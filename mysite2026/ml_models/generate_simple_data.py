"""
Script pour générer des données de test pour le modèle ML
Exécuter avec: python manage.py shell < ml_models/generate_simple_data.py
"""

from django.contrib.auth.models import User
from miniprojet.models import Hopital, DemandeUrgente
from datetime import datetime, timedelta
import random

print("🔄 Génération de données de test...")

# Créer un utilisateur hôpital si nécessaire
user, created = User.objects.get_or_create(
    username='hopital_test',
    defaults={'email': 'test@hopital.com'}
)
if created:
    user.set_password('test123')
    user.save()
    print("✅ Utilisateur créé")

# Créer un hôpital si nécessaire
hopital, created = Hopital.objects.get_or_create(
    user=user,
    defaults={
        'nom': 'Hôpital Test',
        'adresse': 'Rue Test',
        'ville': 'Tunis',
        'num_agrement': 'AGR-TEST-001',
        'telephone': '+216 12345678',
        'valide': True
    }
)
if created:
    print("✅ Hôpital créé")

# Groupes sanguins
groupes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
villes = ['Tunis', 'Sfax', 'Sousse', 'Monastir']

# Générer des demandes pour les 90 derniers jours
print("🔄 Génération de demandes urgentes...")
count = 0

for i in range(90):
    date = datetime.now().date() - timedelta(days=i)
    
    # Générer 2-5 demandes par jour
    nb_demandes = random.randint(2, 5)
    
    for _ in range(nb_demandes):
        groupe = random.choice(groupes)
        ville = random.choice(villes)
        
        # Quantité basée sur le groupe (O+ et A+ plus demandés)
        if groupe in ['O+', 'A+']:
            quantite = random.randint(4, 10)
        elif groupe in ['O-', 'A-']:
            quantite = random.randint(2, 6)
        else:
            quantite = random.randint(1, 5)
        
        # Créer ou récupérer l'hôpital pour cette ville
        hopital_ville, _ = Hopital.objects.get_or_create(
            ville=ville,
            defaults={
                'user': user,
                'nom': f'Hôpital {ville}',
                'adresse': f'Rue {ville}',
                'num_agrement': f'AGR-{ville}-001',
                'valide': True
            }
        )
        
        DemandeUrgente.objects.create(
            hopital=hopital_ville,
            groupe_sanguin=groupe,
            quantite=quantite,
            date_demande=date,
            delai=date + timedelta(days=7),
            statut='active',
            description=f'Demande test générée automatiquement'
        )
        count += 1

print(f"✅ {count} demandes urgentes créées")
print("✅ Données de test générées avec succès!")
print("\n📊 Statistiques:")
print(f"   - Période: 90 derniers jours")
print(f"   - Villes: {', '.join(villes)}")
print(f"   - Groupes: {', '.join(groupes)}")
print(f"   - Total demandes: {count}")
print("\n🎓 Vous pouvez maintenant entraîner le modèle!")
