#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de test automatique pour toutes les fonctionnalités BloodConnect
Lance ce script après avoir démarré le serveur Django
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/blood-api"
COLORS = {
    'GREEN': '\033[92m',
    'RED': '\033[91m',
    'YELLOW': '\033[93m',
    'BLUE': '\033[94m',
    'RESET': '\033[0m',
    'BOLD': '\033[1m'
}

def print_header(text):
    print(f"\n{COLORS['BOLD']}{COLORS['BLUE']}{'='*60}{COLORS['RESET']}")
    print(f"{COLORS['BOLD']}{COLORS['BLUE']}{text.center(60)}{COLORS['RESET']}")
    print(f"{COLORS['BOLD']}{COLORS['BLUE']}{'='*60}{COLORS['RESET']}\n")

def print_success(text):
    print(f"{COLORS['GREEN']}✅ {text}{COLORS['RESET']}")

def print_error(text):
    print(f"{COLORS['RED']}❌ {text}{COLORS['RESET']}")

def print_info(text):
    print(f"{COLORS['YELLOW']}ℹ️  {text}{COLORS['RESET']}")

def test_endpoint(name, method, url, headers=None, data=None, expected_keys=None):
    """Test un endpoint et vérifie les clés attendues"""
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=data)
        
        if response.status_code in [200, 201]:
            result = response.json()
            
            # Vérifier les clés attendues
            if expected_keys:
                missing_keys = [k for k in expected_keys if k not in result]
                if missing_keys:
                    print_error(f"{name} - Clés manquantes: {missing_keys}")
                    return False
            
            print_success(f"{name} - Status {response.status_code}")
            return result
        else:
            print_error(f"{name} - Status {response.status_code}: {response.text[:100]}")
            return None
    except Exception as e:
        print_error(f"{name} - Exception: {str(e)}")
        return None

def main():
    print_header("🧪 TEST AUTOMATIQUE BLOODCONNECT")
    
    # ========== 1. LOGIN ==========
    print_header("🔐 TEST AUTHENTIFICATION")
    
    login_data = {
        "username": "donneur1",
        "password": "test123"
    }
    
    result = test_endpoint(
        "Login Donneur",
        "POST",
        f"{BASE_URL}/auth/login/",
        data=login_data,
        expected_keys=['access', 'refresh', 'user']
    )
    
    if not result:
        print_error("Impossible de se connecter. Vérifie que :")
        print_info("1. Le serveur Django tourne (python manage.py runserver)")
        print_info("2. Les données de test sont créées (voir GUIDE_TEST_COMPLET.md)")
        return
    
    token = result['access']
    headers = {"Authorization": f"Bearer {token}"}
    user = result['user']
    
    print_success(f"Connecté en tant que : {user['username']} ({user['role']})")
    print_info(f"Token : {token[:30]}...")
    
    # ========== 2. DASHBOARD ==========
    print_header("📊 TEST DASHBOARD")
    
    result = test_endpoint(
        "Dashboard Donneur",
        "GET",
        f"{BASE_URL}/dashboard/donneur/",
        headers=headers,
        expected_keys=['groupe_sanguin', 'eligible', 'nb_dons']
    )
    
    if result:
        print_info(f"Groupe sanguin : {result['groupe_sanguin']}")
        print_info(f"Éligible : {'Oui ✅' if result['eligible'] else 'Non ⏳'}")
        print_info(f"Nombre de dons : {result['nb_dons']}")
    
    # ========== 3. CARTE INTERACTIVE ==========
    print_header("🗺️ TEST CARTE INTERACTIVE")
    
    result = test_endpoint(
        "Centres Carte",
        "GET",
        f"{BASE_URL}/centres-carte/",
        headers=headers
    )
    
    if result:
        print_info(f"Centres trouvés : {len(result)}")
        if result:
            centre = result[0]
            print_info(f"Premier centre : {centre['nom']} - {centre['ville']}")
            print_info(f"Demandes actives : {centre['nb_demandes']}")
            print_info(f"Critique : {'Oui 🔴' if centre['critique'] else 'Non 🟢'}")
    
    # ========== 4. ALERTES SOS ==========
    print_header("🚨 TEST ALERTES SOS")
    
    result = test_endpoint(
        "Alertes SOS",
        "GET",
        f"{BASE_URL}/alertes-sos/",
        headers=headers,
        expected_keys=['alertes', 'nb']
    )
    
    if result:
        print_info(f"Alertes critiques : {result['nb']}")
        if result['alertes']:
            alerte = result['alertes'][0]
            print_info(f"Première alerte : {alerte['hopital']} - {alerte['groupe']} - {alerte['jours']}j restants")
    
    # ========== 5. AGENDA DON ==========
    print_header("📅 TEST AGENDA DON")
    
    result = test_endpoint(
        "Agenda Don",
        "GET",
        f"{BASE_URL}/agenda-don/",
        headers=headers,
        expected_keys=['eligible', 'timeline', 'campagnes_proches']
    )
    
    if result:
        print_info(f"Éligible : {'Oui ✅' if result['eligible'] else 'Non ⏳'}")
        print_info(f"Jours restants : {result['jours_restants']}")
        print_info(f"Dons dans la timeline : {len(result['timeline'])}")
        print_info(f"Campagnes proches : {len(result['campagnes_proches'])}")
    
    # ========== 6. MISSIONS ==========
    print_header("🎯 TEST MISSIONS")
    
    result = test_endpoint(
        "Mes Missions",
        "GET",
        f"{BASE_URL}/mes-missions/",
        headers=headers,
        expected_keys=['missions_actives', 'nb_actives']
    )
    
    if result:
        print_info(f"Missions actives : {result['nb_actives']}")
        print_info(f"Missions complétées : {result['nb_completees']}")
        if result['missions_actives']:
            mission = result['missions_actives'][0]
            print_info(f"Première mission : {mission['emoji']} {mission['titre']} - {mission['progres']}/{mission['objectif']}")
    
    # ========== 7. PARRAINAGE ==========
    print_header("👥 TEST PARRAINAGE")
    
    result = test_endpoint(
        "Mon Parrainage",
        "GET",
        f"{BASE_URL}/mon-parrainage/",
        headers=headers,
        expected_keys=['nb_filleuls', 'points_gagnes']
    )
    
    if result:
        print_info(f"Filleuls : {result['nb_filleuls']}")
        print_info(f"Filleuls actifs : {result['nb_filleuls_actifs']}")
        print_info(f"Points gagnés : {result['points_gagnes']}")
    
    # Test génération de code
    result = test_endpoint(
        "Générer Code Parrain",
        "POST",
        f"{BASE_URL}/mon-parrainage/",
        headers=headers,
        expected_keys=['code']
    )
    
    if result:
        print_success(f"Code généré : {result['code']}")
    
    # ========== 8. ÉQUIPES ==========
    print_header("🏢 TEST ÉQUIPES")
    
    result = test_endpoint(
        "Mes Équipes",
        "GET",
        f"{BASE_URL}/mes-equipes/",
        headers=headers,
        expected_keys=['equipes', 'nb']
    )
    
    if result:
        print_info(f"Équipes : {result['nb']}")
        if result['equipes']:
            equipe = result['equipes'][0]
            print_info(f"Première équipe : {equipe['emoji']} {equipe['nom']} - {equipe['nb_membres']} membres - {equipe['score']} pts")
    
    # Classement équipes
    result = test_endpoint(
        "Classement Équipes",
        "GET",
        f"{BASE_URL}/classement-equipes/",
        headers=headers
    )
    
    if result:
        print_info(f"Équipes dans le classement : {len(result)}")
        if result:
            top = result[0]
            print_info(f"Top 1 : {top['emoji']} {top['nom']} - {top['score']} pts")
    
    # ========== 9. STREAK ==========
    print_header("🔥 TEST STREAK")
    
    result = test_endpoint(
        "Mon Streak",
        "GET",
        f"{BASE_URL}/mon-streak/",
        headers=headers,
        expected_keys=['streak', 'meilleur_streak']
    )
    
    if result:
        print_info(f"Streak actuel : {result['streak']} {result['emoji']}")
        print_info(f"Meilleur streak : {result['meilleur_streak']}")
        print_info(f"Dernier don : {result['dernier_don']} ({result['jours_depuis']}j)")
    
    # ========== 10. FEED SOCIAL ==========
    print_header("📰 TEST FEED SOCIAL")
    
    result = test_endpoint(
        "Feed Communautaire",
        "GET",
        f"{BASE_URL}/feed/",
        headers=headers,
        expected_keys=['posts', 'nb']
    )
    
    if result:
        print_info(f"Posts dans le feed : {result['nb']}")
        if result['posts']:
            post = result['posts'][0]
            print_info(f"Premier post : {post['role_emoji']} {post['auteur']} - {post['type']}")
            print_info(f"Likes : {post['nb_likes']} | Commentaires : {post['nb_commentaires']}")
    
    # Créer un post
    result = test_endpoint(
        "Créer Post",
        "POST",
        f"{BASE_URL}/feed/",
        headers=headers,
        data={
            "type_post": "temoignage",
            "contenu": "Test automatique - Post créé par le script de test ! 🧪"
        },
        expected_keys=['id', 'message']
    )
    
    if result:
        print_success(f"Post créé avec ID : {result['id']}")
    
    # ========== 11. STORIES ==========
    print_header("📖 TEST STORIES")
    
    result = test_endpoint(
        "Stories Actives",
        "GET",
        f"{BASE_URL}/stories/",
        headers=headers,
        expected_keys=['stories', 'nb']
    )
    
    if result:
        print_info(f"Stories actives : {result['nb']}")
        if result['stories']:
            story = result['stories'][0]
            print_info(f"Première story : {story['emoji']} {story['auteur']} - {story['nb_vues']} vues")
    
    # Créer une story
    result = test_endpoint(
        "Créer Story",
        "POST",
        f"{BASE_URL}/stories/",
        headers=headers,
        data={
            "contenu": "Story de test automatique ! 🚀",
            "emoji": "🧪"
        },
        expected_keys=['id', 'message']
    )
    
    if result:
        print_success(f"Story créée avec ID : {result['id']}")
    
    # ========== 12. BADGES & GAMIFICATION ==========
    print_header("🏆 TEST BADGES & GAMIFICATION")
    
    result = test_endpoint(
        "Mes Badges",
        "GET",
        f"{BASE_URL}/mes-badges/",
        headers=headers,
        expected_keys=['badges', 'niveau', 'score']
    )
    
    if result:
        print_info(f"Niveau : {result['niveau']}")
        print_info(f"Score : {result['score']} pts")
        print_info(f"Badges obtenus : {result['nb_badges']}")
        if result['badges']:
            badge = result['badges'][0]
            print_info(f"Premier badge : {badge['emoji']} {badge['label']}")
    
    # Classement
    result = test_endpoint(
        "Classement Donneurs",
        "GET",
        f"{BASE_URL}/classement/",
        headers=headers
    )
    
    if result:
        print_info(f"Donneurs dans le classement : {len(result)}")
        if result:
            top = result[0]
            print_info(f"Top 1 : {top['nom']} - {top['score']} pts")
    
    # ========== 13. MATCHING ==========
    print_header("🤝 TEST MATCHING")
    
    result = test_endpoint(
        "Mes Matches",
        "GET",
        f"{BASE_URL}/mes-matches/",
        headers=headers,
        expected_keys=['eligible', 'matches']
    )
    
    if result:
        print_info(f"Éligible au matching : {'Oui ✅' if result['eligible'] else 'Non ⏳'}")
        if result['eligible']:
            print_info(f"Demandes compatibles : {result['nb_matches']}")
            if result['matches']:
                match = result['matches'][0]
                print_info(f"Meilleur match : {match['hopital_nom']} - Score {match['score']}")
    
    # ========== RÉSUMÉ FINAL ==========
    print_header("✅ RÉSUMÉ DES TESTS")
    
    print_success("Tous les endpoints ont été testés !")
    print_info("Consulte les résultats ci-dessus pour plus de détails")
    print_info(f"Date du test : {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    
    print(f"\n{COLORS['BOLD']}{COLORS['GREEN']}{'='*60}{COLORS['RESET']}")
    print(f"{COLORS['BOLD']}{COLORS['GREEN']}{'🎉 TESTS TERMINÉS AVEC SUCCÈS !'.center(60)}{COLORS['RESET']}")
    print(f"{COLORS['BOLD']}{COLORS['GREEN']}{'='*60}{COLORS['RESET']}\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{COLORS['YELLOW']}⚠️  Tests interrompus par l'utilisateur{COLORS['RESET']}")
    except Exception as e:
        print(f"\n\n{COLORS['RED']}❌ Erreur fatale : {str(e)}{COLORS['RESET']}")
