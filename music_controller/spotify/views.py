from django.shortcuts import render, redirect
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
import os
from api.models import Room
from .models import Vote


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': os.environ['REDIRECT_URI'],
            'client_id': os.environ['CLIENT_ID']
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    """
    Pass this function as a param in our request above in AUTHURL so once spotify authenticates a user (on spotify.com)
    the redirect goes to "spotify/redirect" on our server which is registered to this func, and we'll use this callback
    func to get the tokens we need, put them in our db, and redirect user BACK to the front end. So, the flow is:

    front_end (room) -> spotify.com -> spotify_callback @ spotify/redirect -> front_end (room)
    """
    code = request.GET.get('code')
    error = request.GET.get('error')
    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': os.environ['REDIRECT_URI'],
        'client_id': os.environ['CLIENT_ID'],
        'client_secret': os.environ['CLIENT_SECRET']
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token)

    # redirect back to url routed to "" in frontend urls.py, i.e., will be homepage since "" is mapped to homepage.
    return redirect('frontend:')


class IsAuthenticated(APIView):
    """
    Use endpoint to see if user is authenticated.
    """

    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    """
    Use this view to query spotify API for current song and return info about current song to front end so it can be
    displayed on RoomFCOrig.js page.
    """

    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        # check that we actually have a room we are working with before attempting to call API
        if room.exists():
            room = room.first()
        else:
            # print(f"room code is: {room_code} and room.exists={room.exists}")
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        # will append this endpoint to the base url defined in util.py to call spotify API
        endpoint = "player/currently-playing"
        # use helper func from util.py to execute any spotify requests needed.
        response = execute_spotify_api_request(host, endpoint)

        if 'error' in response or 'item' not in response:
            print("In views.py error response is: ", response)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        # response is JSON mapped to python dict, use same operations
        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        # [0] is largest image returned for the abum
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ""

        # build up a string with multiple artists if a song has more than 1 artist.
        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name

        votes = len(Vote.objects.filter(room=room, song_id=song_id))
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes,
            'votes_required_to_skip': room.votes_to_skip,
            'id': song_id
        }

        # update room w/ song ID we are currently playing if needed & remove all votes from any previous song
        self.update_room_song(room, song_id)

        return Response(song, status=status.HTTP_200_OK)

    def update_room_song(self, room, song_id):
        """
        Helper function to ensure we avoid expensive operation of updating DB if we already have the correct song
        mapped to the room we are in
        """
        if room.current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            # get set of votes with the current song as foreign key and delete all of them since we are on a new song.
            Vote.objects.filter(room=room).delete()


class ControlSong(APIView):
    def put(self, response, format=None):
        action = self.request.headers['Action'].lower()
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()
        if self.request.session.session_key == room.host or room.guest_can_pause:
            if action == 'pause':
                print("In spotify_views.py pausing song...")
                control_song(room.host, 'pause')
            else:
                control_song(room.host, 'play')
                print("In spotify_views.py playing song...")
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()
        # add 1 to running total number of votes for the currently playing song since this post request means someone
        # is sending a request to skip, i.e., adding a vote to skip to the DB.
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        current_votes_to_skip = len(votes) + 1
        # num votes needed to skip song based on when room was created
        votes_needed = room.votes_to_skip

        if self.request.session.session_key == room.host or current_votes_to_skip >= votes_needed:
            # before skipping song, remove all votes in DB mapped to current song for room since no longer needed.
            votes.delete()
            skip_song(room.host)
        else:  # otherwise create a new vote
            vote = Vote(user=self.request.session.session_key, room=room, song_id=room.current_song)
            # save vote to DB
            vote.save()

        return Response({}, status.HTTP_204_NO_CONTENT)
