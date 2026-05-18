# 🛒 Guide Panier & Commandes - Magasin

## 📋 Résumé des fonctionnalités ajoutées

✅ **Panier avec sessions** - Stockage temporaire côté serveur  
✅ **Système de commandes** - Avec statuts et historique  
✅ **ItemCommande** - Table intermédiaire pour gérer les quantités  
✅ **API REST complète** - Endpoints pour panier et commandes  

---

## 🔧 Installation

```bash
# 1. Activer l'environnement virtuel
cd "c:\Users\yassi\OneDrive\Documents\yassine\dsi semestre2\framework django\projetdjango"
venv\Scripts\activate

# 2. Appliquer les migrations
cd mysite2026
python manage.py migrate magasin

# 3. Lancer le serveur
python manage.py runserver
```

---

## 🛠️ API Endpoints

### 🛒 PANIER (Sessions)

#### 1. Ajouter au panier
```http
POST http://localhost:8000/api/panier/ajouter/
Content-Type: application/json

{
  "produit_id": 1,
  "quantite": 2
}
```

**Réponse:**
```json
{
  "message": "Chaise ajouté au panier",
  "panier": {
    "1": {
      "libelle": "Chaise",
      "prix": "150.00",
      "quantite": 2,
      "image": "/media/produits/chaise.jpg"
    }
  },
  "total_items": 2
}
```

#### 2. Voir le panier
```http
GET http://localhost:8000/api/panier/
```

**Réponse:**
```json
{
  "items": {
    "1": {
      "libelle": "Chaise",
      "prix": "150.00",
      "quantite": 2,
      "image": "/media/produits/chaise.jpg"
    }
  },
  "total": "300.00",
  "nb_items": 2
}
```

#### 3. Modifier la quantité
```http
POST http://localhost:8000/api/panier/modifier/
Content-Type: application/json

{
  "produit_id": 1,
  "quantite": 5
}
```

#### 4. Vider le panier
```http
DELETE http://localhost:8000/api/panier/vider/
```

---

### 📦 COMMANDES

#### 1. Passer une commande (depuis le panier)
```http
POST http://localhost:8000/api/commandes/passer/
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "adresse_livraison": "123 Rue de la Paix, Tunis",
  "telephone": "+216 12 345 678",
  "notes": "Livraison entre 9h et 12h"
}
```

**Réponse:**
```json
{
  "message": "Commande passée avec succès!",
  "commande_id": 5,
  "total": "300.000"
}
```

#### 2. Mes commandes
```http
GET http://localhost:8000/api/commandes/mes-commandes/
Authorization: Bearer <votre_token>
```

**Réponse:**
```json
[
  {
    "id": 5,
    "date_commande": "2025-01-15",
    "statut": "en_attente",
    "total": "300.000",
    "adresse_livraison": "123 Rue de la Paix, Tunis",
    "telephone": "+216 12 345 678",
    "nb_items": 1,
    "items": [
      {
        "produit": "Chaise",
        "quantite": 2,
        "prix_unitaire": "150.000",
        "sous_total": "300.000"
      }
    ]
  }
]
```

#### 3. Détails d'une commande
```http
GET http://localhost:8000/api/commandes/5/
Authorization: Bearer <votre_token>
```

#### 4. Annuler une commande
```http
POST http://localhost:8000/api/commandes/5/annuler/
Authorization: Bearer <votre_token>
```

---

## 🗄️ Modèles de données

### Commande
```python
class Commande(models.Model):
    user = ForeignKey(User)
    date_commande = DateField()
    statut = CharField(choices=[
        'en_attente', 'confirmee', 
        'expediee', 'livree', 'annulee'
    ])
    totalCde = DecimalField()
    adresse_livraison = TextField()
    telephone = CharField()
    notes = TextField()
```

### ItemCommande
```python
class ItemCommande(models.Model):
    commande = ForeignKey(Commande)
    produit = ForeignKey(Produit)
    quantite = IntegerField()
    prix_unitaire = DecimalField()
    
    def sous_total(self):
        return self.quantite * self.prix_unitaire
```

---

## 🔐 Sessions Django

Le panier utilise les **sessions Django** pour stocker temporairement les données :

```python
# Structure du panier en session
request.session['panier'] = {
    "1": {
        "libelle": "Chaise",
        "prix": "150.00",
        "quantite": 2,
        "image": "/media/produits/chaise.jpg"
    },
    "3": {
        "libelle": "Table",
        "prix": "500.00",
        "quantite": 1,
        "image": "/media/produits/table.jpg"
    }
}
```

**Avantages:**
- ✅ Pas besoin d'authentification pour ajouter au panier
- ✅ Données stockées côté serveur (sécurisé)
- ✅ Persiste entre les pages
- ✅ Automatiquement nettoyé après expiration

---

## 🧪 Test avec Postman/Thunder Client

### 1. Créer un utilisateur
```http
POST http://localhost:8000/api/auth/register/
Content-Type: application/json

{
  "username": "client1",
  "email": "client1@example.com",
  "password": "password123"
}
```

### 2. Se connecter
```http
POST http://localhost:8000/api/auth/login/
Content-Type: application/json

{
  "username": "client1",
  "password": "password123"
}
```

Copier le `access` token de la réponse.

### 3. Ajouter des produits au panier
```http
POST http://localhost:8000/api/panier/ajouter/
Content-Type: application/json

{
  "produit_id": 1,
  "quantite": 2
}
```

### 4. Voir le panier
```http
GET http://localhost:8000/api/panier/
```

### 5. Passer la commande
```http
POST http://localhost:8000/api/commandes/passer/
Authorization: Bearer <votre_access_token>
Content-Type: application/json

{
  "adresse_livraison": "123 Rue de la Paix, Tunis",
  "telephone": "+216 12 345 678"
}
```

### 6. Voir mes commandes
```http
GET http://localhost:8000/api/commandes/mes-commandes/
Authorization: Bearer <votre_access_token>
```

---

## 📊 Workflow complet

```
1. Client ajoute produits au panier (session)
   ↓
2. Client se connecte/s'inscrit
   ↓
3. Client passe commande (panier → Commande + ItemCommande)
   ↓
4. Panier vidé automatiquement
   ↓
5. Admin change statut: en_attente → confirmee → expediee → livree
```

---

## 🎨 Intégration Frontend (React)

```javascript
// Ajouter au panier
const ajouterAuPanier = async (produitId, quantite) => {
  const res = await fetch('http://localhost:8000/api/panier/ajouter/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produit_id: produitId, quantite })
  });
  const data = await res.json();
  console.log(data.message);
};

// Voir le panier
const voirPanier = async () => {
  const res = await fetch('http://localhost:8000/api/panier/');
  const data = await res.json();
  return data;
};

// Passer commande
const passerCommande = async (adresse, telephone) => {
  const res = await fetch('http://localhost:8000/api/commandes/passer/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify({ adresse_livraison: adresse, telephone })
  });
  const data = await res.json();
  return data;
};
```

---

## ✅ Checklist

- [x] Modèles Commande et ItemCommande créés
- [x] Migrations générées
- [x] API panier avec sessions
- [x] API commandes avec authentification
- [x] URLs configurées
- [ ] Appliquer les migrations: `python manage.py migrate`
- [ ] Tester avec Postman
- [ ] Créer le frontend React

---

## 🚀 Prochaines étapes

1. **Appliquer les migrations:**
   ```bash
   python manage.py migrate magasin
   ```

2. **Créer des produits de test:**
   Via l'admin Django ou l'API

3. **Tester le panier:**
   Avec Postman/Thunder Client

4. **Créer le frontend React:**
   Composants Panier et Commandes

---

## 📝 Notes importantes

- Le panier utilise les **sessions** (pas de base de données)
- Les commandes nécessitent **authentification**
- Le panier est **vidé automatiquement** après commande
- Les statuts de commande peuvent être modifiés par l'admin

---

**Bon développement ! 🎉**
