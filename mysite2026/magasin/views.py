from urllib import request

from django.shortcuts import redirect, render
from django.template import loader

from .forms import ProduitForm
from .models import Fournisseur, Produit
from django.shortcuts import render
from .models import Produit, Categorie
from django.contrib.auth.models import User
def index(request):
    products = Produit.objects.all()
    categories = Categorie.objects.all()
    context = {'products': products, 'categories': categories}
    return render(request, 'magasin/mesProduits.html', context)



def catalogue(request, categorie_id=None):
    if categorie_id:
        produits = Produit.objects.filter(categorie_id=categorie_id)
    else:
        produits = Produit.objects.all()
    categories = Categorie.objects.all()
    return render(request, 'magasin/catalogue.html', {
        'produits': produits,
        'categories': categories,
        'categorie_active': categorie_id
    })


def fournisseur(request):
    # logique fournisseur (liste des fournisseurs)
    fournisseurs = Fournisseur.objects.all()
    context = {'fournisseurs': fournisseurs}
    return render(request, 'magasin/fournisseur.html', context)

def administration(request):
    nb_produits = Produit.objects.count()
    nb_fournisseurs = Fournisseur.objects.count()
    nb_users = User.objects.count() 

    return render(request, 'magasin/administration.html', {
        'nb_produits': nb_produits,
        'nb_fournisseurs': nb_fournisseurs,
        'nb_users': nb_users
    })
def produit(request):
    if request.method == 'POST':
        form = ProduitForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('produit')  # recharge la page après ajout
    else:
        form = ProduitForm()

    products = Produit.objects.all()
    return render(request, 'magasin/produit.html', {
        'form': form,
        'products': products
    })
def accueil(request):
    return render(request, 'accueil.html')

	# Create your views here.
