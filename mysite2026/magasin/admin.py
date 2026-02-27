from django.contrib import admin
from .models import Categorie, Fournisseur, Produit,ProduitNC, Commande,ProduitC
admin.site.register(Produit)#permet d'afficher le model Produit dans l'interface d'administration de Django.
admin.site.register(Categorie)
admin.site.register(Fournisseur)
admin.site.register(ProduitNC)
admin.site.register(ProduitC)
admin.site.register(Commande)
# Register your models here.
