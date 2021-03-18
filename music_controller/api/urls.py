from django.urls import path
from .views import RoomView, CreateRoomView

urlpatterns = [
    # register RoomView obj to home URL, returns serialized JSON format since we used serializer on our RoomView class.
    path('home/', RoomView.as_view()),
    # register CreateRoomView obj to create-room url, we will handle POST request at this URL which can create a room.
    path('create-room', CreateRoomView.as_view())
]