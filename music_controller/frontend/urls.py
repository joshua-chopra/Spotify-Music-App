from django.urls import path
from .views import index

urlpatterns = [
    # register index function (which will render index.html template) to all routes.
    path('', index),
    # RoomJoinPage is called through the chain of events frontend/views.index -> render index.html -> render HomePage
    # -> which passes URL to router, which finds exact path for /join which renders RoomJoinPage.js.
    path('join', index),
    # CreateRoom will eventually get called here.
    path('create', index),
    # dispatch any dynamic url beginning w/ (room prefix) i.e., room/{insert_roomcode} over to index, which will render
    # index.html template, i.e., render HomePage which will pass URL to Router and render appropriate component, i.e.,
    # the Room component in this case
    path('room/<str:roomcode>', index)
]