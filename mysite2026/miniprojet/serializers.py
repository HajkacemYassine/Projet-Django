from rest_framework import serializers
from .models import Donneur, Hopital, Don, DemandeUrgente, Campagne, Inscription, Reponse_Appel
from datetime import date
 
 
class HopitalSerializer(serializers.ModelSerializer):
    agrement = serializers.CharField(source='num_agrement', read_only=True)
 
    class Meta:
        model  = Hopital
        fields = ['id', 'nom', 'adresse', 'ville', 'telephone', 'agrement', 'num_agrement', 'valide']
 
 
class HopitalSimpleSerializer(serializers.ModelSerializer):
    """Version simplifiée pour les listes déroulantes"""
    class Meta:
        model  = Hopital
        fields = ['id', 'nom', 'ville']
 
 
class DonneurSerializer(serializers.ModelSerializer):
    username  = serializers.CharField(source='user.username',       read_only=True)
    email     = serializers.CharField(source='user.email',          read_only=True)
    full_name = serializers.CharField(source='user.get_full_name',  read_only=True)
    nom       = serializers.SerializerMethodField()
    nb_dons   = serializers.SerializerMethodField()
 
    class Meta:
        model  = Donneur
        fields = [
            'id', 'username', 'email', 'full_name', 'nom',
            'groupe_sanguin', 'sexe', 'date_naissance',
            'ville', 'telephone', 'actif', 'nb_dons'
        ]
 
    def get_nom(self, obj):
        return obj.user.get_full_name() or obj.user.username
 
    def get_nb_dons(self, obj):
        try:
            return Don.objects.filter(donneur=obj).count()
        except:
            return 0
 
 
class DemandeUrgenteSerializer(serializers.ModelSerializer):
    hopital_nom   = serializers.CharField(source='hopital.nom',   read_only=True)
    hopital_ville = serializers.CharField(source='hopital.ville', read_only=True)
    nb_reponses   = serializers.SerializerMethodField()
    est_urgente   = serializers.SerializerMethodField()
    delai         = serializers.DateField(source='date_demande')
 
    class Meta:
        model  = DemandeUrgente
        fields = [
            'id', 'groupe_sanguin', 'quantite', 'delai',
            'statut', 'description', 'hopital_nom', 'hopital_ville',
            'nb_reponses', 'est_urgente'
        ]
 
    def get_nb_reponses(self, obj):
        return Reponse_Appel.objects.filter(demande_urgente=obj).count()
 
    def get_est_urgente(self, obj):
        try:
            if obj.date_demande >= date.today():
                return (obj.date_demande - date.today()).days <= 3
            return True
        except:
            return False
 
 
class DonSerializer(serializers.ModelSerializer):
    hopital_nom = serializers.CharField(source='hopital.nom', read_only=True)
 
    class Meta:
        model  = Don
        fields = ['id', 'date_don', 'hopital', 'hopital_nom', 'notes', 'valide']
 
 
class CampagneSerializer(serializers.ModelSerializer):
    hopital_nom      = serializers.CharField(source='hopital.nom', read_only=True)
    capacite_totale  = serializers.IntegerField(source='capacite')
    nb_inscrits      = serializers.SerializerMethodField()
    places_restantes = serializers.SerializerMethodField()
    est_complete     = serializers.SerializerMethodField()
 
    class Meta:
        model  = Campagne
        fields = [
            'id', 'nom', 'date', 'lieu', 'groupes_cibles', 'description',
            'capacite_totale', 'hopital_nom',
            'nb_inscrits', 'places_restantes', 'est_complete'
        ]
 
    def get_nb_inscrits(self, obj):
        return Inscription.objects.filter(campagne=obj).count()
 
    def get_places_restantes(self, obj):
        return obj.capacite - Inscription.objects.filter(campagne=obj).count()
 
    def get_est_complete(self, obj):
        return Inscription.objects.filter(campagne=obj).count() >= obj.capacite
 
 
class InscriptionSerializer(serializers.ModelSerializer):
    campagne_nom  = serializers.CharField(source='campagne.nom',  read_only=True)
    campagne_date = serializers.DateField(source='campagne.date', read_only=True)
    campagne_lieu = serializers.CharField(source='campagne.lieu', read_only=True)
 
    class Meta:
        model  = Inscription
        fields = ['id', 'campagne', 'campagne_nom', 'campagne_date', 'campagne_lieu', 'crenau_horaire', 'present']
 
 
class ReponseAppelSerializer(serializers.ModelSerializer):
    donneur_nom    = serializers.CharField(source='donneur.user.username', read_only=True)
    donneur_groupe = serializers.CharField(source='donneur.groupe_sanguin', read_only=True)
    donneur_ville  = serializers.CharField(source='donneur.ville', read_only=True)
 
    class Meta:
        model  = Reponse_Appel
        fields = ['id', 'donneur_nom', 'donneur_groupe', 'donneur_ville', 'date_reponse', 'statut_reponse']