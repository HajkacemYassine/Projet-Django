# magasin/api_views.py
# ─── Installation requise ────────────────────────────────────────────────────
# pip install djangorestframework djangorestframework-simplejwt django-cors-headers

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count
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
