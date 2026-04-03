from django.urls import path
from . import api_views
 
urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────
    path('auth/login/',    api_views.login_view,    name='blood_login'),
    path('auth/register/', api_views.register_view, name='blood_register'),
 
    # ── Dashboards ────────────────────────────────────────────────────────
    path('dashboard/',          api_views.dashboard_admin,   name='blood_dashboard_admin'),
    path('dashboard/donneur/',  api_views.dashboard_donneur, name='blood_dashboard_donneur'),
    path('dashboard/hopital/',  api_views.dashboard_hopital, name='blood_dashboard_hopital'),
 
    # ── Demandes urgentes ─────────────────────────────────────────────────
    path('demandes-urgentes/',                           api_views.demandes_list,    name='blood_demandes'),
    path('demandes-urgentes/mes-demandes/',              api_views.mes_demandes,     name='blood_mes_demandes'),
    path('demandes-urgentes/creer/',                     api_views.creer_demande,    name='blood_creer_demande'),
    path('demandes-urgentes/<int:pk>/cloturer/',         api_views.cloturer_demande, name='blood_cloturer'),
    path('demandes-urgentes/<int:pk>/reponses/',         api_views.reponses_demande, name='blood_reponses_demande'),
 
    # ── Dons ──────────────────────────────────────────────────────────────
    path('mes-dons/', api_views.mes_dons, name='blood_mes_dons'),
 
    # ── Hôpitaux ──────────────────────────────────────────────────────────
    path('hopitaux/',                    api_views.hopitaux_list,   name='blood_hopitaux'),
    path('hopitaux/<int:pk>/valider/',   api_views.valider_hopital, name='blood_valider_hopital'),
    path('hopitaux/<int:pk>/rejeter/',   api_views.rejeter_hopital, name='blood_rejeter_hopital'),
    path('admin-panel/valider-hopital/<int:pk>/', api_views.valider_hopital, name='blood_valider_hopital_admin'),
 
    # ── Campagnes ─────────────────────────────────────────────────────────
    path('campagnes/',               api_views.campagnes_list, name='blood_campagnes'),
    path('campagnes/mes-campagnes/', api_views.mes_campagnes,  name='blood_mes_campagnes'),
 
    # ── Inscriptions campagne ─────────────────────────────────────────────
    path('inscriptions-campagne/', api_views.inscrire_campagne, name='blood_inscription'),
 
    # ── Réponses appel urgent ─────────────────────────────────────────────
    path('reponses/', api_views.repondre_appel, name='blood_reponses'),
 
    # ── Profil ────────────────────────────────────────────────────────────
    path('profil/', api_views.update_profil, name='blood_profil'),
 
    # ── Export CSV (admin) ────────────────────────────────────────────────
    path('export-csv/', api_views.export_csv_donneurs, name='blood_export_csv'),
]