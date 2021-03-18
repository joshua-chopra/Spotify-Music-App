from django.db import models
import random, string

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

# Create your models here.
class Room(models.Model):
    code = models.CharField(max_length=8, default=generate_unique_code, unique=True)
    # cardinality is room can have only 1 host
    host = models.CharField(max_length=50, unique=True)
    # non-null attribute, by default guest cannot pause music.
    guest_can_pause = models.BooleanField(null=False, default=False)
    # number of votes needed to skip song.
    votes_to_skip = models.IntegerField(null=False, default=1)
    # automatically create a time stamp for when room is created (new entry in table)
    created_at = models.DateTimeField(auto_now_add=True)
