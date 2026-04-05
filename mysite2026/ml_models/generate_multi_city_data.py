"""
Script pour générer des données de test avec plusieurs hôpitaux
Exécuter avec: python manage.py shell < ml_models/generate_multi_city_data.py
"""

from miniprojet.models import DemandeUrgente, Hopital
from django.contrib.auth.models import User
from datetime import datetime, timedelta
import random

# Groupes sanguins et villes
groupes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
villes_data = [
    ('Tunis', 'Hôpital Charles Nicolle'),
    ('Sfax', 'Hôpital Habib Bourguiba'),
    ('Sousse', 'Hôpital Farhat Hached'),
    ('Bizerte', 'Hôpital Régional de Bizerte'),
    ('Nabeul', 'Hôpital Régional de Nabeul'),
    ('Gabes', 'Hôpital Régional de Gabes'),
    ('Kairouan', 'Hôpital Ibn El Jazzar'),
]

# Créer un hôpital pour chaque ville
hopitaux = {}
for ville, nom_hopital in villes_data:
    username = f'hopital_{ville.lower()}'
    user, _ = User.objects.get_or_create(
        username=username,
        defaults={'password': 'test123'}
    )
    
    hopital, _ = Hopital.objects.get_or_create(
        user=user,
        defaults={
            'nom': nom_hopital,
            'adresse': f'123 Rue {ville}',
            'ville': ville,
            'num_agrement': f'AGR-{ville[:3].upper()}-001',
            'valide': True
        }
    )
    hopitaux[ville] = hopital
    print(f'Hôpital créé: {nom_hopital} à {ville}')

# Générer des demandes sur les 6 derniers mois
start_date = datetime.now() - timedelta(days=180)
demandes_created = 0

for i in range(300):  # 300 demandes au total
    date = start_date + timedelta(days=random.randint(0, 180))
    groupe = random.choice(groupes)
    ville = random.choice(list(hopitaux.keys()))
    hopital = hopitaux[ville]
    
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

print(f"\n{demandes_created} demandes créées pour {len(hopitaux)} villes!")
