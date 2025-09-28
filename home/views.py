from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import IntegrityError


def home(request):
    return render(request, "home/home.html")


def signup(request):

    if request.method == "POST":

        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")
        email = request.POST.get("email", "").strip()
        confirm_password = request.POST.get("confirm_password", "")

        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return redirect("signup")

        if len(password) < 8:
            messages.error(request, "Password must be at least 8 characters long.")
            return redirect("signup")

        try:
            user = User.objects.create_user(
                username=username, email=email, password=password
            )
            login(request, user)
            messages.success(
                request, "Account created successfully! Welcome to LearnVocab."
            )
            return redirect("home")
        except IntegrityError:
            messages.error(request, "Username already exists.")
            return redirect("signup")

    return render(request, "home/signup.html")


def login_view(request):
    if request.method == "POST":

        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            messages.success(request, "Login successful! Welcome back.")
            return redirect("home")
        else:
            messages.error(request, "Invalid username or password.")
            return redirect("login")

    return render(request, "home/login.html")
