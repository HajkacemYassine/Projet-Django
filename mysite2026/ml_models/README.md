# Système de Prédiction de Demande en Sang

## Installation

1. Installer les dépendances :
```bash
pip install -r requirements.txt
```

## Utilisation

### 1. Générer des données de test (optionnel)
```bash
python manage.py shell < ml_models/generate_test_data.py
```

### 2. Entraîner le modèle

**Endpoint:** `POST /ml-api/train/`

**Headers:**
```
Authorization: Bearer <votre_token_jwt>
```

**Réponse:**
```json
{
  "message": "Modèle entraîné avec succès",
  "status": "success"
}
```

### 3. Prédire la demande pour un groupe sanguin

**Endpoint:** `POST /ml-api/predict/`

**Body:**
```json
{
  "groupe_sanguin": "O+",
  "ville": "Tunis",
  "date": "2024-12-31"
}
```

**Réponse:**
```json
{
  "groupe_sanguin": "O+",
  "ville": "Tunis",
  "date": "2024-12-31",
  "prediction_quantite": 7,
  "statistiques_historiques": {
    "total_demandes": 45,
    "quantite_totale": 280,
    "quantite_moyenne": 6.2
  }
}
```

### 4. Prédire pour tous les groupes sanguins

**Endpoint:** `POST /ml-api/predict-all/`

**Body:**
```json
{
  "ville": "Tunis",
  "date": "2024-12-31"
}
```

**Réponse:**
```json
{
  "ville": "Tunis",
  "date": "2024-12-31",
  "predictions": {
    "A+": 5,
    "A-": 2,
    "B+": 4,
    "B-": 2,
    "AB+": 3,
    "AB-": 1,
    "O+": 7,
    "O-": 3
  }
}
```

### 5. Obtenir les statistiques historiques

**Endpoint:** `GET /ml-api/statistics/?groupe_sanguin=O+&days=30`

**Réponse:**
```json
{
  "groupe_sanguin": "O+",
  "periode_jours": 30,
  "statistiques": {
    "total_demandes": 15,
    "quantite_totale": 95,
    "quantite_moyenne": 6.3
  }
}
```

## Fonctionnalités

- ✅ Prédiction basée sur Random Forest
- ✅ Prise en compte du groupe sanguin, ville, mois, jour de la semaine
- ✅ Statistiques historiques
- ✅ API REST complète
- ✅ Authentification JWT

## Architecture

```
ml_models/
├── __init__.py
├── blood_demand_predictor.py  # Logique de prédiction
├── api_views.py               # Endpoints API
├── urls.py                    # Routes
├── generate_test_data.py      # Génération de données
└── trained_models/            # Modèles sauvegardés
    └── demand_model.pkl
```
