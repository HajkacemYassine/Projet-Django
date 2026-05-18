from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework import status
from datetime import date, timedelta
import csv
import random
import string
from django.shortcuts import get_object_or_404

from miniprojet.models import (
    Donneur, Hopital, Don, DemandeUrgente,
    Campagne, Inscription, Reponse_Appel, DonneeSante, BloodStock, BloodStockNotification
)
from miniprojet.serializers import (
    BloodStockNotificationSerializer, DonneurSerializer, HopitalSerializer, HopitalSimpleSerializer,
    DemandeUrgenteSerializer, DonSerializer, CampagneSerializer,
    InscriptionSerializer, ReponseAppelSerializer, DonneeSanteSerializer, BloodStockSerializer
)
 
 
# ─── AUTH ─────────────────────────────────────────────────────────────────
 
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    email    = request.data.get('email', '')
    password = request.data.get('password1')
    role     = request.data.get('role')
 
    if not username or not password:
        return Response({'error': 'Champs requis manquants.'}, status=400)
 
    if User.objects.filter(username=username).exists():
        return Response({'error': "Ce nom d'utilisateur est déjà pris."}, status=400)
 
    user = User.objects.create_user(
        username=username, email=email, password=password,
        first_name=request.data.get('first_name', ''),
        last_name=request.data.get('last_name', ''),
    )
 
    if role == 'donneur':
        Donneur.objects.create(
            user=user,
            groupe_sanguin=request.data.get('groupe_sanguin', 'O+'),
            sexe=request.data.get('sexe', 'H'),
            date_naissance=request.data.get('date_naissance', '2000-01-01'),
            ville=request.data.get('ville', ''),
            telephone=request.data.get('telephone', ''),
            actif=True,
        )
    elif role == 'hopital':
        Hopital.objects.create(
            user=user,
            nom=request.data.get('nom', ''),
            adresse=request.data.get('adresse', ''),
            ville=request.data.get('ville', ''),
            num_agrement=request.data.get('agrement', ''),
            telephone=request.data.get('telephone', ''),
            valide=False,
        )
 
    return Response({'message': 'Compte créé avec succès.'}, status=201)
 
 
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
 
    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Identifiants incorrects.'}, status=401)
 
    try:
        _ = user.donneur
        role = 'donneur'
    except:
        try:
            _ = user.hopital
            role = 'hopital'
        except:
            role = 'admin' if user.is_superuser else 'user'
 
    refresh = RefreshToken.for_user(user)
    return Response({
        'access':  str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id':         user.id,
            'username':   user.username,
            'email':      user.email,
            'first_name': user.first_name,
            'last_name':  user.last_name,
            'is_staff':   user.is_staff,
            'role':       role,
        }
    })
 
 
# ─── DASHBOARDS ───────────────────────────────────────────────────────────
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_donneur(request):
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)
 
    # Calcul éligibilité
    delai_jours = 56 if donneur.sexe == 'H' else 84
    derniers_dons = Don.objects.filter(donneur=donneur).order_by('-date_don')
    dernier_don   = derniers_dons.first()
 
    if dernier_don:
        prochaine_date = dernier_don.date_don + timedelta(days=delai_jours)
        eligible = date.today() >= prochaine_date
    else:
        prochaine_date = date.today()
        eligible = True
 
    # Demandes compatibles
    demandes_qs = DemandeUrgente.objects.filter(
        groupe_sanguin=donneur.groupe_sanguin,
        statut='active'
    ).select_related('hopital')[:5]
 
    # Mes inscriptions campagnes
    mes_inscriptions = Inscription.objects.filter(
        donneur=donneur,
        campagne__date__gte=date.today()
    ).select_related('campagne')[:3]
 
    return Response({
        'groupe_sanguin':          donneur.groupe_sanguin,
        'sexe':                    donneur.sexe,
        'ville':                   donneur.ville,
        'telephone':               donneur.telephone,
        'actif':                   donneur.actif,
        'eligible':                eligible,
        'prochaine_date':          prochaine_date,
        'nb_dons':                 derniers_dons.count(),
        'nb_demandes_compatibles': DemandeUrgente.objects.filter(
                                       groupe_sanguin=donneur.groupe_sanguin,
                                       statut='active'
                                   ).count(),
        'nb_campagnes':            Campagne.objects.filter(date__gte=date.today()).count(),
        'nb_reponses':             Reponse_Appel.objects.filter(donneur=donneur).count(),
        'demandes_recentes':       DemandeUrgenteSerializer(demandes_qs, many=True).data,
        'mes_inscriptions':        InscriptionSerializer(mes_inscriptions, many=True).data,
    })
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classement_donneurs(request):
    """GET /blood-api/classement/"""
    from miniprojet.models import Badge
 
    donneurs = Donneur.objects.select_related('user').all()
    classement = []
 
    for d in donneurs:
        nb_dons     = Don.objects.filter(donneur=d).count()
        nb_urgences = Reponse_Appel.objects.filter(donneur=d).count()
        nb_badges   = Badge.objects.filter(donneur=d).count()
        score       = (nb_dons * 10) + (nb_urgences * 25) + (nb_badges * 5)
 
        if score > 0 or nb_dons > 0:
            classement.append({
                'username':      d.user.username,
                'nom':           d.user.get_full_name() or d.user.username,
                'groupe_sanguin': d.groupe_sanguin,
                'ville':         d.ville,
                'nb_dons':       nb_dons,
                'nb_urgences':   nb_urgences,
                'nb_badges':     nb_badges,
                'score':         score,
                'is_me':         d.user == request.user,
            })
 
    classement.sort(key=lambda x: x['score'], reverse=True)
 
    # Ajouter le rang
    for i, c in enumerate(classement):
        c['rang'] = i + 1
 
    return Response(classement[:20])  # Top 20
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_hopital(request):
    try:
        hopital = request.user.hopital
    except:
        return Response({'error': 'Pas un hôpital'}, status=403)
 
    demandes_qs = DemandeUrgente.objects.filter(
        hopital=hopital, statut='active'
    ).select_related('hopital')
 
    return Response({
        'nom':                hopital.nom,
        'adresse':            hopital.adresse,
        'ville':              hopital.ville,
        'agrement':           hopital.num_agrement,
        'valide':             hopital.valide,
        'email':              hopital.user.email,
        'nb_demandes_actives': demandes_qs.count(),
        'nb_dons_recus':      Don.objects.filter(hopital=hopital).count(),
        'nb_campagnes':       Campagne.objects.filter(hopital=hopital).count(),
        'nb_reponses':        Reponse_Appel.objects.filter(
                                  demande_urgente__hopital=hopital
                              ).count(),
        'demandes_actives':   DemandeUrgenteSerializer(demandes_qs, many=True).data,
    })
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_admin(request):
    if not request.user.is_superuser:
        return Response({'error': 'Accès refusé'}, status=403)
 
    donneurs_qs         = Donneur.objects.select_related('user').all()
    hopitaux_qs         = Hopital.objects.all()
    hopitaux_attente_qs = Hopital.objects.filter(valide=False)
    demandes_qs         = DemandeUrgente.objects.select_related('hopital').all()
 
    # Demandes par groupe sanguin
    groupes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    demandes_par_groupe = [{
        'groupe': g,
        'nb': DemandeUrgente.objects.filter(groupe_sanguin=g, statut='active').count()
    } for g in groupes]
 
    return Response({
        'nb_donneurs':         Donneur.objects.count(),
        'nb_hopitaux':         Hopital.objects.filter(valide=True).count(),
        'nb_dons':             Don.objects.count(),
        'nb_demandes':         DemandeUrgente.objects.filter(statut='active').count(),
        'hopitaux_attente':    HopitalSerializer(hopitaux_attente_qs, many=True).data,
        'tous_donneurs':       DonneurSerializer(donneurs_qs,  many=True).data,
        'tous_hopitaux':       HopitalSerializer(hopitaux_qs,  many=True).data,
        'demandes_actives':    DemandeUrgenteSerializer(demandes_qs.filter(statut='active')[:5], many=True).data,
        'toutes_demandes':     DemandeUrgenteSerializer(demandes_qs, many=True).data,
        'demandes_par_groupe': demandes_par_groupe,
    })
 
 
# ─── DEMANDES URGENTES ────────────────────────────────────────────────────
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def demandes_list(request):
    """GET /blood-api/demandes-urgentes/ — liste compatible avec le donneur"""
    try:
        donneur  = request.user.donneur
        demandes = DemandeUrgente.objects.filter(
            groupe_sanguin=donneur.groupe_sanguin,
            statut='active'
        ).select_related('hopital')
    except:
        demandes = DemandeUrgente.objects.filter(
            statut='active'
        ).select_related('hopital')
 
    return Response(DemandeUrgenteSerializer(demandes, many=True).data)
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_demandes(request):
    """GET /blood-api/demandes-urgentes/mes-demandes/ — demandes de l'hôpital"""
    try:
        hopital = request.user.hopital
    except:
        return Response({'error': 'Pas un hôpital'}, status=403)
 
    demandes = DemandeUrgente.objects.filter(
        hopital=hopital
    ).order_by('-date_demande').select_related('hopital')
 
    return Response(DemandeUrgenteSerializer(demandes, many=True).data)
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def creer_demande(request):
    """POST /blood-api/demandes-urgentes/creer/"""
    try:
        hopital = request.user.hopital
    except:
        return Response({'error': 'Pas un hôpital'}, status=403)
 
    # Vérifier que l'hôpital est validé
    if not hopital.valide:
        return Response({'error': 'Votre compte hôpital n\'est pas encore validé par l\'administrateur.'}, status=403)
 
    groupe_sanguin = request.data.get('groupe_sanguin')
    quantite       = request.data.get('quantite')
    delai          = request.data.get('delai')
    description    = request.data.get('description', '')
 
    if not groupe_sanguin or not quantite or not delai:
        return Response({'error': 'Champs requis manquants.'}, status=400)
 
    demande = DemandeUrgente.objects.create(
        hopital=hopital,
        groupe_sanguin=groupe_sanguin,
        quantite=int(quantite),
        date_demande=delai,
        statut='active',
        description=description,
    )
 
    return Response(DemandeUrgenteSerializer(demande).data, status=201)
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cloturer_demande(request, pk):
    """POST /blood-api/demandes-urgentes/<pk>/cloturer/"""
    try:
        hopital = request.user.hopital
        demande = DemandeUrgente.objects.get(pk=pk, hopital=hopital)
        demande.statut = 'cloturee'
        demande.save()
        return Response({'message': 'Demande clôturée.'})
    except DemandeUrgente.DoesNotExist:
        return Response({'error': 'Demande introuvable.'}, status=404)
    except:
        return Response({'error': 'Accès refusé.'}, status=403)
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reponses_demande(request, pk):
    """GET /blood-api/demandes-urgentes/<pk>/reponses/ — donneurs ayant répondu"""
    try:
        hopital = request.user.hopital
        demande = DemandeUrgente.objects.get(pk=pk, hopital=hopital)
    except:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    reponses = Reponse_Appel.objects.filter(
        demande_urgente=demande
    ).select_related('donneur__user')
 
    return Response(ReponseAppelSerializer(reponses, many=True).data)
 
 
# ─── DONS ─────────────────────────────────────────────────────────────────
 
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def mes_dons(request):
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)
 
    if request.method == 'GET':
        dons = Don.objects.filter(donneur=donneur).select_related('hopital').order_by('-date_don')
        return Response(DonSerializer(dons, many=True).data)
 
    elif request.method == 'POST':
        hopital_id = request.data.get('hopital')
        date_don   = request.data.get('date_don')
        notes      = request.data.get('notes', '')
 
        if not hopital_id or not date_don:
            return Response({'error': 'Hôpital et date requis.'}, status=400)
 
        # Vérifier éligibilité
        if not donneur.actif:
            return Response({'error': 'Votre compte est désactivé.'}, status=400)
 
        try:
            hopital = Hopital.objects.get(pk=hopital_id)
        except Hopital.DoesNotExist:
            return Response({'error': 'Hôpital introuvable.'}, status=404)
 
        don = Don.objects.create(
            donneur=donneur,
            hopital=hopital,
            date_don=date_don,
            notes=notes,
            valide=True,
        )
 
        return Response(DonSerializer(don).data, status=201)
 
 
# ─── HÔPITAUX ─────────────────────────────────────────────────────────────
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hopitaux_list(request):
    """GET /blood-api/hopitaux/ — liste des hôpitaux validés"""
    hopitaux = Hopital.objects.filter(valide=True)
    return Response(HopitalSimpleSerializer(hopitaux, many=True).data)
 
 
# ─── VALIDATION HÔPITAL (Admin) ───────────────────────────────────────────
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def valider_hopital(request, pk):
    """POST /blood-api/hopitaux/<pk>/valider/"""
    if not request.user.is_superuser:
        return Response({'error': 'Accès refusé.'}, status=403)
    try:
        hopital = Hopital.objects.get(pk=pk)
        hopital.valide = True
        hopital.save()
        return Response({'message': f'{hopital.nom} validé avec succès.'})
    except Hopital.DoesNotExist:
        return Response({'error': 'Hôpital introuvable.'}, status=404)
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rejeter_hopital(request, pk):
    """POST /blood-api/hopitaux/<pk>/rejeter/"""
    if not request.user.is_superuser:
        return Response({'error': 'Accès refusé.'}, status=403)
    try:
        hopital = Hopital.objects.get(pk=pk)
        nom = hopital.nom
        hopital.user.delete()
        return Response({'message': f'{nom} rejeté et supprimé.'})
    except Hopital.DoesNotExist:
        return Response({'error': 'Hôpital introuvable.'}, status=404)
 
 
# ─── CAMPAGNES ────────────────────────────────────────────────────────────
 
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def campagnes_list(request):
    if request.method == 'GET':
        campagnes = Campagne.objects.all().select_related('hopital').order_by('date')
        return Response(CampagneSerializer(campagnes, many=True).data)
 
    elif request.method == 'POST':
        try:
            hopital = request.user.hopital
        except:
            return Response({'error': 'Pas un hôpital'}, status=403)
 
        nom            = request.data.get('nom')
        date_camp      = request.data.get('date')
        lieu           = request.data.get('lieu', '')
        groupes_cibles = request.data.get('groupes_cibles', '')
        capacite       = request.data.get('capacite_totale')
        description    = request.data.get('description', '')
 
        if not nom or not date_camp or not capacite:
            return Response({'error': 'Champs requis manquants.'}, status=400)
 
        campagne = Campagne.objects.create(
            hopital=hopital,
            nom=nom,
            date=date_camp,
            lieu=lieu,
            groupes_cibles=groupes_cibles,
            capacite=int(capacite),
            description=description,
        )
 
        return Response(CampagneSerializer(campagne).data, status=201)
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_campagnes(request):
    """GET /blood-api/campagnes/mes-campagnes/"""
    try:
        hopital = request.user.hopital
    except:
        return Response({'error': 'Pas un hôpital'}, status=403)
 
    campagnes = Campagne.objects.filter(hopital=hopital).order_by('-date')
    return Response(CampagneSerializer(campagnes, many=True).data)
 
 
# ─── INSCRIPTIONS CAMPAGNE ────────────────────────────────────────────────
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def inscrire_campagne(request):
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)
 
    campagne_id = request.data.get('campagne')
    creneau     = request.data.get('creneau_horaire', '09:00')
 
    if not campagne_id:
        return Response({'error': 'Campagne requise.'}, status=400)
 
    try:
        campagne = Campagne.objects.get(pk=campagne_id)
    except Campagne.DoesNotExist:
        return Response({'error': 'Campagne introuvable.'}, status=404)
 
    if Inscription.objects.filter(campagne=campagne).count() >= campagne.capacite:
        return Response({'error': 'La campagne est complète.'}, status=400)
 
    if Inscription.objects.filter(campagne=campagne, donneur=donneur).exists():
        return Response({'error': 'Vous êtes déjà inscrit à cette campagne.'}, status=400)
 
    inscription = Inscription.objects.create(
        campagne=campagne,
        donneur=donneur,
        date_inscription=date.today(),
        crenau_horaire=creneau,
    )
 
    return Response(InscriptionSerializer(inscription).data, status=201)
 
 
# ─── RÉPONSE APPEL ────────────────────────────────────────────────────────
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def repondre_appel(request):
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)
 
    # Vérifier éligibilité
    if not donneur.actif:
        return Response({'error': 'Votre compte est désactivé.'}, status=400)
 
    delai_jours   = 56 if donneur.sexe == 'H' else 84
    dernier_don   = Don.objects.filter(donneur=donneur).order_by('-date_don').first()
    if dernier_don:
        prochaine = dernier_don.date_don + timedelta(days=delai_jours)
        if date.today() < prochaine:
            jours_restants = (prochaine - date.today()).days
            return Response({
                'error': f'Vous n\'êtes pas encore éligible. Encore {jours_restants} jours.'
            }, status=400)
 
    demande_id = request.data.get('demande')
    if not demande_id:
        return Response({'error': 'Demande requise.'}, status=400)
 
    try:
        demande = DemandeUrgente.objects.get(pk=demande_id, statut='active')
    except DemandeUrgente.DoesNotExist:
        return Response({'error': 'Demande introuvable ou clôturée.'}, status=404)
 
    if Reponse_Appel.objects.filter(demande_urgente=demande, donneur=donneur).exists():
        return Response({'error': 'Vous avez déjà répondu à cet appel.'}, status=400)
 
    reponse = Reponse_Appel.objects.create(
        donneur=donneur,
        demande_urgente=demande,
        date_reponse=date.today(),
        statut_reponse='en_attente',
    )
 
    return Response(ReponseAppelSerializer(reponse).data, status=201)
 
 
# ─── PROFIL ───────────────────────────────────────────────────────────────
 
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profil(request):
    user = request.user
 
    if request.method == 'GET':
        data = {
            'username':   user.username,
            'first_name': user.first_name,
            'last_name':  user.last_name,
            'email':      user.email,
        }
        try:
            d = user.donneur
            data.update(DonneurSerializer(d).data)
            data['role'] = 'donneur'
        except:
            try:
                h = user.hopital
                data.update(HopitalSerializer(h).data)
                data['role'] = 'hopital'
            except:
                data['role'] = 'admin'
        return Response(data)
 
    elif request.method == 'PATCH':
        if 'first_name' in request.data: user.first_name = request.data['first_name']
        if 'last_name'  in request.data: user.last_name  = request.data['last_name']
        if 'email'      in request.data: user.email      = request.data['email']
        user.save()
 
        try:
            donneur = user.donneur
            if 'ville'     in request.data: donneur.ville     = request.data['ville']
            if 'telephone' in request.data: donneur.telephone = request.data['telephone']
            if 'actif'     in request.data: donneur.actif     = request.data['actif']
            donneur.save()
            return Response(DonneurSerializer(donneur).data)
        except:
            pass
 
        try:
            hopital = user.hopital
            if 'nom'     in request.data: hopital.nom     = request.data['nom']
            if 'adresse' in request.data: hopital.adresse = request.data['adresse']
            if 'ville'   in request.data: hopital.ville   = request.data['ville']
            hopital.save()
            return Response(HopitalSerializer(hopital).data)
        except:
            pass
 
        return Response({'message': 'Profil mis à jour avec succès.'})
 
 
# ─── EXPORT CSV ───────────────────────────────────────────────────────────
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_csv_donneurs(request):
    """GET /blood-api/export-csv/ — export CSV des donneurs (admin seulement)"""
    if not request.user.is_superuser:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="donneurs_bloodconnect.csv"'
 
    # BOM UTF-8 pour Excel
    response.write('\ufeff')
 
    writer = csv.writer(response)
    writer.writerow([
        'Username', 'Nom complet', 'Email',
        'Groupe sanguin', 'Sexe', 'Date naissance',
        'Ville', 'Téléphone', 'Actif', 'Nb dons'
    ])
 
    for d in Donneur.objects.select_related('user').all():
        writer.writerow([
            d.user.username,
            d.user.get_full_name() or d.user.username,
            d.user.email,
            d.groupe_sanguin,
            'Homme' if d.sexe == 'H' else 'Femme',
            d.date_naissance,
            d.ville,
            d.telephone,
            'Oui' if d.actif else 'Non',
            Don.objects.filter(donneur=d).count()
        ])
 
    return response
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def toutes_demandes(request):
    demandes = DemandeUrgente.objects.filter(statut='active').select_related('hopital')
    return Response(DemandeUrgenteSerializer(demandes, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_reponses(request):
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)
    reponses = Reponse_Appel.objects.filter(donneur=donneur).select_related('demande_urgente__hopital').order_by('-date_reponse')
    data = [{
        'id': r.id,
        'date_reponse': r.date_reponse,
        'statut_reponse': r.statut_reponse,
        'groupe_sanguin': r.demande_urgente.groupe_sanguin,
        'hopital_nom': r.demande_urgente.hopital.nom,
    } for r in reponses]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_inscriptions(request):
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)
    inscriptions = Inscription.objects.filter(donneur=donneur).select_related('campagne').order_by('-date_inscription')
    return Response(InscriptionSerializer(inscriptions, many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def stats_view(request):
    return Response({
        'nb_donneurs': Donneur.objects.count(),
        'nb_hopitaux': Hopital.objects.filter(valide=True).count(),
        'nb_dons': Don.objects.count(),
    })
def attribuer_badges(donneur):
    """Appelé après chaque don ou réponse pour vérifier et attribuer les badges"""
    from miniprojet.models import Badge
 
    nb_dons      = Don.objects.filter(donneur=donneur).count()
    nb_urgences  = Reponse_Appel.objects.filter(donneur=donneur).count()
    nb_campagnes = Inscription.objects.filter(donneur=donneur).count()
 
    # Badges selon nb dons
    if nb_dons >= 1:
        Badge.objects.get_or_create(donneur=donneur, type_badge='premier_don')
    if nb_dons >= 5:
        Badge.objects.get_or_create(donneur=donneur, type_badge='cinq_dons')
    if nb_dons >= 10:
        Badge.objects.get_or_create(donneur=donneur, type_badge='dix_dons')
    if nb_dons >= 20:
        Badge.objects.get_or_create(donneur=donneur, type_badge='vingt_dons')
 
    # Badges urgences
    if nb_urgences >= 1:
        Badge.objects.get_or_create(donneur=donneur, type_badge='urgence')
    if nb_urgences >= 3:
        Badge.objects.get_or_create(donneur=donneur, type_badge='trois_urgences')
 
    # Badges campagnes
    if nb_campagnes >= 1:
        Badge.objects.get_or_create(donneur=donneur, type_badge='campagne')
 
    # Donneur régulier : au moins 1 don tous les 3 mois sur 6 mois
    from datetime import date, timedelta
    six_mois = date.today() - timedelta(days=180)
    dons_recents = Don.objects.filter(donneur=donneur, date_don__gte=six_mois).count()
    if dons_recents >= 2:
        Badge.objects.get_or_create(donneur=donneur, type_badge='regulier')
 
    # Ambassadeur : 10 dons + 3 urgences + 1 campagne
    if nb_dons >= 10 and nb_urgences >= 3 and nb_campagnes >= 1:
        Badge.objects.get_or_create(donneur=donneur, type_badge='ambassadeur')
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_badges(request):
    """GET /blood-api/mes-badges/"""
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)
 
    from miniprojet.models import Badge
 
    # Recalculer les badges à chaque appel
    attribuer_badges(donneur)
 
    badges = Badge.objects.filter(donneur=donneur).order_by('date_obtenu')
 
    BADGE_INFO = {
        'premier_don':    {'emoji': '🩸', 'label': 'Premier Don',           'desc': 'Vous avez effectué votre premier don !',             'color': '#e74c3c'},
        'cinq_dons':      {'emoji': '🏅', 'label': '5 Dons',                'desc': 'Vous avez donné 5 fois. Merci !',                     'color': '#e67e22'},
        'dix_dons':       {'emoji': '🥇', 'label': '10 Dons',               'desc': 'Incroyable ! 10 dons enregistrés.',                   'color': '#f39c12'},
        'vingt_dons':     {'emoji': '🏆', 'label': '20 Dons',               'desc': 'Vous êtes une légende du don de sang !',              'color': '#d4ac0d'},
        'urgence':        {'emoji': '⚡', 'label': 'Héros de l\'Urgence',   'desc': 'Vous avez répondu à un appel urgent.',                'color': '#8e44ad'},
        'trois_urgences': {'emoji': '🦸', 'label': 'Super Héros',           'desc': '3 urgences ! Vous sauvez des vies.',                  'color': '#6c3483'},
        'campagne':       {'emoji': '📅', 'label': 'Participant Campagne',  'desc': 'Vous avez participé à une campagne de collecte.',     'color': '#2980b9'},
        'regulier':       {'emoji': '⭐', 'label': 'Donneur Régulier',      'desc': 'Vous donnez régulièrement depuis 6 mois.',            'color': '#27ae60'},
        'ambassadeur':    {'emoji': '👑', 'label': 'Ambassadeur',           'desc': 'Vous incarnez l\'esprit BloodConnect !',              'color': '#c0392b'},
    }
 
    data = [{
        'id':         b.id,
        'type':       b.type_badge,
        'emoji':      BADGE_INFO.get(b.type_badge, {}).get('emoji', '🎖️'),
        'label':      BADGE_INFO.get(b.type_badge, {}).get('label', b.type_badge),
        'desc':       BADGE_INFO.get(b.type_badge, {}).get('desc', ''),
        'color':      BADGE_INFO.get(b.type_badge, {}).get('color', '#666'),
        'date':       b.date_obtenu.strftime('%d/%m/%Y'),
    } for b in badges]
 
    # Calcul niveau et score
    nb_dons     = Don.objects.filter(donneur=donneur).count()
    nb_urgences = Reponse_Appel.objects.filter(donneur=donneur).count()
    score       = (nb_dons * 10) + (nb_urgences * 25) + (len(data) * 5)
 
    niveau = 'Bronze'
    if score >= 500:  niveau = 'Diamant'
    elif score >= 200: niveau = 'Or'
    elif score >= 100: niveau = 'Argent'
 
    return Response({
        'badges':      data,
        'nb_badges':   len(data),
        'score':       score,
        'niveau':      niveau,
        'nb_dons':     nb_dons,
        'nb_urgences': nb_urgences,
        'prochain_badge': _prochain_badge(nb_dons, nb_urgences),
    })
 
 
def _prochain_badge(nb_dons, nb_urgences):
    """Indique le prochain badge à débloquer"""
    if nb_dons < 1:  return {'label': 'Premier Don',  'emoji': '🩸', 'manque': f'{1 - nb_dons} don',      'progress': 0}
    if nb_dons < 5:  return {'label': '5 Dons',        'emoji': '🏅', 'manque': f'{5 - nb_dons} dons',     'progress': int((nb_dons/5)*100)}
    if nb_dons < 10: return {'label': '10 Dons',       'emoji': '🥇', 'manque': f'{10 - nb_dons} dons',    'progress': int((nb_dons/10)*100)}
    if nb_urgences < 3: return {'label': 'Super Héros','emoji': '🦸', 'manque': f'{3 - nb_urgences} urgence(s)', 'progress': int((nb_urgences/3)*100)}
    if nb_dons < 20: return {'label': '20 Dons',       'emoji': '🏆', 'manque': f'{20 - nb_dons} dons',    'progress': int((nb_dons/20)*100)}
    return {'label': 'Ambassadeur',                     'emoji': '👑', 'manque': 'Continuez ainsi !',       'progress': 100}
# ─── Helper : Créer une notification ─────────────────────────────────
 
def creer_notification(user, type_notif, titre, message, lien=''):
    """Crée une notification pour un utilisateur"""
    from miniprojet.models import Notification
    Notification.objects.create(
        user=user, type_notif=type_notif,
        titre=titre, message=message, lien=lien
    )
 
 
# ─── Notifications CRUD ───────────────────────────────────────────────
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_notifications(request):
    """GET /blood-api/notifications/"""
    from miniprojet.models import Notification
    notifs = Notification.objects.filter(user=request.user)[:30]
    nb_non_lues = Notification.objects.filter(user=request.user, lue=False).count()
 
    data = [{
        'id':         n.id,
        'type':       n.type_notif,
        'titre':      n.titre,
        'message':    n.message,
        'lien':       n.lien,
        'lue':        n.lue,
        'date':       n.date_notif.strftime('%d/%m/%Y %H:%M'),
        'date_relative': _date_relative(n.date_notif),
    } for n in notifs]
 
    return Response({'notifications': data, 'nb_non_lues': nb_non_lues})
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def marquer_lue(request, notif_id):
    """POST /blood-api/notifications/<id>/lire/"""
    from miniprojet.models import Notification
    try:
        notif = Notification.objects.get(pk=notif_id, user=request.user)
        notif.lue = True
        notif.save()
        return Response({'message': 'Notification marquée comme lue.'})
    except Notification.DoesNotExist:
        return Response({'error': 'Introuvable.'}, status=404)
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tout_marquer_lu(request):
    """POST /blood-api/notifications/tout-lire/"""
    from miniprojet.models import Notification
    Notification.objects.filter(user=request.user, lue=False).update(lue=True)
    return Response({'message': 'Toutes les notifications marquées comme lues.'})
 
 
def _date_relative(dt):
    """Retourne une date relative : "Il y a 2h", "Hier", etc."""
    from django.utils import timezone
    from datetime import timedelta
    now  = timezone.now()
    diff = now - dt
    if diff.seconds < 60:    return "À l'instant"
    if diff.seconds < 3600:  return f"Il y a {diff.seconds // 60}min"
    if diff.days == 0:       return f"Il y a {diff.seconds // 3600}h"
    if diff.days == 1:       return "Hier"
    if diff.days < 7:        return f"Il y a {diff.days} jours"
    return dt.strftime('%d/%m/%Y')
 
 
# ─── Envoyer notifications aux donneurs compatibles ───────────────────
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notifier_donneurs_compatibles(request, demande_id):
    """
    POST /blood-api/demandes-urgentes/<id>/notifier/
    Notifie tous les donneurs compatibles et éligibles
    """
    try:
        hopital = request.user.hopital
    except:
        return Response({'error': 'Pas un hôpital.'}, status=403)
 
    try:
        demande = DemandeUrgente.objects.get(pk=demande_id, hopital=hopital)
    except DemandeUrgente.DoesNotExist:
        return Response({'error': 'Demande introuvable.'}, status=404)
 
    # Compatibilité groupes sanguins
    COMPATIBILITE = {
        'O-':  ['O-','O+','A-','A+','B-','B+','AB-','AB+'],
        'O+':  ['O+','A+','B+','AB+'],
        'A-':  ['A-','A+','AB-','AB+'],
        'A+':  ['A+','AB+'],
        'B-':  ['B-','B+','AB-','AB+'],
        'B+':  ['B+','AB+'],
        'AB-': ['AB-','AB+'],
        'AB+': ['AB+'],
    }
    groupes_recepteurs = COMPATIBILITE.get(demande.groupe_sanguin, [demande.groupe_sanguin])
 
    from datetime import date, timedelta
    nb_notifies = 0
    donneurs = Donneur.objects.filter(
        groupe_sanguin__in=groupes_recepteurs,
        actif=True
    ).select_related('user')
 
    for donneur in donneurs:
        # Vérifier éligibilité
        delai_jours = 56 if donneur.sexe == 'H' else 84
        dernier_don = Don.objects.filter(donneur=donneur).order_by('-date_don').first()
        if dernier_don:
            prochaine = dernier_don.date_don + timedelta(days=delai_jours)
            if date.today() < prochaine:
                continue  # Pas éligible, on ne notifie pas
 
        creer_notification(
            user=donneur.user,
            type_notif='urgence',
            titre=f'🚨 Appel urgent — Groupe {demande.groupe_sanguin}',
            message=f'{hopital.nom} a besoin de {demande.quantite} poche(s) de sang {demande.groupe_sanguin}. Pouvez-vous aider ?',
            lien=f'demandes/{demande_id}'
        )
        nb_notifies += 1
 
    return Response({
        'message': f'{nb_notifies} donneur(s) notifié(s).',
        'nb_notifies': nb_notifies
    })
 
 
# ─── Carte Centres de Don ───────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def centres_carte(request):
    """
    GET /blood-api/centres-carte/
    Retourne les hôpitaux validés avec infos pour la carte
    """
    hopitaux = Hopital.objects.filter(valide=True).select_related('user')
    data = []
    for h in hopitaux:
        nb_demandes_actives = DemandeUrgente.objects.filter(hopital=h, statut='active').count()
        groupes_urgents = list(
            DemandeUrgente.objects.filter(hopital=h, statut='active')
            .values_list('groupe_sanguin', flat=True).distinct()
        )
        data.append({
            'id':               h.id,
            'nom':              h.nom,
            'adresse':          h.adresse,
            'ville':            h.ville or h.adresse,
            'telephone':        h.telephone,
            'email':            h.user.email,
            'nb_demandes':      nb_demandes_actives,
            'groupes_urgents':  groupes_urgents,
            'critique':         nb_demandes_actives >= 3,
        })
    # Trier : critiques en premier
    data.sort(key=lambda x: x['nb_demandes'], reverse=True)
    return Response(data)


# ─── Alertes SOS ─────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alertes_sos(request):
    """
    GET /blood-api/alertes-sos/
    Retourne les demandes urgentes critiques (délai <= 2 jours)
    """
    try:
        donneur = request.user.donneur
    except:
        return Response({'alertes': [], 'nb': 0})

    from datetime import date, timedelta
    aujourd_hui = date.today()
    dans_2j = aujourd_hui + timedelta(days=2)

    COMPATIBILITE_DONNEUR = {
        'O-':  ['O-','O+','A-','A+','B-','B+','AB-','AB+'],
        'O+':  ['O+','A+','B+','AB+'],
        'A-':  ['A-','A+','AB-','AB+'],
        'A+':  ['A+','AB+'],
        'B-':  ['B-','B+','AB-','AB+'],
        'B+':  ['B+','AB+'],
        'AB-': ['AB-','AB+'],
        'AB+': ['AB+'],
    }
    groupes_receveurs = COMPATIBILITE_DONNEUR.get(donneur.groupe_sanguin, [donneur.groupe_sanguin])

    demandes_critiques = DemandeUrgente.objects.filter(
        groupe_sanguin__in=groupes_receveurs,
        statut='active',
        delai__lte=dans_2j,
    ).select_related('hopital').order_by('delai')

    alertes = [{
        'id':           d.id,
        'groupe':       d.groupe_sanguin,
        'hopital':      d.hopital.nom,
        'ville':        d.hopital.ville or d.hopital.adresse,
        'quantite':     d.quantite,
        'delai':        d.delai.strftime('%d/%m/%Y') if d.delai else None,
        'jours':        (d.delai - aujourd_hui).days if d.delai else 0,
        'description':  d.description,
    } for d in demandes_critiques]

    return Response({'alertes': alertes, 'nb': len(alertes)})


# ─── Agenda Don Personnel ─────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def agenda_don(request):
    """
    GET /blood-api/agenda-don/
    Retourne l'agenda complet du donneur : historique + prochaine date + stats
    """
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)

    from datetime import date, timedelta
    delai_jours = 56 if donneur.sexe == 'H' else 84
    dons = Don.objects.filter(donneur=donneur).select_related('hopital').order_by('-date_don')
    dernier_don = dons.first()

    if dernier_don:
        prochaine_date = dernier_don.date_don + timedelta(days=delai_jours)
        eligible = date.today() >= prochaine_date
        jours_restants = max(0, (prochaine_date - date.today()).days)
    else:
        prochaine_date = date.today()
        eligible = True
        jours_restants = 0

    # Timeline des dons avec intervalles
    timeline = []
    dons_list = list(dons)
    for i, d in enumerate(dons_list):
        intervalle = None
        if i < len(dons_list) - 1:
            intervalle = (d.date_don - dons_list[i+1].date_don).days
        timeline.append({
            'id':         d.id,
            'date':       d.date_don.strftime('%d/%m/%Y'),
            'hopital':    d.hopital.nom,
            'ville':      d.hopital.ville or d.hopital.adresse,
            'notes':      d.notes,
            'valide':     d.valide,
            'intervalle': intervalle,
        })

    # Prochaines campagnes disponibles
    campagnes_proches = Campagne.objects.filter(
        date__gte=date.today()
    ).select_related('hopital').order_by('date')[:3]

    return Response({
        'eligible':        eligible,
        'jours_restants':  jours_restants,
        'prochaine_date':  prochaine_date.strftime('%d/%m/%Y'),
        'delai_jours':     delai_jours,
        'nb_dons':         dons.count(),
        'dernier_don':     dernier_don.date_don.strftime('%d/%m/%Y') if dernier_don else None,
        'timeline':        timeline,
        'campagnes_proches': [{
            'id':    c.id,
            'nom':   c.nom,
            'date':  c.date.strftime('%d/%m/%Y'),
            'lieu':  c.lieu,
            'places': c.places_restantes(),
        } for c in campagnes_proches],
    })


# ─── SOCIAL & COMMUNAUTÉ ─────────────────────────────────────────────────────

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def feed_communautaire(request):
    """
    GET  /blood-api/feed/ — liste des posts
    POST /blood-api/feed/ — créer un post
    """
    from miniprojet.models import Post
    from django.utils import timezone
    from datetime import timedelta

    if request.method == 'POST':
        type_post = request.data.get('type_post', 'temoignage')
        contenu = request.data.get('contenu', '').strip()
        image_url = request.data.get('image_url', '')

        if not contenu:
            return Response({'error': 'Contenu requis'}, status=400)

        post = Post.objects.create(
            auteur=request.user,
            type_post=type_post,
            contenu=contenu,
            image_url=image_url,
        )

        return Response({
            'id': post.id,
            'message': 'Post publié avec succès !'
        }, status=201)

    # GET
    posts = Post.objects.select_related('auteur').prefetch_related('likes', 'commentaires').all()[:50]
    
    data = []
    for p in posts:
        # Déterminer le rôle de l'auteur
        try:
            _ = p.auteur.donneur
            role = 'donneur'
            role_emoji = '🫀'
        except:
            try:
                _ = p.auteur.hopital
                role = 'hopital'
                role_emoji = '🏥'
            except:
                role = 'admin'
                role_emoji = '🛡️'

        data.append({
            'id':           p.id,
            'auteur':       p.auteur.get_full_name() or p.auteur.username,
            'auteur_username': p.auteur.username,
            'role':         role,
            'role_emoji':   role_emoji,
            'type':         p.type_post,
            'contenu':      p.contenu,
            'image_url':    p.image_url,
            'date':         p.date_post.strftime('%d/%m/%Y %H:%M'),
            'date_relative': _date_relative(p.date_post),
            'nb_likes':     p.nb_likes(),
            'nb_commentaires': p.commentaires.count(),
            'liked_by_me':  request.user in p.likes.all(),
            'epingle':      p.epingle,
        })

    return Response({'posts': data, 'nb': len(data)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def liker_post(request, post_id):
    """
    POST /blood-api/feed/<id>/like/
    """
    from miniprojet.models import Post

    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post introuvable'}, status=404)

    if request.user in post.likes.all():
        post.likes.remove(request.user)
        action = 'unliked'
    else:
        post.likes.add(request.user)
        action = 'liked'

    return Response({
        'action': action,
        'nb_likes': post.nb_likes()
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def commentaires_post(request, post_id):
    """
    GET  /blood-api/feed/<id>/commentaires/ — liste
    POST /blood-api/feed/<id>/commentaires/ — ajouter
    """
    from miniprojet.models import Post, Commentaire

    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post introuvable'}, status=404)

    if request.method == 'POST':
        contenu = request.data.get('contenu', '').strip()
        if not contenu:
            return Response({'error': 'Contenu requis'}, status=400)

        comment = Commentaire.objects.create(
            post=post,
            auteur=request.user,
            contenu=contenu,
        )

        return Response({
            'id': comment.id,
            'message': 'Commentaire ajouté'
        }, status=201)

    # GET
    commentaires = post.commentaires.select_related('auteur').all()
    data = [{
        'id':      c.id,
        'auteur':  c.auteur.get_full_name() or c.auteur.username,
        'contenu': c.contenu,
        'date':    c.date_comment.strftime('%d/%m/%Y %H:%M'),
        'date_relative': _date_relative(c.date_comment),
    } for c in commentaires]

    return Response({'commentaires': data, 'nb': len(data)})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def stories(request):
    """
    GET  /blood-api/stories/ — stories actives (24h)
    POST /blood-api/stories/ — créer une story
    """
    from miniprojet.models import Story
    from django.utils import timezone
    from datetime import timedelta

    if request.method == 'POST':
        contenu = request.data.get('contenu', '').strip()
        emoji = request.data.get('emoji', '🩸')
        image_url = request.data.get('image_url', '')

        if not contenu:
            return Response({'error': 'Contenu requis'}, status=400)

        story = Story.objects.create(
            auteur=request.user,
            contenu=contenu,
            emoji=emoji,
            image_url=image_url,
        )

        return Response({
            'id': story.id,
            'message': 'Story publiée !'
        }, status=201)

    # GET — stories des dernières 24h
    limite = timezone.now() - timedelta(hours=24)
    stories_actives = Story.objects.filter(
        date_story__gte=limite
    ).select_related('auteur').prefetch_related('vues').order_by('-date_story')

    data = []
    for s in stories_actives:
        # Rôle
        try:
            _ = s.auteur.donneur
            role = 'donneur'
            role_emoji = '🫀'
        except:
            try:
                _ = s.auteur.hopital
                role = 'hopital'
                role_emoji = '🏥'
            except:
                role = 'admin'
                role_emoji = '🛡️'

        data.append({
            'id':        s.id,
            'auteur':    s.auteur.get_full_name() or s.auteur.username,
            'role':      role,
            'role_emoji': role_emoji,
            'contenu':   s.contenu,
            'emoji':     s.emoji,
            'image_url': s.image_url,
            'date':      s.date_story.strftime('%d/%m/%Y %H:%M'),
            'nb_vues':   s.nb_vues(),
            'vue_par_moi': request.user in s.vues.all(),
        })

    return Response({'stories': data, 'nb': len(data)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def voir_story(request, story_id):
    """
    POST /blood-api/stories/<id>/voir/
    """
    from miniprojet.models import Story

    try:
        story = Story.objects.get(pk=story_id)
    except Story.DoesNotExist:
        return Response({'error': 'Story introuvable'}, status=404)

    if not story.est_active():
        return Response({'error': 'Story expirée'}, status=400)

    if request.user not in story.vues.all():
        story.vues.add(request.user)

    return Response({
        'nb_vues': story.nb_vues()
    })


# ─── GAMIFICATION AVANCÉE ────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_missions(request):
    """
    GET /blood-api/mes-missions/
    Retourne les missions actives et la progression du donneur
    """
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)

    from miniprojet.models import Mission, ProgressionMission
    from datetime import date

    missions_actives = Mission.objects.filter(
        statut='active',
        date_debut__lte=date.today(),
        date_fin__gte=date.today()
    ).order_by('date_fin')

    data = []
    for m in missions_actives:
        prog, _ = ProgressionMission.objects.get_or_create(donneur=donneur, mission=m)
        pct = min(100, int((prog.progres / m.objectif) * 100)) if m.objectif > 0 else 0
        jours_restants = (m.date_fin - date.today()).days

        data.append({
            'id':           m.id,
            'titre':        m.titre,
            'description':  m.description,
            'type':         m.type_mission,
            'emoji':        m.emoji,
            'objectif':     m.objectif,
            'progres':      prog.progres,
            'pct':          pct,
            'completee':    prog.completee,
            'recompense':   m.recompense_pts,
            'jours_restants': jours_restants,
            'date_fin':     m.date_fin.strftime('%d/%m/%Y'),
        })

    # Missions complétées récemment
    missions_completees = ProgressionMission.objects.filter(
        donneur=donneur,
        completee=True
    ).select_related('mission').order_by('-date_fin')[:5]

    completees = [{
        'titre':      p.mission.titre,
        'emoji':      p.mission.emoji,
        'recompense': p.mission.recompense_pts,
        'date':       p.date_fin.strftime('%d/%m/%Y') if p.date_fin else '',
    } for p in missions_completees]

    return Response({
        'missions_actives': data,
        'nb_actives':       len(data),
        'nb_completees':    missions_completees.count(),
        'completees':       completees,
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def mon_parrainage(request):
    """
    GET  /blood-api/mon-parrainage/ — infos parrainage
    POST /blood-api/mon-parrainage/ — générer code parrain
    """
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)

    from miniprojet.models import Parrainage
    import random, string

    if request.method == 'POST':
        # Générer un code unique
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        while Parrainage.objects.filter(code=code).exists():
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
        return Response({'code': code, 'message': 'Code généré avec succès'})

    # GET : stats parrainage
    mes_filleuls = Parrainage.objects.filter(parrain=donneur).select_related('filleul__user')
    mon_parrain = Parrainage.objects.filter(filleul=donneur).select_related('parrain__user').first()

    filleuls_data = [{
        'nom':       f.filleul.user.get_full_name() or f.filleul.user.username,
        'groupe':    f.filleul.groupe_sanguin,
        'date':      f.date.strftime('%d/%m/%Y'),
        'premier_don': f.premier_don_fait,
        'actif':     f.actif,
    } for f in mes_filleuls]

    nb_filleuls_actifs = mes_filleuls.filter(premier_don_fait=True).count()
    points_gagnes = nb_filleuls_actifs * 50  # 50 pts par filleul actif

    return Response({
        'nb_filleuls':        mes_filleuls.count(),
        'nb_filleuls_actifs': nb_filleuls_actifs,
        'points_gagnes':      points_gagnes,
        'filleuls':           filleuls_data,
        'mon_parrain':        {
            'nom': mon_parrain.parrain.user.get_full_name() or mon_parrain.parrain.user.username,
            'groupe': mon_parrain.parrain.groupe_sanguin,
        } if mon_parrain else None,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def utiliser_code_parrain(request):
    """
    POST /blood-api/utiliser-code-parrain/
    Body: {"code": "ABC12345"}
    """
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)

    from miniprojet.models import Parrainage, Donneur
    code = request.data.get('code', '').strip().upper()

    if not code:
        return Response({'error': 'Code requis'}, status=400)

    # Vérifier si le donneur a déjà un parrain
    if Parrainage.objects.filter(filleul=donneur).exists():
        return Response({'error': 'Vous avez déjà un parrain'}, status=400)

    # Chercher un parrainage avec ce code (créé par un autre donneur)
    # On suppose que le code a été généré et partagé manuellement
    # Pour simplifier, on cherche un donneur dont le username contient le code (à adapter)
    # Ou on crée une table temporaire de codes
    
    # Implémentation simplifiée : on cherche un donneur par username
    try:
        parrain_user = User.objects.get(username=code)
        parrain = parrain_user.donneur
    except:
        return Response({'error': 'Code invalide ou parrain introuvable'}, status=404)

    if parrain == donneur:
        return Response({'error': 'Vous ne pouvez pas vous parrainer vous-même'}, status=400)

    # Créer le parrainage
    Parrainage.objects.create(
        parrain=parrain,
        filleul=donneur,
        code=code,
        actif=True,
    )

    return Response({'message': f'Vous êtes maintenant parrainé par {parrain.user.get_full_name() or parrain.user.username} !'})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def mes_equipes(request):
    """
    GET  /blood-api/mes-equipes/ — liste des équipes
    POST /blood-api/mes-equipes/ — créer une équipe
    """
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)

    from miniprojet.models import Equipe
    import random, string

    if request.method == 'POST':
        nom = request.data.get('nom', '').strip()
        description = request.data.get('description', '')
        emoji = request.data.get('emoji', '🏢')

        if not nom:
            return Response({'error': 'Nom requis'}, status=400)

        # Générer code unique
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        while Equipe.objects.filter(code_invite=code).exists():
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        equipe = Equipe.objects.create(
            nom=nom,
            description=description,
            createur=donneur,
            code_invite=code,
            avatar_emoji=emoji,
        )
        equipe.membres.add(donneur)

        return Response({
            'id':   equipe.id,
            'nom':  equipe.nom,
            'code': equipe.code_invite,
            'message': 'Équipe créée avec succès !'
        }, status=201)

    # GET
    mes_equipes = donneur.equipes.all()
    data = []
    for e in mes_equipes:
        data.append({
            'id':          e.id,
            'nom':         e.nom,
            'description': e.description,
            'emoji':       e.avatar_emoji,
            'code':        e.code_invite,
            'nb_membres':  e.membres.count(),
            'score':       e.score_total(),
            'createur':    e.createur.user.username,
            'est_createur': e.createur == donneur,
        })

    return Response({'equipes': data, 'nb': len(data)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rejoindre_equipe(request):
    """
    POST /blood-api/rejoindre-equipe/
    Body: {"code": "ABC123"}
    """
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)

    from miniprojet.models import Equipe
    code = request.data.get('code', '').strip().upper()

    if not code:
        return Response({'error': 'Code requis'}, status=400)

    try:
        equipe = Equipe.objects.get(code_invite=code)
    except Equipe.DoesNotExist:
        return Response({'error': 'Code invalide'}, status=404)

    if donneur in equipe.membres.all():
        return Response({'error': 'Vous êtes déjà membre de cette équipe'}, status=400)

    equipe.membres.add(donneur)
    return Response({'message': f'Vous avez rejoint l\'équipe {equipe.nom} !'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def classement_equipes(request):
    """
    GET /blood-api/classement-equipes/
    Top 20 équipes par score
    """
    from miniprojet.models import Equipe

    equipes = Equipe.objects.all()
    classement = []

    for e in equipes:
        score = e.score_total()
        if score > 0:
            classement.append({
                'id':         e.id,
                'nom':        e.nom,
                'emoji':      e.avatar_emoji,
                'nb_membres': e.membres.count(),
                'score':      score,
            })

    classement.sort(key=lambda x: x['score'], reverse=True)

    for i, c in enumerate(classement):
        c['rang'] = i + 1

    return Response(classement[:20])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mon_streak(request):
    """
    GET /blood-api/mon-streak/
    Calcule le streak de dons consécutifs
    """
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur'}, status=403)

    from datetime import timedelta
    dons = Don.objects.filter(donneur=donneur).order_by('-date_don')

    if not dons.exists():
        return Response({'streak': 0, 'meilleur_streak': 0, 'message': 'Aucun don enregistré'})

    # Calcul du streak actuel
    delai_jours = 56 if donneur.sexe == 'H' else 84
    tolerance = 14  # Tolérance de 14 jours

    streak_actuel = 1
    meilleur_streak = 1
    streak_temp = 1

    dons_list = list(dons)
    for i in range(len(dons_list) - 1):
        intervalle = (dons_list[i].date_don - dons_list[i + 1].date_don).days
        # Si l'intervalle est proche du délai (±tolérance), c'est un streak
        if delai_jours - tolerance <= intervalle <= delai_jours + tolerance:
            streak_temp += 1
            if i == 0:
                streak_actuel = streak_temp
        else:
            meilleur_streak = max(meilleur_streak, streak_temp)
            streak_temp = 1

    meilleur_streak = max(meilleur_streak, streak_temp)

    # Vérifier si le streak actuel est toujours valide
    dernier_don = dons_list[0]
    jours_depuis = (date.today() - dernier_don.date_don).days
    if jours_depuis > delai_jours + tolerance:
        streak_actuel = 0

    return Response({
        'streak':         streak_actuel,
        'meilleur_streak': meilleur_streak,
        'nb_dons':        dons.count(),
        'dernier_don':    dernier_don.date_don.strftime('%d/%m/%Y'),
        'jours_depuis':   jours_depuis,
        'emoji':          '🔥' if streak_actuel >= 3 else '⭐' if streak_actuel >= 2 else '✨',
    })


# ─── Matching Intelligent ─────────────────────────────────────────────
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def matching_donneurs(request, demande_id):
    """
    GET /blood-api/demandes-urgentes/<id>/matching/
    Retourne les donneurs les mieux matchés pour cette demande
    (pour les hôpitaux)
    """
    try:
        hopital = request.user.hopital
    except:
        return Response({'error': 'Pas un hôpital.'}, status=403)
 
    try:
        demande = DemandeUrgente.objects.get(pk=demande_id)
    except DemandeUrgente.DoesNotExist:
        return Response({'error': 'Demande introuvable.'}, status=404)
 
    from datetime import date, timedelta
 
    COMPATIBILITE = {
        'O-':  ['O-'],
        'O+':  ['O-','O+','A-','A+','B-','B+','AB-','AB+'],
        'A-':  ['O-','A-','AB-','AB+'],
        'A+':  ['O-','O+','A-','A+','B-','B+','AB-','AB+'],
        'B-':  ['O-','B-','AB-','AB+'],
        'B+':  ['O-','O+','B-','B+','AB-','AB+'],
        'AB-': ['O-','A-','B-','AB-'],
        'AB+': ['O-','O+','A-','A+','B-','B+','AB-','AB+'],
    }
    groupes_compatibles = COMPATIBILITE.get(demande.groupe_sanguin, [demande.groupe_sanguin])
 
    donneurs = Donneur.objects.filter(
        groupe_sanguin__in=groupes_compatibles,
        actif=True
    ).select_related('user')
 
    resultats = []
    for donneur in donneurs:
        score = 0
        raisons = []
 
        # 1. Score groupe sanguin (compatibilité exacte = +50, compatible = +30)
        if donneur.groupe_sanguin == demande.groupe_sanguin:
            score += 50
            raisons.append('✅ Groupe identique')
        else:
            score += 30
            raisons.append(f'✅ Compatible ({donneur.groupe_sanguin}→{demande.groupe_sanguin})')
 
        # 2. Éligibilité
        delai_jours = 56 if donneur.sexe == 'H' else 84
        dernier_don = Don.objects.filter(donneur=donneur).order_by('-date_don').first()
        if dernier_don:
            prochaine = dernier_don.date_don + timedelta(days=delai_jours)
            eligible  = date.today() >= prochaine
        else:
            eligible = True
 
        if not eligible:
            continue  # Exclure les non éligibles
 
        score += 30
        raisons.append('✅ Éligible au don')
 
        # 3. Proximité ville
        if hopital.ville and donneur.ville.lower() == hopital.ville.lower():
            score += 15
            raisons.append('📍 Même ville')
        elif hopital.ville and hopital.ville.lower() in donneur.ville.lower():
            score += 8
            raisons.append('📍 Ville proche')
 
        # 4. Expérience (nb dons)
        nb_dons = Don.objects.filter(donneur=donneur).count()
        if nb_dons >= 5:
            score += 5
            raisons.append(f'🩸 Donneur expérimenté ({nb_dons} dons)')
 
        # 5. Réponses urgences précédentes
        nb_urgences = Reponse_Appel.objects.filter(donneur=donneur).count()
        if nb_urgences > 0:
            score += 5
            raisons.append(f'⚡ {nb_urgences} urgences répondues')
 
        resultats.append({
            'donneur_id':    donneur.id,
            'nom':           donneur.user.get_full_name() or donneur.user.username,
            'username':      donneur.user.username,
            'groupe_sanguin': donneur.groupe_sanguin,
            'ville':         donneur.ville,
            'telephone':     donneur.telephone,
            'email':         donneur.user.email,
            'score':         score,
            'raisons':       raisons,
            'nb_dons':       nb_dons,
            'nb_urgences':   nb_urgences,
            'eligible':      eligible,
        })
 
    # Trier par score décroissant
    resultats.sort(key=lambda x: x['score'], reverse=True)
 
    return Response({
        'demande_id':     demande_id,
        'groupe_cherche': demande.groupe_sanguin,
        'nb_matches':     len(resultats),
        'matches':        resultats[:20],  # Top 20
    })
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_matches(request):
    """
    GET /blood-api/mes-matches/
    Pour un donneur : liste des demandes urgentes qui lui correspondent le mieux
    avec un score de pertinence
    """
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur.'}, status=403)
 
    from datetime import date, timedelta
 
    # Vérifier éligibilité
    delai_jours = 56 if donneur.sexe == 'H' else 84
    dernier_don = Don.objects.filter(donneur=donneur).order_by('-date_don').first()
    if dernier_don:
        prochaine = dernier_don.date_don + timedelta(days=delai_jours)
        eligible  = date.today() >= prochaine
    else:
        eligible = True
 
    if not eligible:
        return Response({
            'eligible': False,
            'matches':  [],
            'message':  'Vous n\'êtes pas encore éligible au don.'
        })
 
    COMPATIBILITE_DONNEUR = {
        'O-':  ['O-','O+','A-','A+','B-','B+','AB-','AB+'],
        'O+':  ['O+','A+','B+','AB+'],
        'A-':  ['A-','A+','AB-','AB+'],
        'A+':  ['A+','AB+'],
        'B-':  ['B-','B+','AB-','AB+'],
        'B+':  ['B+','AB+'],
        'AB-': ['AB-','AB+'],
        'AB+': ['AB+'],
    }
    groupes_receveurs = COMPATIBILITE_DONNEUR.get(donneur.groupe_sanguin, [donneur.groupe_sanguin])
 
    demandes = DemandeUrgente.objects.filter(
        groupe_sanguin__in=groupes_receveurs,
        statut='active'
    ).select_related('hopital')
 
    resultats = []
    for d in demandes:
        score = 0
        raisons = []
 
        # Groupe exact
        if d.groupe_sanguin == donneur.groupe_sanguin:
            score += 50
            raisons.append('🎯 Votre groupe sanguin exact')
        else:
            score += 20
            raisons.append('✅ Vous pouvez donner à ce groupe')
 
        # Urgence deadline
        if d.date_demande:
            jours_restants = (d.date_demande - date.today()).days
            if jours_restants <= 1:
                score += 40
                raisons.append('🚨 Urgence critique — Aujourd\'hui !')
            elif jours_restants <= 3:
                score += 25
                raisons.append(f'⚡ Très urgent — {jours_restants}j restants')
            elif jours_restants <= 7:
                score += 10
                raisons.append(f'⏰ Urgent — {jours_restants}j restants')
 
        # Proximité
        if d.hopital.ville and donneur.ville.lower() == d.hopital.ville.lower():
            score += 20
            raisons.append('📍 Dans votre ville')
 
        # Quantité élevée = plus urgent
        if d.quantite >= 5:
            score += 10
            raisons.append(f'📦 {d.quantite} poches demandées')
 
        resultats.append({
            'id':           d.id,
            'groupe_sanguin': d.groupe_sanguin,
            'quantite':     d.quantite,
            'hopital_nom':  d.hopital.nom,
            'hopital_ville': d.hopital.ville or d.hopital.adresse,
            'delai':        d.date_demande,
            'description':  d.description,
            'score':        score,
            'raisons':      raisons,
            'est_urgente':  score >= 60,
            'nb_reponses':  Reponse_Appel.objects.filter(demande_urgente=d).count(),
        })
 
    resultats.sort(key=lambda x: x['score'], reverse=True)
 
    return Response({
        'eligible': True,
        'groupe_sanguin': donneur.groupe_sanguin,
        'nb_matches': len(resultats),
        'matches': resultats,
    })
# ── FEED COMMUNAUTAIRE ────────────────────────────────────────────────
 
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def feed_communautaire(request):
    """
    GET  /blood-api/feed/        → liste des posts
    POST /blood-api/feed/        → créer un post
    """
    from miniprojet.models import Post
 
    if request.method == 'GET':
        posts = Post.objects.filter(actif=True).select_related('auteur')[:20]
        from miniprojet.models import Like
        data = [{
            'id':         p.id,
            'auteur':     p.auteur.username,
            'type_post':  p.type_post,
            'contenu':    p.contenu,
            'image_url':  p.image_url,
            'date_post':  p.date_post.strftime('%d/%m/%Y %H:%M'),
            'date_rel':   _date_relative(p.date_post),
            'nb_likes':   Like.objects.filter(post=p).count(),
            'nb_coms':    p.commentaires.count(),
            'liked':      Like.objects.filter(post=p, user=request.user).exists(),
            'is_mine':    p.auteur == request.user,
        } for p in posts]
        return Response(data)
 
    elif request.method == 'POST':
        contenu   = request.data.get('contenu', '').strip()
        type_post = request.data.get('type_post', 'temoignage')
        image_url = request.data.get('image_url', '')
 
        if not contenu:
            return Response({'error': 'Le contenu est requis.'}, status=400)
        if len(contenu) > 500:
            return Response({'error': 'Maximum 500 caractères.'}, status=400)
 
        post = Post.objects.create(
            auteur=request.user,
            type_post=type_post,
            contenu=contenu,
            image_url=image_url,
        )
        return Response({'id': post.id, 'message': 'Post publié !'}, status=201)
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, post_id):
    """POST /blood-api/feed/<id>/like/"""
    from miniprojet.models import Post, Like
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post introuvable.'}, status=404)
 
    existing = Like.objects.filter(post=post, user=request.user).first()
    if existing:
        existing.delete()
        action = 'unliked'
    else:
        Like.objects.create(post=post, user=request.user)
        action = 'liked'
 
    nb = Like.objects.filter(post=post).count()
    return Response({'action': action, 'nb_likes': nb})
 
 
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def commentaires_post(request, post_id):
    """
    GET  /blood-api/feed/<id>/commentaires/
    POST /blood-api/feed/<id>/commentaires/
    """
    from miniprojet.models import Post, Commentaire
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post introuvable.'}, status=404)
 
    if request.method == 'GET':
        coms = Commentaire.objects.filter(post=post).select_related('auteur')
        data = [{
            'id':      c.id,
            'auteur':  c.auteur.username,
            'contenu': c.contenu,
            'date':    c.date_com.strftime('%d/%m/%Y %H:%M'),
            'is_mine': c.auteur == request.user,
        } for c in coms]
        return Response(data)
 
    elif request.method == 'POST':
        contenu = request.data.get('contenu', '').strip()
        if not contenu:
            return Response({'error': 'Commentaire vide.'}, status=400)
        c = Commentaire.objects.create(post=post, auteur=request.user, contenu=contenu)
        return Response({'id': c.id, 'message': 'Commentaire ajouté.'}, status=201)
 
 
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def supprimer_post(request, post_id):
    """DELETE /blood-api/feed/<id>/supprimer/"""
    from miniprojet.models import Post
    try:
        post = Post.objects.get(pk=post_id, auteur=request.user)
        post.actif = False
        post.save()
        return Response({'message': 'Post supprimé.'})
    except Post.DoesNotExist:
        return Response({'error': 'Post introuvable.'}, status=404)
 
 
# ── ÉQUIPES ───────────────────────────────────────────────────────────
 
def _equipe_data(equipe, user=None):
    from miniprojet.models import MembreEquipe
    membres = equipe.membres.select_related('user').all()
    return {
        'id':          equipe.id,
        'nom':         equipe.nom,
        'description': equipe.description,
        'code_invite': equipe.code_invite,
        'logo_emoji':  equipe.logo_emoji,
        'type_equipe': equipe.type_equipe,
        'date_creation': equipe.date_creation.strftime('%d/%m/%Y'),
        'nb_membres':  membres.count(),
        'score':       equipe.score_total(),
        'is_member':   user is not None and membres.filter(user=user).exists(),
        'is_admin':    user is not None and membres.filter(user=user, role='admin').exists(),
        'membres': [{
            'username': m.user.username,
            'role':     m.role,
            'date':     m.date_adhesion.strftime('%d/%m/%Y'),
        } for m in membres],
    }
 
 
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def equipes_list(request):
    """
    GET  /blood-api/equipes/    → toutes les équipes (classement)
    POST /blood-api/equipes/    → créer une équipe
    """
    from miniprojet.models import Equipe, MembreEquipe
 
    if request.method == 'GET':
        equipes = sorted(Equipe.objects.all(), key=lambda e: e.score_total(), reverse=True)
        data = []
        for i, e in enumerate(equipes):
            d = _equipe_data(e, request.user)
            d['rang'] = i + 1
            data.append(d)
        return Response(data[:20])
 
    elif request.method == 'POST':
        nom         = request.data.get('nom', '').strip()
        description = request.data.get('description', '')
        logo_emoji  = request.data.get('logo_emoji', '🏆')
        type_equipe = request.data.get('type_equipe', 'association')
 
        if not nom:
            return Response({'error': 'Nom requis.'}, status=400)
 
        # Générer code unique
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        while Equipe.objects.filter(code_invite=code).exists():
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
 
        equipe = Equipe.objects.create(
            nom=nom, description=description, createur=request.user,
            code_invite=code, logo_emoji=logo_emoji, type_equipe=type_equipe
        )
        MembreEquipe.objects.create(equipe=equipe, user=request.user, role='admin')
 
        return Response(_equipe_data(equipe, request.user), status=201)
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_equipes(request):
    """GET /blood-api/equipes/mes-equipes/"""
    from miniprojet.models import MembreEquipe
    memberships = MembreEquipe.objects.filter(user=request.user).select_related('equipe')
    equipes = sorted([m.equipe for m in memberships], key=lambda e: e.score_total(), reverse=True)
    return Response([_equipe_data(e, request.user) for e in equipes])
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rejoindre_equipe(request):
    """POST /blood-api/equipes/rejoindre/ { code_invite }"""
    from miniprojet.models import Equipe, MembreEquipe
    code = request.data.get('code_invite', '').strip().upper()
 
    if not code:
        return Response({'error': 'Code requis.'}, status=400)
 
    try:
        equipe = Equipe.objects.get(code_invite=code)
    except Equipe.DoesNotExist:
        return Response({'error': 'Code invalide.'}, status=404)
 
    if MembreEquipe.objects.filter(equipe=equipe, user=request.user).exists():
        return Response({'error': 'Vous êtes déjà membre de cette équipe.'}, status=400)
 
    MembreEquipe.objects.create(equipe=equipe, user=request.user, role='membre')
    return Response({'message': f'Vous avez rejoint {equipe.nom} !', **_equipe_data(equipe, request.user)})
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quitter_equipe(request, equipe_id):
    """POST /blood-api/equipes/<id>/quitter/"""
    from miniprojet.models import MembreEquipe
    try:
        m = MembreEquipe.objects.get(equipe_id=equipe_id, user=request.user)
        if m.role == 'admin':
            return Response({'error': 'L\'admin ne peut pas quitter l\'équipe. Supprimez l\'équipe.'}, status=400)
        m.delete()
        return Response({'message': 'Vous avez quitté l\'équipe.'})
    except MembreEquipe.DoesNotExist:
        return Response({'error': 'Vous n\'êtes pas membre.'}, status=404)
 
 
# ── DASHBOARD SANTÉ ───────────────────────────────────────────────────
 
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def donnees_sante(request):
    """
    GET  /blood-api/sante/   → historique des mesures
    POST /blood-api/sante/   → ajouter une mesure
    """
    from miniprojet.models import DonneeSante
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur.'}, status=403)
 
    if request.method == 'GET':
        mesures = DonneeSante.objects.filter(donneur=donneur).order_by('date_mesure')
        data = [{
            'id':                  m.id,
            'date_mesure':         m.date_mesure.strftime('%Y-%m-%d'),
            'hemoglobine':         float(m.hemoglobine) if m.hemoglobine else None,
            'tension_systolique':  m.tension_systolique,
            'tension_diastolique': m.tension_diastolique,
            'poids':               float(m.poids) if m.poids else None,
            'notes':               m.notes,
        } for m in mesures]
 
        # Conseils nutritionnels basés sur la dernière mesure
        conseils = _conseils_nutritionnels(donneur, mesures.last() if mesures.exists() else None)
 
        return Response({'mesures': data, 'conseils': conseils})
 
    elif request.method == 'POST':
        mesure = DonneeSante.objects.create(
            donneur=donneur,
            date_mesure=request.data.get('date_mesure', date.today()),
            hemoglobine=request.data.get('hemoglobine') or None,
            tension_systolique=request.data.get('tension_systolique') or None,
            tension_diastolique=request.data.get('tension_diastolique') or None,
            poids=request.data.get('poids') or None,
            notes=request.data.get('notes', ''),
        )
        return Response({'id': mesure.id, 'message': 'Mesure enregistrée !'}, status=201)
 
 
def _conseils_nutritionnels(donneur, derniere_mesure):
    """Génère des conseils personnalisés selon les données santé"""
    conseils = []
    dernier_don = Don.objects.filter(donneur=donneur).order_by('-date_don').first()
 
    # Conseils post-don
    if dernier_don:
        jours = (date.today() - dernier_don.date_don).days
        if jours <= 7:
            conseils.append({'ic': '🥩', 'titre': 'Après le don', 'texte': 'Mangez des aliments riches en fer : viande rouge, légumineuses, épinards.', 'type': 'post_don'})
            conseils.append({'ic': '💧', 'titre': 'Hydratation', 'texte': 'Buvez au moins 2L d\'eau par jour les 48h suivant le don.', 'type': 'post_don'})
 
    # Conseils pré-don
    delai = 56 if donneur.sexe == 'H' else 84
    dernier_don_date = dernier_don.date_don if dernier_don else None
    if dernier_don_date:
        prochaine = dernier_don_date + timedelta(days=delai)
        jours_avant = (prochaine - date.today()).days
        if 0 <= jours_avant <= 14:
            conseils.append({'ic': '🥦', 'titre': 'Avant le don', 'texte': 'Augmentez votre consommation de vitamine C pour mieux absorber le fer.', 'type': 'pre_don'})
            conseils.append({'ic': '🚫', 'titre': 'À éviter', 'texte': 'Évitez l\'alcool 24h avant le don et les repas gras 4h avant.', 'type': 'pre_don'})
 
    # Conseils sur hémoglobine
    if derniere_mesure and derniere_mesure.hemoglobine:
        hb = float(derniere_mesure.hemoglobine)
        seuil = 13.5 if donneur.sexe == 'H' else 12.5
        if hb < seuil:
            conseils.append({'ic': '⚠️', 'titre': 'Hémoglobine basse', 'texte': f'Votre hémoglobine ({hb} g/dL) est en dessous du seuil recommandé. Consultez un médecin.', 'type': 'alerte'})
        else:
            conseils.append({'ic': '✅', 'titre': 'Hémoglobine normale', 'texte': f'Votre hémoglobine ({hb} g/dL) est dans les valeurs normales. Vous êtes prêt à donner !', 'type': 'ok'})
 
    if not conseils:
        conseils.append({'ic': '🌿', 'titre': 'Conseils généraux', 'texte': 'Maintenez une alimentation équilibrée riche en fer, vitamine C et hydratation.', 'type': 'general'})
        conseils.append({'ic': '💪', 'titre': 'Mode de vie', 'texte': 'L\'exercice modéré et le sommeil suffisant améliorent la qualité de votre sang.', 'type': 'general'})
 
    return conseils
 
 
# ── IMPACT VISUALISÉ ──────────────────────────────────────────────────
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mon_impact(request):
    """GET /blood-api/impact/"""
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur.'}, status=403)
 
    nb_dons = Don.objects.filter(donneur=donneur).count()
    nb_reponses = Reponse_Appel.objects.filter(donneur=donneur).count()
 
    # Calculs d'impact
    vies_sauvees     = nb_dons * 3        # En moyenne, 1 don peut sauver jusqu'à 3 personnes
    patients_aides   = nb_dons * 3
    litres_sang      = round(nb_dons * 0.45, 2)  # 450 mL par don
    nb_enfants       = int(nb_dons * 1.2)
    nb_adultes       = int(nb_dons * 1.5)
    nb_operations    = int(nb_dons * 0.8)
 
    # Répartition groupes sanguins aidés
    dons = Don.objects.filter(donneur=donneur).select_related()
    groupes_aides = {}
    COMPAT = {
        'O-': ['tous les groupes'], 'O+': ['O+','A+','B+','AB+'],
        'A-': ['A-','A+','AB-','AB+'], 'A+': ['A+','AB+'],
        'B-': ['B-','B+','AB-','AB+'], 'B+': ['B+','AB+'],
        'AB-': ['AB-','AB+'], 'AB+': ['AB+']
    }
    receveurs = COMPAT.get(donneur.groupe_sanguin, [donneur.groupe_sanguin])
    for g in receveurs:
        groupes_aides[g] = nb_dons
 
    # Impact par année
    from django.db.models.functions import TruncYear
    from django.db.models import Count
    impact_annuel = Don.objects.filter(donneur=donneur).extra(select={'annee': "strftime('%Y', date_don)"}).values('annee').annotate(nb=Count('id')).order_by('annee')
 
    return Response({
        'nb_dons':        nb_dons,
        'nb_reponses':    nb_reponses,
        'vies_sauvees':   vies_sauvees,
        'patients_aides': patients_aides,
        'litres_sang':    litres_sang,
        'nb_enfants':     nb_enfants,
        'nb_adultes':     nb_adultes,
        'nb_operations':  nb_operations,
        'groupes_aides':  groupes_aides,
        'groupe_donneur': donneur.groupe_sanguin,
        'impact_annuel':  list(impact_annuel),
        'message': f"Vos {nb_dons} dons ont potentiellement sauvé {vies_sauvees} vie{'s' if vies_sauvees>1 else ''} !",
        # Stats globales plateforme
        'total_dons_plateforme':   Don.objects.count(),
        'total_donneurs_actifs':   Donneur.objects.filter(actif=True).count(),
        'total_hopitaux':          Hopital.objects.filter(valide=True).count(),
    })
 
 
# ── CHATBOT IA ────────────────────────────────────────────────────────
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chatbot_don(request):
    """POST /blood-api/chatbot/ { message }"""
    message = request.data.get('message', '').lower().strip()
 
    # Base de connaissances règles métier
    reponses = {
        # Éligibilité générale
        'eligible': ('eligibilite', 'Pour donner du sang, vous devez avoir entre 18 et 70 ans, peser plus de 50 kg, et être en bonne santé. Les hommes peuvent donner tous les 56 jours, les femmes tous les 84 jours.'),
        'age': ('eligibilite', 'L\'âge minimum est 18 ans et maximum 70 ans. Au-delà de 60 ans, un accord médical peut être requis.'),
        'poids': ('eligibilite', 'Le poids minimum est de 50 kg. Cela garantit que le prélèvement de 450 mL n\'affecte pas votre santé.'),
 
        # Médicaments
        'medicament': ('medicaments', 'De nombreux médicaments n\'empêchent pas le don, mais certains nécessitent un délai d\'attente. Les antibiotiques requièrent un délai de 7 jours après la fin du traitement. Consultez toujours le médecin du centre.'),
        'aspirine': ('medicaments', 'L\'aspirine nécessite un délai de 5 jours avant le don de plaquettes, mais pas pour le don de sang total.'),
        'antibiotique': ('medicaments', 'Attendez 7 jours après la fin de votre traitement antibiotique avant de donner.'),
        'vaccin': ('medicaments', 'Selon le vaccin, le délai varie de 48h (grippe) à 4 semaines (vaccins vivants atténués). Renseignez-vous au centre.'),
 
        # Voyages
        'voyage': ('voyages', 'Un séjour dans une zone à risque (paludisme, dengue, etc.) nécessite un délai de 4 semaines après le retour. Pour les zones à haut risque, le délai peut être de 3 à 12 mois.'),
        'malaria': ('voyages', 'Si vous avez voyagé dans une zone endémique, attendez 6 mois après votre retour. Si vous avez contracté la malaria, le délai est de 3 ans.'),
 
        # Maladies
        'rhume': ('sante', 'Attendez d\'être complètement rétabli avant de donner. En général, attendez 1 semaine après la disparition des symptômes.'),
        'grippe': ('sante', 'Attendez 2 semaines après la guérison complète de la grippe avant de donner.'),
        'tatouage': ('sante', 'Un tatouage ou piercing nécessite un délai de 4 mois. Assurez-vous que le matériel utilisé était stérile.'),
        'grossesse': ('sante', 'Le don est contre-indiqué pendant la grossesse et jusqu\'à 6 mois après l\'accouchement.'),
 
        # Process du don
        'comment': ('process', 'Le don dure environ 45 minutes en tout : questionnaire médical (20 min), prélèvement (8-10 min), collation (15 min). Le sang prélevé est environ 450 mL.'),
        'douleur': ('process', 'La prise de sang est légèrement inconfortable mais pas douloureuse. Une petite piqûre initiale, puis vous ne sentez plus rien. La plupart des donneurs trouvent l\'expérience très simple.'),
        'apres': ('process', 'Après le don : restez assis 10-15 minutes, mangez la collation proposée, buvez beaucoup d\'eau, évitez l\'effort physique intense les 24h suivantes.'),
        'jeun': ('process', 'Il ne faut PAS être à jeun pour donner ! Mangez normalement 2-3h avant, évitez les repas très gras. Un estomac vide peut causer un malaise.'),
 
        # Groupe sanguin
        'groupe': ('groupe_sanguin', 'Tous les groupes sanguins sont nécessaires ! O- est le groupe universel (donneur universel). AB+ peut recevoir de tous les groupes (receveur universel). Votre groupe est précieux quel qu\'il soit.'),
    }
 
    # Trouver la meilleure réponse
    reponse_texte = None
    categorie = 'general'
 
    for mot_cle, (cat, rep) in reponses.items():
        if mot_cle in message:
            reponse_texte = rep
            categorie = cat
            break
 
    # Questions sur l'éligibilité personnelle
    try:
        donneur = request.user.donneur
        if any(w in message for w in ['mon', 'je', 'moi', 'puis-je', 'suis-je']):
            delai = 56 if donneur.sexe == 'H' else 84
            dernier_don = Don.objects.filter(donneur=donneur).order_by('-date_don').first()
            if dernier_don:
                prochaine = dernier_don.date_don + timedelta(days=delai)
                jours = (prochaine - date.today()).days
                if jours > 0:
                    reponse_texte = f"Selon votre historique, vous pourrez donner dans {jours} jour(s), le {prochaine.strftime('%d/%m/%Y')}. Continuez à prendre soin de vous !"
                else:
                    reponse_texte = f"Bonne nouvelle ! Vous êtes éligible pour donner dès maintenant. Votre groupe {donneur.groupe_sanguin} est toujours précieux."
                categorie = 'eligibilite'
            else:
                reponse_texte = f"Vous n'avez pas encore de don enregistré. Si vous êtes en bonne santé et que vous avez entre 18 et 70 ans, vous pouvez donner ! Votre groupe {donneur.groupe_sanguin} peut aider de nombreux patients."
                categorie = 'eligibilite'
    except: pass
 
    # Réponse par défaut
    if not reponse_texte:
        suggestions = [
            "Puis-je donner si je prends des médicaments ?",
            "Quel est le délai après un voyage ?",
            "Comment se passe le don ?",
            "Suis-je éligible ?",
            "Dois-je être à jeun ?",
        ]
        reponse_texte = "Je n'ai pas compris votre question. Voici quelques questions fréquentes auxquelles je peux répondre :"
        return Response({
            'reponse':     reponse_texte,
            'categorie':   'aide',
            'suggestions': suggestions,
            'confiance':   0.3,
        })
 
    return Response({
        'reponse':     reponse_texte,
        'categorie':   categorie,
        'suggestions': [],
        'confiance':   0.9,
    })
 
 
# ── RÉCOMPENSES ───────────────────────────────────────────────────────
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def liste_recompenses(request):
    """GET /blood-api/recompenses/"""
    from miniprojet.models import Recompense, EchangeRecompense
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur.'}, status=403)
 
    # Calculer les points du donneur
    from miniprojet.models import Badge
    nb_dons     = Don.objects.filter(donneur=donneur).count()
    nb_urgences = Reponse_Appel.objects.filter(donneur=donneur).count()
    nb_badges   = Badge.objects.filter(donneur=donneur).count()
    points      = (nb_dons * 10) + (nb_urgences * 25) + (nb_badges * 5)
 
    recompenses = Recompense.objects.filter(actif=True).order_by('points_requis')
    data = [{
        'id':             r.id,
        'titre':          r.titre,
        'description':    r.description,
        'partenaire':     r.partenaire,
        'points_requis':  r.points_requis,
        'reduction_pct':  r.reduction_pct,
        'valide_jusqu':   r.valide_jusqu.strftime('%d/%m/%Y') if r.valide_jusqu else None,
        'emoji':          r.emoji,
        'disponible':     points >= r.points_requis,
        'deja_echange':   EchangeRecompense.objects.filter(donneur=donneur, recompense=r).exists(),
    } for r in recompenses]
 
    return Response({'points': points, 'recompenses': data})
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def echanger_recompense(request, recompense_id):
    """POST /blood-api/recompenses/<id>/echanger/"""
    from miniprojet.models import Recompense, EchangeRecompense, Badge
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur.'}, status=403)
 
    try:
        recompense = Recompense.objects.get(pk=recompense_id, actif=True)
    except Recompense.DoesNotExist:
        return Response({'error': 'Récompense introuvable.'}, status=404)
 
    # Vérifier les points
    nb_dons     = Don.objects.filter(donneur=donneur).count()
    nb_urgences = Reponse_Appel.objects.filter(donneur=donneur).count()
    nb_badges   = Badge.objects.filter(donneur=donneur).count()
    points      = (nb_dons * 10) + (nb_urgences * 25) + (nb_badges * 5)
 
    if points < recompense.points_requis:
        return Response({'error': f'Il vous manque {recompense.points_requis - points} points pour cette récompense.'}, status=400)
 
    if EchangeRecompense.objects.filter(donneur=donneur, recompense=recompense).exists():
        return Response({'error': 'Vous avez déjà échangé cette récompense.'}, status=400)
 
    # Générer code unique
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
    while EchangeRecompense.objects.filter(code_usage=code).exists():
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))
 
    echange = EchangeRecompense.objects.create(
        donneur=donneur, recompense=recompense, code_usage=code
    )
 
    return Response({
        'message':      f'Récompense échangée ! Votre code : {code}',
        'code_usage':   code,
        'titre':        recompense.titre,
        'reduction_pct': recompense.reduction_pct,
    }, status=201)
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_echanges(request):
    """GET /blood-api/recompenses/mes-echanges/"""
    from miniprojet.models import EchangeRecompense
    try:
        donneur = request.user.donneur
    except:
        return Response({'error': 'Pas un donneur.'}, status=403)
 
    echanges = EchangeRecompense.objects.filter(donneur=donneur).select_related('recompense').order_by('-date_echange')
    data = [{
        'id':            e.id,
        'titre':         e.recompense.titre,
        'partenaire':    e.recompense.partenaire,
        'emoji':         e.recompense.emoji,
        'reduction_pct': e.recompense.reduction_pct,
        'code_usage':    e.code_usage,
        'date':          e.date_echange.strftime('%d/%m/%Y'),
        'utilise':       e.utilise,
    } for e in echanges]
    return Response(data)
class HealthDataListCreateView(APIView):
    """
    GET  /api/health/          → list all health entries for the logged-in donor
    POST /api/health/          → create a new health entry
    """
    permission_classes = [IsAuthenticated]
 
    def _get_donneur(self, request):
        return get_object_or_404(Donneur, user=request.user)
 
    def get(self, request):
        donneur = self._get_donneur(request)
        entries = DonneeSante.objects.filter(donneur=donneur)
        serializer = DonneeSanteSerializer(entries, many=True)
        return Response(serializer.data)
 
    def post(self, request):
        donneur = self._get_donneur(request)
        serializer = DonneeSanteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(donneur=donneur)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
 
class HealthDataDetailView(APIView):
    """
    GET    /api/health/<pk>/   → retrieve a specific entry
    DELETE /api/health/<pk>/   → delete a specific entry
    """
    permission_classes = [IsAuthenticated]
 
    def _get_entry(self, request, pk):
        donneur = get_object_or_404(Donneur, user=request.user)
        return get_object_or_404(DonneeSante, pk=pk, donneur=donneur)
 
    def get(self, request, pk):
        entry = self._get_entry(request, pk)
        return Response(DonneeSanteSerializer(entry).data)
 
    def delete(self, request, pk):
        entry = self._get_entry(request, pk)
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
 
 
class HealthDataLatestView(APIView):
    """
    GET /api/health/latest/    → most recent entry + recommendations
    """
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        donneur = get_object_or_404(Donneur, user=request.user)
        entry = DonneeSante.objects.filter(donneur=donneur).first()
        if not entry:
            return Response({'detail': 'Aucune donnée de santé enregistrée.'}, status=404)
        return Response(DonneeSanteSerializer(entry).data)
 
 
class HealthDataStatsView(APIView):
    """
    GET /api/health/stats/     → min/max/avg hemoglobin over time (for chart)
    """
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        donneur = get_object_or_404(Donneur, user=request.user)
        entries = DonneeSante.objects.filter(donneur=donneur).order_by('date_mesure')
 
        if not entries.exists():
            return Response({'detail': 'Aucune donnée.'}, status=404)
 
        data = [
            {
                'date': e.date_mesure.strftime('%d/%m/%Y'),
                'hemoglobine': e.hemoglobine,
                'tension': e.tension_arterielle,
                'frequence': e.frequence_cardiaque,
                'poids': e.poids,
            }
            for e in entries
        ]
 
        hemoglobin_values = [e.hemoglobine for e in entries]
        return Response({
            'historique': data,
            'stats': {
                'min':  min(hemoglobin_values),
                'max':  max(hemoglobin_values),
                'moy':  round(sum(hemoglobin_values) / len(hemoglobin_values), 2),
                'total_entrees': len(hemoglobin_values),
            }
        })
# GET all stocks / PUT update quantity
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def blood_stock_list(request):
    stocks = BloodStock.objects.all().order_by('blood_group')
    serializer = BloodStockSerializer(stocks, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def blood_stock_detail(request, pk):
    try:
        stock = BloodStock.objects.get(pk=pk)
    except BloodStock.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if request.method == 'GET':
        return Response(BloodStockSerializer(stock).data)

    elif request.method == 'PUT':
        serializer = BloodStockSerializer(stock, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def blood_stock_notifications(request):
    notifs = BloodStockNotification.objects.all()
    serializer = BloodStockNotificationSerializer(notifs, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def acknowledge_notification(request, pk):
    try:
        notif = BloodStockNotification.objects.get(pk=pk)
    except BloodStockNotification.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    from django.utils import timezone
    notif.status = 'acknowledged'
    notif.acknowledged_at = timezone.now()
    notif.save()
    return Response(BloodStockNotificationSerializer(notif).data)