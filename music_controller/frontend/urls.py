from django.urls import path
from .views import index

app_name = 'frontend'

urlpatterns = [
    # register index function (which will render index.html template) to all routes. give name so when we call
    # redirect("frontend:") [i.e., empty string after the :] in spotify.views.py we get redirected here, then homepage.
    path('', index, name=""),
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