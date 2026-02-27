from django.shortcuts import render
from django.http import HttpResponse
def index(request):
 return HttpResponse("Première apllication django")
# Create your views here.
