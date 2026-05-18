# 🧪 Guide de Test - Système IA Amélioré

## 📋 Checklist de Test

### ✅ Tests à Effectuer

- [ ] 1. Entraînement du modèle
- [ ] 2. Prédictions basiques
- [ ] 3. Prédictions hebdomadaires
- [ ] 4. Optimisation des stocks
- [ ] 5. Disponibilité des donneurs
- [ ] 6. Recommandations
- [ ] 7. Tendances
- [ ] 8. Performance du modèle
- [ ] 9. Interface React
- [ ] 10. Gestion des erreurs

---

## 🚀 Tests Backend (API)

### Test 1 : Entraînement du Modèle

```bash
# Test basique
curl -X POST http://localhost:8000/ml-api/train/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Résultat attendu :
{
  "message": "Modèle entraîné avec succès",
  "status": "success"
}

# Test avancé (Gradient Boosting)
curl -X POST http://localhost:8000/ml-api/train-advanced/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"use_gradient_boosting": true}'

# Résultat attendu :
{
  "message": "Modèle entraîné avec succès",
  "metrics": {
    "mae": 1.23,
    "r2_score": 0.87,
    "n_samples": 450,
    "model_type": "GradientBoosting"
  },
  "status": "success"
}
```

**✅ Critères de succès** :
- Status 200
- Message de succès
- Métriques présentes (pour train-advanced)
- MAE < 2.0
- R² > 0.75

---

### Test 2 : Prédictions Hebdomadaires

```bash
curl -X POST http://localhost:8000/ml-api/predict-week/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ville": "Tunis"}'

# Résultat attendu :
{
  "ville": "Tunis",
  "predictions_semaine": [
    {
      "date": "2024-01-15",
      "jour": "Lundi",
      "predictions": {
        "A+": 5,
        "A-": 3,
        "B+": 4,
        "B-": 2,
        "AB+": 3,
        "AB-": 1,
        "O+": 8,
        "O-": 4
      }
    },
    // ... 6 autres jours
  ],
  "total_jours": 7
}
```

**✅ Critères de succès** :
- 7 jours de prédictions
- Tous les groupes sanguins présents
- Valeurs numériques positives
- Dates séquentielles

---

### Test 3 : Optimisation des Stocks

```bash
curl -X POST http://localhost:8000/ml-api/optimize-stock/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ville": "Sfax"}'

# Résultat attendu :
{
  "ville": "Sfax",
  "allocation_optimale": {
    "O+": {
      "quantite_predite": 8,
      "pourcentage": 25.5,
      "priorite": "Haute",
      "groupes_compatibles": ["O+", "A+", "B+", "AB+"]
    },
    // ... autres groupes
  },
  "date_calcul": "2024-01-15 14:30"
}
```

**✅ Critères de succès** :
- Tous les groupes présents
- Pourcentages totalisent ~100%
- Priorités cohérentes (Haute si quantité >= 8)
- Groupes compatibles corrects

---

### Test 4 : Disponibilité des Donneurs

```bash
curl -X GET "http://localhost:8000/ml-api/donor-availability/?ville=Tunis" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Résultat attendu :
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
    // ... autres groupes
  ]
}
```

**✅ Critères de succès** :
- Total cohérent
- Taux entre 0 et 100
- Éligibles <= Total
- Tous les groupes présents

---

### Test 5 : Recommandations

```bash
curl -X POST http://localhost:8000/ml-api/predict-recommendations/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ville": "Sousse"}'

# Résultat attendu :
{
  "ville": "Sousse",
  "predictions": {
    "O+": 10,
    "A+": 6,
    // ...
  },
  "recommendations": [
    {
      "groupe": "O+",
      "action": "Lancer une campagne urgente",
      "priorite": "Critique",
      "quantite_predite": 10,
      "message": "Demande élevée prévue pour O+ (10 unités). Action immédiate requise."
    }
  ],
  "donneurs_disponibles": {
    "O+": 25,
    "A+": 18
  }
}
```

**✅ Critères de succès** :
- Recommandations pertinentes
- Priorités cohérentes
- Messages clairs
- Disponibilité des donneurs

---

### Test 6 : Tendances

```bash
curl -X GET "http://localhost:8000/ml-api/demand-trends/?ville=Tunis&groupe_sanguin=O+" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Résultat attendu :
{
  "groupe_sanguin": "O+",
  "ville": "Tunis",
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

**✅ Critères de succès** :
- 3 périodes présentes
- Valeurs cohérentes (90j > 30j > 7j)
- Moyennes calculées correctement

---

### Test 7 : Performance du Modèle

```bash
curl -X GET http://localhost:8000/ml-api/model-performance/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Résultat attendu :
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
    // ...
  },
  "model_loaded": true
}
```

**✅ Critères de succès** :
- MAE < 2.0
- R² > 0.75
- Feature importance totale ≈ 1.0
- Model loaded = true

---

### Test 8 : Simulation de Pénurie

```bash
curl -X POST http://localhost:8000/ml-api/simulate-shortage/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ville": "Gabes", "groupe_sanguin": "O-"}'

# Résultat attendu :
{
  "scenario": {
    "ville": "Gabes",
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
  "groupes_compatibles": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "niveau_risque": "Élevé"
}
```

**✅ Critères de succès** :
- Groupes compatibles corrects
- Niveau de risque cohérent
- Solutions alternatives pertinentes

---

## 🎨 Tests Frontend (React)

### Test 9 : Interface React

#### Test 9.1 : Chargement du Composant

```javascript
// Dans votre console navigateur
console.log('Test chargement composant');

// Vérifier que le composant se charge
// Vérifier que les 6 onglets sont présents
// Vérifier que la sélection de ville fonctionne
```

**✅ Critères de succès** :
- Composant s'affiche sans erreur
- 6 onglets visibles
- Dropdown ville fonctionnel
- Pas d'erreurs console

#### Test 9.2 : Prédictions Hebdomadaires

```javascript
// Cliquer sur "📅 Prédictions 7 jours"
// Vérifier l'affichage
```

**✅ Critères de succès** :
- 7 cartes de jours affichées
- Tous les groupes visibles
- Design responsive
- Animation fluide

#### Test 9.3 : Optimisation Stock

```javascript
// Cliquer sur "📦 Optimisation Stock"
// Vérifier l'affichage
```

**✅ Critères de succès** :
- Cartes par groupe sanguin
- Badges de priorité colorés
- Pourcentages affichés
- Groupes compatibles listés

#### Test 9.4 : Disponibilité Donneurs

```javascript
// Cliquer sur "👥 Disponibilité Donneurs"
// Vérifier l'affichage
```

**✅ Critères de succès** :
- Total des donneurs affiché
- Cartes par groupe
- Taux de disponibilité en %
- Couleurs cohérentes

#### Test 9.5 : Recommandations

```javascript
// Cliquer sur "💡 Recommandations"
// Vérifier l'affichage
```

**✅ Critères de succès** :
- Alertes critiques en rouge
- Alertes moyennes en orange
- Messages clairs
- Prédictions détaillées en bas

#### Test 9.6 : Tendances

```javascript
// Cliquer sur "📈 Tendances"
// Vérifier l'affichage
```

**✅ Critères de succès** :
- 3 cartes de périodes
- Statistiques complètes
- Design cohérent

#### Test 9.7 : Performance Modèle

```javascript
// Cliquer sur "🎯 Performance Modèle"
// Vérifier l'affichage
```

**✅ Critères de succès** :
- Métriques affichées
- Barres de progression
- Importance des features
- Couleurs gradient

---

## 🐛 Tests de Gestion d'Erreurs

### Test 10.1 : Modèle Non Entraîné

```bash
# Supprimer le modèle
rm ml_models/trained_models/demand_model.pkl

# Essayer une prédiction
curl -X POST http://localhost:8000/ml-api/predict-week/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ville": "Tunis"}'

# Résultat attendu :
{
  "error": "Impossible de faire les prédictions. Entraînez d'abord le modèle.",
  "action_required": "train_model"
}
```

**✅ Critères de succès** :
- Status 400
- Message d'erreur clair
- Action requise indiquée

### Test 10.2 : Ville Inconnue

```bash
curl -X POST http://localhost:8000/ml-api/predict-week/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ville": "VilleInconnue"}'

# Résultat attendu :
{
  "error": "Impossible de faire les prédictions. Entraînez d'abord le modèle.",
  "action_required": "train_model"
}
```

**✅ Critères de succès** :
- Erreur gérée gracieusement
- Pas de crash serveur

### Test 10.3 : Pas de Données

```bash
# Vider la table DemandeUrgente
# Essayer d'entraîner

curl -X POST http://localhost:8000/ml-api/train/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Résultat attendu :
{
  "message": "Pas assez de données pour entraîner le modèle",
  "status": "error"
}
```

**✅ Critères de succès** :
- Status 400
- Message explicite
- Pas de crash

---

## 📊 Tests de Performance

### Test 11 : Temps de Réponse

```bash
# Mesurer le temps de réponse
time curl -X POST http://localhost:8000/ml-api/predict-week/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ville": "Tunis"}'
```

**✅ Critères de succès** :
- Entraînement : < 10 secondes
- Prédiction simple : < 1 seconde
- Prédiction hebdomadaire : < 3 secondes
- Optimisation : < 2 secondes

### Test 12 : Charge

```bash
# Tester avec 10 requêtes simultanées
for i in {1..10}; do
  curl -X POST http://localhost:8000/ml-api/predict-week/ \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"ville": "Tunis"}' &
done
wait
```

**✅ Critères de succès** :
- Toutes les requêtes réussissent
- Pas de timeout
- Temps de réponse stable

---

## 📝 Rapport de Test

### Template de Rapport

```markdown
# Rapport de Test - Système IA v2.0

**Date** : [DATE]
**Testeur** : [NOM]
**Environnement** : [DEV/STAGING/PROD]

## Résultats

### Backend (API)
- [ ] Test 1 : Entraînement ✅/❌
- [ ] Test 2 : Prédictions hebdo ✅/❌
- [ ] Test 3 : Optimisation ✅/❌
- [ ] Test 4 : Disponibilité ✅/❌
- [ ] Test 5 : Recommandations ✅/❌
- [ ] Test 6 : Tendances ✅/❌
- [ ] Test 7 : Performance ✅/❌
- [ ] Test 8 : Simulation ✅/❌

### Frontend (React)
- [ ] Test 9.1 : Chargement ✅/❌
- [ ] Test 9.2 : Prédictions hebdo ✅/❌
- [ ] Test 9.3 : Optimisation ✅/❌
- [ ] Test 9.4 : Disponibilité ✅/❌
- [ ] Test 9.5 : Recommandations ✅/❌
- [ ] Test 9.6 : Tendances ✅/❌
- [ ] Test 9.7 : Performance ✅/❌

### Gestion d'Erreurs
- [ ] Test 10.1 : Modèle non entraîné ✅/❌
- [ ] Test 10.2 : Ville inconnue ✅/❌
- [ ] Test 10.3 : Pas de données ✅/❌

### Performance
- [ ] Test 11 : Temps de réponse ✅/❌
- [ ] Test 12 : Charge ✅/❌

## Bugs Trouvés
1. [Description du bug]
2. [Description du bug]

## Recommandations
1. [Recommandation]
2. [Recommandation]

## Conclusion
[Résumé global]
```

---

## 🎯 Critères de Validation Globale

### ✅ Le système est prêt si :

1. **Entraînement** : Modèle s'entraîne sans erreur
2. **Métriques** : MAE < 2.0 et R² > 0.75
3. **Prédictions** : Toutes les API fonctionnent
4. **Interface** : Tous les onglets s'affichent
5. **Erreurs** : Gestion gracieuse des erreurs
6. **Performance** : Temps de réponse < 3s
7. **Documentation** : Guides disponibles
8. **Tests** : 90% des tests passent

### ❌ Le système n'est PAS prêt si :

1. Erreurs 500 fréquentes
2. Prédictions incohérentes
3. Interface cassée
4. Performance < 5s
5. Pas de gestion d'erreurs
6. Documentation manquante

---

## 🚀 Prochaines Étapes Après Tests

1. ✅ Corriger les bugs trouvés
2. ✅ Optimiser les performances
3. ✅ Compléter la documentation
4. ✅ Déployer en staging
5. ✅ Tests utilisateurs
6. ✅ Déploiement production

---

**Bon courage pour les tests ! 🧪🚀**
