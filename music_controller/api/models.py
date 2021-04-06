from django.db import models
import random, string

# Create your models here.
"""
CALL python manage.py makemigrations in terminal whenever ANY of these models are updated before running server!!
"""


def generate_unique_code():
    """
    Get a unique code for a room when created
    :return:
    """
    CODE_LENGTH = 6
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=CODE_LENGTH))
        # if there is no room (filter by code field) i.e., count of rooms with code is 0 for the code we generated
        # we are good to go
        if not Room.objects.filter(code=code).count(): break
    return code


class Room(models.Model):
    """
    Room entity that drives our whole application. We store rooms in our SQL Lite DB. This is how we track the host,
    person who created the room, their guests that join their room, the number of votes needed to skip a song, and if
    a guest can pause a song.
    """
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    # user can only be host of 1 room at a time.
    host = models.CharField(max_length=50, unique=True)
    guest_can_pause = models.BooleanField(null=False, default=False)
    votes_to_skip = models.IntegerField(null=False, default=1)
    # automatically create a time stamp for when room is created (new entry in table)
    created_at = models.DateTimeField(auto_now_add=True)
    # store currently playing song so we can access this in Votes DB.
    current_song = models.CharField(null=True, max_length=50)
