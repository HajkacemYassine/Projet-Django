from django.urls import path
from . import api_views
from .api_views import (
    HealthDataListCreateView,
    HealthDataDetailView,
    HealthDataLatestView,
    HealthDataStatsView,
)
 
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

    path('demandes-urgentes/toutes/', api_views.toutes_demandes,   name='blood_toutes_demandes'),
    path('mes-reponses/',             api_views.mes_reponses,       name='blood_mes_reponses'),
    path('mes-inscriptions/',         api_views.mes_inscriptions,   name='blood_mes_inscriptions'),
    path('stats/',                    api_views.stats_view,         name='blood_stats'),
    path('mes-badges/',   api_views.mes_badges,           name='blood_badges'),
    path('classement/',   api_views.classement_donneurs,  name='blood_classement'),
    path('notifications/',                              api_views.mes_notifications,          name='notifs'),
    path('notifications/<int:notif_id>/lire/',          api_views.marquer_lue,                name='notif_lire'),
    path('notifications/tout-lire/',                    api_views.tout_marquer_lu,            name='notif_tout_lire'),
    path('demandes-urgentes/<int:demande_id>/notifier/',api_views.notifier_donneurs_compatibles, name='notifier'),
    path('demandes-urgentes/<int:demande_id>/matching/',api_views.matching_donneurs,           name='matching'),
    path('mes-matches/',                                api_views.mes_matches,                name='mes_matches'),
    path('centres-carte/',                              api_views.centres_carte,              name='centres_carte'),
    path('alertes-sos/',                                api_views.alertes_sos,                name='alertes_sos'),
    path('agenda-don/',                                 api_views.agenda_don,                 name='agenda_don'),
    # Gamification avancée
    path('mes-missions/',                               api_views.mes_missions,               name='mes_missions'),
    path('mon-parrainage/',                             api_views.mon_parrainage,             name='mon_parrainage'),
    path('utiliser-code-parrain/',                      api_views.utiliser_code_parrain,      name='utiliser_code_parrain'),
    path('mes-equipes/',                                api_views.mes_equipes,                name='mes_equipes'),
    path('rejoindre-equipe/',                           api_views.rejoindre_equipe,           name='rejoindre_equipe'),
    path('classement-equipes/',                         api_views.classement_equipes,         name='classement_equipes'),
    path('mon-streak/',                                 api_views.mon_streak,                 name='mon_streak'),
    # Social & Communauté
    path('feed-communautaire/',                         api_views.feed_communautaire,         name='feed'),
    path('posts/<int:post_id>/liker/',                  api_views.liker_post,                 name='liker_post'),
    path('posts/<int:post_id>/commentaires/',           api_views.commentaires_post,          name='commentaires_post'),
    path('stories/',                                    api_views.stories,                    name='stories'),
    path('stories/<int:story_id>/voir/',                api_views.voir_story,                 name='voir_story'),
    
    # Chatbot IA
    path('chatbot/',                                    api_views.chatbot_don,                name='chatbot'),
    
    # Santé & Impact
    path('sante/',                                      api_views.donnees_sante,              name='donnees_sante'),
    path('impact/',                                     api_views.mon_impact,                 name='mon_impact'),
    
    # Récompenses
    path('recompenses/',                                api_views.liste_recompenses,          name='recompenses'),
    path('recompenses/<int:recompense_id>/echanger/',   api_views.echanger_recompense,        name='echanger_recompense'),
    path('recompenses/mes-echanges/',                   api_views.mes_echanges,               name='mes_echanges'),
    
    # Feed & Équipes
    path('feed/',                                       api_views.feed_communautaire,         name='feed_v2'),
    path('feed/<int:post_id>/like/',                   api_views.toggle_like,                name='toggle_like'),
    path('feed/<int:post_id>/commentaires/',           api_views.commentaires_post,          name='feed_commentaires'),
    path('feed/<int:post_id>/supprimer/',              api_views.supprimer_post,             name='supprimer_post'),
    path('equipes/',                                    api_views.equipes_list,               name='equipes'),
    path('equipes/mes-equipes/',                        api_views.mes_equipes,                name='equipes_mes'),
    path('equipes/rejoindre/',                          api_views.rejoindre_equipe,           name='equipes_rejoindre'),
    path('equipes/<int:equipe_id>/quitter/',            api_views.quitter_equipe,             name='quitter_equipe'),
    


    # Add these to your urlpatterns list
    path('health/',          HealthDataListCreateView.as_view()),
    path('health/latest/',   HealthDataLatestView.as_view()),
    path('health/stats/',    HealthDataStatsView.as_view()),
    path('health/<int:pk>/', HealthDataDetailView.as_view()),
]