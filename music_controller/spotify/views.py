from django.shortcuts import render, redirect
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
import os
from api.models import Room


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
    displayed on Room.js page.
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

        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': 0,
            'id': song_id
        }

        return Response(song, status=status.HTTP_200_OK)


class ControlSong(APIView):
    def put(self, response, format=None):
        action = self.request.headers['Action'].lower()
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code).first()
        if self.request.session.session_key == room.host or room.guest_can_pause:
            if action == 'pause':
                control_song(room.host, 'pause')
            else:
                control_song(room.host, 'play')
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)