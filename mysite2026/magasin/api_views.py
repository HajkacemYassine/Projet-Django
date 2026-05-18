from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count, Sum, Avg
from django.db.models import F, Q
from io import BytesIO
from django.http import HttpResponse
from django.db import models
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
except Exception:
    A4 = None
from .models import Produit, Categorie, Fournisseur, Commande
from .serializers import (
    ProduitSerializer, CategorieSerializer,
    FournisseurSerializer, CommandeSerializer
)


# ─── Auth ─────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/auth/login/
    Body: { "username": "...", "password": "..." }
    Returns: { "access": "...", "refresh": "...", "user": {...} }
    """
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {'error': 'Identifiants incorrects.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'role': 'Administrateur' if user.is_staff else 'Utilisateur',
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    POST /api/auth/register/
    Body: { "username": "...", "email": "...", "password": "..." }
    """
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Champs requis manquants.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'error': "Ce nom d'utilisateur est déjà pris."}, status=400)

    user = User.objects.create_user(
        username=username, email=email, password=password
    )
    return Response({'message': 'Compte créé avec succès.'}, status=201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    POST /api/auth/logout/
    Body: { "refresh": "..." }
    """
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Déconnecté.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """GET /api/auth/me/ — Profil de l'utilisateur connecté"""
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'role': 'Administrateur' if user.is_staff else 'Utilisateur',
    })


# ─── Produits ─────────────────────────────────────────────────────────────────

class ProduitListCreate(generics.ListCreateAPIView):
    """
    GET  /api/produits/        — Liste tous les produits (avec filtres)
    POST /api/produits/        — Crée un produit (auth requise)
    
    Query params:
      ?categorie=<id>
      ?type=em|fr|cs
      ?search=<libelle>
    """
    serializer_class = ProduitSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Produit.objects.select_related('Categorie', 'Fournisseur').all()

        


class ProduitDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/produits/<id>/  — Détail d'un produit
    PUT    /api/produits/<id>/  — Modifier (auth requise)
    DELETE /api/produits/<id>/  — Supprimer (admin seulement)
    """
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        if self.request.method == 'DELETE':
            return [permissions.IsAdminUser()]
        return [IsAuthenticated()]


# ─── Catégories ───────────────────────────────────────────────────────────────

class CategorieListCreate(generics.ListCreateAPIView):
    """GET /api/categories/ — POST /api/categories/"""
    queryset = Categorie.objects.annotate(nb_produits=Count('produit'))
    serializer_class = CategorieSerializer

    def get_permissions(self):
        return [AllowAny()] if self.request.method == 'GET' else [IsAuthenticated()]


# ─── Fournisseurs ─────────────────────────────────────────────────────────────

class FournisseurListCreate(generics.ListCreateAPIView):
    """GET /api/fournisseurs/ — POST /api/fournisseurs/"""
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    permission_classes = [IsAuthenticated]


class FournisseurDetail(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/fournisseurs/<id>/"""
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    permission_classes = [IsAuthenticated]


# ─── Commandes ────────────────────────────────────────────────────────────────

class CommandeListCreate(generics.ListCreateAPIView):
    """GET /api/commandes/ — POST /api/commandes/"""
    queryset = Commande.objects.prefetch_related('produits').all()
    serializer_class = CommandeSerializer
    permission_classes = [IsAuthenticated]


# ─── Dashboard stats ──────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    GET /api/dashboard/
    Retourne des statistiques pour le panneau d'administration.
    """
    return Response({
        'nb_produits': Produit.objects.count(),
        'nb_fournisseurs': Fournisseur.objects.count(),
        'nb_categories': Categorie.objects.count(),
        'nb_users': User.objects.count(),
        'nb_commandes': Commande.objects.count(),
        'produits_par_categorie': list(
            Categorie.objects.annotate(nb=Count('produit'))
            .values('nom', 'nb')
            .order_by('-nb')[:8]
        ),
    })


from rest_framework.permissions import IsAdminUser

@api_view(['GET'])
@permission_classes([IsAdminUser])
def users_list(request):
    from django.contrib.auth.models import User
    users = User.objects.values('id', 'username', 'email', 'is_active', 'is_staff')
    return Response(list(users))


# ─── PANIER (SESSIONS) ──────────────────────────────────────────────────────────────

from decimal import Decimal
from .models import ItemCommande
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def ajouter_au_panier(request):
    """
    POST /api/panier/ajouter/
    Body: { "produit_id": 1, "quantite": 2 }
    """
    produit_id = request.data.get('produit_id')
    quantite = int(request.data.get('quantite', 1))
    
    if not produit_id:
        return Response({'error': 'Produit requis.'}, status=400)
    
    try:
        produit = Produit.objects.get(pk=produit_id)
    except Produit.DoesNotExist:
        return Response({'error': 'Produit introuvable.'}, status=404)
    
    # Récupérer le panier depuis la session
    panier = request.session.get('panier', {})
    
    # Ajouter ou mettre à jour la quantité
    if str(produit_id) in panier:
        panier[str(produit_id)]['quantite'] += quantite
    else:
        panier[str(produit_id)] = {
            'libelle': produit.libelle,
            'prix': str(produit.prix),
            'quantite': quantite,
            'image': produit.img.url if produit.img else '',
        }
    
    request.session['panier'] = panier
    request.session.modified = True
    
    return Response({
        'message': f'{produit.libelle} ajouté au panier',
        'panier': panier,
        'total_items': sum(item['quantite'] for item in panier.values())
    })


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def voir_panier(request):
    """
    GET /api/panier/
    Retourne le contenu du panier stocké en session
    """
    panier = request.session.get('panier', {})
    
    total = sum(
        Decimal(item['prix']) * item['quantite']
        for item in panier.values()
    )
    
    return Response({
        'items': panier,
        'total': str(total),
        'nb_items': sum(item['quantite'] for item in panier.values())
    })


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def modifier_panier(request):
    """
    POST /api/panier/modifier/
    Body: { "produit_id": 1, "quantite": 3 }
    Si quantite = 0, supprime le produit
    """
    produit_id = request.data.get('produit_id')
    quantite = int(request.data.get('quantite', 1))
    
    panier = request.session.get('panier', {})
    
    if str(produit_id) in panier:
        if quantite <= 0:
            del panier[str(produit_id)]
        else:
            panier[str(produit_id)]['quantite'] = quantite
    
    request.session['panier'] = panier
    request.session.modified = True
    
    return Response({'message': 'Panier mis à jour', 'panier': panier})


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
def vider_panier(request):
    """DELETE /api/panier/vider/"""
    request.session['panier'] = {}
    return Response({'message': 'Panier vidé'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def passer_commande(request):
    panier = request.session.get('panier', {})
    
    if not panier:
        return Response({'error': 'Votre panier est vide.'}, status=400)
    
    adresse = request.data.get('adresse_livraison')
    telephone = request.data.get('telephone')
    notes = request.data.get('notes', '')
    
    if not adresse or not telephone:
        return Response({'error': 'Adresse et téléphone requis.'}, status=400)
    
    # Créer la commande
    commande = Commande.objects.create(
        user=request.user,
        adresse_livraison=adresse,
        telephone=telephone,
        notes=notes,
        statut='en_attente',
        totalCde=0
    )
    
    # Créer les items
    for produit_id, item in panier.items():
        try:
            produit = Produit.objects.get(pk=produit_id)
            ItemCommande.objects.create(
                commande=commande,
                produit=produit,
                quantite=item['quantite'],
                prix_unitaire=produit.prix
            )
        except Produit.DoesNotExist:
            commande.delete()
            return Response({'error': f'Produit {produit_id} introuvable.'}, status=404)
    
    # Calculer le total D'ABORD
    commande.calculer_total()
    commande.refresh_from_db()
    
    # Créer la facture APRÈS le total
    facture = _get_or_create_facture(commande)
    
    # Vider le panier
    request.session['panier'] = {}
    request.session.modified = True
    
    return Response({
        'message': 'Commande passée avec succès!',
        'commande_id': commande.id,
        'total': str(commande.totalCde),
        'facture_numero': facture.numero,
        'url_facture': f'/api/commandes/{commande.id}/facture/'
    }, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_commandes(request):
    """
    GET /api/commandes/mes-commandes/
    Liste des commandes de l'utilisateur connecté
    """
    commandes = Commande.objects.filter(user=request.user).prefetch_related('items__produit').order_by('-date_commande')
    
    data = [{
        'id': c.id,
        'date_commande': c.date_commande,
        'statut': c.statut,
        'total': str(c.totalCde),
        'adresse_livraison': c.adresse_livraison,
        'telephone': c.telephone,
        'nb_items': c.items.count(),
        'items': [{
            'produit': item.produit.libelle,
            'quantite': item.quantite,
            'prix_unitaire': str(item.prix_unitaire),
            'sous_total': str(item.sous_total())
        } for item in c.items.all()]
    } for c in commandes]
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def commande_detail(request, pk):
    """
    GET /api/commandes/<pk>/
    Détails d'une commande
    """
    try:
        commande = Commande.objects.get(pk=pk, user=request.user)
    except Commande.DoesNotExist:
        return Response({'error': 'Commande introuvable.'}, status=404)
    
    return Response({
        'id': commande.id,
        'date_commande': commande.date_commande,
        'statut': commande.statut,
        'total': str(commande.totalCde),
        'adresse_livraison': commande.adresse_livraison,
        'telephone': commande.telephone,
        'notes': commande.notes,
        'items': [{
            'produit': item.produit.libelle,
            'quantite': item.quantite,
            'prix_unitaire': str(item.prix_unitaire),
            'sous_total': str(item.sous_total())
        } for item in commande.items.all()]
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def annuler_commande(request, pk):
    """
    POST /api/commandes/<pk>/annuler/
    Annuler une commande
    """
    try:
        commande = Commande.objects.get(pk=pk, user=request.user)
    except Commande.DoesNotExist:
        return Response({'error': 'Commande introuvable.'}, status=404)
    
    if commande.statut in ['expediee', 'livree']:
        return Response({'error': 'Impossible d\'annuler une commande déjà expédiée.'}, status=400)
    
    commande.statut = 'annulee'
    commande.save()
    
    return Response({'message': 'Commande annulée avec succès.'})
@api_view(['GET'])
@permission_classes([AllowAny])
def recherche_avancee(request):
    """
    GET /api/recherche/?q=tomate&prix_min=5&prix_max=50&type=fr&categorie=2&fournisseur=1&tri=prix_asc
    """
    qs = Produit.objects.select_related('Categorie', 'Fournisseur').all()
 
    # Filtre texte (libelle + description)
    q = request.query_params.get('q', '').strip()
    if q:
        from django.db.models import Q
        qs = qs.filter(Q(libelle__icontains=q) | Q(description__icontains=q))
 
    # Filtre prix
    prix_min = request.query_params.get('prix_min')
    prix_max = request.query_params.get('prix_max')
    if prix_min:
        qs = qs.filter(prix__gte=float(prix_min))
    if prix_max:
        qs = qs.filter(prix__lte=float(prix_max))
 
    # Filtre type (em/fr/cs)
    type_p = request.query_params.get('type')
    if type_p:
        qs = qs.filter(type=type_p)
 
    # Filtre catégorie
    categorie = request.query_params.get('categorie')
    if categorie:
        qs = qs.filter(Categorie__id=categorie)
 
    # Filtre fournisseur
    fournisseur = request.query_params.get('fournisseur')
    if fournisseur:
        qs = qs.filter(Fournisseur__id=fournisseur)
 
    # Tri
    tri = request.query_params.get('tri', 'nom_asc')
    tri_map = {
        'nom_asc':   'libelle',
        'nom_desc':  '-libelle',
        'prix_asc':  'prix',
        'prix_desc': '-prix',
        'recent':    '-id',
    }
    qs = qs.order_by(tri_map.get(tri, 'libelle'))
 
    serializer = ProduitSerializer(qs, many=True)
    return Response({
        'count':    qs.count(),
        'results':  serializer.data,
        'prix_min': float(qs.order_by('prix').first().prix) if qs.exists() else 0,
        'prix_max': float(qs.order_by('-prix').first().prix) if qs.exists() else 0,
    })
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def avis_produit(request, produit_id):
    """
    GET  /api/produits/<id>/avis/  → liste des avis
    POST /api/produits/<id>/avis/  → ajouter un avis
    """
    from magasin.models import Avis
    try:
        produit = Produit.objects.get(pk=produit_id)
    except Produit.DoesNotExist:
        return Response({'error': 'Produit introuvable.'}, status=404)
 
    if request.method == 'GET':
        avis = Avis.objects.filter(produit=produit).select_related('user').order_by('-date_avis')
        data = [{
            'id':           a.id,
            'username':     a.user.username,
            'note':         a.note,
            'commentaire':  a.commentaire,
            'date_avis':    a.date_avis.strftime('%d/%m/%Y'),
            'is_mine':      a.user == request.user,
        } for a in avis]
 
        # Calcul moyenne
        notes = [a['note'] for a in data]
        moyenne = round(sum(notes) / len(notes), 1) if notes else 0
 
        return Response({
            'avis':    data,
            'moyenne': moyenne,
            'count':   len(data),
            'repartition': {
                str(i): sum(1 for n in notes if n == i)
                for i in range(1, 6)
            }
        })
 
    elif request.method == 'POST':
        note        = request.data.get('note')
        commentaire = request.data.get('commentaire', '')
 
        if not note or not (1 <= int(note) <= 5):
            return Response({'error': 'Note entre 1 et 5 requise.'}, status=400)
 
        # Vérifier si l'user a déjà un avis
        existing = Avis.objects.filter(produit=produit, user=request.user).first()
        if existing:
            existing.note        = int(note)
            existing.commentaire = commentaire
            existing.save()
            return Response({'message': 'Avis mis à jour.', 'action': 'updated'})
 
        Avis.objects.create(
            produit=produit,
            user=request.user,
            note=int(note),
            commentaire=commentaire,
        )
        return Response({'message': 'Avis ajouté avec succès.', 'action': 'created'}, status=201)
 
 
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def supprimer_avis(request, produit_id):
    """DELETE /api/produits/<id>/avis/supprimer/"""
    from magasin.models import Avis
    try:
        avis = Avis.objects.get(produit_id=produit_id, user=request.user)
        avis.delete()
        return Response({'message': 'Avis supprimé.'})
    except Avis.DoesNotExist:
        return Response({'error': 'Avis introuvable.'}, status=404)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def valider_code_promo(request):
    """POST /api/promo/valider/ { code, total }"""
    from magasin.models import CodePromo
    code  = request.data.get('code', '').strip().upper()
    total = float(request.data.get('total', 0))
 
    if not code:
        return Response({'error': 'Code requis.'}, status=400)
 
    try:
        promo = CodePromo.objects.get(code=code)
    except CodePromo.DoesNotExist:
        return Response({'error': 'Code promo invalide.'}, status=404)
 
    if not promo.est_valide():
        return Response({'error': 'Code promo expiré ou épuisé.'}, status=400)
 
    if promo.type_reduction == 'pct':
        reduction = round(total * float(promo.valeur) / 100, 2)
    else:
        reduction = min(float(promo.valeur), total)
 
    nouveau_total = round(total - reduction, 2)
 
    return Response({
        'valide':       True,
        'code':         promo.code,
        'type':         promo.type_reduction,
        'valeur':       float(promo.valeur),
        'reduction':    reduction,
        'nouveau_total': nouveau_total,
        'message':      f"Code appliqué ! Réduction de {reduction} DT",
    })
 
 
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def gerer_codes_promo(request):
    """
    GET  /api/promo/ → liste des codes (admin)
    POST /api/promo/ → créer un code (admin)
    """
    from magasin.models import CodePromo
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    if request.method == 'GET':
        promos = CodePromo.objects.all().order_by('-id')
        from datetime import date
        data = [{
            'id':           p.id,
            'code':         p.code,
            'type':         p.type_reduction,
            'valeur':       float(p.valeur),
            'date_fin':     p.date_fin,
            'usage_max':    p.usage_max,
            'nb_utilise':   p.nb_utilise,
            'actif':        p.actif,
            'est_valide':   p.est_valide(),
        } for p in promos]
        return Response(data)
 
    elif request.method == 'POST':
        from datetime import date, timedelta
        code           = request.data.get('code', '').upper()
        type_reduction = request.data.get('type', 'pct')
        valeur         = request.data.get('valeur')
        date_fin       = request.data.get('date_fin', (date.today() + timedelta(days=30)).isoformat())
        usage_max      = request.data.get('usage_max', 100)
 
        if not code or not valeur:
            return Response({'error': 'Code et valeur requis.'}, status=400)
 
        if CodePromo.objects.filter(code=code).exists():
            return Response({'error': 'Ce code existe déjà.'}, status=400)
 
        promo = CodePromo.objects.create(
            code=code, type_reduction=type_reduction,
            valeur=valeur, date_fin=date_fin, usage_max=usage_max
        )
        return Response({'id': promo.id, 'code': promo.code, 'message': 'Code créé !'}, status=201)
 
 
# ── Wishlist ──────────────────────────────────────────────────────────────
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ma_wishlist(request):
    """GET /api/wishlist/"""
    from magasin.models import Wishlist
    items = Wishlist.objects.filter(user=request.user).select_related('produit__Categorie', 'produit__Fournisseur').order_by('-date_ajout')
    data = [{
        'id':          item.id,
        'produit_id':  item.produit.id,
        'libelle':     item.produit.libelle,
        'prix':        float(item.produit.prix),
        'img':         item.produit.img.url if item.produit.img else None,
        'categorie':   item.produit.Categorie.nom if item.produit.Categorie else None,
        'type':        item.produit.type,
        'date_ajout':  item.date_ajout.strftime('%d/%m/%Y'),
    } for item in items]
    return Response(data)
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request, produit_id):
    """POST /api/wishlist/<produit_id>/toggle/"""
    from magasin.models import Wishlist
    try:
        produit = Produit.objects.get(pk=produit_id)
    except Produit.DoesNotExist:
        return Response({'error': 'Produit introuvable.'}, status=404)
 
    existing = Wishlist.objects.filter(user=request.user, produit=produit).first()
    if existing:
        existing.delete()
        return Response({'action': 'removed', 'message': f'{produit.libelle} retiré de la wishlist.'})
    else:
        Wishlist.objects.create(user=request.user, produit=produit)
        return Response({'action': 'added', 'message': f'{produit.libelle} ajouté à la wishlist !'}, status=201)
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_ids(request):
    """GET /api/wishlist/ids/ → liste des ids des produits en wishlist"""
    from magasin.models import Wishlist
    ids = Wishlist.objects.filter(user=request.user).values_list('produit_id', flat=True)
    return Response(list(ids))
 
 
# ── Suivi Livraison ───────────────────────────────────────────────────────
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suivi_commande(request, commande_id):
    """GET /api/commandes/<id>/suivi/"""
    from magasin.models import SuiviLivraison, EtapeLivraison
    try:
        suivi = SuiviLivraison.objects.get(commande_id=commande_id)
    except SuiviLivraison.DoesNotExist:
        # Créer un suivi par défaut si inexistant
        suivi = SuiviLivraison.objects.create(
            commande_id=commande_id,
            statut_actuel='confirmee',
        )
        EtapeLivraison.objects.create(
            suivi=suivi, statut='confirmee',
            description='Commande reçue et confirmée',
            localisation='Sfax, Tunisie'
        )
 
    etapes = EtapeLivraison.objects.filter(suivi=suivi)
 
    STATUTS_ORDRE = ['confirmee', 'preparation', 'expediee', 'en_transit', 'livree']
    idx_actuel    = STATUTS_ORDRE.index(suivi.statut_actuel) if suivi.statut_actuel in STATUTS_ORDRE else 0
 
    return Response({
        'commande_id':   commande_id,
        'statut_actuel': suivi.statut_actuel,
        'idx_actuel':    idx_actuel,
        'numero_suivi':  suivi.numero_suivi or f'BC-{commande_id:06d}',
        'adresse':       suivi.adresse_livraison,
        'date_estimee':  suivi.date_livraison_estimee,
        'confirmee_par_admin': suivi.confirmee_par_admin,
        'admin_confirme_par': suivi.admin_confirme_par.username if suivi.admin_confirme_par else None,
        'date_confirmation_admin': suivi.date_confirmation_admin,
        'position_livreur': {
            'latitude': float(suivi.livreur_latitude) if suivi.livreur_latitude else None,
            'longitude': float(suivi.livreur_longitude) if suivi.livreur_longitude else None,
            'derniere_maj': suivi.derniere_maj_position
        } if suivi.livreur_latitude else None,
        'destination': {
            'latitude': float(suivi.destination_latitude) if suivi.destination_latitude else None,
            'longitude': float(suivi.destination_longitude) if suivi.destination_longitude else None,
        } if suivi.destination_latitude else None,
        'etapes': [{
            'statut':      e.statut,
            'description': e.description,
            'date_etape':        e.date_etape.strftime('%d/%m/%Y %H:%M'),
            'localisation': e.localisation,
            'commentaire': getattr(e, 'commentaire', ''),
        } for e in etapes],
        'timeline': [
            {'statut': 'confirmee',  'label': 'Confirmée',      'icon': '✅'},
            {'statut': 'preparation','label': 'Préparation',    'icon': '📦'},
            {'statut': 'expediee',   'label': 'Expédiée',       'icon': '🚚'},
            {'statut': 'en_transit', 'label': 'En transit',     'icon': '📍'},
            {'statut': 'livree',     'label': 'Livrée',         'icon': '🎉'},
        ]
    })
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def avancer_statut(request, commande_id):
    """POST /api/commandes/<id>/avancer/ — admin seulement"""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    from magasin.models import SuiviLivraison, EtapeLivraison
    STATUTS_ORDRE = ['confirmee', 'preparation', 'expediee', 'en_transit', 'livree']
 
    try:
        suivi = SuiviLivraison.objects.get(commande_id=commande_id)
    except SuiviLivraison.DoesNotExist:
        return Response({'error': 'Suivi introuvable.'}, status=404)
 
    idx = STATUTS_ORDRE.index(suivi.statut_actuel) if suivi.statut_actuel in STATUTS_ORDRE else 0
    if idx >= len(STATUTS_ORDRE) - 1:
        return Response({'error': 'Commande déjà livrée.'}, status=400)
 
    nouveau_statut = STATUTS_ORDRE[idx + 1]
    suivi.statut_actuel = nouveau_statut
    suivi.save()
 
    DESCRIPTIONS = {
        'preparation': 'Votre commande est en cours de préparation',
        'expediee':    'Votre commande a été expédiée',
        'en_transit':  'Votre commande est en transit vers votre adresse',
        'livree':      'Votre commande a été livrée avec succès !',
    }
    EtapeLivraison.objects.create(
        suivi=suivi, statut=nouveau_statut,
        description=DESCRIPTIONS.get(nouveau_statut, nouveau_statut),
        localisation=request.data.get('localisation', 'Tunisie')
    )
 
    return Response({'statut': nouveau_statut, 'message': f'Statut mis à jour : {nouveau_statut}'})


# ── Confirmation Admin & GPS Tracking ─────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmer_livraison_admin(request, commande_id):
    """
    POST /api/commandes/<id>/confirmer-livraison/
    Admin confirme qu'une livraison peut démarrer
    """
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé. Admin uniquement.'}, status=403)
    
    from magasin.models import SuiviLivraison
    from django.utils import timezone
    
    try:
        suivi = SuiviLivraison.objects.get(commande_id=commande_id)
    except SuiviLivraison.DoesNotExist:
        return Response({'error': 'Suivi introuvable.'}, status=404)
    
    if suivi.confirmee_par_admin:
        return Response({'error': 'Livraison déjà confirmée.'}, status=400)
    
    suivi.confirmee_par_admin = True
    suivi.admin_confirme_par = request.user
    suivi.date_confirmation_admin = timezone.now()
    suivi.save()
    
    return Response({
        'message': 'Livraison confirmée par l\'admin',
        'confirmee_par': request.user.username,
        'date_confirmation': suivi.date_confirmation_admin
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_position_livreur(request, commande_id):
    """
    POST /api/commandes/<id>/position/
    Body: { "latitude": 36.8065, "longitude": 10.1815 }
    Met à jour la position GPS du livreur
    """
    from magasin.models import SuiviLivraison
    from django.utils import timezone
    
    try:
        suivi = SuiviLivraison.objects.get(commande_id=commande_id)
    except SuiviLivraison.DoesNotExist:
        return Response({'error': 'Suivi introuvable.'}, status=404)
    
    latitude = request.data.get('latitude')
    longitude = request.data.get('longitude')
    
    if not latitude or not longitude:
        return Response({'error': 'Latitude et longitude requises.'}, status=400)
    
    suivi.livreur_latitude = latitude
    suivi.livreur_longitude = longitude
    suivi.derniere_maj_position = timezone.now()
    suivi.save()
    
    return Response({
        'message': 'Position mise à jour',
        'latitude': float(suivi.livreur_latitude),
        'longitude': float(suivi.livreur_longitude),
        'derniere_maj': suivi.derniere_maj_position
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_position_livreur(request, commande_id):
    """
    GET /api/commandes/<id>/position/
    Récupère la position actuelle du livreur
    """
    from magasin.models import SuiviLivraison
    
    try:
        suivi = SuiviLivraison.objects.get(commande_id=commande_id)
    except SuiviLivraison.DoesNotExist:
        return Response({'error': 'Suivi introuvable.'}, status=404)
    
    if not suivi.livreur_latitude or not suivi.livreur_longitude:
        return Response({
            'has_position': False,
            'message': 'Position du livreur non disponible'
        })
    
    return Response({
        'has_position': True,
        'livreur': {
            'latitude': float(suivi.livreur_latitude),
            'longitude': float(suivi.livreur_longitude),
            'derniere_maj': suivi.derniere_maj_position
        },
        'destination': {
            'latitude': float(suivi.destination_latitude) if suivi.destination_latitude else None,
            'longitude': float(suivi.destination_longitude) if suivi.destination_longitude else None,
            'adresse': suivi.adresse_livraison
        },
        'confirmee_par_admin': suivi.confirmee_par_admin,
        'statut': suivi.statut_actuel
    })


# ── Gestion de Stock ──────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def gestion_stock(request):
    """
    GET /api/stock/
    Vue d'ensemble du stock pour l'admin
    """
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé. Admin uniquement.'}, status=403)
    
    produits = Produit.objects.select_related('Fournisseur', 'Categorie').all()
    
    # Statistiques globales
    total_produits = produits.count()
    produits_en_stock = produits.filter(en_stock=True).count()
    produits_rupture = produits.filter(quantite_stock=0).count()
    produits_alerte = produits.filter(quantite_stock__gt=0, quantite_stock__lte=models.F('seuil_alerte')).count()
    
    # Produits en rupture
    rupture_list = [{
        'id': p.id,
        'libelle': p.libelle,
        'fournisseur': p.Fournisseur.nom if p.Fournisseur else None,
        'fournisseur_id': p.Fournisseur.id if p.Fournisseur else None,
        'fournisseur_email': p.Fournisseur.email if p.Fournisseur else None,
        'fournisseur_telephone': p.Fournisseur.telephone if p.Fournisseur else None,
        'categorie': p.Categorie.nom if p.Categorie else None,
        'prix': float(p.prix),
        'quantite_stock': p.quantite_stock,
    } for p in produits.filter(quantite_stock=0)]
    
    # Produits en alerte
    alerte_list = [{
        'id': p.id,
        'libelle': p.libelle,
        'fournisseur': p.Fournisseur.nom if p.Fournisseur else None,
        'fournisseur_id': p.Fournisseur.id if p.Fournisseur else None,
        'categorie': p.Categorie.nom if p.Categorie else None,
        'quantite_stock': p.quantite_stock,
        'seuil_alerte': p.seuil_alerte,
        'prix': float(p.prix),
    } for p in produits.filter(quantite_stock__gt=0, quantite_stock__lte=models.F('seuil_alerte'))]
    
    # Stock par fournisseur
    from django.db.models import Sum, Count
    stock_par_fournisseur = list(
        Fournisseur.objects.annotate(
            nb_produits=Count('produits'),
            nb_rupture=Count('produits', filter=models.Q(produits__quantite_stock=0)),
            stock_total=Sum('produits__quantite_stock')
        ).values('id', 'nom', 'nb_produits', 'nb_rupture', 'stock_total', 'email', 'telephone')
    )
    
    return Response({
        'stats': {
            'total_produits': total_produits,
            'produits_en_stock': produits_en_stock,
            'produits_rupture': produits_rupture,
            'produits_alerte': produits_alerte,
        },
        'rupture': rupture_list,
        'alerte': alerte_list,
        'fournisseurs': stock_par_fournisseur,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ajuster_stock(request, produit_id):
    """
    POST /api/stock/<produit_id>/ajuster/
    Body: { "quantite": 50, "operation": "ajouter" | "retirer" | "definir" }
    """
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé. Admin uniquement.'}, status=403)
    
    try:
        produit = Produit.objects.get(pk=produit_id)
    except Produit.DoesNotExist:
        return Response({'error': 'Produit introuvable.'}, status=404)
    
    quantite = int(request.data.get('quantite', 0))
    operation = request.data.get('operation', 'definir')
    
    ancien_stock = produit.quantite_stock
    
    if operation == 'ajouter':
        produit.quantite_stock += quantite
    elif operation == 'retirer':
        produit.quantite_stock = max(0, produit.quantite_stock - quantite)
    elif operation == 'definir':
        produit.quantite_stock = max(0, quantite)
    
    produit.en_stock = produit.quantite_stock > 0
    produit.save()
    
    return Response({
        'message': 'Stock mis à jour',
        'produit': produit.libelle,
        'ancien_stock': ancien_stock,
        'nouveau_stock': produit.quantite_stock,
        'en_stock': produit.en_stock,
        'en_alerte': produit.est_en_alerte(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_par_fournisseur(request, fournisseur_id):
    """
    GET /api/stock/fournisseur/<id>/
    Liste des produits d'un fournisseur avec leur stock
    """
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé. Admin uniquement.'}, status=403)
    
    try:
        fournisseur = Fournisseur.objects.get(pk=fournisseur_id)
    except Fournisseur.DoesNotExist:
        return Response({'error': 'Fournisseur introuvable.'}, status=404)
    
    produits = Produit.objects.filter(Fournisseur=fournisseur)
    
    data = [{
        'id': p.id,
        'libelle': p.libelle,
        'prix': float(p.prix),
        'quantite_stock': p.quantite_stock,
        'seuil_alerte': p.seuil_alerte,
        'en_stock': p.en_stock,
        'en_rupture': p.est_en_rupture(),
        'en_alerte': p.est_en_alerte(),
        'categorie': p.Categorie.nom if p.Categorie else None,
    } for p in produits]
    
    return Response({
        'fournisseur': {
            'id': fournisseur.id,
            'nom': fournisseur.nom,
            'email': fournisseur.email,
            'telephone': fournisseur.telephone,
        },
        'produits': data,
        'stats': {
            'total': len(data),
            'en_rupture': sum(1 for p in data if p['en_rupture']),
            'en_alerte': sum(1 for p in data if p['en_alerte']),
        }
    })
def creer_notif(user, type_notif, titre, message, lien=''):
    """Helper — crée une notification pour un utilisateur"""
    from magasin.models import Notification
    Notification.objects.create(
        user=user, type_notif=type_notif,
        titre=titre, message=message, lien=lien
    )
 
 
def _date_rel(dt):
    """Retourne une date relative lisible"""
    if not dt:
        return ''
    from django.utils import timezone as tz
    now  = tz.now()
    diff = now - dt
    if diff.seconds < 60:    return "À l'instant"
    if diff.seconds < 3600:  return f"Il y a {diff.seconds // 60} min"
    if diff.days == 0:       return f"Il y a {diff.seconds // 3600}h"
    if diff.days == 1:       return "Hier"
    if diff.days < 7:        return f"Il y a {diff.days} jours"
    return dt.strftime('%d/%m/%Y')
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_notifications(request):
    """GET /api/notifications/"""
    from magasin.models import Notification
    notifs      = Notification.objects.filter(user=request.user)[:30]
    nb_non_lues = Notification.objects.filter(user=request.user, lue=False).count()
 
    TYPE_ICONS = {
        'commande': '🛍️', 'livraison': '🚚', 'promo': '🎁',
        'stock': '📦', 'avis': '⭐', 'systeme': '⚙️'
    }
 
    data = [{
        'id':       n.id,
        'type':     n.type_notif,
        'icon':     TYPE_ICONS.get(n.type_notif, '🔔'),
        'titre':    n.titre,
        'message':  n.message,
        'lien':     n.lien,
        'lue':      n.lue,
        'date':     n.date_notif.strftime('%d/%m/%Y %H:%M'),
        'date_rel': _date_rel(n.date_notif),
    } for n in notifs]
 
    return Response({'notifications': data, 'nb_non_lues': nb_non_lues})
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def marquer_notif_lue(request, notif_id):
    """POST /api/notifications/<id>/lire/"""
    from magasin.models import Notification
    try:
        n = Notification.objects.get(pk=notif_id, user=request.user)
        n.lue = True
        n.save()
        return Response({'message': 'Notification marquée comme lue.'})
    except Notification.DoesNotExist:
        return Response({'error': 'Introuvable.'}, status=404)
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def tout_marquer_lu(request):
    """POST /api/notifications/tout-lire/"""
    from magasin.models import Notification
    Notification.objects.filter(user=request.user, lue=False).update(lue=True)
    return Response({'message': 'Toutes les notifications marquées comme lues.'})
 
 
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def supprimer_notif(request, notif_id):
    """DELETE /api/notifications/<id>/supprimer/"""
    from magasin.models import Notification
    try:
        n = Notification.objects.get(pk=notif_id, user=request.user)
        n.delete()
        return Response({'message': 'Notification supprimée.'})
    except Notification.DoesNotExist:
        return Response({'error': 'Introuvable.'}, status=404)
 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generer_facture_pdf(request, commande_id):
    """GET /api/commandes/<id>/facture/ — génère/télécharge le PDF de la facture"""
    from .models import Facture, Commande
    try:
        commande = Commande.objects.get(pk=commande_id)
    except Commande.DoesNotExist:
        return Response({'error': 'Commande introuvable.'}, status=404)

    if commande.user != request.user and not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)

    facture = getattr(commande, 'facture', None)
    if not facture:
        numero = f"F-{commande.id}-{commande.date_commande.strftime('%Y%m%d')}"
        facture = Facture.objects.create(
            commande=commande,
            numero=numero,
            total_ht=commande.totalCde,
            tva=0,
            total_ttc=commande.totalCde,
            pdf_genere=False
        )

    # Si reportlab n'est pas disponible, renvoyer un fichier texte basique
    if A4 is None:
        content = f"Facture {facture.numero}\nCommande #{commande.id}\nTotal: {facture.total_ttc} DT\n\n"
        for item in commande.items.all():
            content += f"{item.produit.libelle} x{item.quantite} - {item.sous_total()} DT\n"
        response = HttpResponse(content, content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="facture_{commande.id}.txt"'
        return response

    # Générer un PDF simple avec reportlab
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    p.setFont("Helvetica-Bold", 16)
    p.drawString(40, height - 60, "Facture")
    p.setFont("Helvetica", 12)
    p.drawString(40, height - 90, f"Numéro: {facture.numero}")
    p.drawString(40, height - 110, f"Date: {facture.date_emission.strftime('%d/%m/%Y')}")
    p.drawString(40, height - 130, f"Commande #: {commande.id}")
    y = height - 170
    p.setFont("Helvetica-Bold", 12)
    p.drawString(40, y, "Article")
    p.drawString(360, y, "Quantité")
    p.drawString(440, y, "Prix unitaire")
    p.drawString(520, y, "Sous-total")
    p.setFont("Helvetica", 11)
    y -= 20
    for item in commande.items.all():
        p.drawString(40, y, item.produit.libelle[:40])
        p.drawRightString(420, y, str(item.quantite))
        p.drawRightString(500, y, f"{item.prix_unitaire}")
        p.drawRightString(580, y, f"{item.sous_total()}")
        y -= 18
        if y < 80:
            p.showPage()
            y = height - 60

    p.setFont("Helvetica-Bold", 12)
    p.drawRightString(580, y - 10, f"Total: {facture.total_ttc} DT")
    p.showPage()
    p.save()
    pdf = buffer.getvalue()
    buffer.close()

    facture.pdf_genere = True
    facture.save()

    response = HttpResponse(pdf, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="facture_{commande.id}.pdf"'
    return response


# ════════════════════════════════════════════════════════════════════════
# 2. ANALYTICS AVANCÉS
# ════════════════════════════════════════════════════════════════════════
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_avances(request):
    """GET /api/analytics/
    Paramètres : ?periode=7  (7, 30, 90, 365 jours)
    """
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    from magasin.models import Commande, Produit, Fournisseur
    from django.contrib.auth.models import User
 
    periode = int(request.query_params.get('periode', 30))
    date_debut = date.today() - timedelta(days=periode)
 
    # ── Ventes par jour ──────────────────────────────────────────────
    commandes = Commande.objects.filter(
        date_commande__gte=date_debut
    ).exclude(statut='annulee')
 
    ventes_par_jour = {}
    for i in range(periode):
        d = date_debut + timedelta(days=i)
        key = d.strftime('%Y-%m-%d')
        ventes_par_jour[key] = {'date': d.strftime('%d/%m'), 'total': 0, 'nb': 0}
 
    for c in commandes:
        key = c.date_commande.strftime('%Y-%m-%d') if hasattr(c.date_commande, 'strftime') else str(c.date_commande)[:10]
        if key in ventes_par_jour:
            ventes_par_jour[key]['total'] += float(c.totalCde or 0)
            ventes_par_jour[key]['nb'] += 1
 
    ventes_liste = list(ventes_par_jour.values())
 
    # ── CA total période ──────────────────────────────────────────────
    ca_total = sum(float(c.totalCde or 0) for c in commandes)
    ca_precedent_cmd = Commande.objects.filter(
        date_commande__gte=date_debut - timedelta(days=periode),
        date_commande__lt=date_debut
    ).exclude(statut='annulee')
    ca_precedent = sum(float(c.totalCde or 0) for c in ca_precedent_cmd)
    evolution_ca = round(((ca_total - ca_precedent) / max(ca_precedent, 1)) * 100, 1)
 
    # ── Commandes par statut ──────────────────────────────────────────
    from magasin.models import Commande as C
    STATUTS = ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee']
    statuts_data = []
    for s in STATUTS:
        nb = Commande.objects.filter(statut=s).count()
        statuts_data.append({'statut': s, 'nb': nb})
 
    # ── Top produits vendus ───────────────────────────────────────────
    try:
        from magasin.models import ItemCommande
        top_produits = ItemCommande.objects.filter(
            commande__date_commande__gte=date_debut
        ).values(
            'produit__id', 'produit__libelle', 'produit__prix'
        ).annotate(
            total_vendu=Sum('quantite'),
            ca_produit=Sum('prix_unitaire')
        ).order_by('-total_vendu')[:10]
 
        top_produits_liste = [{
            'id':          p['produit__id'],
            'libelle':     p['produit__libelle'],
            'prix':        float(p['produit__prix'] or 0),
            'total_vendu': p['total_vendu'] or 0,
            'ca':          float(p['ca_produit'] or 0),
        } for p in top_produits]
    except:
        # Fallback si ItemCommande n'existe pas
        top_produits_liste = []
        produits_all = Produit.objects.all()[:10]
        for p in produits_all:
            top_produits_liste.append({
                'id': p.id, 'libelle': p.libelle,
                'prix': float(p.prix), 'total_vendu': random.randint(1, 50), 'ca': float(p.prix) * random.randint(1, 50)
            })
        top_produits_liste.sort(key=lambda x: x['total_vendu'], reverse=True)
 
    # ── Revenus par catégorie ─────────────────────────────────────────
    from magasin.models import Categorie
    cats = Categorie.objects.all()
    revenus_cat = []
    COLORS = ['#6c63ff','#e63946','#2563eb','#22c55e','#f59e0b','#ec4899','#14b8a6','#f97316']
    for i, cat in enumerate(cats):
        nb = Produit.objects.filter(Categorie=cat).count()
        revenus_cat.append({
            'nom':   cat.nom,
            'nb':    nb,
            'color': COLORS[i % len(COLORS)]
        })
 
    # ── Nouveaux utilisateurs ─────────────────────────────────────────
    nb_users_nouveau = User.objects.filter(
        date_joined__gte=datetime.combine(date_debut, datetime.min.time())
    ).count()
    nb_users_total   = User.objects.count()
 
    # ── Taux conversion ───────────────────────────────────────────────
    nb_commandes_livrees  = Commande.objects.filter(statut='livree').count()
    nb_commandes_total    = Commande.objects.count()
    taux_conversion       = round((nb_commandes_livrees / max(nb_commandes_total, 1)) * 100, 1)
 
    # ── Panier moyen ──────────────────────────────────────────────────
    panier_moyen = round(ca_total / max(commandes.count(), 1), 2)
 
    # ── Clients les plus actifs ───────────────────────────────────────
    top_clients = Commande.objects.filter(
        date_commande__gte=date_debut
    ).values(
        'user__username', 'user__email'
    ).annotate(
        nb_commandes=Count('id'),
        total_depense=Sum('totalCde')
    ).order_by('-total_depense')[:5]
 
    top_clients_liste = [{
        'username':      c['user__username'],
        'email':         c['user__email'],
        'nb_commandes':  c['nb_commandes'],
        'total_depense': float(c['total_depense'] or 0),
    } for c in top_clients]
 
    # ── Stock alertes ──────────────────────────────────────────────────
    try:
        produits_alerte = Produit.objects.filter(
            quantite_stock__lte=models.F('seuil_alerte')
        ).values('id', 'libelle', 'quantite_stock', 'seuil_alerte')[:10]
        stock_alertes = list(produits_alerte)
    except:
        stock_alertes = []
 
    return Response({
        'periode':          periode,
        'ca_total':         round(ca_total, 2),
        'ca_precedent':     round(ca_precedent, 2),
        'evolution_ca':     evolution_ca,
        'nb_commandes':     commandes.count(),
        'panier_moyen':     panier_moyen,
        'taux_conversion':  taux_conversion,
        'nb_users_nouveau': nb_users_nouveau,
        'nb_users_total':   nb_users_total,
        'ventes_par_jour':  ventes_liste,
        'statuts':          statuts_data,
        'top_produits':     top_produits_liste,
        'revenus_cat':      revenus_cat,
        'top_clients':      top_clients_liste,
        'stock_alertes':    stock_alertes,
    })
 
 
# ════════════════════════════════════════════════════════════════════════
# 3. RECOMMANDATIONS IA
# ════════════════════════════════════════════════════════════════════════
 
@api_view(['GET'])
@permission_classes([AllowAny])
def recommandations_produit(request, produit_id):
    """GET /api/produits/<id>/recommandations/
    Retourne les produits similaires et souvent achetés ensemble
    """
    from magasin.models import Produit
 
    try:
        produit = Produit.objects.get(pk=produit_id)
    except Produit.DoesNotExist:
        return Response({'error': 'Produit introuvable.'}, status=404)
 
    # ── Méthode 1 : Même catégorie (content-based) ────────────────────
    similaires = Produit.objects.filter(
        Categorie=produit.Categorie
    ).exclude(pk=produit_id).order_by('?')[:6]
 
    similaires_data = [{
        'id':          p.id,
        'libelle':     p.libelle,
        'prix':        float(p.prix),
        'img':         p.img.url if p.img else None,
        'categorie':   p.Categorie.nom if p.Categorie else None,
        'type':        p.type,
        'raison':      'Même catégorie',
        'score':       round(random.uniform(0.7, 0.99), 2),
    } for p in similaires]
 
    # ── Méthode 2 : Même fournisseur ──────────────────────────────────
    meme_fournisseur = Produit.objects.filter(
        Fournisseur=produit.Fournisseur
    ).exclude(pk=produit_id).exclude(
        id__in=[p['id'] for p in similaires_data]
    ).order_by('?')[:3] if produit.Fournisseur else []
 
    fournisseur_data = [{
        'id':      p.id,
        'libelle': p.libelle,
        'prix':    float(p.prix),
        'img':     p.img.url if p.img else None,
        'categorie': p.Categorie.nom if p.Categorie else None,
        'type':    p.type,
        'raison':  'Même fournisseur',
        'score':   round(random.uniform(0.6, 0.85), 2),
    } for p in meme_fournisseur]
 
    # ── Méthode 3 : Achetés ensemble (collaborative) ──────────────────
    try:
        from magasin.models import ItemCommande
        # Trouver les commandes qui contiennent ce produit
        commandes_avec_produit = ItemCommande.objects.filter(
            produit=produit
        ).values_list('commande_id', flat=True)
 
        # Trouver les autres produits dans ces commandes
        achetes_ensemble = ItemCommande.objects.filter(
            commande_id__in=commandes_avec_produit
        ).exclude(produit=produit).values(
            'produit__id', 'produit__libelle', 'produit__prix'
        ).annotate(
            nb=Count('produit')
        ).order_by('-nb')[:4]
 
        ensemble_data = [{
            'id':      p['produit__id'],
            'libelle': p['produit__libelle'],
            'prix':    float(p['produit__prix'] or 0),
            'img':     None,
            'categorie': None,
            'type':    'em',
            'raison':  f"Acheté {p['nb']}x ensemble",
            'score':   round(min(p['nb'] * 0.1 + 0.5, 0.99), 2),
        } for p in achetes_ensemble]
    except:
        ensemble_data = []
 
    # ── Méthode 4 : Même fourchette de prix ───────────────────────────
    prix = float(produit.prix)
    marge = prix * 0.3  # ±30%
    meme_prix = Produit.objects.filter(
        prix__gte=prix - marge,
        prix__lte=prix + marge,
    ).exclude(pk=produit_id).exclude(
        id__in=[p['id'] for p in similaires_data + fournisseur_data]
    ).order_by('?')[:3]
 
    prix_data = [{
        'id':      p.id,
        'libelle': p.libelle,
        'prix':    float(p.prix),
        'img':     p.img.url if p.img else None,
        'categorie': p.Categorie.nom if p.Categorie else None,
        'type':    p.type,
        'raison':  'Prix similaire',
        'score':   round(random.uniform(0.55, 0.75), 2),
    } for p in meme_prix]
 
    return Response({
        'produit_id':      produit_id,
        'similaires':      similaires_data,
        'fournisseur':     fournisseur_data,
        'achetes_ensemble': ensemble_data,
        'meme_prix':       prix_data,
        # Tous mélangés et triés par score
        'tous': sorted(
            similaires_data + fournisseur_data + ensemble_data + prix_data,
            key=lambda x: x['score'], reverse=True
        )[:8],
    })
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommandations_personnalisees(request):
    """GET /api/recommandations/
    Recommandations basées sur l'historique d'achat de l'utilisateur
    """
    from magasin.models import Produit, Commande
 
    user = request.user
 
    # Produits déjà achetés
    try:
        from magasin.models import ItemCommande
        produits_achetes_ids = ItemCommande.objects.filter(
            commande__user=user
        ).values_list('produit_id', flat=True)
 
        # Catégories préférées
        cats_preferees = ItemCommande.objects.filter(
            commande__user=user
        ).values('produit__Categorie').annotate(
            nb=Count('produit__Categorie')
        ).order_by('-nb')[:3]
 
        cats_ids = [c['produit__Categorie'] for c in cats_preferees if c['produit__Categorie']]
 
        # Produits recommandés dans ces catégories non encore achetés
        recommandes = Produit.objects.filter(
            Categorie__in=cats_ids
        ).exclude(id__in=produits_achetes_ids).order_by('?')[:8]
    except:
        recommandes = Produit.objects.order_by('?')[:8]
        produits_achetes_ids = []
 
    data = [{
        'id':        p.id,
        'libelle':   p.libelle,
        'prix':      float(p.prix),
        'img':       p.img.url if p.img else None,
        'categorie': p.Categorie.nom if p.Categorie else None,
        'type':      p.type,
        'raison':    'Basé sur vos achats',
        'score':     round(random.uniform(0.7, 0.99), 2),
    } for p in recommandes]
 
    # Nouveaux produits (récents)
    nouveaux = Produit.objects.order_by('-id').exclude(
        id__in=produits_achetes_ids
    )[:4]
    nouveaux_data = [{
        'id':        p.id,
        'libelle':   p.libelle,
        'prix':      float(p.prix),
        'img':       p.img.url if p.img else None,
        'categorie': p.Categorie.nom if p.Categorie else None,
        'type':      p.type,
        'raison':    '🆕 Nouveau',
        'score':     round(random.uniform(0.65, 0.85), 2),
    } for p in nouveaux]
 
    return Response({
        'pour_vous': data,
        'nouveautes': nouveaux_data,
    })
 

import io
import os
from datetime import date, timedelta
from django.http import HttpResponse
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
 
 
# ── Helper : Générer le numéro de facture unique ──────────────────────
def _generer_numero_facture(commande_id):
    """Génère un numéro de facture unique : HH-2026-000001"""
    annee = date.today().year
    return f"HH-{annee}-{str(commande_id).zfill(6)}"
 
 
# ── Helper : Créer ou récupérer la facture ────────────────────────────
def _get_or_create_facture(commande):
    from magasin.models import Facture
    
    try:
        f = commande.facture
        print(f"[DEBUG] facture existante : {f.numero}")
        return f
    except Exception as e:
        print(f"[DEBUG] pas de facture existante : {e}")

    total    = float(commande.totalCde or 0)
    tva      = round(total * 0.19, 3)
    total_ht = round(total - tva, 3)
    
    print(f"[DEBUG] création facture — total={total}, tva={tva}, ht={total_ht}")
    
    try:
        facture = Facture.objects.create(
            commande=commande,
            numero=_generer_numero_facture(commande.id),
            total_ht=total_ht,
            tva=tva,
            total_ttc=total,
            pdf_genere=True,
        )
        print(f"[DEBUG] facture créée : {facture.id} — {facture.numero}")
        return facture
    except Exception as e:
        print(f"[DEBUG] ERREUR création facture : {e}")
        raise
 
# ── Helper : Récupérer les items de la commande ───────────────────────
def _get_items_commande(commande):
    """Retourne les articles de la commande"""
    try:
        from magasin.models import ItemCommande
        items = ItemCommande.objects.filter(
            commande=commande
        ).select_related('produit')
        return [{
            'libelle':       i.produit.libelle,
            'quantite':      i.quantite,
            'prix_unitaire': float(i.prix_unitaire),
            'sous_total':    float(i.prix_unitaire) * i.quantite,
        } for i in items]
    except Exception:
        # Fallback si ItemCommande n'existe pas
        return [{
            'libelle':       p.libelle,
            'quantite':      1,
            'prix_unitaire': float(p.prix),
            'sous_total':    float(p.prix),
        } for p in commande.produits.all()]
 
 
# ── Générateur PDF principal ───────────────────────────────────────────
def _generer_pdf(commande, facture, items):
    """Génère le PDF et retourne un buffer BytesIO"""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Table, TableStyle,
        Paragraph, Spacer, HRFlowable
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
 
    # ── Couleurs ──────────────────────────────────────────────────────
    VIOLET  = colors.HexColor('#6c63ff')
    DARK    = colors.HexColor('#0a0a0f')
    GRAY    = colors.HexColor('#6a6a78')
    LIGHT   = colors.HexColor('#f8f9fa')
    BORDER  = colors.HexColor('#e8e8f0')
    GREEN   = colors.HexColor('#22c55e')
    WHITE   = colors.white
 
    # ── Buffer ────────────────────────────────────────────────────────
    buffer = io.BytesIO()
    doc    = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=1.5*cm, bottomMargin=2*cm,
        title=f"Facture {facture.numero}",
    )
 
    styles = getSampleStyleSheet()
 
    # ── Styles personnalisés ──────────────────────────────────────────
    def ps(name, **kwargs):
        return ParagraphStyle(name, parent=styles['Normal'], **kwargs)
 
    ST = {
        'brand':   ps('brand',   fontSize=26, fontName='Helvetica-Bold', textColor=VIOLET),
        'slogan':  ps('slogan',  fontSize=9,  textColor=GRAY),
        'inv_num': ps('inv_num', fontSize=22, fontName='Helvetica-Bold',
                      textColor=DARK, alignment=TA_RIGHT),
        'inv_sub': ps('inv_sub', fontSize=10, textColor=GRAY, alignment=TA_RIGHT),
        'section': ps('section', fontSize=11, fontName='Helvetica-Bold',
                      textColor=DARK, spaceBefore=4, spaceAfter=6),
        'normal':  ps('normal',  fontSize=9,  textColor=DARK),
        'muted':   ps('muted',   fontSize=9,  textColor=GRAY),
        'bold9':   ps('bold9',   fontSize=9,  fontName='Helvetica-Bold', textColor=DARK),
        'total_lbl': ps('tl',   fontSize=10, fontName='Helvetica-Bold',
                         textColor=DARK, alignment=TA_RIGHT),
        'total_val': ps('tv',   fontSize=10, fontName='Helvetica-Bold',
                         textColor=VIOLET, alignment=TA_RIGHT),
        'footer':    ps('foot', fontSize=8,  textColor=GRAY, alignment=TA_CENTER),
        'thanks':    ps('thx',  fontSize=11, fontName='Helvetica-Bold',
                         textColor=VIOLET, alignment=TA_CENTER),
    }
 
    content = []
 
    # ════════════════════════════════════════════════════════════════
    # EN-TÊTE : Logo + Numéro de facture
    # ════════════════════════════════════════════════════════════════
    date_emission = facture.date_emission
    if hasattr(date_emission, 'strftime'):
        date_str = date_emission.strftime('%d/%m/%Y')
    else:
        date_str = str(date_emission)[:10]
 
    date_cmd = commande.date_commande
    if hasattr(date_cmd, 'strftime'):
        date_cmd_str = date_cmd.strftime('%d/%m/%Y')
    else:
        date_cmd_str = str(date_cmd)[:10]
 
    header = Table([
        [
            [Paragraph('🍯 Honey House', ST['brand']),
             Paragraph('Votre boutique en ligne de confiance', ST['slogan'])],
            [Paragraph('FACTURE', ST['inv_num']),
             Paragraph(f'N° {facture.numero}', ST['inv_sub']),
             Paragraph(f'Date : {date_str}', ST['inv_sub'])],
        ]
    ], colWidths=[10*cm, 7*cm])
    header.setStyle(TableStyle([
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    content.append(header)
    content.append(HRFlowable(width='100%', thickness=3,
        color=VIOLET, spaceAfter=16, spaceBefore=4))
 
    # ════════════════════════════════════════════════════════════════
    # BANDE STATUT COMMANDE
    # ════════════════════════════════════════════════════════════════
    STATUT_COLORS = {
        'confirmee': GREEN, 'expediee': VIOLET,
        'livree': GREEN,    'en_attente': colors.orange,
        'annulee': colors.red,
    }
    statut_color = STATUT_COLORS.get(commande.statut, GRAY)
    statut_label = {
        'confirmee': '✅ CONFIRMÉE', 'expediee': '🚚 EXPÉDIÉE',
        'livree': '🎉 LIVRÉE',       'en_attente': '⏳ EN ATTENTE',
        'annulee': '❌ ANNULÉE',
    }.get(commande.statut, commande.statut.upper())
 
    status_table = Table([[
        Paragraph(f'Commande #{str(commande.id).zfill(4)} — {statut_label}',
            ps('st', fontSize=10, fontName='Helvetica-Bold',
               textColor=WHITE, alignment=TA_CENTER))
    ]], colWidths=[17*cm])
    status_table.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), statut_color),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('ROUNDEDCORNERS', [6]),
    ]))
    content.append(status_table)
    content.append(Spacer(1, 16))
 
    # ════════════════════════════════════════════════════════════════
    # INFOS CLIENT + INFOS COMMANDE (2 colonnes)
    # ════════════════════════════════════════════════════════════════
    adresse  = getattr(commande, 'adresse_livraison', '') or '—'
    tel      = getattr(commande, 'telephone', '') or '—'
    email    = commande.user.email or '—'
    prenom   = commande.user.first_name or ''
    nom      = commande.user.last_name or ''
    nom_complet = f"{prenom} {nom}".strip() or commande.user.username
 
    left_col = [
        Paragraph('INFORMATIONS CLIENT', ST['section']),
        Spacer(1, 4),
        Paragraph(f'<b>Nom :</b> {nom_complet}',         ST['normal']),
        Paragraph(f'<b>Username :</b> {commande.user.username}', ST['muted']),
        Paragraph(f'<b>Email :</b> {email}',             ST['normal']),
        Paragraph(f'<b>Téléphone :</b> {tel}',           ST['normal']),
        Paragraph(f'<b>Adresse :</b> {adresse}',         ST['normal']),
    ]
 
    right_col = [
        Paragraph('DÉTAILS DE LA COMMANDE', ST['section']),
        Spacer(1, 4),
        Paragraph(f'<b>N° Commande :</b> #{str(commande.id).zfill(4)}', ST['normal']),
        Paragraph(f'<b>Date commande :</b> {date_cmd_str}',             ST['normal']),
        Paragraph(f'<b>N° Facture :</b> {facture.numero}',              ST['bold9']),
        Paragraph(f'<b>Date facture :</b> {date_str}',                  ST['normal']),
        Paragraph('<b>Mode de paiement :</b> À la livraison',           ST['normal']),
    ]
 
    info_table = Table(
        [[left_col, right_col]],
        colWidths=[8.5*cm, 8.5*cm]
    )
    info_table.setStyle(TableStyle([
        ('VALIGN',        (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND',    (0,0), (0,0),   LIGHT),
        ('BACKGROUND',    (1,0), (1,0),   colors.HexColor('#f0f0ff')),
        ('BOX',           (0,0), (0,0),   0.5, BORDER),
        ('BOX',           (1,0), (1,0),   0.5, BORDER),
        ('LEFTPADDING',   (0,0), (-1,-1), 12),
        ('RIGHTPADDING',  (0,0), (-1,-1), 12),
        ('TOPPADDING',    (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LINEABOVE',     (0,0), (0,0),   2, VIOLET),
        ('LINEABOVE',     (1,0), (1,0),   2, colors.HexColor('#9b59ff')),
    ]))
    content.append(info_table)
    content.append(Spacer(1, 20))
 
    # ════════════════════════════════════════════════════════════════
    # TABLEAU DES ARTICLES
    # ════════════════════════════════════════════════════════════════
    content.append(Paragraph('ARTICLES COMMANDÉS', ST['section']))
 
    thead = ['N°', 'Désignation', 'Qté', 'Prix unitaire HT', 'TVA (19%)', 'Sous-total TTC']
    rows  = [thead]
 
    for idx, item in enumerate(items, 1):
        pu_ht   = round(item['prix_unitaire'] / 1.19, 3)
        tva_row = round(item['prix_unitaire'] - pu_ht, 3)
        rows.append([
            str(idx),
            item['libelle'],
            str(item['quantite']),
            f"{pu_ht:.3f} DT",
            f"{tva_row:.3f} DT",
            f"{item['sous_total']:.3f} DT",
        ])
 
    col_widths = [0.8*cm, 7.2*cm, 1.2*cm, 2.8*cm, 2*cm, 3*cm]
    items_table = Table(rows, colWidths=col_widths, repeatRows=1)
    items_table.setStyle(TableStyle([
        # Header
        ('BACKGROUND',    (0,0), (-1,0),  VIOLET),
        ('TEXTCOLOR',     (0,0), (-1,0),  WHITE),
        ('FONTNAME',      (0,0), (-1,0),  'Helvetica-Bold'),
        ('FONTSIZE',      (0,0), (-1,0),  8.5),
        ('ALIGN',         (0,0), (-1,0),  'CENTER'),
        # Lignes alternées
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [WHITE, LIGHT]),
        ('FONTSIZE',      (0,1), (-1,-1), 8.5),
        # Alignements colonnes
        ('ALIGN',   (0,1), (0,-1),  'CENTER'),   # N°
        ('ALIGN',   (2,1), (2,-1),  'CENTER'),   # Qté
        ('ALIGN',   (3,1), (-1,-1), 'RIGHT'),    # Prix etc.
        # Bordures
        ('BOX',       (0,0), (-1,-1), 0.5, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.25, BORDER),
        # Padding
        ('TOPPADDING',    (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING',   (0,0), (-1,-1), 6),
        ('RIGHTPADDING',  (0,0), (-1,-1), 6),
        # Ligne séparatrice header
        ('LINEBELOW', (0,0), (-1,0), 0, WHITE),
    ]))
    content.append(items_table)
    content.append(Spacer(1, 16))
 
    # ════════════════════════════════════════════════════════════════
    # TOTAUX
    # ════════════════════════════════════════════════════════════════
    total_ht  = float(facture.total_ht)
    tva_val   = float(facture.tva)
    total_ttc = float(facture.total_ttc)
 
    totaux_data = [
        ['', Paragraph('Sous-total HT :', ST['total_lbl']),
             Paragraph(f'{total_ht:.3f} DT', ST['muted'])],
        ['', Paragraph('TVA (19%) :', ST['total_lbl']),
             Paragraph(f'{tva_val:.3f} DT', ST['muted'])],
        ['', Paragraph('TOTAL TTC :', ps('ttl', fontSize=12,
             fontName='Helvetica-Bold', textColor=VIOLET, alignment=TA_RIGHT)),
             Paragraph(f'{total_ttc:.3f} DT', ps('ttv', fontSize=12,
             fontName='Helvetica-Bold', textColor=VIOLET, alignment=TA_RIGHT))],
    ]
 
    totaux_table = Table(totaux_data, colWidths=[9*cm, 5*cm, 3*cm])
    totaux_table.setStyle(TableStyle([
        ('ALIGN',         (1,0), (-1,-1), 'RIGHT'),
        ('TOPPADDING',    (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LINEABOVE',     (1,2), (-1,2),  1.5, VIOLET),
        ('BACKGROUND',    (1,2), (-1,2),  colors.HexColor('#f0f0ff')),
        ('BOX',           (1,0), (-1,-1), 0.5, BORDER),
        ('INNERGRID',     (1,0), (-1,-1), 0.25, BORDER),
    ]))
    content.append(totaux_table)
 
    # ════════════════════════════════════════════════════════════════
    # NOTES SI PRÉSENTES
    # ════════════════════════════════════════════════════════════════
    notes = getattr(commande, 'notes', '') or ''
    if notes.strip():
        content.append(Spacer(1, 12))
        notes_table = Table([[
            Paragraph(f'📝 Notes : {notes}',
                ps('n', fontSize=9, textColor=GRAY))
        ]], colWidths=[17*cm])
        notes_table.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,-1), LIGHT),
            ('BOX',           (0,0), (-1,-1), 0.5, BORDER),
            ('LEFTPADDING',   (0,0), (-1,-1), 10),
            ('TOPPADDING',    (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LINEABOVE',     (0,0), (-1,0),  2, colors.orange),
        ]))
        content.append(notes_table)
 
    # ════════════════════════════════════════════════════════════════
    # INFORMATIONS LÉGALES
    # ════════════════════════════════════════════════════════════════
    content.append(Spacer(1, 20))
    legal_data = [[
        Paragraph(
            '📋 <b>Informations légales</b><br/>'
            'Cette facture est générée automatiquement et constitue un document officiel. '
            'TVA applicable au taux de 19% conformément à la législation tunisienne en vigueur. '
            'Toute réclamation doit être effectuée dans un délai de 14 jours.',
            ps('legal', fontSize=7.5, textColor=GRAY)
        )
    ]]
    legal_table = Table(legal_data, colWidths=[17*cm])
    legal_table.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,-1), LIGHT),
        ('BOX',           (0,0), (-1,-1), 0.5, BORDER),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
        ('TOPPADDING',    (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    content.append(legal_table)
 
    # ════════════════════════════════════════════════════════════════
    # PIED DE PAGE
    # ════════════════════════════════════════════════════════════════
    content.append(Spacer(1, 16))
    content.append(HRFlowable(width='100%', thickness=1,
        color=BORDER, spaceAfter=10))
    content.append(Paragraph(
        '🍯 Merci pour votre confiance et votre achat !',
        ST['thanks']
    ))
    content.append(Spacer(1, 4))
    content.append(Paragraph(
        f'Honey House • {date.today().year} • contact@honeyhouse.tn • +216 XX XXX XXX',
        ST['footer']
    ))
 
    # ── Build ─────────────────────────────────────────────────────────
    doc.build(content)
    buffer.seek(0)
    return buffer
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def apercu_facture(request, commande_id):
    """
    GET /api/commandes/<id>/facture/apercu/
    Retourne les données JSON de la facture (pour affichage dans React)
    """
    from magasin.models import Commande
 
    try:
        if request.user.is_staff:
            commande = Commande.objects.select_related('user').get(pk=commande_id)
        else:
            commande = Commande.objects.select_related('user').get(
                pk=commande_id, user=request.user
            )
    except Commande.DoesNotExist:
        return Response({'error': 'Commande introuvable.'}, status=404)
 
    facture = _get_or_create_facture(commande)
    items   = _get_items_commande(commande)
 
    date_cmd = commande.date_commande
    date_str = date_cmd.strftime('%d/%m/%Y') if hasattr(date_cmd, 'strftime') else str(date_cmd)[:10]
    date_fac = facture.date_emission.strftime('%d/%m/%Y') if hasattr(facture.date_emission, 'strftime') else str(facture.date_emission)[:10]
 
    return Response({
        'numero':          facture.numero,
        'date_facture':    date_fac,
        'date_commande':   date_str,
        'commande_id':     commande.id,
        'statut':          commande.statut,
        'client': {
            'username':    commande.user.username,
            'nom_complet': f"{commande.user.first_name} {commande.user.last_name}".strip() or commande.user.username,
            'email':       commande.user.email or '—',
            'telephone':   getattr(commande, 'telephone', '') or '—',
            'adresse':     getattr(commande, 'adresse_livraison', '') or '—',
        },
        'items':      items,
        'total_ht':   float(facture.total_ht),
        'tva':        float(facture.tva),
        'total_ttc':  float(facture.total_ttc),
        'notes':      getattr(commande, 'notes', '') or '',
        'url_pdf':    f'/api/commandes/{commande.id}/facture/',
    })
 
 
# ✅ GARDEZ UNIQUEMENT CELLE-CI :

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mes_factures(request):
    from magasin.models import Commande, Facture

    if request.user.is_staff:
        commandes = Commande.objects.select_related('user').filter(
            statut__in=['en_attente', 'confirmee', 'expediee', 'livree']
        ).order_by('-date_commande')
    else:
        commandes = Commande.objects.select_related('user').filter(
            user=request.user,
            statut__in=['en_attente', 'confirmee', 'expediee', 'livree']
        ).order_by('-date_commande')

    data = []
    for c in commandes:
        facture = _get_or_create_facture(c)
        date_cmd = c.date_commande
        date_str = date_cmd.strftime('%d/%m/%Y') if hasattr(date_cmd, 'strftime') else str(date_cmd)[:10]

        STATUT_LABELS = {
            'en_attente': '⏳ En attente',
            'confirmee':  '✅ Confirmée',
            'expediee':   '🚚 Expédiée',
            'livree':     '🎉 Livrée',
        }

        data.append({
            'id':           c.id,
            'numero':       facture.numero,
            'date':         date_str,
            'client':       c.user.username,
            'total_ttc':    float(c.totalCde or 0),
            'statut':       c.statut,
            'statut_label': STATUT_LABELS.get(c.statut, c.statut),
            'url_pdf':      f'/api/commandes/{c.id}/facture/',
            'url_apercu':   f'/api/commandes/{c.id}/facture/apercu/',
        })

    return Response(data)


# ════════════════════════════════════════════════════════════════════════
# GESTION AUTOMATIQUE DE LA LIVRAISON
# ════════════════════════════════════════════════════════════════════════

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def marquer_livree_automatique(request, commande_id):
    """
    POST /api/commandes/<id>/marquer-livree/
    Marque une commande comme "livrée" après vérification du délai (15 min)
    Admin seulement
    """
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé. Admin uniquement.'}, status=403)
    
    from magasin.models import Commande, SuiviLivraison, EtapeLivraison
    from django.utils import timezone
    from datetime import timedelta
    
    DELAI_LIVRAISON = timedelta(minutes=15)  # 15 minutes pour test
    
    try:
        commande = Commande.objects.get(pk=commande_id)
    except Commande.DoesNotExist:
        return Response({'error': 'Commande introuvable.'}, status=404)
    
    if commande.statut == 'livree':
        return Response({'error': 'Commande déjà livrée.'}, status=400)
    
    if commande.statut not in ['expediee', 'en_transit']:
        return Response({
            'error': f'Commande en statut {commande.statut}, doit être expédiée ou en transit.'
        }, status=400)
    
    # Vérifier le délai depuis l'expédition
    temps_ecoule = timezone.now() - commande.date_commande
    if temps_ecoule < DELAI_LIVRAISON:
        temps_restant = DELAI_LIVRAISON - temps_ecoule
        minutes = int(temps_restant.total_seconds() / 60)
        return Response({
            'error': f'Délai insuffisant. Encore {minutes} minutes avant livraison.',
            'temps_restant_minutes': minutes,
            'peut_forcer': request.data.get('forcer', False)
        }, status=400)
    
    # Marquer comme livrée
    commande.statut = 'livree'
    commande.save()
    
    # Créer/récupérer le suivi et ajouter l'étape
    try:
        suivi = SuiviLivraison.objects.get(commande=commande)
    except SuiviLivraison.DoesNotExist:
        suivi = SuiviLivraison.objects.create(
            commande=commande,
            statut_actuel='livree',
        )
    
    suivi.statut_actuel = 'livree'
    suivi.save()
    
    EtapeLivraison.objects.create(
        suivi=suivi,
        statut='livree',
        description='Commande livrée avec succès',
        localisation=suivi.adresse_livraison or 'Tunisie'
    )
    
    # Créer/récupérer la facture
    facture = _get_or_create_facture(commande)
    
    return Response({
        'message': 'Commande marquée comme livrée ✅',
        'commande_id': commande.id,
        'statut': 'livree',
        'facture_numero': facture.numero,
        'facture_total': float(facture.total_ttc),
        'url_facture': f'/api/commandes/{commande.id}/facture/'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def forcer_livraison(request, commande_id):
    """
    POST /api/commandes/<id>/forcer-livraison/
    Force le passage en "livrée" sans attendre le délai
    Admin seulement - pour tests/urgences
    """
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé. Admin uniquement.'}, status=403)
    
    from magasin.models import Commande, SuiviLivraison, EtapeLivraison
    from django.utils import timezone
    
    try:
        commande = Commande.objects.get(pk=commande_id)
    except Commande.DoesNotExist:
        return Response({'error': 'Commande introuvable.'}, status=404)
    
    if commande.statut == 'livree':
        return Response({'error': 'Commande déjà livrée.'}, status=400)
    
    # Marquer comme livrée
    commande.statut = 'livree'
    commande.save()
    
    # Créer/récupérer le suivi et ajouter l'étape
    try:
        suivi = SuiviLivraison.objects.get(commande=commande)
    except SuiviLivraison.DoesNotExist:
        suivi = SuiviLivraison.objects.create(
            commande=commande,
            statut_actuel='livree',
        )
    
    suivi.statut_actuel = 'livree'
    suivi.save()
    
    EtapeLivraison.objects.create(
        suivi=suivi,
        statut='livree',
        description='Commande livrée (forcée par admin)',
        localisation=suivi.adresse_livraison or 'Tunisie'
    )
    
    # Créer/récupérer la facture
    facture = _get_or_create_facture(commande)
    
    return Response({
        'message': '⚡ Livraison forcée !',
        'commande_id': commande.id,
        'statut': 'livree',
        'facture_numero': facture.numero,
        'facture_total': float(facture.total_ttc),
        'url_facture': f'/api/commandes/{commande.id}/facture/'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def verifier_commandes_expirees(request):
    """
    GET /api/commandes/verifier-expirees/
    Vérifie et met à jour automatiquement les commandes dont le délai a expiré
    Admin seulement
    """
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé. Admin uniquement.'}, status=403)
    
    from magasin.models import Commande, SuiviLivraison, EtapeLivraison
    from django.utils import timezone
    from datetime import timedelta
    
    DELAI_LIVRAISON = timedelta(minutes=15)
    
    # Trouver les commandes expédiées/en transit depuis 15 min
    maintenant = timezone.now()
    commandes_a_livrer = Commande.objects.filter(
        statut__in=['expediee', 'en_transit'],
        date_commande__lte=maintenant - DELAI_LIVRAISON
    )
    
    updated_count = 0
    updated_list = []
    
    for commande in commandes_a_livrer:
        try:
            commande.statut = 'livree'
            commande.save()
            
            # Mettre à jour le suivi
            try:
                suivi = SuiviLivraison.objects.get(commande=commande)
            except SuiviLivraison.DoesNotExist:
                suivi = SuiviLivraison.objects.create(
                    commande=commande,
                    statut_actuel='livree',
                )
            
            suivi.statut_actuel = 'livree'
            suivi.save()
            
            EtapeLivraison.objects.create(
                suivi=suivi,
                statut='livree',
                description='Auto-livrée (délai expiré)',
                localisation=suivi.adresse_livraison or 'Tunisie'
            )
            
            # Créer la facture
            facture = _get_or_create_facture(commande)
            
            updated_count += 1
            updated_list.append({
                'commande_id': commande.id,
                'facture_numero': facture.numero,
                'total': float(facture.total_ttc)
            })
        except Exception as e:
            pass
    
    return Response({
        'message': f'{updated_count} commande(s) marquée(s) livrée(s)',
        'nombre_mises_a_jour': updated_count,
        'commandes_mises_a_jour': updated_list,
        'delai_livraison_minutes': 15
    })
from datetime import date, timedelta, datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
import random
import string
 
 
# ════════════════════════════════════════════════════════════════════════
# 1. SUIVI DES COMMANDES AVANCÉ
# ════════════════════════════════════════════════════════════════════════
 
def _num_suivi(commande_id):
    return f"HH-{date.today().year}-{str(commande_id).zfill(8)}"
 
 
def _creer_suivi(commande):
    """Crée le suivi automatiquement quand une commande est passée"""
    from magasin.models import SuiviCommande, EtapeSuivi
    if hasattr(commande, 'suivi_avance'):
        return commande.suivi_avance
 
    adresse = getattr(commande, 'adresse_livraison', '') or ''
    suivi   = SuiviCommande.objects.create(
        commande=commande,
        statut_actuel='en_attente',
        adresse_livraison=adresse,
        numero_suivi=_num_suivi(commande.id),
        date_livraison_estimee=date.today() + timedelta(days=3),
    )
    EtapeSuivi.objects.create(
        suivi=suivi,
        statut='en_attente',
        description='Commande reçue et enregistrée dans notre système.',
        localisation='Honey House — Entrepôt central',
    )
    return suivi
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suivi_commande(request, commande_id):
    """GET /api/commandes/<id>/suivi/"""
    from magasin.models import Commande, SuiviCommande, EtapeSuivi
 
    try:
        if request.user.is_staff:
            commande = Commande.objects.get(pk=commande_id)
        else:
            commande = Commande.objects.get(pk=commande_id, user=request.user)
    except Commande.DoesNotExist:
        return Response({'error': 'Commande introuvable.'}, status=404)
 
    suivi = _creer_suivi(commande)
 
    TIMELINE = [
        {'statut': 'en_attente',  'label': 'Commande reçue',   'icon': '📋'},
        {'statut': 'confirmee',   'label': 'Confirmée',         'icon': '✅'},
        {'statut': 'preparation', 'label': 'Préparation',       'icon': '📦'},
        {'statut': 'expediee',    'label': 'Expédiée',          'icon': '🚚'},
        {'statut': 'en_transit',  'label': 'En transit',        'icon': '📍'},
        {'statut': 'livree',      'label': 'Livrée',            'icon': '🎉'},
    ]
    ORDRE = [t['statut'] for t in TIMELINE]
    idx_actuel = ORDRE.index(suivi.statut_actuel) if suivi.statut_actuel in ORDRE else 0
 
    etapes = EtapeSuivi.objects.filter(suivi=suivi)
 
    return Response({
        'commande_id':    commande_id,
        'statut_actuel':  suivi.statut_actuel,
        'idx_actuel':     idx_actuel,
        'numero_suivi':   suivi.numero_suivi or _num_suivi(commande_id),
        'adresse':        suivi.adresse_livraison,
        'date_estimee':   suivi.date_livraison_estimee.strftime('%d/%m/%Y') if suivi.date_livraison_estimee else None,
        'date_livraison': suivi.date_livraison_reelle.strftime('%d/%m/%Y') if suivi.date_livraison_reelle else None,
        'livreur_nom':    suivi.livreur_nom or None,
        'livreur_tel':    suivi.livreur_tel or None,
        'timeline':       TIMELINE,
        'etapes': [{
            'statut':       e.statut,
            'description':  e.description,
            'localisation': e.localisation,
            'date':         e.date_etape.strftime('%d/%m/%Y à %H:%M'),
        } for e in etapes],
    })
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def avancer_statut(request, commande_id):
    """POST /api/commandes/<id>/avancer/  — Admin seulement"""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    from magasin.models import Commande, SuiviCommande, EtapeSuivi
 
    try:
        commande = Commande.objects.get(pk=commande_id)
    except Commande.DoesNotExist:
        return Response({'error': 'Commande introuvable.'}, status=404)
 
    suivi = _creer_suivi(commande)
 
    ORDRE = ['en_attente','confirmee','preparation','expediee','en_transit','livree']
    DESCRIPTIONS = {
        'confirmee':   'Votre commande a été confirmée par notre équipe.',
        'preparation': 'Votre commande est en cours de préparation dans notre entrepôt.',
        'expediee':    'Votre commande a été remise au transporteur.',
        'en_transit':  'Votre colis est en route vers votre adresse.',
        'livree':      '🎉 Votre commande a été livrée avec succès !',
    }
 
    idx = ORDRE.index(suivi.statut_actuel) if suivi.statut_actuel in ORDRE else 0
    if idx >= len(ORDRE) - 1:
        return Response({'error': 'Commande déjà au statut final.'}, status=400)
 
    nouveau_statut = ORDRE[idx + 1]
    localisation   = request.data.get('localisation', 'Tunisie')
    livreur_nom    = request.data.get('livreur_nom', '')
    livreur_tel    = request.data.get('livreur_tel', '')
 
    suivi.statut_actuel = nouveau_statut
    if livreur_nom: suivi.livreur_nom = livreur_nom
    if livreur_tel: suivi.livreur_tel = livreur_tel
    if nouveau_statut == 'livree':
        suivi.date_livraison_reelle = date.today()
        commande.statut = 'livree'
        commande.save()
    elif nouveau_statut == 'expediee':
        from django.utils import timezone
        suivi.date_expedition = timezone.now()
        commande.statut = 'expediee'
        commande.save()
    elif nouveau_statut == 'confirmee':
        commande.statut = 'confirmee'
        commande.save()
    suivi.save()
 
    EtapeSuivi.objects.create(
        suivi=suivi,
        statut=nouveau_statut,
        description=DESCRIPTIONS.get(nouveau_statut, nouveau_statut),
        localisation=localisation,
    )
 
    # Notification automatique
    try:
        from magasin.models import Notification
        Notification.objects.create(
            user=commande.user,
            type_notif='livraison',
            titre=f'📦 Commande #{commande_id} mise à jour',
            message=DESCRIPTIONS.get(nouveau_statut, ''),
            lien=f'commandes/{commande_id}',
        )
    except: pass
 
    return Response({'statut': nouveau_statut, 'message': f'Statut mis à jour : {nouveau_statut}'})
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def toutes_commandes_admin(request):
    """GET /api/admin/commandes/  — Vue admin de toutes les commandes"""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    from magasin.models import Commande
    statut = request.query_params.get('statut', '')
    qs = Commande.objects.select_related('user').order_by('-date_commande')
    if statut:
        qs = qs.filter(statut=statut)
 
    data = []
    for c in qs[:50]:
        date_cmd = c.date_commande
        date_str = date_cmd.strftime('%d/%m/%Y') if hasattr(date_cmd,'strftime') else str(date_cmd)[:10]
        data.append({
            'id':       c.id,
            'client':   c.user.username,
            'email':    c.user.email,
            'total':    float(c.totalCde or 0),
            'statut':   c.statut,
            'date':     date_str,
            'adresse':  getattr(c,'adresse_livraison','') or '',
            'telephone':getattr(c,'telephone','') or '',
        })
    return Response(data)
 
 
# ════════════════════════════════════════════════════════════════════════
# 2. PORTAIL FOURNISSEUR (géré par l'admin)
# ════════════════════════════════════════════════════════════════════════
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portail_fournisseur(request):
    """GET /api/fournisseurs/portail/  — Statistiques admin sur fournisseurs"""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    from magasin.models import Fournisseur, Produit
    from django.db.models import Count, Avg, F
 
    fournisseurs = Fournisseur.objects.all()
    data = []
 
    for f in fournisseurs:
        produits        = Produit.objects.filter(Fournisseur=f)
        nb_produits     = produits.count()
 
        # Stock
        try:
            en_stock        = produits.filter(en_stock=True).count()
            rupture         = produits.filter(en_stock=False).count()
            alerte          = produits.filter(
                quantite_stock__lte=F('seuil_alerte'),
                quantite_stock__gt=0
            ).count()
            stock_total     = sum(p.quantite_stock or 0 for p in produits)
            val_stock       = sum((p.quantite_stock or 0) * float(p.prix) for p in produits)
        except:
            en_stock=nb_produits; rupture=0; alerte=0; stock_total=0; val_stock=0
 
        # Commandes passées à ce fournisseur
        try:
            from magasin.models import CommandeFournisseur
            cmds    = CommandeFournisseur.objects.filter(fournisseur=f)
            nb_cmds = cmds.count()
            val_cmds= sum(cmd.total() for cmd in cmds)
        except:
            nb_cmds=0; val_cmds=0
 
        prix_moy = float(produits.aggregate(Avg('prix'))['prix__avg'] or 0)
 
        data.append({
            'id':           f.id,
            'nom':          f.nom,
            'email':        f.email or '—',
            'telephone':    f.telephone or '—',
            'adresse':      f.adresse or '—',
            'actif':        getattr(f, 'actif', True),
            'nb_produits':  nb_produits,
            'en_stock':     en_stock,
            'rupture':      rupture,
            'alerte':       alerte,
            'stock_total':  stock_total,
            'val_stock':    round(val_stock, 2),
            'prix_moyen':   round(prix_moy, 2),
            'nb_commandes': nb_cmds,
            'val_commandes':round(val_cmds, 2),
            'score_perf':   min(100, round((en_stock / max(nb_produits,1)) * 100)),
        })
 
    data.sort(key=lambda x: x['score_perf'], reverse=True)
    return Response(data)
 
 
@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def detail_fournisseur_admin(request, fournisseur_id):
    """
    GET   /api/fournisseurs/<id>/admin/  — détail complet
    PATCH /api/fournisseurs/<id>/admin/  — modifier
    """
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    from magasin.models import Fournisseur, Produit
    try:
        f = Fournisseur.objects.get(pk=fournisseur_id)
    except Fournisseur.DoesNotExist:
        return Response({'error': 'Fournisseur introuvable.'}, status=404)
 
    if request.method in ['PUT', 'PATCH']:
        for field in ['nom','email','telephone','adresse']:
            if field in request.data:
                setattr(f, field, request.data[field])
        if 'actif' in request.data:
            f.actif = request.data['actif']
        f.save()
        return Response({'message': f'Fournisseur {f.nom} mis à jour.'})
 
    # GET — détail complet avec produits
    produits = Produit.objects.filter(Fournisseur=f)
    return Response({
        'id':        f.id,
        'nom':       f.nom,
        'email':     f.email,
        'telephone': f.telephone,
        'adresse':   f.adresse,
        'actif':     getattr(f,'actif',True),
        'produits':  [{
            'id':        p.id,
            'libelle':   p.libelle,
            'prix':      float(p.prix),
            'type':      p.type,
            'en_stock':  getattr(p,'en_stock',True),
            'stock':     getattr(p,'quantite_stock',0),
        } for p in produits],
    })
 
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def commander_fournisseur(request, fournisseur_id):
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)

    try:
        f = Fournisseur.objects.get(pk=fournisseur_id)
    except Fournisseur.DoesNotExist:
        return Response({'error': 'Fournisseur introuvable.'}, status=404)

    produit_id = request.data.get('produit_id')
    quantite   = int(request.data.get('quantite', 0))

    if not produit_id or quantite <= 0:
        return Response({'error': 'Produit et quantité requis.'}, status=400)

    try:
        produit = Produit.objects.get(pk=produit_id, Fournisseur=f)  # ← majuscule
    except Produit.DoesNotExist:
        return Response({'error': 'Produit introuvable pour ce fournisseur.'}, status=404)

    # Réapprovisionner le stock directement
    ancien_stock = produit.quantite_stock
    produit.quantite_stock += quantite
    produit.en_stock = True
    produit.save()

    return Response({
        'message': f'Commande de {quantite} × {produit.libelle} envoyée à {f.nom}.',
        'produit': produit.libelle,
        'ancien_stock': ancien_stock,
        'nouveau_stock': produit.quantite_stock,
    }, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recevoir_commande_fournisseur(request, cmd_id):
    """POST /api/fournisseurs/commandes/<id>/recevoir/  — Marquer reçu + maj stock"""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    from magasin.models import CommandeFournisseur
 
    try:
        cmd = CommandeFournisseur.objects.get(pk=cmd_id)
    except CommandeFournisseur.DoesNotExist:
        return Response({'error': 'Commande introuvable.'}, status=404)
 
    cmd.statut         = 'recue'
    cmd.date_reception = date.today()
    cmd.save()
 
    # Mettre à jour le stock du produit
    produit = cmd.produit
    try:
        produit.quantite_stock = (produit.quantite_stock or 0) + cmd.quantite
        produit.en_stock       = True
        produit.save()
    except: pass
 
    return Response({'message': f'Stock de {produit.libelle} mis à jour (+{cmd.quantite}).', 'nouveau_stock': getattr(produit,'quantite_stock',0)})
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def commandes_fournisseur_list(request):
    """GET /api/fournisseurs/commandes/  — Liste toutes les commandes fournisseur"""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    from magasin.models import CommandeFournisseur
    cmds = CommandeFournisseur.objects.select_related(
        'fournisseur','produit','admin'
    ).order_by('-date_commande')[:50]
 
    data = [{
        'id':          c.id,
        'fournisseur': c.fournisseur.nom,
        'produit':     c.produit.libelle,
        'quantite':    c.quantite,
        'prix_unit':   float(c.prix_unitaire),
        'total':       c.total(),
        'statut':      c.statut,
        'date':        c.date_commande.strftime('%d/%m/%Y'),
        'reception':   c.date_reception.strftime('%d/%m/%Y') if c.date_reception else None,
        'notes':       c.notes,
    } for c in cmds]
    return Response(data)
 
 
# ════════════════════════════════════════════════════════════════════════
# 3. TABLEAU DE BORD AVANCÉ
# ════════════════════════════════════════════════════════════════════════
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_avance(request):
    """GET /api/dashboard/avance/?periode=30"""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    from magasin.models import Commande, Produit, Fournisseur, Categorie
    from django.contrib.auth.models import User
    from django.db.models import Count, Sum, Avg, Q, F
 
    periode    = int(request.query_params.get('periode', 30))
    date_debut = date.today() - timedelta(days=periode)
    date_prev  = date_debut - timedelta(days=periode)
 
    cmds    = Commande.objects.filter(date_commande__gte=date_debut).exclude(statut='annulee')
    cmds_pr = Commande.objects.filter(
        date_commande__gte=date_prev, date_commande__lt=date_debut
    ).exclude(statut='annulee')
 
    ca        = sum(float(c.totalCde or 0) for c in cmds)
    ca_prev   = sum(float(c.totalCde or 0) for c in cmds_pr)
    nb_cmds   = cmds.count()
    nb_prev   = cmds_pr.count()
    nb_users  = User.objects.count()
    nb_prods  = Produit.objects.count()
    nb_fours  = Fournisseur.objects.count()
 
    evo_ca   = round(((ca - ca_prev) / max(ca_prev, 1)) * 100, 1)
    evo_cmds = round(((nb_cmds - nb_prev) / max(nb_prev, 1)) * 100, 1)
 
    # ── Ventes par jour ───────────────────────────────────────────────
    ventes_jour = {}
    for i in range(min(periode, 30)):
        d   = date_debut + timedelta(days=i)
        key = d.strftime('%Y-%m-%d')
        ventes_jour[key] = {'date': d.strftime('%d/%m'), 'ca': 0, 'nb': 0}
    for c in cmds:
        key = c.date_commande.strftime('%Y-%m-%d') if hasattr(c.date_commande,'strftime') else str(c.date_commande)[:10]
        if key in ventes_jour:
            ventes_jour[key]['ca'] += float(c.totalCde or 0)
            ventes_jour[key]['nb'] += 1
 
    # ── Commandes par statut ──────────────────────────────────────────
    statuts = {}
    for c in Commande.objects.all():
        statuts[c.statut] = statuts.get(c.statut, 0) + 1
 
    # ── Top produits ──────────────────────────────────────────────────
    top_produits = []
    try:
        from magasin.models import ItemCommande
        top = ItemCommande.objects.filter(
            commande__date_commande__gte=date_debut
        ).values('produit__id','produit__libelle','produit__prix').annotate(
            total=Sum('quantite'), ca=Sum('prix_unitaire')
        ).order_by('-total')[:8]
        top_produits = [{
            'id': p['produit__id'], 'libelle': p['produit__libelle'],
            'prix': float(p['produit__prix'] or 0),
            'vendu': p['total'] or 0, 'ca': float(p['ca'] or 0),
        } for p in top]
    except: pass
 
    # ── Répartition catégories ────────────────────────────────────────
    cats = Categorie.objects.annotate(nb=Count('produit')).order_by('-nb')
    COLORS = ['#6c63ff','#e63946','#2563eb','#22c55e','#f59e0b','#ec4899','#14b8a6','#f97316']
    cats_data = [{'nom':c.nom,'nb':c.nb,'color':COLORS[i%len(COLORS)]} for i,c in enumerate(cats)]
 
    # ── Top clients ───────────────────────────────────────────────────
    top_clients = Commande.objects.filter(
        date_commande__gte=date_debut
    ).values('user__username','user__email').annotate(
        nb=Count('id'), total=Sum('totalCde')
    ).order_by('-total')[:5]
    clients_data = [{
        'username': c['user__username'], 'email': c['user__email'],
        'nb': c['nb'], 'total': float(c['total'] or 0),
    } for c in top_clients]
 
    # ── Alertes stock ─────────────────────────────────────────────────
    alertes_stock = []
    try:
        alertes = Produit.objects.filter(quantite_stock__lte=F('seuil_alerte'))
        alertes_stock = [{
            'id': p.id, 'libelle': p.libelle,
            'stock': p.quantite_stock, 'seuil': p.seuil_alerte,
        } for p in alertes[:10]]
    except: pass
 
    # ── Nouveaux utilisateurs ─────────────────────────────────────────
    from django.utils import timezone as tz
    try:
        nb_new_users = User.objects.filter(
            date_joined__gte=tz.make_aware(datetime.combine(date_debut, datetime.min.time()))
        ).count()
    except:
        nb_new_users = User.objects.filter(
            date_joined__date__gte=date_debut
        ).count()
 
    panier_moy = round(ca / max(nb_cmds, 1), 2)
 
    return Response({
        'periode':         periode,
        'ca':              round(ca, 2),
        'ca_prev':         round(ca_prev, 2),
        'evo_ca':          evo_ca,
        'nb_commandes':    nb_cmds,
        'nb_prev':         nb_prev,
        'evo_cmds':        evo_cmds,
        'panier_moy':      panier_moy,
        'nb_users':        nb_users,
        'nb_new_users':    nb_new_users,
        'nb_produits':     nb_prods,
        'nb_fournisseurs': nb_fours,
        'ventes_jour':     list(ventes_jour.values()),
        'statuts':         statuts,
        'top_produits':    top_produits,
        'categories':      cats_data,
        'top_clients':     clients_data,
        'alertes_stock':   alertes_stock,
    })
 
 
# ════════════════════════════════════════════════════════════════════════
# 4. CHATBOT SUPPORT CLIENT
# ════════════════════════════════════════════════════════════════════════
 
CHATBOT_KB = {
    # Commandes
    'commande':      ('commandes', 'Pour voir vos commandes, allez dans "Mes Commandes". Vous pouvez suivre l\'état en temps réel, annuler une commande en attente, et télécharger votre facture.'),
    'annuler':       ('commandes', 'Vous pouvez annuler une commande uniquement si elle est encore "En attente". Allez dans Mes Commandes → cliquez sur la commande → Annuler. Passé ce stade, contactez notre support.'),
    'livraison':     ('livraison', 'La livraison prend généralement 2 à 5 jours ouvrables. Vous pouvez suivre votre colis en temps réel depuis la page "Mes Commandes" → "Suivi".'),
    'retour':        ('retour', 'Pour retourner un produit, vous avez 14 jours après réception. Contactez notre support avec votre numéro de commande. Le remboursement intervient sous 5 à 7 jours.'),
    'remboursement': ('retour', 'Le remboursement est effectué sous 5 à 7 jours ouvrables après réception du retour. Il est effectué via le même mode de paiement initial.'),
 
    # Produits
    'produit':       ('produits', 'Notre catalogue contient des produits frais, emballés et en conserve. Utilisez les filtres de recherche pour trouver exactement ce que vous cherchez.'),
    'stock':         ('produits', 'Si un produit est marqué "En rupture", vous pouvez l\'ajouter à votre wishlist. Vous serez notifié dès qu\'il est à nouveau disponible.'),
    'prix':          ('produits', 'Nos prix sont en Dinars Tunisiens (DT) et incluent toutes les taxes. Vous pouvez appliquer un code promo lors du passage de commande.'),
 
    # Promo
    'promo':         ('promo', 'Pour appliquer un code promo, ajoutez vos produits au panier puis saisissez le code dans le champ prévu. La réduction sera appliquée automatiquement.'),
    'reduction':     ('promo', 'Les codes de réduction sont valables une seule fois par compte, dans la limite des dates de validité indiquées. Contactez-nous si votre code ne fonctionne pas.'),
 
    # Compte
    'compte':        ('compte', 'Pour modifier votre compte, allez dans votre profil utilisateur. Vous pouvez changer votre email, mot de passe et adresse de livraison par défaut.'),
    'mot de passe':  ('compte', 'Pour réinitialiser votre mot de passe, cliquez sur "Mot de passe oublié" sur la page de connexion. Un email de réinitialisation vous sera envoyé.'),
    'connexion':     ('compte', 'Si vous ne pouvez pas vous connecter, vérifiez votre email et mot de passe. Si le problème persiste, utilisez "Mot de passe oublié" ou contactez notre support.'),
 
    # Paiement
    'paiement':      ('paiement', 'Honey House accepte le paiement à la livraison. Assurez-vous d\'avoir le montant exact lors de la réception de votre commande.'),
    'facture':       ('paiement', 'Votre facture est disponible dans "Mes Commandes" → sélectionnez la commande → "Télécharger la facture PDF". Elle est générée automatiquement à la confirmation.'),
 
    # Support
    'contact':       ('support', 'Notre équipe support est disponible du lundi au samedi, de 8h à 20h. Email : contact@honeyhouse.tn | Téléphone : +216 XX XXX XXX'),
    'aide':          ('support', 'Je suis là pour vous aider ! Posez-moi votre question sur les commandes, produits, livraison, retours ou votre compte.'),
    'probleme':      ('support', 'Désolé d\'apprendre que vous rencontrez un problème. Pouvez-vous me décrire le problème plus précisément ? Je ferai de mon mieux pour vous aider.'),
 
    # Wishlist
    'wishlist':      ('wishlist', 'La wishlist vous permet de sauvegarder vos produits favoris. Cliquez sur le cœur ♥ sur chaque produit. Retrouvez votre wishlist dans le menu principal.'),
    'favoris':       ('wishlist', 'Pour ajouter un produit à vos favoris, cliquez sur l\'icône ♥ sur la carte produit. Vous retrouverez tous vos favoris dans "Ma Wishlist".'),
 
    # Avis
    'avis':          ('avis', 'Pour laisser un avis, cliquez sur ⭐ sur un produit que vous avez acheté. Sélectionnez votre note (1 à 5 étoiles) et rédigez votre commentaire.'),
}
 
 
@api_view(['POST'])
@permission_classes([AllowAny])
def chatbot_message(request):
    """POST /api/chatbot/
    { message: "..." }
    """
    message = request.data.get('message', '').strip()
    if not message:
        return Response({'error': 'Message requis.'}, status=400)
 
    msg_lower = message.lower()
 
    # ── Salutations ───────────────────────────────────────────────────
    salutations = ['bonjour','salut','bonsoir','hello','hi','coucou','hey']
    if any(s in msg_lower for s in salutations):
        user_str = f', {request.user.username}' if request.user.is_authenticated else ''
        return Response({
            'reponse':    f'Bonjour{user_str} ! 👋 Je suis l\'assistant Honey House. Comment puis-je vous aider aujourd\'hui ?',
            'categorie':  'salutation',
            'suggestions': ['Où est ma commande ?', 'Comment retourner un produit ?', 'Appliquer un code promo', 'Contacter le support'],
            'confiance':  1.0,
        })
 
    # ── Remerciements ─────────────────────────────────────────────────
    if any(w in msg_lower for w in ['merci','thanks','thank','super','parfait','génial']):
        return Response({
            'reponse':    'Avec plaisir ! 😊 N\'hésitez pas si vous avez d\'autres questions. Bonne journée !',
            'categorie':  'remerciement',
            'suggestions': [],
            'confiance':  1.0,
        })
 
    # ── Questions sur commande spécifique ─────────────────────────────
    if request.user.is_authenticated and any(w in msg_lower for w in ['ma commande','mon colis','ma livraison','où est']):
        from magasin.models import Commande
        derniere = Commande.objects.filter(user=request.user).order_by('-date_commande').first()
        if derniere:
            STATUT_MSG = {
                'en_attente':  f'Votre dernière commande #{derniere.id} est en attente de confirmation.',
                'confirmee':   f'Votre commande #{derniere.id} est confirmée et va bientôt être préparée.',
                'preparation': f'Votre commande #{derniere.id} est en cours de préparation dans notre entrepôt.',
                'expediee':    f'Votre commande #{derniere.id} a été expédiée ! Elle est en route vers vous.',
                'en_transit':  f'Votre commande #{derniere.id} est en transit et sera livrée très prochainement.',
                'livree':      f'Votre commande #{derniere.id} a été livrée. Profitez-en bien ! 🎉',
                'annulee':     f'Votre commande #{derniere.id} a été annulée.',
            }
            return Response({
                'reponse':    STATUT_MSG.get(derniere.statut, f'Commande #{derniere.id} — statut : {derniere.statut}'),
                'categorie':  'commandes',
                'suggestions': ['Télécharger la facture', 'Contacter le support', 'Passer une nouvelle commande'],
                'confiance':  0.95,
            })
 
    # ── Recherche dans la base de connaissances ───────────────────────
    meilleure_rep = None
    meilleure_cat = 'general'
    meilleur_score = 0
 
    for mot_cle, (cat, rep) in CHATBOT_KB.items():
        if mot_cle in msg_lower:
            score = len(mot_cle)  # Plus le mot-clé est long, plus c'est précis
            if score > meilleur_score:
                meilleure_rep   = rep
                meilleure_cat   = cat
                meilleur_score  = score
 
    # ── Suggestions contextuelles ─────────────────────────────────────
    SUGGESTIONS_CAT = {
        'commandes': ['Annuler ma commande', 'Suivre ma livraison', 'Télécharger ma facture'],
        'livraison': ['Délai de livraison', 'Changer mon adresse', 'Contacter le livreur'],
        'retour':    ['Procédure de retour', 'Délai de remboursement', 'Contacter le support'],
        'produits':  ['Filtrer par catégorie', 'Ajouter à la wishlist', 'Lire les avis'],
        'promo':     ['Valider mon code', 'Cumuler les réductions', 'Dates de validité'],
        'paiement':  ['Télécharger ma facture', 'Mode de paiement', 'Remboursement'],
        'compte':    ['Modifier mon email', 'Changer mon mot de passe', 'Supprimer mon compte'],
        'support':   ['Email du support', 'Horaires', 'Chat en direct'],
    }
 
    if meilleure_rep:
        return Response({
            'reponse':    meilleure_rep,
            'categorie':  meilleure_cat,
            'suggestions': SUGGESTIONS_CAT.get(meilleure_cat, []),
            'confiance':  round(0.6 + meilleur_score * 0.01, 2),
        })
 
    # ── Réponse par défaut ────────────────────────────────────────────
    return Response({
        'reponse':    "Je n'ai pas bien compris votre question. 🤔 Voici les sujets sur lesquels je peux vous aider :",
        'categorie':  'aide',
        'suggestions': [
            'Où est ma commande ?',
            'Comment retourner un produit ?',
            'Appliquer un code promo',
            'Problème de connexion',
            'Contacter le support',
        ],
        'confiance': 0.2,
    })
 
 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chatbot_historique(request):
    """GET /api/chatbot/historique/  — Historique des conversations (admin)"""
    if not request.user.is_staff:
        return Response({'error': 'Accès refusé.'}, status=403)
 
    from magasin.models import ChatbotConversation
    convs = ChatbotConversation.objects.select_related('user').order_by('-date_debut')[:50]
    data  = [{
        'id':         c.id,
        'user':       c.user.username if c.user else 'Anonyme',
        'nb_msg':     c.nb_messages,
        'date':       c.date_debut.strftime('%d/%m/%Y %H:%M'),
    } for c in convs]
    return Response(data)
 