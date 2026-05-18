from django.db import models
from django.contrib.auth.models import User
 
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
class Badge(models.Model):
    TYPES = [
        ('premier_don',     '🩸 Premier Don'),
        ('cinq_dons',       '🏅 5 Dons'),
        ('dix_dons',        '🥇 10 Dons'),
        ('vingt_dons',      '🏆 20 Dons'),
        ('urgence',         '⚡ Héros de l\'Urgence'),
        ('trois_urgences',  '🦸 Super Héros'),
        ('campagne',        '📅 Participant Campagne'),
        ('regulier',        '⭐ Donneur Régulier'),
        ('ambassadeur',     '👑 Ambassadeur BloodConnect'),
    ]
    donneur     = models.ForeignKey(Donneur, on_delete=models.CASCADE, related_name='badges')
    type_badge  = models.CharField(max_length=30, choices=TYPES)
    date_obtenu = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        unique_together = ('donneur', 'type_badge')
 
    def __str__(self):
        return f"{self.donneur} → {self.type_badge}"
class Notification(models.Model):
    TYPE_CHOICES = [
        ('urgence',    '🚨 Appel urgent'),
        ('campagne',   '📅 Nouvelle campagne'),
        ('badge',      '🏆 Badge obtenu'),
        ('eligible',   '✅ Vous êtes éligible'),
        ('validation', '✅ Compte validé'),
        ('reponse',    '📢 Réponse reçue'),
    ]
    user       = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='notifications')
    type_notif = models.CharField(max_length=20, choices=TYPE_CHOICES)
    titre      = models.CharField(max_length=200)
    message    = models.TextField()
    lien       = models.CharField(max_length=100, blank=True, default='')
    lue        = models.BooleanField(default=False)
    date_notif = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date_notif']
    
    def __str__(self): return f"{self.user.username} — {self.titre}"


class Mission(models.Model):
    """Missions hebdomadaires/mensuelles pour les donneurs"""
    TYPE_CHOICES = [
        ('hebdo',  'Hebdomadaire'),
        ('mensuel', 'Mensuelle'),
        ('special', 'Spéciale'),
    ]
    STATUT_CHOICES = [
        ('active',   'Active'),
        ('terminee', 'Terminée'),
        ('expiree',  'Expirée'),
    ]
    
    titre          = models.CharField(max_length=200)
    description    = models.TextField()
    type_mission   = models.CharField(max_length=10, choices=TYPE_CHOICES, default='hebdo')
    objectif       = models.IntegerField(help_text="Nombre requis pour compléter")
    recompense_pts = models.IntegerField(default=50)
    emoji          = models.CharField(max_length=10, default='🎯')
    date_debut     = models.DateField()
    date_fin       = models.DateField()
    statut         = models.CharField(max_length=10, choices=STATUT_CHOICES, default='active')
    
    def __str__(self):
        return f"{self.titre} ({self.type_mission})"


class ProgressionMission(models.Model):
    """Progression d'un donneur sur une mission"""
    donneur    = models.ForeignKey(Donneur, on_delete=models.CASCADE, related_name='progressions')
    mission    = models.ForeignKey(Mission, on_delete=models.CASCADE, related_name='progressions')
    progres    = models.IntegerField(default=0)
    completee  = models.BooleanField(default=False)
    date_debut = models.DateTimeField(auto_now_add=True)
    date_fin   = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('donneur', 'mission')
    
    def __str__(self):
        return f"{self.donneur} → {self.mission.titre} ({self.progres}/{self.mission.objectif})"


class Parrainage(models.Model):
    """Système de parrainage entre donneurs"""
    parrain    = models.ForeignKey(Donneur, on_delete=models.CASCADE, related_name='filleuls')
    filleul    = models.ForeignKey(Donneur, on_delete=models.CASCADE, related_name='parrains')
    code       = models.CharField(max_length=20, unique=True)
    date       = models.DateTimeField(auto_now_add=True)
    actif      = models.BooleanField(default=True)
    premier_don_fait = models.BooleanField(default=False, help_text="Le filleul a fait son 1er don")
    
    def __str__(self):
        return f"{self.parrain.user.username} → {self.filleul.user.username}"






class Post(models.Model):
    """Posts du feed communautaire"""
    TYPE_CHOICES = [
        ('temoignage',  '💬 Témoignage'),
        ('remerciement', '🙏 Remerciement'),
        ('annonce',     '📢 Annonce'),
        ('celebration', '🎉 Célébration'),
    ]
    
    auteur      = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='posts')
    type_post   = models.CharField(max_length=20, choices=TYPE_CHOICES, default='temoignage')
    contenu     = models.TextField()
    image_url   = models.URLField(blank=True, default='')
    date_post   = models.DateTimeField(auto_now_add=True)
    epingle     = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-date_post']
    
    def __str__(self):
        return f"{self.auteur.username} - {self.type_post} - {self.date_post.strftime('%d/%m/%Y')}"
    
    def nb_likes(self):
        return self.like_set.count()





class Story(models.Model):
    """Stories éphémères (24h)"""
    auteur      = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='stories')
    contenu     = models.TextField()
    image_url   = models.URLField(blank=True, default='')
    emoji       = models.CharField(max_length=10, default='🩸')
    date_story  = models.DateTimeField(auto_now_add=True)
    vues        = models.ManyToManyField('auth.User', related_name='stories_vues', blank=True)
    
    class Meta:
        ordering = ['-date_story']
    
    def __str__(self):
        return f"Story de {self.auteur.username} - {self.date_story.strftime('%d/%m/%Y %H:%M')}"
    
    def nb_vues(self):
        return self.vues.count()
    
    def est_active(self):
        from django.utils import timezone
        from datetime import timedelta
        return timezone.now() - self.date_story < timedelta(hours=24)
        # ── Feed Communautaire ────────────────────────────────────────────────

 
 
class Like(models.Model):
    post    = models.ForeignKey(Post, on_delete=models.CASCADE)
    user    = models.ForeignKey(User, on_delete=models.CASCADE)
    date    = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        unique_together = ('post', 'user')
 
 
class Commentaire(models.Model):
    post        = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='commentaires')
    auteur      = models.ForeignKey(User, on_delete=models.CASCADE)
    contenu     = models.TextField()
    date_com    = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        ordering = ['date_com']
 
 
# ── Équipes & Groupes ─────────────────────────────────────────────────
class Equipe(models.Model):
    nom         = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    createur    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='equipes_creees')
    code_invite = models.CharField(max_length=10, unique=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    logo_emoji  = models.CharField(max_length=5, default='🏆')
    type_equipe = models.CharField(max_length=20, default='association',
                    choices=[('entreprise','Entreprise'),('ecole','École'),('association','Association'),('amis','Amis')])
 
    def nb_membres(self):
        return self.membres.count()
 
    def score_total(self):
        total = 0
        for m in self.membres.select_related('donneur__user'):
            try:
                d = m.user.donneur
                total += Don.objects.filter(donneur=d).count() * 10
                total += Reponse_Appel.objects.filter(donneur=d).count() * 25
            except: pass
        return total
 
    def __str__(self):
        return self.nom
 
 
class MembreEquipe(models.Model):
    equipe  = models.ForeignKey(Equipe, on_delete=models.CASCADE, related_name='membres')
    user    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='equipes')
    date_adhesion = models.DateTimeField(auto_now_add=True)
    role    = models.CharField(max_length=20, default='membre',
                choices=[('admin','Admin'),('membre','Membre')])
 
    class Meta:
        unique_together = ('equipe', 'user')
 
 
class Challenge(models.Model):
    equipe_1    = models.ForeignKey(Equipe, on_delete=models.CASCADE, related_name='challenges_lances')
    equipe_2    = models.ForeignKey(Equipe, on_delete=models.CASCADE, related_name='challenges_recus')
    objectif    = models.IntegerField(default=10)  # nombre de dons
    date_debut  = models.DateField()
    date_fin    = models.DateField()
    statut      = models.CharField(max_length=20, default='en_cours',
                    choices=[('en_cours','En cours'),('termine','Terminé'),('annule','Annulé')])
    gagnant     = models.ForeignKey(Equipe, null=True, blank=True, on_delete=models.SET_NULL, related_name='challenges_gagnes')
 
 
# ── Dashboard Santé Personnel ─────────────────────────────────────────
class DonneeSante(models.Model):
    donneur = models.ForeignKey(
        Donneur, on_delete=models.CASCADE, related_name='donnees_sante'
    )
    hemoglobine = models.FloatField(
        help_text="Taux d'hémoglobine en g/dL",
        default=0.0  # ← add this
    )
    tension_arterielle = models.CharField(
        max_length=20,
        help_text="Tension artérielle (ex: 120/80)",
        default='120/80'  # ← add this
    )
    poids = models.FloatField(null=True, blank=True, help_text="Poids en kg")
    frequence_cardiaque = models.IntegerField(
        null=True, blank=True, help_text="Fréquence cardiaque (bpm)"
    )
    notes = models.TextField(blank=True, default='')
    date_mesure = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_mesure']

    def __str__(self):
        return f"{self.donneur.user.username} — Hgb:{self.hemoglobine} — {self.date_mesure.strftime('%d/%m/%Y')}"

    def statut_hemoglobine(self):
        seuil = 13.0 if self.donneur.sexe == 'H' else 12.0
        if self.hemoglobine < seuil:
            return 'bas'
        elif self.hemoglobine > 17.5:
            return 'eleve'
        return 'normal'

    def peut_donner(self):
        seuil = 13.0 if self.donneur.sexe == 'H' else 12.5
        return self.hemoglobine >= seuil

    def recommandations(self):
        recs = []
        statut = self.statut_hemoglobine()
        if statut == 'bas':
            recs.append("⚠️ Hémoglobine basse — augmentez la consommation de fer (viande rouge, légumineuses, épinards).")
            recs.append("🍊 Associez le fer à la vitamine C pour améliorer son absorption.")
            recs.append("❌ Don de sang déconseillé jusqu'à normalisation.")
        elif statut == 'eleve':
            recs.append("ℹ️ Hémoglobine élevée — consultez un médecin.")
        else:
            recs.append("✅ Hémoglobine normale — vous êtes éligible au don.")
        try:
            sys, dia = [int(x) for x in self.tension_arterielle.split('/')]
            if sys > 140 or dia > 90:
                recs.append("⚠️ Tension artérielle élevée — consultez un médecin avant de donner.")
            elif sys < 90 or dia < 60:
                recs.append("⚠️ Tension artérielle basse — hydratez-vous bien avant le don.")
            else:
                recs.append("✅ Tension artérielle normale.")
        except Exception:
            pass
        if self.frequence_cardiaque:
            if self.frequence_cardiaque > 100:
                recs.append("⚠️ Fréquence cardiaque élevée — reposez-vous avant le don.")
            elif self.frequence_cardiaque < 50:
                recs.append("ℹ️ Fréquence cardiaque basse — signalez-le au personnel médical.")
        return recs
 
 
# ── Programme Récompenses ─────────────────────────────────────────────
class Recompense(models.Model):
    titre       = models.CharField(max_length=100)
    description = models.TextField()
    partenaire  = models.CharField(max_length=100)
    points_requis = models.IntegerField(default=100)
    reduction_pct = models.IntegerField(default=10)
    valide_jusqu = models.DateField(null=True, blank=True)
    emoji        = models.CharField(max_length=5, default='🎁')
    actif        = models.BooleanField(default=True)
 
 
class EchangeRecompense(models.Model):
    donneur     = models.ForeignKey(Donneur, on_delete=models.CASCADE, related_name='echanges')
    recompense  = models.ForeignKey(Recompense, on_delete=models.CASCADE)
    date_echange = models.DateTimeField(auto_now_add=True)
    code_usage  = models.CharField(max_length=20, unique=True)
    utilise     = models.BooleanField(default=False)


# ── Chatbot Hôpitaux ──────────────────────────────────────────────────
class ConversationChatbot(models.Model):
    """Conversations du chatbot pour les hôpitaux"""
    hopital     = models.ForeignKey(Hopital, on_delete=models.CASCADE, related_name='conversations')
    date_debut  = models.DateTimeField(auto_now_add=True)
    active      = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Conversation {self.hopital.nom} - {self.date_debut.strftime('%d/%m/%Y %H:%M')}"


class MessageChatbot(models.Model):
    """Messages du chatbot"""
    ROLE_CHOICES = [
        ('user', 'Utilisateur'),
        ('assistant', 'Assistant'),
    ]
    
    conversation = models.ForeignKey(ConversationChatbot, on_delete=models.CASCADE, related_name='messages')
    role         = models.CharField(max_length=10, choices=ROLE_CHOICES)
    contenu      = models.TextField()
    date_message = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['date_message']
    
    def __str__(self):
        return f"{self.role}: {self.contenu[:50]}"


# ── Prédiction Stock (Admin) ──────────────────────────────────────────
class StockSang(models.Model):
    """Stock de sang par groupe sanguin"""
    groupe_sanguin = models.CharField(max_length=3, unique=True)
    quantite_actuelle = models.IntegerField(default=0)
    seuil_alerte   = models.IntegerField(default=50)
    seuil_critique = models.IntegerField(default=20)
    date_maj       = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.groupe_sanguin}: {self.quantite_actuelle} unités"
    
    def niveau_stock(self):
        if self.quantite_actuelle <= self.seuil_critique:
            return 'critique'
        elif self.quantite_actuelle <= self.seuil_alerte:
            return 'alerte'
        return 'normal'


class PredictionStock(models.Model):
    """Prédictions de stock pour les admins"""
    groupe_sanguin = models.CharField(max_length=3)
    date_prediction = models.DateField()
    quantite_predite = models.IntegerField()
    confiance      = models.DecimalField(max_digits=5, decimal_places=2, help_text="Pourcentage de confiance")
    date_calcul    = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['date_prediction']
    
    def __str__(self):
        return f"{self.groupe_sanguin} - {self.date_prediction}: {self.quantite_predite} unités ({self.confiance}%)"
