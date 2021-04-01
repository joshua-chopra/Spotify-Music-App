"""
Translate attributes from models into JSON (for GET) or from JSON into python usable format (for POST)
"""

from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    """
    OUTGOING serializer.
    Serializes a Room object from DB to something we can return as a response to the HTML template.
    """
    # describes how to serialize our object from model.
    class Meta:
        model = Room
        # specify fields we want to display in {key : value} JSON format.
        fields = (
            'id', 'code', 'host', 'guest_can_pause',
            'votes_to_skip', 'created_at'
        )


class CreateRoomSerializer(serializers.ModelSerializer):
    """
    Incoming Serializer.
    this will handle the POST request at /create and check data assoc. with the request to ensure that a room can be
    created given the parameters passed by user on the client side, define fields we need from post request.
    """

    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip')



class UpdateRoomSerializer(serializers.ModelSerializer):
    # we need to use the same code again, so when PATCH request comes in with a code we've already put into DB we do
    # not want code to be validated against DB since we have a 'unique' constraint on code attribute, and we need to
    # use the code (once serialized from JSON to python format) to update details of the room.
    code = serializers.CharField(validators=[])

    class Meta:
        model = Room
        fields = ('guest_can_pause', 'votes_to_skip', 'code')


