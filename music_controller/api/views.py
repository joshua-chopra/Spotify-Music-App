from django.http import JsonResponse
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response


# Create your views here.

class RoomView(generics.ListAPIView):
    # get all Room objects in the Room table
    queryset = Room.objects.all()
    # use RoomSerializer to convert all the entries in the set to JSON to display at '/home' URL
    serializer_class = RoomSerializer


class GetRoom(APIView):
    # use same serializer for RoomView
    serializer_class = RoomSerializer
    # parameter sent over in URL, we used ?code in front end url sent over, e.g., get-room?code={room.code}
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        # get code param from request since in format of room/:code, since request.GET returns dict with all HTTP
        # parameters.
        code = request.GET.get(self.lookup_url_kwarg)
        if code:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room.first()).data
                # add key:value pair to response data for is_host to use when setting state in Room component. we
                # check the session key and see if it's equal to the host attribute for the room, since the host
                # attribute in CreateRoomView below was assigned based on session key.
                data['is_host'] = self.request.session.session_key == room[0].host
                # return room to display,
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                self.request.session['room_code'] = code
                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)

            return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'Bad Request': 'Invalid post data, did not find a code key'},
                        status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    """
    Store users based on session, each one has a unique session (even 2 users on same network)
    We use API View as parent class to override default methods, e.g., 'post'
    """

    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        # if current user does not have an active session, then we'll create one
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # takes data and map it to python representation, and check if the 2 fields in serializer are valid, and in the
        # data sent in the post request
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # get values from serializer mapped to respective fields from request we received.
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            # if host already exists we don't want to create a new room, just change settings of the existing room.
            # we assign session key from request received and we will use this later to check if current user is a host.
            host = self.request.session.session_key
            # get query set from host (unique attribute in model)
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause, room.votes_to_skip = guest_can_pause, votes_to_skip
                # pass fields that we need to update the room
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                # ensure to save room code to user's session!
                self.request.session['room_code'] = room.code
                # print('saved room code as', self.request.session['room_code'])
                # let sender know room was updated, 200 - all good.
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:  # create new room w/ session key for this user
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                # ensure to save room code to user's session, we need to parse this from request later!
                self.request.session['room_code'] = room.code
                room.save()
                # return response with serialized room object DATA (cannot pass serializer object)
                # to sender of the POST request.
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        # let sender know that their post request had invalid data.
        return Response({'Bad Request': 'Invalid Data...'}, status=status.HTTP_400_BAD_REQUEST)


# use to check if user is in a room on HomePage to redirect if needed, return associated code. Will be none if there
# is no room code yet assigned i.e., if JoinRoom view hasn't been visited since code is set there.
class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }
        print(f"code is {data['code']}")
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request, format=None):
        # user would've been assigned a room code so session dict would have key : value like room_code : DJKMVO etc.
        if 'room_code' in self.request.session:
            # remove room code attribute from user's session
            self.request.session.pop('room_code')
            # check if current user is the host of a room, if so, need to remove room from DB so it is not accesible.
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if room_results.exists():
                room = room_results[0]
                room.delete()

        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    # recall, PATCH is an update
    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        # recall, we do NOT validate code against the model but do validate all other fields
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')
            # look to see if room exists based on code we got from PATCH request
            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({'msg': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

            room = queryset.first()
            # do not allow user to modify the attributes of the room if they are not the host.
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'msg': 'You are not the host of this room.'}, status=status.HTTP_403_FORBIDDEN)

            # update attributes to values user passed in from request
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': "Invalid Data..."}, status=status.HTTP_400_BAD_REQUEST)
