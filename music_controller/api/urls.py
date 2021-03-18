from django.urls import path
from .views import RoomView

urlpatterns = [
    # call main() for blank URL endpoint, where prefix from urls.py (other module) is ''.
    # so this path literally handles url '' (nothing following it). If we did something like 'api', include(urls.py)
    # then did path('home', main) this would mean that api/home endpoint will call main function
    path('home/', RoomView.as_view())
]