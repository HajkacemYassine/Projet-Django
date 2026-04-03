from django import forms
from .models import Produit

class ProduitForm(forms.ModelForm):
    class Meta:
        model = Produit
        fields = ['libelle', 'description', 'img', 'Categorie', 'Fournisseur', 'prix', 'type'   ]
        
      