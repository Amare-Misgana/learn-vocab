from django.shortcuts import render


def home(request):
    return render(request, "home/home.html")


def signup(request):
    return render(request, "home/signup.html")


def login_view(request):
    pass
