from django.urls import path
from .views import RoomView, CreateRoomView, GetRoom

"""
Deal with any urls starting with /api since project level (music-controller) directs URL requests with /api to this
module, and we register the corresponding views of the DB here. 
"""
urlpatterns = [
    # register RoomView obj to room URL, returns serialized JSON format since we used serializer on our RoomView class.
    path('room', RoomView.as_view()),
    # register CreateRoomView obj to create-room url, we will handle POST request at this URL which can create a room.
    path('create-room', CreateRoomView.as_view()),
    path('get-room', GetRoom.as_view())
]