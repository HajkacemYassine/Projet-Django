from django.db import models
from datetime import date
from django.contrib.auth.models import User
from django.utils import timezone
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
    img = models.ImageField(blank=True, upload_to="produits/")
    Fournisseur=models.ForeignKey('Fournisseur', on_delete=models.CASCADE, null=True, related_name='produits')
    Categorie=models.ForeignKey('Categorie', on_delete=models.CASCADE, null=True)
    
    # Gestion de stock
    quantite_stock = models.IntegerField(default=0)
    seuil_alerte = models.IntegerField(default=10)
    en_stock = models.BooleanField(default=True)
    date_derniere_maj_stock = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Produit: {self.libelle} | {self.description} | {self.prix} DT | {self.get_type_display()}"
    
    def est_en_rupture(self):
        return self.quantite_stock <= 0
    
    def est_en_alerte(self):
        return 0 < self.quantite_stock <= self.seuil_alerte
    
    def mettre_a_jour_stock(self, quantite_vendue):
        self.quantite_stock -= quantite_vendue
        if self.quantite_stock <= 0:
            self.en_stock = False
        self.save()
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
    actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True, null=True)
    
    def __str__(self):
        return self.nom
    
    def nb_produits(self):
        return self.produits.count()
    
    def produits_en_rupture(self):
        return self.produits.filter(quantite_stock=0).count()
class ProduitNC(Produit):
    duree_garantie=models.CharField(default=12)
    def __str__(self):
        return f"Produit Non Consommable: {self.libelle} | {self.description} | {self.prix} DT | {self.get_type_display()} | Durée de Garantie: {self.duree_garantie} mois"
class Commande(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirmee', 'Confirmée'),
        ('expediee', 'Expédiée'),
        ('livree', 'Livrée'),
        ('annulee', 'Annulée'),
    ]
    
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='commandes_magasin', null=True)
    produits = models.ManyToManyField(Produit, through='ItemCommande')
    totalCde = models.DecimalField(max_digits=10, decimal_places=3)
    date_commande = models.DateField(default=date.today, null=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    adresse_livraison = models.TextField(default='')
    telephone = models.CharField(max_length=20, default='')
    notes = models.TextField(blank=True, default='')
    
    def __str__(self):
        return f"Commande #{self.id}: {self.totalCde} DT | Date: {self.date_commande} | Statut: {self.statut}"
    
    def calculer_total(self):
        total = sum(item.sous_total() for item in self.items.all())
        self.totalCde = total
        self.save()
        return total


class ItemCommande(models.Model):
    """Table intermédiaire pour gérer les quantités dans une commande"""
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='items')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.IntegerField(default=1)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=3)
    
    def __str__(self):
        return f"{self.produit.libelle} x{self.quantite}"
    
    def sous_total(self):
        return self.quantite * self.prix_unitaire
class ProduitC(Produit):
    date_expiration=models.DateField(default=date.today,null=True)
    def __str__(self):
        return f"Produit Consommable: {self.libelle} | {self.description} | {self.prix} DT | {self.get_type_display()} | Date d'Expiration: {self.date_expiration}"
class Avis(models.Model):
    produit    = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='avis')
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    note       = models.IntegerField(choices=[(i,i) for i in range(1,6)])  # 1 à 5 étoiles
    commentaire = models.TextField(blank=True, default='')
    date_avis  = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('produit', 'user')  # Un seul avis par user par produit
    
    def __str__(self):
        return f"{self.user.username} → {self.produit.libelle} ({self.note}★)"
class CodePromo(models.Model):
    TYPE_CHOICES = [('pct', 'Pourcentage'), ('fixe', 'Montant fixe')]
    
    code           = models.CharField(max_length=20, unique=True)
    type_reduction = models.CharField(max_length=4, choices=TYPE_CHOICES, default='pct')
    valeur         = models.DecimalField(max_digits=10, decimal_places=2)  # 20 = 20% ou 20 DT
    date_debut     = models.DateField(default=timezone.now)
    date_fin       = models.DateField()
    usage_max      = models.IntegerField(default=100)
    nb_utilise     = models.IntegerField(default=0)
    actif          = models.BooleanField(default=True)
    
    def est_valide(self):
        from datetime import date
        return (
            self.actif and
            self.nb_utilise < self.usage_max and
            self.date_debut <= date.today() <= self.date_fin
        )
    
    def __str__(self): return f"{self.code} ({self.valeur}{'%' if self.type_reduction=='pct' else ' DT'})"
 
 
# ── Wishlist ──────────────────────────────────────────────────────────────
class Wishlist(models.Model):
    user       = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='wishlist')
    produit    = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='wishlist_items')
    date_ajout = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'produit')
    
    def __str__(self): return f"{self.user.username} ♥ {self.produit.libelle}"
class SuiviLivraison(models.Model):
    STATUTS = [
        ('confirmee',     '✅ Commande confirmée'),
        ('preparation',   '📦 En préparation'),
        ('expediee',      '🚚 Expédiée'),
        ('en_transit',    '📍 En transit'),
        ('livree',        '🎉 Livrée'),
        ('annulee',       '❌ Annulée'),
    ]
    commande          = models.OneToOneField(Commande, on_delete=models.CASCADE, related_name='suivi')
    statut_actuel     = models.CharField(max_length=20, choices=STATUTS, default='confirmee')
    adresse_livraison = models.TextField(default='')
    date_commande     = models.DateTimeField(auto_now_add=True)
    date_expedition   = models.DateTimeField(null=True, blank=True)
    date_livraison_estimee = models.DateField(null=True, blank=True)
    date_livraison_reelle  = models.DateField(null=True, blank=True)
    numero_suivi      = models.CharField(max_length=50, blank=True, default='')
    notes             = models.TextField(blank=True, default='')
    
    # Nouveaux champs pour confirmation admin et tracking GPS
    confirmee_par_admin = models.BooleanField(default=False)
    admin_confirme_par  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='livraisons_confirmees')
    date_confirmation_admin = models.DateTimeField(null=True, blank=True)
    
    # Position GPS du livreur
    livreur_latitude  = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    livreur_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    derniere_maj_position = models.DateTimeField(null=True, blank=True)
    
    # Coordonnées de destination
    destination_latitude  = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    destination_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    def __str__(self): return f"Suivi #{self.commande.id} — {self.statut_actuel}"
 
 
class EtapeLivraison(models.Model):
    suivi       = models.ForeignKey(SuiviLivraison, on_delete=models.CASCADE, related_name='etapes')
    statut      = models.CharField(max_length=20)
    description = models.CharField(max_length=200)
    date_etape  = models.DateTimeField(auto_now_add=True)
    localisation = models.CharField(max_length=100, blank=True, default='')
    commentaire = models.TextField(blank=True, default='')
    
    class Meta:
        ordering = ['date_etape']
# ── 1. Notifications In-App ───────────────────────────────────────────
class Notification(models.Model):
    TYPE_CHOICES = [
        ('commande',  '🛍️ Commande'),
        ('livraison', '🚚 Livraison'),
        ('promo',     '🎁 Promo'),
        ('stock',     '📦 Stock'),
        ('avis',      '⭐ Avis'),
        ('systeme',   '⚙️ Système'),
    ]
    user       = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='notifications_shop')
    type_notif = models.CharField(max_length=15, choices=TYPE_CHOICES)
    titre      = models.CharField(max_length=200)
    message    = models.TextField()
    lien       = models.CharField(max_length=100, blank=True, default='')
    lue        = models.BooleanField(default=False)
    date_notif = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        ordering = ['-date_notif']
 
    def __str__(self):
        return f"{self.user.username} — {self.titre}"
 
 
# ── 2. Recommandations IA ─────────────────────────────────────────────
class ProduitsVuEnsemble(models.Model):
    produit_a  = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='vu_avec_a')
    produit_b  = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='vu_avec_b')
    nb_fois    = models.IntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        unique_together = ('produit_a', 'produit_b')
 
    def __str__(self):
        return f"{self.produit_a.libelle} ↔ {self.produit_b.libelle} ({self.nb_fois}x)"
class Facture(models.Model):
    commande      = models.OneToOneField(Commande, on_delete=models.CASCADE, related_name='facture')
    numero        = models.CharField(max_length=20, unique=True)
    date_emission = models.DateTimeField(auto_now_add=True)
    total_ht      = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    tva           = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    total_ttc     = models.DecimalField(max_digits=10, decimal_places=3, default=0)
    pdf_genere    = models.BooleanField(default=False)

    def __str__(self):
        return f"Facture {self.numero} — Commande #{self.commande.id}"
# ── 1. Suivi Commandes Avancé ─────────────────────────────────────────
class SuiviCommande(models.Model):
    STATUTS = [
        ('en_attente',  '⏳ En attente'),
        ('confirmee',   '✅ Confirmée'),
        ('preparation', '📦 En préparation'),
        ('expediee',    '🚚 Expédiée'),
        ('en_transit',  '📍 En transit'),
        ('livree',      '🎉 Livrée'),
        ('annulee',     '❌ Annulée'),
        ('retournee',   '↩️ Retournée'),
    ]
    commande              = models.OneToOneField('Commande', on_delete=models.CASCADE, related_name='suivi_avance')
    statut_actuel         = models.CharField(max_length=20, choices=STATUTS, default='en_attente')
    adresse_livraison     = models.TextField(blank=True, default='')
    numero_suivi          = models.CharField(max_length=30, blank=True, default='')
    date_expedition       = models.DateTimeField(null=True, blank=True)
    date_livraison_estimee= models.DateField(null=True, blank=True)
    date_livraison_reelle = models.DateField(null=True, blank=True)
    livreur_nom           = models.CharField(max_length=100, blank=True, default='')
    livreur_tel           = models.CharField(max_length=20, blank=True, default='')
    notes_livraison       = models.TextField(blank=True, default='')
    lat_destination       = models.FloatField(null=True, blank=True)
    lng_destination       = models.FloatField(null=True, blank=True)
 
    def __str__(self):
        return f"Suivi #{self.commande.id} — {self.statut_actuel}"
 
 
class EtapeSuivi(models.Model):
    suivi       = models.ForeignKey(SuiviCommande, on_delete=models.CASCADE, related_name='etapes')
    statut      = models.CharField(max_length=20)
    description = models.CharField(max_length=300)
    localisation= models.CharField(max_length=200, blank=True, default='')
    date_etape  = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        ordering = ['date_etape']
 
 
# ── 2. Portail Fournisseur ────────────────────────────────────────────
class MessageFournisseur(models.Model):
    fournisseur = models.ForeignKey('Fournisseur', on_delete=models.CASCADE, related_name='messages')
    sujet       = models.CharField(max_length=200)
    contenu     = models.TextField()
    expediteur  = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    date_envoi  = models.DateTimeField(auto_now_add=True)
    lu          = models.BooleanField(default=False)
 
    class Meta:
        ordering = ['-date_envoi']
 
 
class CommandeFournisseur(models.Model):
    fournisseur    = models.ForeignKey('Fournisseur', on_delete=models.CASCADE, related_name='commandes_f')
    admin          = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    produit        = models.ForeignKey('Produit', on_delete=models.CASCADE)
    quantite       = models.IntegerField()
    prix_unitaire  = models.DecimalField(max_digits=10, decimal_places=3)
    statut         = models.CharField(max_length=20, default='en_attente',
                       choices=[('en_attente','En attente'),('confirmee','Confirmée'),
                                ('recue','Reçue'),('annulee','Annulée')])
    date_commande  = models.DateTimeField(auto_now_add=True)
    date_reception = models.DateField(null=True, blank=True)
    notes          = models.TextField(blank=True, default='')
 
    def total(self):
        return float(self.quantite) * float(self.prix_unitaire)
 
 
# ── 3. Chatbot Messages ───────────────────────────────────────────────
class ChatbotConversation(models.Model):
    user        = models.ForeignKey('auth.User', on_delete=models.CASCADE, null=True, blank=True)
    session_id  = models.CharField(max_length=50, blank=True, default='')
    date_debut  = models.DateTimeField(auto_now_add=True)
    nb_messages = models.IntegerField(default=0)
 
class ChatbotMessage(models.Model):
    conversation = models.ForeignKey(ChatbotConversation, on_delete=models.CASCADE, related_name='messages')
    role         = models.CharField(max_length=10)  # 'user' ou 'bot'
    contenu      = models.TextField()
    date_msg     = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        ordering = ['date_msg']