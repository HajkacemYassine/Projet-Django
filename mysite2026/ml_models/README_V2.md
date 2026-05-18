# 🤖 Système IA BloodConnect - Version 2.0

## 🎯 Vue d'Ensemble

Système d'Intelligence Artificielle avancé pour prédire la demande en sang et optimiser la gestion des stocks dans les hôpitaux.

---

## ✨ Fonctionnalités Principales

### 🔮 Prédictions
- ✅ Prédiction instantanée par groupe sanguin
- ✅ Prédiction pour tous les groupes
- 🆕 **Prédictions hebdomadaires (7 jours)**
- 🆕 **Prédictions avec recommandations**

### 📊 Analyse
- ✅ Statistiques historiques
- 🆕 **Analyse des tendances (7/30/90 jours)**
- 🆕 **Performance du modèle (MAE, R²)**
- 🆕 **Importance des caractéristiques**

### 🎯 Optimisation
- 🆕 **Optimisation automatique des stocks**
- 🆕 **Allocation par priorité**
- 🆕 **Compatibilité des groupes sanguins**

### 👥 Gestion
- 🆕 **Disponibilité des donneurs en temps réel**
- 🆕 **Taux d'éligibilité par groupe**
- 🆕 **Simulation de scénarios de pénurie**

### 🚨 Alertes
- ✅ Système d'alertes automatiques
- ✅ Création de demandes urgentes
- ✅ Notifications par email

---

## 🧠 Modèle Machine Learning

### Algorithmes

#### 1. Random Forest (Défaut)
```python
RandomForestRegressor(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
```

#### 2. Gradient Boosting (Avancé)
```python
GradientBoostingRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)
```

### Features (12 au total)

| Feature | Type | Description |
|---------|------|-------------|
| Groupe sanguin | Catégoriel | A+, A-, B+, B-, AB+, AB-, O+, O- |
| Ville | Catégoriel | Tunis, Sfax, Sousse, etc. |
| Mois | Numérique | 1-12 |
| Jour semaine | Numérique | 0-6 (Lundi-Dimanche) |
| Année | Numérique | 2024, 2025, etc. |
| Trimestre | Numérique | 1-4 |
| Semaine année | Numérique | 1-52 |
| Weekend | Binaire | 0 ou 1 |
| Début mois | Binaire | 0 ou 1 |
| Saison | Catégoriel | Hiver, Printemps, Été, Automne |
| Urgence | Binaire | 0 ou 1 |
| Moyenne historique | Numérique | Moyenne par ville/groupe |

---

## 📡 API Endpoints

### Entraînement

```http
POST /ml-api/train/
```
Entraîne le modèle standard (Random Forest)

```http
POST /ml-api/train-advanced/
Content-Type: application/json

{
  "use_gradient_boosting": true
}
```
Entraîne le modèle avancé (Gradient Boosting)

### Prédictions

```http
POST /ml-api/predict/
Content-Type: application/json

{
  "groupe_sanguin": "O+",
  "ville": "Tunis",
  "date": "2024-01-15"
}
```

```http
POST /ml-api/predict-all/
Content-Type: application/json

{
  "ville": "Sfax"
}
```

```http
POST /ml-api/predict-week/
Content-Type: application/json

{
  "ville": "Sousse"
}
```

```http
POST /ml-api/predict-recommendations/
Content-Type: application/json

{
  "ville": "Tunis"
}
```

### Analyse

```http
GET /ml-api/statistics/?groupe_sanguin=O+&days=30
```

```http
GET /ml-api/demand-trends/?ville=Tunis&groupe_sanguin=A+
```

```http
GET /ml-api/model-performance/
```

### Optimisation

```http
POST /ml-api/optimize-stock/
Content-Type: application/json

{
  "ville": "Bizerte"
}
```

```http
GET /ml-api/donor-availability/?ville=Nabeul
```

```http
POST /ml-api/simulate-shortage/
Content-Type: application/json

{
  "ville": "Gabes",
  "groupe_sanguin": "O-"
}
```

### Alertes

```http
POST /ml-api/predict-with-alerts/
Content-Type: application/json

{
  "ville": "Kairouan",
  "auto_create_demand": true
}
```

```http
GET /ml-api/alert-history/
```

### Visualisations

```http
GET /ml-api/visualizations/?days=30
```

```http
GET /ml-api/prediction-chart/?ville=Tunis
```

---

## 🚀 Installation

### Prérequis

```bash
Python 3.8+
Django 4.0+
PostgreSQL (recommandé)
```

### Dépendances Python

```bash
pip install scikit-learn==1.3.0
pip install pandas==2.0.0
pip install numpy==1.24.0
pip install joblib==1.3.0
pip install matplotlib==3.7.0
pip install seaborn==0.12.0
```

### Configuration Django

```python
# settings.py

INSTALLED_APPS = [
    ...
    'ml_models',
    'miniprojet',
]

# Logging
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'ml_predictions.log',
        },
    },
    'loggers': {
        'ml_models': {
            'handlers': ['file'],
            'level': 'INFO',
        },
    },
}
```

### URLs

```python
# urls.py

urlpatterns = [
    ...
    path('ml-api/', include('ml_models.urls')),
]
```

---

## 📊 Métriques de Performance

### MAE (Mean Absolute Error)
- **Définition** : Erreur moyenne en unités
- **Formule** : `MAE = (1/n) * Σ|y_pred - y_true|`
- **Interprétation** : Plus c'est bas, mieux c'est
- **Objectif** : < 2.0

### R² Score
- **Définition** : Coefficient de détermination
- **Formule** : `R² = 1 - (SS_res / SS_tot)`
- **Interprétation** : 0 = mauvais, 1 = parfait
- **Objectif** : > 0.75

### Validation Croisée
- **Méthode** : 5-fold cross-validation
- **Objectif** : Écart-type faible (< 0.5)

---

## 💻 Utilisation Frontend

### Import du composant

```javascript
import { AIPredictionDashboard } from './AIPrediction';
import { AdvancedAIFeatures } from './AdvancedAIFeatures';
```

### Utilisation basique

```jsx
<AIPredictionDashboard 
  getHeaders={getHeaders} 
  onToast={onToast} 
/>
```

### Utilisation avancée

```jsx
<AdvancedAIFeatures 
  getHeaders={getHeaders} 
  onToast={onToast} 
/>
```

---

## 🎯 Cas d'Usage

### 1. Prédiction Quotidienne

```python
from ml_models.blood_demand_predictor import BloodDemandPredictor

predictor = BloodDemandPredictor()
predictions = predictor.predict_all_groups('Tunis')

for groupe, quantite in predictions.items():
    print(f"{groupe}: {quantite} unités")
```

### 2. Optimisation des Stocks

```python
allocation = predictor.optimize_stock_allocation('Sfax')

for groupe, data in allocation.items():
    print(f"{groupe}: {data['quantite_predite']} unités")
    print(f"Priorité: {data['priorite']}")
    print(f"Pourcentage: {data['pourcentage']}%")
```

### 3. Analyse des Tendances

```python
stats_7j = predictor.get_historical_stats(days=7)
stats_30j = predictor.get_historical_stats(days=30)
stats_90j = predictor.get_historical_stats(days=90)

print(f"Tendance court terme: {stats_7j['quantite_moyenne']}")
print(f"Tendance mensuelle: {stats_30j['quantite_moyenne']}")
print(f"Tendance trimestrielle: {stats_90j['quantite_moyenne']}")
```

### 4. Simulation de Pénurie

```python
compatibles = predictor.get_blood_type_compatibility('O-')
print(f"Groupes compatibles: {compatibles}")

# Vérifier la disponibilité
for groupe in compatibles:
    pred = predictor.predict_demand(groupe, 'Tunis')
    print(f"{groupe}: {pred} unités disponibles")
```

---

## 📈 Amélioration Continue

### Entraînement Régulier

```python
# Entraîner toutes les semaines
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    def handle(self, *args, **options):
        predictor = BloodDemandPredictor()
        success = predictor.train_model()
        
        if success:
            print(f"Modèle entraîné - MAE: {predictor.model_metrics['mae']}")
        else:
            print("Pas assez de données")
```

### Monitoring

```python
# Vérifier la performance
predictor = BloodDemandPredictor()
predictor.load_model()

print(f"MAE: {predictor.model_metrics['mae']}")
print(f"R²: {predictor.model_metrics['r2_score']}")
print(f"Échantillons: {predictor.model_metrics['n_samples']}")
```

---

## 🔒 Sécurité

- ✅ Authentification requise pour toutes les API
- ✅ Permissions par rôle (Admin, Hôpital)
- ✅ Validation des données d'entrée
- ✅ Logs des prédictions
- ✅ Sauvegarde automatique du modèle

---

## 🐛 Dépannage

### Erreur : "Modèle non entraîné"
**Solution** : Entraînez le modèle avec `/ml-api/train/`

### Erreur : "Pas assez de données"
**Solution** : Ajoutez au moins 50 demandes urgentes historiques

### Erreur : "Ville inconnue"
**Solution** : Vérifiez que la ville existe dans les données d'entraînement

### Performance faible (R² < 0.5)
**Solution** : 
1. Ajoutez plus de données
2. Vérifiez la qualité des données
3. Essayez Gradient Boosting

---

## 📚 Documentation

- [Guide Rapide](./GUIDE_RAPIDE.md)
- [Améliorations Détaillées](./AMELIORATIONS_IA.md)
- [Documentation Technique](./DOCUMENTATION.md)

---

## 🎉 Changelog

### Version 2.0 (Janvier 2024)
- 🆕 12 features au lieu de 5
- 🆕 Prédictions hebdomadaires
- 🆕 Optimisation des stocks
- 🆕 Recommandations intelligentes
- 🆕 Analyse des tendances
- 🆕 Performance du modèle
- 🆕 Disponibilité des donneurs
- 🆕 Simulation de pénurie
- 🆕 Gradient Boosting
- 🆕 Validation croisée

### Version 1.0 (Décembre 2023)
- ✅ Prédictions basiques
- ✅ Random Forest
- ✅ Alertes automatiques
- ✅ Visualisations

---

## 👥 Contributeurs

- **Équipe BloodConnect**
- **Yassine** - Développement principal

---

## 📄 Licence

MIT License - Libre d'utilisation pour sauver des vies ! 🩸❤️

---

## 🌟 Remerciements

Merci à tous les donneurs de sang qui rendent ce projet possible ! 🙏
