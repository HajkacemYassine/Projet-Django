# magasin/serializers.py

from rest_framework import serializers
from .models import Produit, Categorie, Fournisseur, Commande


class CategorieSerializer(serializers.ModelSerializer):
    nb_produits = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'type', 'get_type_display', 'nb_produits']


class FournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fournisseur
        fields = ['id', 'nom', 'adresse', 'email', 'telephone']


class ProduitSerializer(serializers.ModelSerializer):
    type_display    = serializers.CharField(source='get_type_display', read_only=True)
    categorie_nom   = serializers.CharField(source='Categorie.nom',    read_only=True)
    fournisseur_nom = serializers.CharField(source='Fournisseur.nom',  read_only=True)

    class Meta:
        model  = Produit
        fields = [
            'id', 'libelle', 'description', 'prix',
            'type', 'type_display', 'img',
            'Categorie', 'categorie_nom',
            'Fournisseur', 'fournisseur_nom'
        ]
        extra_kwargs = {
            'Fournisseur': {'required': False, 'allow_null': True},
            'Categorie':   {'required': False, 'allow_null': True},
            'img':         {'required': False, 'allow_null': True},
        }

    def get_categorie_nom(self, obj):
        try:
            return obj.Categorie.nom
        except:
            return None

    def get_fournisseur_nom(self, obj):
        try:
            return obj.Fournisseur.nom
        except:
            return None


class CommandeSerializer(serializers.ModelSerializer):
    produits = ProduitSerializer(many=True, read_only=True)
    produit_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Produit.objects.all(), write_only=True, source='produits'
    )

    class Meta:
        model = Commande
        fields = ['id', 'produits', 'produit_ids', 'totalCde', 'date_commande']
