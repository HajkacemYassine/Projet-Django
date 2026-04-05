# 🩸 Plateforme de Don de Sang avec IA

Système intelligent de gestion des dons de sang avec prédiction de demande par intelligence artificielle.

## ✨ Fonctionnalités Principales

### 🎯 Gestion de Base
- Inscription et gestion des donneurs
- Gestion des hôpitaux et centres de don
- Demandes urgentes de sang
- Campagnes de don
- Historique des dons

### 🤖 Intelligence Artificielle
- **Prédiction de demande** : Anticipe les besoins en sang par type et par ville
- **Système d'alertes** : Détection automatique de demande critique
- **Visualisations avancées** : Graphiques et analyses de données
- **Intégration AWS SageMaker** : Déploiement cloud du modèle ML

## 🚀 Installation Rapide

### 1. Cloner le projet
```bash
git clone <repository-url>
cd projetdjango/mysite2026
```

### 2. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 3. Configuration
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos configurations
```

### 4. Migrations
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 5. Générer des données de test (optionnel)
```bash
python manage.py shell < ml_models/generate_test_data.py
```

### 6. Lancer le serveur
```bash
python manage.py runserver
```

## 📡 API Endpoints

### Authentification
```http
POST /blood-api/login/
POST /blood-api/register/
```

### Prédictions ML
```http
POST /ml-api/train/                    # Entraîner le modèle
POST /ml-api/predict/                  # Prédire un groupe
POST /ml-api/predict-all/              # Prédire tous les groupes
GET  /ml-api/statistics/               # Statistiques
```

### Fonctionnalités Avancées
```http
POST /ml-api/predict-with-alerts/      # Prédiction + alertes
GET  /ml-api/visualizations/           # Graphiques
POST /ml-api/prediction-chart/         # Comparaison prédictions
GET  /ml-api/alert-history/            # Historique alertes
```

### AWS SageMaker
```http
POST /ml-api/sagemaker/deploy/         # Déployer sur AWS
GET  /ml-api/sagemaker/status/         # Statut endpoint
```

## 📊 Exemple d'Utilisation

### 1. Entraîner le modèle
```bash
curl -X POST http://localhost:8000/ml-api/train/ \
  -H "Authorization: Bearer <token>"
```

### 2. Prédire la demande
```bash
curl -X POST http://localhost:8000/ml-api/predict/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "groupe_sanguin": "O+",
    "ville": "Tunis",
    "date": "2024-12-31"
  }'
```

### 3. Obtenir des visualisations
```bash
curl -X GET "http://localhost:8000/ml-api/visualizations/?days=30" \
  -H "Authorization: Bearer <token>"
```

## 🧪 Tests

### Tester toutes les fonctionnalités
```bash
python test_ml_features.py
```

### Tests manuels
```bash
# 1. Créer un utilisateur
POST /blood-api/register/

# 2. Se connecter
POST /blood-api/login/

# 3. Entraîner le modèle
POST /ml-api/train/

# 4. Faire des prédictions
POST /ml-api/predict-all/
```

## 📈 Architecture ML

```
Données Historiques
        ↓
  Random Forest
        ↓
   Prédictions
        ↓
  Système d'Alertes
        ↓
Notifications + Actions
```

### Modèle
- **Algorithme** : Random Forest Regressor
- **Features** : Groupe sanguin, ville, mois, jour de la semaine, année
- **Target** : Quantité de sang demandée

### Seuils d'Alerte
- O+ : 8 unités
- O- : 5 unités
- A+ : 7 unités
- A- : 4 unités
- B+ : 6 unités
- B- : 3 unités
- AB+ : 5 unités
- AB- : 2 unités

## 🎨 Visualisations Disponibles

1. **Demande par groupe sanguin** : Graphique en barres
2. **Évolution temporelle** : Courbe de tendance
3. **Heatmap par ville** : Matrice de chaleur
4. **Dons vs Demandes** : Comparaison
5. **Prédictions vs Historique** : Analyse comparative

## ☁️ Déploiement AWS

### Prérequis
- Compte AWS
- Rôle IAM pour SageMaker
- Bucket S3

### Configuration
```bash
# .env
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=my-ml-models
AWS_SAGEMAKER_ROLE_ARN=arn:aws:iam::xxx:role/SageMaker
```

### Déployer
```bash
POST /ml-api/sagemaker/deploy/
{
  "bucket_name": "my-ml-models",
  "role_arn": "arn:aws:iam::xxx:role/SageMaker"
}
```

## 📚 Documentation

- [Documentation complète](ml_models/DOCUMENTATION.md)
- [Guide AWS SageMaker](https://docs.aws.amazon.com/sagemaker/)
- [API REST Framework](https://www.django-rest-framework.org/)

## 🛠️ Technologies

### Backend
- Django 6.0
- Django REST Framework
- JWT Authentication

### Machine Learning
- scikit-learn
- pandas
- numpy
- matplotlib
- seaborn

### Cloud (Optionnel)
- AWS SageMaker
- AWS S3
- AWS Bedrock (futur)

## 📦 Structure du Projet

```
mysite2026/
├── miniprojet/              # App principale
│   ├── models.py           # Modèles de données
│   ├── api_views.py        # API REST
│   └── serializers.py      # Sérialiseurs
├── ml_models/              # Module IA
│   ├── blood_demand_predictor.py
│   ├── alert_system.py
│   ├── visualizer.py
│   ├── sagemaker_integration.py
│   ├── api_views.py
│   ├── api_views_advanced.py
│   └── trained_models/
├── requirements.txt
├── test_ml_features.py
└── manage.py
```

## 🔐 Sécurité

- Authentification JWT
- Permissions par rôle (Donneur/Hôpital)
- Variables d'environnement pour secrets
- CORS configuré

## 🚨 Troubleshooting

### Erreur: "Modèle non entraîné"
```bash
POST /ml-api/train/
```

### Erreur: "Pas assez de données"
```bash
python manage.py shell < ml_models/generate_test_data.py
```

### Erreur AWS
```bash
# Vérifier les credentials
aws configure list
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 👥 Auteurs

- Yassine Hajkacem

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitLab
- Consulter la [documentation](ml_models/DOCUMENTATION.md)
- Contacter l'équipe de développement

---

**Note** : Ce projet utilise des services AWS qui peuvent engendrer des coûts. Consultez la [calculatrice de prix AWS](https://calculator.aws) pour estimer les coûts.
