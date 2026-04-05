"""
Script de test pour toutes les fonctionnalités ML
Usage: python test_ml_features.py
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
TOKEN = None


def login():
    """Connexion et récupération du token"""
    global TOKEN
    response = requests.post(f"{BASE_URL}/blood-api/login/", json={
        "username": "admin",
        "password": "admin123"
    })
    if response.status_code == 200:
        TOKEN = response.json()['access']
        print("✓ Connexion réussie")
        return True
    print("✗ Erreur de connexion")
    return False


def get_headers():
    """Retourne les headers avec le token"""
    return {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }


def test_train_model():
    """Test: Entraînement du modèle"""
    print("\n--- Test: Entraînement du modèle ---")
    response = requests.post(
        f"{BASE_URL}/ml-api/train/",
        headers=get_headers()
    )
    print(f"Status: {response.status_code}")
    print(f"Réponse: {response.json()}")


def test_predict_single():
    """Test: Prédiction pour un groupe sanguin"""
    print("\n--- Test: Prédiction groupe unique ---")
    response = requests.post(
        f"{BASE_URL}/ml-api/predict/",
        headers=get_headers(),
        json={
            "groupe_sanguin": "O+",
            "ville": "Tunis",
            "date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Réponse: {json.dumps(response.json(), indent=2)}")


def test_predict_all():
    """Test: Prédiction tous les groupes"""
    print("\n--- Test: Prédiction tous les groupes ---")
    response = requests.post(
        f"{BASE_URL}/ml-api/predict-all/",
        headers=get_headers(),
        json={
            "ville": "Tunis"
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Réponse: {json.dumps(response.json(), indent=2)}")


def test_statistics():
    """Test: Statistiques"""
    print("\n--- Test: Statistiques ---")
    response = requests.get(
        f"{BASE_URL}/ml-api/statistics/?groupe_sanguin=O+&days=30",
        headers=get_headers()
    )
    print(f"Status: {response.status_code}")
    print(f"Réponse: {json.dumps(response.json(), indent=2)}")


def test_predict_with_alerts():
    """Test: Prédiction avec alertes"""
    print("\n--- Test: Prédiction avec alertes ---")
    response = requests.post(
        f"{BASE_URL}/ml-api/predict-with-alerts/",
        headers=get_headers(),
        json={
            "ville": "Tunis",
            "auto_create_demand": True
        }
    )
    print(f"Status: {response.status_code}")
    print(f"Réponse: {json.dumps(response.json(), indent=2)}")


def test_visualizations():
    """Test: Visualisations"""
    print("\n--- Test: Visualisations ---")
    response = requests.get(
        f"{BASE_URL}/ml-api/visualizations/?days=30",
        headers=get_headers()
    )
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Graphiques générés: {list(data['charts'].keys())}")
    for chart_name, chart_data in data['charts'].items():
        if chart_data:
            print(f"  ✓ {chart_name}: {len(chart_data)} caractères")
        else:
            print(f"  ✗ {chart_name}: Pas de données")


def test_prediction_chart():
    """Test: Graphique de comparaison"""
    print("\n--- Test: Graphique de comparaison ---")
    response = requests.post(
        f"{BASE_URL}/ml-api/prediction-chart/",
        headers=get_headers(),
        json={
            "ville": "Tunis"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Graphique généré: {len(data['chart'])} caractères")
        print(f"Prédictions: {data['predictions']}")


def test_alert_history():
    """Test: Historique des alertes"""
    print("\n--- Test: Historique des alertes ---")
    response = requests.get(
        f"{BASE_URL}/ml-api/alert-history/?days=7",
        headers=get_headers()
    )
    print(f"Status: {response.status_code}")
    print(f"Réponse: {json.dumps(response.json(), indent=2)}")


def run_all_tests():
    """Exécute tous les tests"""
    print("=" * 60)
    print("TESTS DES FONCTIONNALITÉS ML")
    print("=" * 60)
    
    if not login():
        print("Impossible de se connecter. Arrêt des tests.")
        return
    
    # Tests de base
    test_train_model()
    test_predict_single()
    test_predict_all()
    test_statistics()
    
    # Tests avancés
    test_predict_with_alerts()
    test_visualizations()
    test_prediction_chart()
    test_alert_history()
    
    print("\n" + "=" * 60)
    print("TESTS TERMINÉS")
    print("=" * 60)


if __name__ == "__main__":
    run_all_tests()
