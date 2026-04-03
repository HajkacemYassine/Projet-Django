from django.db import models
from datetime import date
# Create your models here.
class Produit(models.Model):
    TYPE_CHOICES=[('em','emballe'),
                  ('fr','Frais'),
                  ('cs','Conserve')
                  ]
    libelle=models.CharField(max_length=100)
    description=models.TextField(default="Non definie")
    prix=models.DecimalField(max_digits=10, decimal_places=2)
    type=models.CharField(max_length=2, default="em",choices=TYPE_CHOICES)
    img = models.ImageField(blank=True, upload_to="produits/") #upload_to="produits/" permet de ranger les images dans un sous-dossier media/produits/.
    Fournisseur=models.ForeignKey('Fournisseur', on_delete=models.CASCADE, null=True) #permet de créer une relation entre les produits et les fournisseurs. Chaque produit est associé à un fournisseur.
    Categorie=models.ForeignKey('Categorie', on_delete=models.CASCADE, null=True) #permet de créer une relation entre les produits et les catégories. Chaque produit appartient à une catégorie.

    def __str__(self):
        return f"Produit: {self.libelle} | {self.description} | {self.prix} DT | {self.get_type_display()}"
class Categorie(models.Model):
    TYPES_CHOICES=[
        ('Al','Alimentaire'), ('Mb','Meuble'),
        ('Sn','Sanitaire'), ('Vs','Vaisselle'),
        ('Vt','Vêtement'),('Jx','Jouets'),
        ('Lg','Linge de Maison'),('Bj','Bijoux'),('Dc','Décor')]
    nom=models.CharField(max_length=100)
    type=models.CharField(max_length=2, default="al",choices=TYPES_CHOICES)

    def __str__(self):
        return self.nom
class Fournisseur(models.Model):
    nom=models.CharField(max_length=100)
    adresse=models.TextField(max_length=200)
    email=models.EmailField()
    telephone=models.CharField(max_length=20)
    def __str__(self):
        return self.nom
class ProduitNC(Produit):
    duree_garantie=models.CharField(default=12)
    def __str__(self):
        return f"Produit Non Consommable: {self.libelle} | {self.description} | {self.prix} DT | {self.get_type_display()} | Durée de Garantie: {self.duree_garantie} mois"
class Commande(models.Model):
    produits=models.ManyToManyField(Produit) #permet de créer une relation plusieurs à plusieurs entre les commandes et les produits. Une commande peut contenir plusieurs produits, et un produit peut être présent dans plusieurs commandes.
    totalCde=models.DecimalField(max_digits=10, decimal_places=3)
    date_commande=models.DateField(default=date.today,null=True)
    def __str__(self):
        return f"Commande: {self.totalCde} DT | Date: {self.date_commande}"
class ProduitC(Produit):
    date_expiration=models.DateField(default=date.today,null=True)
    def __str__(self):
        return f"Produit Consommable: {self.libelle} | {self.description} | {self.prix} DT | {self.get_type_display()} | Date d'Expiration: {self.date_expiration}"