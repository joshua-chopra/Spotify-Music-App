from django.shortcuts import render
from rest_framework import generics
from .serializers import RoomSerializer
from .models import Room


# Create your views here.

class RoomView(generics.CreateAPIView):
    # get all Room objects in the Room table
    queryset = Room.objects.all()
    # use RoomSerializer to convert all the entries in the set to JSON
    serializer_class = RoomSerializer
