# magasin/api_urls.py
# À inclure dans mysite2026/urls.py avec : path('api/', include('magasin.api_urls'))

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import api_views

urlpatterns = [
    # ── Auth ────────────────────────────────────────────────────────────────
    path('auth/login/',     api_views.login_view,    name='api_login'),
    path('auth/register/',  api_views.register_view, name='api_register'),
    path('auth/logout/',    api_views.logout_view,   name='api_logout'),
    path('auth/me/',        api_views.me_view,       name='api_me'),
    path('auth/refresh/',   TokenRefreshView.as_view(), name='token_refresh'),

    # ── Produits ─────────────────────────────────────────────────────────────
    path('produits/',          api_views.ProduitListCreate.as_view(), name='api_produits'),
    path('produits/<int:pk>/', api_views.ProduitDetail.as_view(),     name='api_produit_detail'),

    # ── Catégories ────────────────────────────────────────────────────────────
    path('categories/', api_views.CategorieListCreate.as_view(), name='api_categories'),

    # ── Fournisseurs ──────────────────────────────────────────────────────────
    path('fournisseurs/',          api_views.FournisseurListCreate.as_view(), name='api_fournisseurs'),
    path('fournisseurs/<int:pk>/', api_views.FournisseurDetail.as_view(),     name='api_fournisseur_detail'),

    # ── Commandes ─────────────────────────────────────────────────────────────
    path('commandes/', api_views.CommandeListCreate.as_view(), name='api_commandes'),

    # ── Dashboard ─────────────────────────────────────────────────────────────
    path('dashboard/', api_views.dashboard_stats, name='api_dashboard'),
    path('users/', api_views.users_list, name='api_users'),
]
