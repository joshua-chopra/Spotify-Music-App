from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response


# Create your views here.

class RoomView(generics.ListAPIView):
    # get all Room objects in the Room table
    queryset = Room.objects.all()
    # use RoomSerializer to convert all the entries in the set to JSON to display at '/home' URL
    serializer_class = RoomSerializer


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
            host = self.request.session.session_key
            # get query set from host (unique attribute in model)
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause, room.votes_to_skip = guest_can_pause, votes_to_skip
                # pass fields that we need to update the room
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                # let sender know room was updated, 200 - all good.
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:  # create new room w/ session key for this user
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                # return response with serialized room object DATA (cannot pass serializer object)
                # to sender of the POST request.
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        # let sender know that their post request had invalid data.
        return Response({'Bad Request': 'Invalid Data...'}, status=status.HTTP_400_BAD_REQUEST)
