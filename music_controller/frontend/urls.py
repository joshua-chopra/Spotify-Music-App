from django.urls import path
from .views import index

urlpatterns = [
    # register index function (which will render index.html template) to all routes.
    path('', index),
    path('join', index),
    path('create', index)
]