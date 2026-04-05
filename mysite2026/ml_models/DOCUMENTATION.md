# Documentation Complète - Système de Prédiction IA

## 🚀 Installation

```bash
cd mysite2026
pip install -r requirements.txt
python manage.py migrate
```

## 📊 Fonctionnalités

### 1. Prédiction de Base
- Prédiction par groupe sanguin
- Prédiction pour tous les groupes
- Statistiques historiques

### 2. Système d'Alertes
- Détection automatique de demande critique
- Notifications par email
- Création automatique de demandes urgentes
- Historique des alertes

### 3. Visualisations
- Graphique de demande par groupe sanguin
- Évolution temporelle
- Heatmap par ville
- Comparaison dons vs demandes
- Comparaison prédictions vs historique

### 4. Intégration AWS SageMaker
- Déploiement du modèle sur SageMaker
- Prédictions via endpoint cloud
- Monitoring du statut

---

## 📡 API Endpoints

### Endpoints de Base

#### 1. Entraîner le Modèle
```http
POST /ml-api/train/
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "message": "Modèle entraîné avec succès",
  "status": "success"
}
```

#### 2. Prédire pour un Groupe
```http
POST /ml-api/predict/
Authorization: Bearer <token>
Content-Type: application/json

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

#### 3. Prédire Tous les Groupes
```http
POST /ml-api/predict-all/
Authorization: Bearer <token>
Content-Type: application/json

{
  "ville": "Tunis",
  "date": "2024-12-31"
}
```

#### 4. Statistiques
```http
GET /ml-api/statistics/?groupe_sanguin=O+&days=30
Authorization: Bearer <token>
```

---

### Endpoints Avancés

#### 5. Prédiction avec Alertes
```http
POST /ml-api/predict-with-alerts/
Authorization: Bearer <token>
Content-Type: application/json

{
  "ville": "Tunis",
  "auto_create_demand": true
}
```

**Réponse:**
```json
{
  "ville": "Tunis",
  "predictions": {
    "O+": 9,
    "A+": 7,
    "B+": 5
  },
  "alerts": [
    {
      "groupe_sanguin": "O+",
      "quantite_predite": 9,
      "seuil": 8,
      "niveau": "critique",
      "ville": "Tunis"
    }
  ],
  "demandes_auto_creees": true
}
```

#### 6. Visualisations
```http
GET /ml-api/visualizations/?days=30&groupe_sanguin=O+
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "charts": {
    "demand_by_blood_type": "data:image/png;base64,...",
    "demand_timeline": "data:image/png;base64,...",
    "city_heatmap": "data:image/png;base64,...",
    "donation_vs_demand": "data:image/png;base64,..."
  },
  "periode_jours": 30
}
```

#### 7. Graphique de Comparaison
```http
POST /ml-api/prediction-chart/
Authorization: Bearer <token>
Content-Type: application/json

{
  "ville": "Tunis"
}
```

#### 8. Historique des Alertes
```http
GET /ml-api/alert-history/?days=7
Authorization: Bearer <token>
```

---

### Endpoints AWS SageMaker

#### 9. Déployer sur SageMaker
```http
POST /ml-api/sagemaker/deploy/
Authorization: Bearer <token>
Content-Type: application/json

{
  "bucket_name": "my-ml-models",
  "role_arn": "arn:aws:iam::123456789:role/SageMakerRole",
  "aws_access_key": "<access_key>",
  "aws_secret_key": "<secret_key>",
  "region": "us-east-1"
}
```

**Réponse:**
```json
{
  "message": "Déploiement lancé",
  "endpoint_name": "blood-demand-predictor",
  "status": "deploying"
}
```

#### 10. Statut de l'Endpoint
```http
GET /ml-api/sagemaker/status/?region=us-east-1
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "status": "InService",
  "creation_time": "2024-01-15T10:30:00",
  "last_modified": "2024-01-15T10:45:00"
}
```

---

## 🎯 Cas d'Usage

### Scénario 1: Prédiction Quotidienne
```python
# 1. Entraîner le modèle (une fois par semaine)
POST /ml-api/train/

# 2. Prédire avec alertes (chaque jour)
POST /ml-api/predict-with-alerts/
{
  "ville": "Tunis",
  "auto_create_demand": true
}
```

### Scénario 2: Dashboard de Visualisation
```python
# Récupérer tous les graphiques
GET /ml-api/visualizations/?days=30

# Afficher les images base64 dans le frontend
<img src="{charts.demand_by_blood_type}" />
```

### Scénario 3: Déploiement Production
```python
# 1. Entraîner localement
POST /ml-api/train/

# 2. Déployer sur AWS
POST /ml-api/sagemaker/deploy/
{
  "bucket_name": "prod-ml-models",
  "role_arn": "arn:aws:iam::xxx:role/SageMaker"
}

# 3. Vérifier le statut
GET /ml-api/sagemaker/status/
```

---

## 🔧 Configuration

### Variables d'Environnement
```bash
# .env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
AWS_SAGEMAKER_ROLE_ARN=arn:aws:iam::xxx:role/SageMaker
```

### Configuration Email
```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-password'
```

---

## 📈 Seuils d'Alerte

Les seuils par défaut pour les alertes:
- O+: 8 unités
- O-: 5 unités
- A+: 7 unités
- A-: 4 unités
- B+: 6 unités
- B-: 3 unités
- AB+: 5 unités
- AB-: 2 unités

Modifiez dans `ml_models/alert_system.py`

---

## 🧪 Tests

### Générer des Données de Test
```bash
python manage.py shell < ml_models/generate_test_data.py
```

### Tester l'API
```bash
# Obtenir un token
POST /blood-api/login/
{
  "username": "admin",
  "password": "password"
}

# Utiliser le token
curl -H "Authorization: Bearer <token>" \
     http://localhost:8000/ml-api/train/
```

---

## 📊 Architecture

```
ml_models/
├── __init__.py
├── blood_demand_predictor.py  # Modèle ML
├── alert_system.py            # Système d'alertes
├── visualizer.py              # Graphiques
├── sagemaker_integration.py   # AWS SageMaker
├── api_views.py               # Endpoints de base
├── api_views_advanced.py      # Endpoints avancés
├── urls.py                    # Routes
├── generate_test_data.py      # Données de test
└── trained_models/            # Modèles sauvegardés
    └── demand_model.pkl
```

---

## 🚨 Troubleshooting

### Erreur: "Modèle non entraîné"
```bash
POST /ml-api/train/
```

### Erreur: "Pas assez de données"
```bash
python manage.py shell < ml_models/generate_test_data.py
```

### Erreur AWS: "Credentials not found"
```bash
# Configurer les variables d'environnement
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
```

---

## 💡 Améliorations Futures

- [ ] Prédiction multi-périodes (7, 14, 30 jours)
- [ ] Intégration avec Amazon Bedrock pour chatbot
- [ ] Notifications push mobile
- [ ] Dashboard temps réel avec WebSockets
- [ ] Export PDF des rapports
- [ ] API GraphQL
- [ ] Tests unitaires complets
- [ ] CI/CD avec GitLab

---

## 📞 Support

Pour toute question, consultez la documentation AWS:
- [SageMaker](https://docs.aws.amazon.com/sagemaker/)
- [Bedrock](https://docs.aws.amazon.com/bedrock/)
- [S3](https://docs.aws.amazon.com/s3/)
