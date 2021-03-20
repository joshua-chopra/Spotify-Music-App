from django.shortcuts import render


# Create your views here.
def index(request, *args, **kwargs):
    """
    All be all function for our essentially SPA (single page app). It renders index.html, which in turn will render
    App.js in the div component with id="app" and App handles browser routing to ensure that the proper component
    is rendered given the URL in the browser (BrowserRouter in App.js users HTML5 history library to get current URL
    and selects relevant route based on switch statement in App.js)
    :param request: request passed as arg from urls.py, path() function
    :param args:
    :param kwargs:
    :return:
    """
    return render(request, 'frontend/index.html')
