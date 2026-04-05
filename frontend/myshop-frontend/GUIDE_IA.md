# Guide d'Utilisation de l'IA dans React

## 🎯 Fonctionnalités Ajoutées

### Pour les Administrateurs et Hôpitaux

Un nouvel onglet **"Prédictions IA"** a été ajouté dans le menu de navigation avec :

1. **Entraînement du Modèle** 🎓
2. **Prédictions de Demande** 🔮
3. **Visualisations Graphiques** 📊
4. **Alertes Automatiques** 🚨

---

## 📱 Comment Utiliser

### 1. Accéder à l'IA

1. Connectez-vous en tant qu'**Administrateur** ou **Hôpital**
2. Cliquez sur **"Prédictions IA"** dans le menu latéral
3. Vous verrez le tableau de bord IA

### 2. Entraîner le Modèle (Première fois)

```
Cliquez sur "🎓 Entraîner le Modèle"
```

- Le bouton devient vert ✅ quand le modèle est prêt
- À faire une fois par semaine pour mettre à jour le modèle

### 3. Faire des Prédictions

```
1. Sélectionnez une ville (Tunis, Sfax, etc.)
2. Cliquez sur "🔮 Prédire la Demande"
```

**Résultat :**
- Prédictions pour tous les groupes sanguins (O+, A+, B+, etc.)
- Alertes automatiques si demande critique
- Création automatique de demandes urgentes

### 4. Voir les Graphiques

```
Cliquez sur "📊 Voir les Graphiques"
```

**Graphiques disponibles :**
- Demande par groupe sanguin
- Évolution temporelle
- Heatmap par ville
- Dons vs Demandes

---

## 🎨 Interface

### Carte de Prédiction

Chaque groupe sanguin affiche :
- **Nombre** : Quantité prédite (en unités)
- **Groupe** : O+, A+, B+, etc.
- **Animation** : Survol pour effet visuel

### Alertes Critiques

Quand une demande est critique :
- 🔴 **Badge rouge** : Niveau critique
- 🟠 **Badge orange** : Niveau élevé
- Détails : Quantité prédite vs seuil

---

## 💻 Code d'Intégration

### Utiliser le composant IA

```jsx
import { AIPredictionDashboard } from './AIPrediction';

// Dans votre composant
<AIPredictionDashboard 
  getHeaders={getHeaders} 
  onToast={onToast} 
/>
```

### Afficher les stats IA

```jsx
import { AIStatsCard } from './AIPrediction';

<AIStatsCard getHeaders={getHeaders} />
```

---

## 🔧 Personnalisation

### Modifier les villes

Dans `AIPrediction.jsx` :
```javascript
const VILLES = ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul'];
```

### Modifier les couleurs

```javascript
// Gradient principal
background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

// Alertes critiques
background: '#fadbd8'
border: '2px solid #c0392b'
```

### Ajouter des fonctionnalités

```javascript
// Prédiction pour un groupe spécifique
const predictSingle = async (groupe) => {
  const res = await fetch(`${ML_API}/predict/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      groupe_sanguin: groupe,
      ville: ville,
      date: new Date().toISOString().split('T')[0]
    })
  });
  const data = await res.json();
  return data;
};
```

---

## 📊 Exemples d'Utilisation

### Scénario 1 : Prédiction Quotidienne

```
1. Ouvrir "Prédictions IA"
2. Sélectionner "Tunis"
3. Cliquer "Prédire la Demande"
4. Consulter les alertes
5. Les demandes urgentes sont créées automatiquement
```

### Scénario 2 : Analyse Hebdomadaire

```
1. Cliquer "Entraîner le Modèle" (lundi matin)
2. Cliquer "Voir les Graphiques"
3. Analyser les tendances
4. Planifier les campagnes en conséquence
```

### Scénario 3 : Gestion des Alertes

```
1. Prédire la demande
2. Si alertes critiques apparaissent :
   - Vérifier les demandes urgentes créées
   - Contacter les donneurs compatibles
   - Organiser une campagne si nécessaire
```

---

## 🚀 Workflow Recommandé

### Pour les Hôpitaux

**Lundi matin :**
1. Entraîner le modèle
2. Prédire pour votre ville
3. Consulter les alertes

**Chaque jour :**
1. Prédire la demande
2. Vérifier les alertes
3. Agir sur les demandes critiques

**Fin de semaine :**
1. Voir les graphiques
2. Analyser les tendances
3. Planifier la semaine suivante

### Pour les Administrateurs

**Hebdomadaire :**
1. Entraîner le modèle
2. Prédire pour toutes les villes
3. Exporter les statistiques

**Mensuel :**
1. Analyser les graphiques
2. Identifier les tendances
3. Optimiser les campagnes

---

## 🎯 Indicateurs Clés

### Prédictions

- **Quantité** : Nombre d'unités prédites
- **Seuils** : 
  - O+ : 8 unités
  - A+ : 7 unités
  - B+ : 6 unités
  - AB+ : 5 unités

### Alertes

- **Critique** : Quantité > 1.5 × seuil
- **Élevé** : Quantité ≥ seuil

---

## 🐛 Dépannage

### "Modèle non entraîné"
```
Solution : Cliquer sur "Entraîner le Modèle"
```

### "Pas assez de données"
```
Solution : Générer des données de test
python manage.py shell < ml_models/generate_test_data.py
```

### Graphiques ne s'affichent pas
```
Solution : Vérifier que le backend est lancé
python manage.py runserver
```

### Erreur réseau
```
Solution : Vérifier l'URL de l'API
const ML_API = "http://localhost:8000/ml-api";
```

---

## 📱 Responsive Design

L'interface s'adapte automatiquement :
- **Desktop** : Grille 3-4 colonnes
- **Tablet** : Grille 2 colonnes
- **Mobile** : 1 colonne

---

## 🎨 Thème Visuel

### Couleurs

- **Primaire** : Gradient violet (#667eea → #764ba2)
- **Prédictions** : Gradient rose (#f093fb → #f5576c)
- **Graphiques** : Gradient bleu (#4facfe → #00f2fe)
- **Alertes** : Rouge (#c0392b) / Orange (#e67e22)

### Animations

- Hover : translateY(-4px)
- Loading : Overlay avec spinner
- Cartes : Fade-in progressif

---

## 🔐 Sécurité

- Authentification JWT requise
- Headers automatiques via `getHeaders()`
- Permissions par rôle (Admin/Hôpital)

---

## 📈 Améliorations Futures

- [ ] Prédictions multi-périodes (7, 14, 30 jours)
- [ ] Export PDF des rapports
- [ ] Notifications push
- [ ] Dashboard temps réel
- [ ] Comparaison inter-villes
- [ ] Historique des prédictions

---

## 💡 Astuces

1. **Entraîner régulièrement** : Une fois par semaine minimum
2. **Vérifier les alertes** : Chaque jour
3. **Analyser les graphiques** : Hebdomadaire
4. **Exporter les données** : Mensuel

---

Besoin d'aide ? Consultez la documentation complète dans `ml_models/DOCUMENTATION.md`
