from django.urls import path
from .views import index

urlpatterns = [
    # register index function (which will render index.html template) to '' route. 
    path('', index),
    path('join', index),
    path('create', index)
]