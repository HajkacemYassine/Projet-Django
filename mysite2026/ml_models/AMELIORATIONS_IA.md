# 🚀 Améliorations du Modèle IA - BloodConnect

## 📋 Vue d'ensemble

Le modèle d'Intelligence Artificielle de BloodConnect a été considérablement amélioré avec de nouvelles fonctionnalités avancées pour une meilleure prédiction et gestion des stocks de sang.

---

## 🎯 Nouvelles Fonctionnalités

### 1. **Modèle ML Amélioré**

#### Algorithmes disponibles :
- **Random Forest** (par défaut) : 200 arbres, profondeur 15
- **Gradient Boosting** (optionnel) : 200 estimateurs, taux d'apprentissage 0.1

#### Nouvelles features d'entraînement :
- ✅ **Temporelles** : mois, jour semaine, année, trimestre, semaine de l'année
- ✅ **Saisonnières** : hiver, printemps, été, automne
- ✅ **Contextuelles** : weekend, début de mois, urgence
- ✅ **Statistiques** : moyenne historique par ville et groupe sanguin

#### Métriques de performance :
- **MAE** (Mean Absolute Error) : Erreur moyenne absolue
- **R² Score** : Coefficient de détermination (précision)
- **Validation croisée** : 5-fold cross-validation
- **Importance des features** : Analyse de l'impact de chaque caractéristique

---

### 2. **Prédictions Hebdomadaires** 📅

Prédisez la demande pour les **7 prochains jours** :
- Prédictions jour par jour
- Tous les groupes sanguins
- Planification anticipée

**Endpoint** : `POST /ml-api/predict-week/`
```json
{
  "ville": "Tunis"
}
```

**Réponse** :
```json
{
  "ville": "Tunis",
  "predictions_semaine": [
    {
      "date": "2024-01-15",
      "jour": "Lundi",
      "predictions": {
        "A+": 5,
        "O+": 8,
        "B+": 3,
        ...
      }
    },
    ...
  ]
}
```

---

### 3. **Optimisation des Stocks** 📦

Allocation intelligente basée sur les prédictions :
- Pourcentage optimal par groupe sanguin
- Niveau de priorité (Haute/Moyenne/Basse)
- Groupes sanguins compatibles
- Recommandations d'allocation

**Endpoint** : `POST /ml-api/optimize-stock/`
```json
{
  "ville": "Sfax"
}
```

**Réponse** :
```json
{
  "allocation_optimale": {
    "O+": {
      "quantite_predite": 8,
      "pourcentage": 25.5,
      "priorite": "Haute",
      "groupes_compatibles": ["O+", "A+", "B+", "AB+"]
    },
    ...
  }
}
```

---

### 4. **Disponibilité des Donneurs** 👥

Analyse en temps réel de la disponibilité :
- Nombre de donneurs actifs
- Donneurs éligibles par groupe sanguin
- Taux de disponibilité en pourcentage
- Filtrage par ville

**Endpoint** : `GET /ml-api/donor-availability/?ville=Tunis`

**Réponse** :
```json
{
  "ville": "Tunis",
  "total_donneurs_actifs": 150,
  "disponibilite_par_groupe": [
    {
      "groupe_sanguin": "O+",
      "total": 45,
      "eligibles": 32,
      "taux_disponibilite": 71.11
    },
    ...
  ]
}
```

---

### 5. **Recommandations Intelligentes** 💡

Suggestions automatiques basées sur l'IA :
- Actions prioritaires à entreprendre
- Niveau de criticité
- Messages personnalisés
- Prédictions détaillées

**Endpoint** : `POST /ml-api/predict-recommendations/`
```json
{
  "ville": "Sousse"
}
```

**Réponse** :
```json
{
  "recommendations": [
    {
      "groupe": "O+",
      "action": "Lancer une campagne urgente",
      "priorite": "Critique",
      "quantite_predite": 10,
      "message": "Demande élevée prévue pour O+ (10 unités). Action immédiate requise."
    },
    ...
  ],
  "donneurs_disponibles": {
    "O+": 25,
    "A+": 18,
    ...
  }
}
```

---

### 6. **Analyse des Tendances** 📈

Statistiques sur plusieurs périodes :
- **7 jours** : Tendance court terme
- **30 jours** : Tendance mensuelle
- **90 jours** : Tendance trimestrielle

Métriques :
- Total des demandes
- Quantité totale
- Demandes urgentes
- Moyenne par jour

**Endpoint** : `GET /ml-api/demand-trends/?ville=Tunis&groupe_sanguin=O+`

**Réponse** :
```json
{
  "tendances": {
    "7_jours": {
      "total_demandes": 12,
      "quantite_totale": 85,
      "demandes_urgentes": 5,
      "moyenne_par_jour": 12.14
    },
    "30_jours": { ... },
    "90_jours": { ... }
  }
}
```

---

### 7. **Performance du Modèle** 🎯

Métriques détaillées de performance :
- Erreur moyenne absolue (MAE)
- Score de précision (R²)
- Validation croisée
- Importance des caractéristiques

**Endpoint** : `GET /ml-api/model-performance/`

**Réponse** :
```json
{
  "metrics": {
    "mae": 1.23,
    "r2_score": 0.87,
    "cv_mae_mean": 1.45,
    "cv_mae_std": 0.32,
    "n_samples": 450,
    "model_type": "RandomForest"
  },
  "feature_importance": {
    "Groupe sanguin": 0.35,
    "Ville": 0.22,
    "Mois": 0.15,
    "Moyenne historique": 0.12,
    ...
  }
}
```

---

### 8. **Simulation de Pénurie** ⚠️

Scénarios de crise et solutions alternatives :
- Groupes sanguins compatibles
- Solutions de substitution
- Niveau de risque
- Donneurs disponibles

**Endpoint** : `POST /ml-api/simulate-shortage/`
```json
{
  "ville": "Tunis",
  "groupe_sanguin": "O-"
}
```

**Réponse** :
```json
{
  "scenario": {
    "ville": "Tunis",
    "groupe_critique": "O-",
    "demande_predite": 8,
    "donneurs_disponibles": 5
  },
  "solutions_alternatives": [
    {
      "groupe_alternatif": "O+",
      "disponibilite_estimee": 3,
      "compatibilite": "Totale",
      "recommandation": "Utiliser O+ comme alternative"
    }
  ],
  "niveau_risque": "Élevé"
}
```

---

## 🔧 Utilisation

### Installation des dépendances

```bash
pip install scikit-learn pandas numpy joblib
```

### Entraînement du modèle

```python
# Modèle standard (Random Forest)
POST /ml-api/train/

# Modèle avancé (Gradient Boosting)
POST /ml-api/train-advanced/
{
  "use_gradient_boosting": true
}
```

### Intégration Frontend

```javascript
import { AdvancedAIFeatures } from './AdvancedAIFeatures';

// Dans votre composant
<AdvancedAIFeatures 
  getHeaders={getHeaders} 
  onToast={onToast} 
/>
```

---

## 📊 Comparaison Avant/Après

| Fonctionnalité | Avant | Après |
|----------------|-------|-------|
| **Features** | 5 | 12 |
| **Algorithmes** | 1 (RF) | 2 (RF + GB) |
| **Métriques** | Aucune | MAE, R², CV |
| **Prédictions** | Instantanées | + Hebdomadaires |
| **Optimisation** | Manuelle | Automatique |
| **Recommandations** | Aucune | Intelligentes |
| **Analyse** | Basique | Tendances multi-périodes |
| **Compatibilité** | Non gérée | Groupes compatibles |

---

## 🎓 Données d'Entraînement

Le modèle apprend à partir de :

1. **Demandes urgentes historiques** :
   - Groupe sanguin
   - Quantité demandée
   - Date de la demande
   - Ville de l'hôpital
   - Statut d'urgence

2. **Features calculées** :
   - Informations temporelles (mois, jour, saison)
   - Statistiques historiques
   - Patterns saisonniers
   - Contexte (weekend, début de mois)

3. **Données de donneurs** :
   - Disponibilité par groupe
   - Éligibilité
   - Localisation

---

## 🚀 Prochaines Améliorations Possibles

1. **Deep Learning** : Réseaux de neurones LSTM pour séries temporelles
2. **Clustering** : Regroupement des hôpitaux par profil de demande
3. **Prédiction météo** : Intégration des données météorologiques
4. **Événements** : Prise en compte des événements locaux (festivals, accidents)
5. **Notifications push** : Alertes en temps réel aux donneurs
6. **Optimisation multi-objectifs** : Minimiser les coûts + maximiser la disponibilité
7. **Apprentissage en ligne** : Mise à jour continue du modèle
8. **Explainability** : SHAP values pour expliquer les prédictions

---

## 📞 Support

Pour toute question ou suggestion d'amélioration, contactez l'équipe de développement.

**Version** : 2.0  
**Date** : Janvier 2024  
**Auteur** : BloodConnect Team
