"""
Script pour générer des données de test pour le modèle de prédiction
Exécuter avec: python manage.py shell < ml_models/generate_test_data.py
"""

from miniprojet.models import DemandeUrgente, Hopital
from django.contrib.auth.models import User
from datetime import datetime, timedelta
import random

# Créer un hôpital de test si nécessaire
user, _ = User.objects.get_or_create(username='hopital_test', defaults={'password': 'test123'})
hopital, created = Hopital.objects.get_or_create(
    user=user,
    defaults={
        'nom': 'Hôpital Test',
        'adresse': '123 Rue Test',
        'ville': 'Tunis',  # Ville par défaut
        'num_agrement': 'TEST001',
        'valide': True
    }
)

# Mettre à jour la ville si l'hôpital existe déjà
if not created and not hopital.ville:
    hopital.ville = 'Tunis'
    hopital.save()

# Groupes sanguins et villes
groupes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
villes = ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul', 'Gabes', 'Kairouan']

# Générer des demandes sur les 6 derniers mois
start_date = datetime.now() - timedelta(days=180)
demandes_created = 0

for i in range(200):
    date = start_date + timedelta(days=random.randint(0, 180))
    groupe = random.choice(groupes)
    ville = random.choice(villes)
    
    # Quantités plus élevées pour O+ et A+
    if groupe in ['O+', 'A+']:
        quantite = random.randint(3, 10)
    elif groupe in ['O-', 'AB-']:
        quantite = random.randint(1, 4)
    else:
        quantite = random.randint(2, 6)
    
    DemandeUrgente.objects.create(
        hopital=hopital,
        groupe_sanguin=groupe,
        quantite=quantite,
        date_demande=date.date(),
        statut='active'
    )
    demandes_created += 1

print(f"{demandes_created} demandes de test créées avec succès!")
