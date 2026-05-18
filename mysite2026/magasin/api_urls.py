from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import api_views

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────────
    path('auth/login/',    api_views.login_view,           name='api_login'),
    path('auth/register/', api_views.register_view,        name='api_register'),
    path('auth/logout/',   api_views.logout_view,          name='api_logout'),
    path('auth/me/',       api_views.me_view,              name='api_me'),
    path('auth/refresh/',  TokenRefreshView.as_view(),     name='token_refresh'),

    # ── Produits ──────────────────────────────────────────────────────────────
    path('produits/',          api_views.ProduitListCreate.as_view(), name='api_produits'),
    path('produits/<int:pk>/', api_views.ProduitDetail.as_view(),     name='api_produit_detail'),
    path('produits/<int:produit_id>/avis/',            api_views.avis_produit,              name='avis'),
    path('produits/<int:produit_id>/avis/supprimer/', api_views.supprimer_avis,             name='supprimer_avis'),
    path('produits/<int:produit_id>/recommandations/', api_views.recommandations_produit,   name='recommandations_produit'),

    # ── Catégories ────────────────────────────────────────────────────────────
    path('categories/', api_views.CategorieListCreate.as_view(), name='api_categories'),

    # ── Fournisseurs ──────────────────────────────────────────────────────────
    path('fournisseurs/',          api_views.FournisseurListCreate.as_view(), name='api_fournisseurs'),
    path('fournisseurs/<int:pk>/', api_views.FournisseurDetail.as_view(),     name='api_fournisseur_detail'),

    # ── Dashboard & Users ─────────────────────────────────────────────────────
    path('dashboard/', api_views.dashboard_stats, name='api_dashboard'),
    path('users/',     api_views.users_list,      name='api_users'),

    # ── Panier ────────────────────────────────────────────────────────────────
    path('panier/',          api_views.voir_panier,       name='api_voir_panier'),
    path('panier/ajouter/',  api_views.ajouter_au_panier, name='api_ajouter_panier'),
    path('panier/modifier/', api_views.modifier_panier,   name='api_modifier_panier'),
    path('panier/vider/',    api_views.vider_panier,      name='api_vider_panier'),

    # ── Commandes ─────────────────────────────────────────────────────────────
    path('commandes/',                       api_views.CommandeListCreate.as_view(), name='api_commandes'),
    path('commandes/passer/',                api_views.passer_commande,              name='api_passer_commande'),
    path('commandes/mes-commandes/',         api_views.mes_commandes,                name='api_mes_commandes'),
    path('commandes/verifier-expirees/',     api_views.verifier_commandes_expirees,  name='verifier_expirees'),
    path('commandes/<int:pk>/',              api_views.commande_detail,              name='api_commande_detail'),
    path('commandes/<int:pk>/annuler/',      api_views.annuler_commande,             name='api_annuler_commande'),

    # ── Commandes — Factures ──────────────────────────────────────────────────
    path('commandes/<int:commande_id>/facture/',         api_views.generer_facture_pdf, name='generer_facture'),
    path('commandes/<int:commande_id>/facture/apercu/',  api_views.apercu_facture,      name='apercu_facture'),

    # ── Commandes — Suivi & Livraison ─────────────────────────────────────────
    path('commandes/<int:commande_id>/suivi/',               api_views.suivi_commande,              name='suivi'),
    path('commandes/<int:commande_id>/avancer/',             api_views.avancer_statut,              name='avancer'),
    path('commandes/<int:commande_id>/confirmer-livraison/', api_views.confirmer_livraison_admin,   name='confirmer_livraison'),
    path('commandes/<int:commande_id>/position/update/',     api_views.update_position_livreur,     name='update_position'),
    path('commandes/<int:commande_id>/position/',            api_views.get_position_livreur,        name='get_position'),
    path('commandes/<int:commande_id>/marquer-livree/',      api_views.marquer_livree_automatique,  name='marquer_livree'),
    path('commandes/<int:commande_id>/forcer-livraison/',    api_views.forcer_livraison,            name='forcer_livraison'),

    # ── Factures ──────────────────────────────────────────────────────────────
    path('factures/', api_views.mes_factures, name='factures'),

    # ── Recherche ─────────────────────────────────────────────────────────────
    path('recherche/', api_views.recherche_avancee, name='recherche'),

    # ── Promo ─────────────────────────────────────────────────────────────────
    path('promo/valider/', api_views.valider_code_promo, name='valider_promo'),
    path('promo/',         api_views.gerer_codes_promo,  name='gerer_promos'),

    # ── Wishlist ──────────────────────────────────────────────────────────────
    path('wishlist/',                         api_views.ma_wishlist,    name='wishlist'),
    path('wishlist/ids/',                     api_views.wishlist_ids,   name='wishlist_ids'),
    path('wishlist/<int:produit_id>/toggle/', api_views.toggle_wishlist, name='toggle_wishlist'),

    # ── Stock ─────────────────────────────────────────────────────────────────
    path('stock/',                                    api_views.gestion_stock,       name='gestion_stock'),
    path('stock/<int:produit_id>/ajuster/',           api_views.ajuster_stock,       name='ajuster_stock'),
    path('stock/fournisseur/<int:fournisseur_id>/',   api_views.stock_par_fournisseur, name='stock_fournisseur'),

    # ── Notifications ─────────────────────────────────────────────────────────
    path('notifications/',                           api_views.mes_notifications, name='notifications'),
    path('notifications/tout-lire/',                 api_views.tout_marquer_lu,   name='tout_marquer_lu'),
    path('notifications/<int:notif_id>/lire/',       api_views.marquer_notif_lue, name='marquer_notif_lue'),
    path('notifications/<int:notif_id>/supprimer/',  api_views.supprimer_notif,   name='supprimer_notif'),

    # ── Analytics & Recommandations ───────────────────────────────────────────
    path('analytics/',       api_views.analytics_avances,            name='analytics'),
    path('recommandations/', api_views.recommandations_personnalisees, name='recommandations'),

    # ── Suivi Livraison (alias) ───────────────────────────────────────────────
    path('suivi-livraison/<int:commande_id>/', api_views.suivi_commande, name='suivi_livraison'),
    # Suivi commandes
path('commandes/<int:commande_id>/suivi/',       api_views.suivi_commande,             name='suivi'),
path('commandes/<int:commande_id>/avancer/',     api_views.avancer_statut,             name='avancer'),
path('admin/commandes/',                         api_views.toutes_commandes_admin,     name='admin_cmds'),
 
# ── Fournisseurs ──────────────────────────────────────────────────────────────
path('fournisseurs/',                                    api_views.FournisseurListCreate.as_view(), name='api_fournisseurs'),

# ⚠️ Routes fixes EN PREMIER (avant tout <int:...>)
path('fournisseurs/portail/',                            api_views.portail_fournisseur,             name='portail_f'),
path('fournisseurs/commandes/',                          api_views.commandes_fournisseur_list,      name='cmds_f'),
path('fournisseurs/commandes/<int:cmd_id>/recevoir/',    api_views.recevoir_commande_fournisseur,   name='recv_f'),

# Routes avec paramètres APRÈS
path('fournisseurs/<int:pk>/',                           api_views.FournisseurDetail.as_view(),     name='api_fournisseur_detail'),
path('fournisseurs/<int:fournisseur_id>/admin/',         api_views.detail_fournisseur_admin,        name='detail_f'),
path('fournisseurs/<int:fournisseur_id>/commander/',     api_views.commander_fournisseur,           name='cmd_f'),
 
 
# Chatbot
path('chatbot/',                                 api_views.chatbot_message,            name='chatbot'),
path('chatbot/historique/',                      api_views.chatbot_historique,         name='chatbot_hist'),
]