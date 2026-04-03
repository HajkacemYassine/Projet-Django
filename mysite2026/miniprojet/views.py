from django.shortcuts import render
def home(request):
    return render(request, 'miniprojet/home.html')
# Create your views here.
