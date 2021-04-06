from django.db import models

# Create your models here.
from django.db import models
from api.models import Room


class SpotifyToken(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    refresh_token = models.CharField(max_length=150)
    access_token = models.CharField(max_length=150)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)


class Vote(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    song_id = models.CharField(max_length=50)
    # store reference to room when we create a vote, since we need to know what room the vote took place in, if room
    # gets deleted then models.CASCADE ensures that we delete ALL votes that had room as a foreign key if the room is
    # removed from the Room DB.
    room = models.ForeignKey(Room, on_delete=models.CASCADE)