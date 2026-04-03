from django.db import models
 
 
class Donneur(models.Model):
    SEXE_CHOICES = [('H', 'Homme'), ('F', 'Femme')]
    GROUPE_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]
 
    user           = models.OneToOneField('auth.User', on_delete=models.CASCADE)
    groupe_sanguin = models.CharField(max_length=3, choices=GROUPE_CHOICES)
    sexe           = models.CharField(max_length=1, choices=SEXE_CHOICES)
    date_naissance = models.DateField()
    ville          = models.CharField(max_length=100)
    telephone      = models.CharField(max_length=20, blank=True, default='')
    actif          = models.BooleanField(default=True)  
    def __str__(self):
        return f"{self.user.username} ({self.groupe_sanguin})"
 
 
class Hopital(models.Model):
    user         = models.OneToOneField('auth.User', on_delete=models.CASCADE)
    nom          = models.CharField(max_length=100)
    adresse      = models.CharField(max_length=200)
    ville        = models.CharField(max_length=100, default='')  
    num_agrement = models.CharField(max_length=50)
    telephone    = models.CharField(max_length=20, blank=True, default='')
    valide       = models.BooleanField(default=False)  
 
    def __str__(self):
        return self.nom
 
 
class DemandeUrgente(models.Model):
    STATUT_CHOICES = [
        ('active',    'Active'),
        ('cloturee',  'Clôturée'),
        ('satisfaite','Satisfaite'),
    ]
 
    hopital        = models.ForeignKey(Hopital, on_delete=models.CASCADE, related_name='demandes')
    groupe_sanguin = models.CharField(max_length=3)
    quantite       = models.IntegerField()
    date_demande   = models.DateField()
    delai          = models.DateField(null=True, blank=True)  
    statut         = models.CharField(max_length=10, choices=STATUT_CHOICES, default='active')
    description    = models.TextField(blank=True, default='')  
 
    def __str__(self):
        return f"{self.groupe_sanguin} - {self.hopital.nom} ({self.statut})"
 
 
class Don(models.Model):
    donneur    = models.ForeignKey(Donneur, on_delete=models.CASCADE)
    hopital    = models.ForeignKey(Hopital, on_delete=models.CASCADE)
    date_don   = models.DateField()
    notes      = models.TextField(blank=True, default='')  
    valide     = models.BooleanField(default=True)         
 
    
 
    def __str__(self):
        return f"{self.donneur} - {self.hopital} - {self.date_don}"
 
 
class Campagne(models.Model):
    hopital        = models.ForeignKey(Hopital, on_delete=models.CASCADE, related_name='campagnes')
    nom            = models.CharField(max_length=100)
    date           = models.DateField()
    lieu           = models.CharField(max_length=200)
    groupes_cibles = models.CharField(max_length=100)
    capacite       = models.IntegerField()
    description    = models.TextField(blank=True, default='')  
 
    def __str__(self):
        return f"{self.nom} - {self.date}"
 
    def nb_inscrits(self):
        return self.inscription_set.count()
 
    def places_restantes(self):
        return self.capacite - self.nb_inscrits()
 
    def est_complete(self):
        return self.nb_inscrits() >= self.capacite
 
 
class Inscription(models.Model):
    donneur          = models.ForeignKey(Donneur, on_delete=models.CASCADE)
    campagne         = models.ForeignKey(Campagne, on_delete=models.CASCADE)
    date_inscription = models.DateField()
    crenau_horaire   = models.CharField(max_length=50)
    present          = models.BooleanField(default=False)  
 
    
 
    def __str__(self):
        return f"{self.donneur} → {self.campagne}"
 
 
class Reponse_Appel(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirme',   'Confirmé'),
        ('annule',     'Annulé'),
    ]
 
    donneur          = models.ForeignKey(Donneur,        on_delete=models.CASCADE)
    demande_urgente  = models.ForeignKey(DemandeUrgente, on_delete=models.CASCADE, related_name='reponses')
    date_reponse     = models.DateField()
    statut_reponse   = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
 
    
 
    def __str__(self):
        return f"{self.donneur} → {self.demande_urgente}"
 