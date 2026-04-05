from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponse
from datetime import date, timedelta
import csv
 
from miniprojet.models import (
    Donneur, Hopital, Don, DemandeUrgente,
    Campagne, Inscription, Reponse_Appel
)
from miniprojet.serializers import (
    DonneurSerializer, HopitalSerializer, HopitalSimpleSerializer,
    DemandeUrgenteSerializer, DonSerializer, CampagneSerializer,
    InscriptionSerializer, ReponseAppelSerializer
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