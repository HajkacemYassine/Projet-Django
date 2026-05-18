"""
Script de test rapide pour vérifier le système ML
Exécuter avec: python test_ml_quick.py
"""

import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite2026.settings')
django.setup()

from miniprojet.models import DemandeUrgente, Hopital
from ml_models.blood_demand_predictor import BloodDemandPredictor
from datetime import datetime

print("=" * 60)
print("🧪 TEST RAPIDE DU SYSTÈME ML")
print("=" * 60)

# Test 1: Vérifier les données
print("\n📊 Test 1: Vérification des données")
print("-" * 60)
nb_demandes = DemandeUrgente.objects.count()
nb_hopitaux = Hopital.objects.count()
print(f"✓ Nombre de demandes urgentes: {nb_demandes}")
print(f"✓ Nombre d'hôpitaux: {nb_hopitaux}")

if nb_demandes < 50:
    print("⚠️  ATTENTION: Pas assez de données (minimum 50 recommandé)")
    print("   Exécutez: python manage.py shell < ml_models\\generate_simple_data.py")
else:
    print("✅ Données suffisantes pour l'entraînement")

# Test 2: Entraîner le modèle
print("\n🎓 Test 2: Entraînement du modèle")
print("-" * 60)
try:
    predictor = BloodDemandPredictor()
    success = predictor.train_model()
    
    if success:
        print("✅ Modèle entraîné avec succès")
        print(f"   - MAE: {predictor.model_metrics.get('mae', 'N/A'):.2f}")
        print(f"   - R² Score: {predictor.model_metrics.get('r2_score', 'N/A'):.2f}")
        print(f"   - Échantillons: {predictor.model_metrics.get('n_samples', 'N/A')}")
    else:
        print("❌ Échec de l'entraînement")
except Exception as e:
    print(f"❌ Erreur: {str(e)}")

# Test 3: Faire une prédiction
print("\n🔮 Test 3: Prédiction")
print("-" * 60)
try:
    predictor = BloodDemandPredictor()
    
    # Tester pour chaque ville disponible
    villes = Hopital.objects.values_list('ville', flat=True).distinct()
    
    if villes:
        ville_test = list(villes)[0]
        print(f"Ville testée: {ville_test}")
        print()
        
        groupes = ['O+', 'A+', 'B+', 'AB+']
        for groupe in groupes:
            prediction = predictor.predict_demand(groupe, ville_test, datetime.now())
            if prediction is not None:
                print(f"✓ {groupe}: {prediction} unités prédites")
            else:
                print(f"✗ {groupe}: Échec de la prédiction")
    else:
        print("❌ Aucune ville trouvée dans la base de données")
        
except Exception as e:
    print(f"❌ Erreur: {str(e)}")

# Test 4: Prédiction pour tous les groupes
print("\n📋 Test 4: Prédiction tous groupes")
print("-" * 60)
try:
    predictor = BloodDemandPredictor()
    villes = Hopital.objects.values_list('ville', flat=True).distinct()
    
    if villes:
        ville_test = list(villes)[0]
        predictions = predictor.predict_all_groups(ville_test, datetime.now())
        
        if predictions:
            print(f"✅ Prédictions pour {ville_test}:")
            total = sum(predictions.values())
            for groupe, quantite in sorted(predictions.items()):
                pourcentage = (quantite / total * 100) if total > 0 else 0
                print(f"   {groupe}: {quantite} unités ({pourcentage:.1f}%)")
        else:
            print("❌ Aucune prédiction générée")
    else:
        print("❌ Aucune ville disponible")
        
except Exception as e:
    print(f"❌ Erreur: {str(e)}")

# Test 5: Statistiques historiques
print("\n📈 Test 5: Statistiques historiques")
print("-" * 60)
try:
    predictor = BloodDemandPredictor()
    stats = predictor.get_historical_stats(groupe_sanguin='O+', days=30)
    
    print("✅ Statistiques O+ (30 derniers jours):")
    print(f"   - Total demandes: {stats.get('total_demandes', 0)}")
    print(f"   - Quantité totale: {stats.get('quantite_totale', 0)}")
    print(f"   - Quantité moyenne: {stats.get('quantite_moyenne', 0):.2f}")
    
except Exception as e:
    print(f"❌ Erreur: {str(e)}")

# Test 6: Optimisation des stocks
print("\n📦 Test 6: Optimisation des stocks")
print("-" * 60)
try:
    predictor = BloodDemandPredictor()
    villes = Hopital.objects.values_list('ville', flat=True).distinct()
    
    if villes:
        ville_test = list(villes)[0]
        allocation = predictor.optimize_stock_allocation(ville_test)
        
        if allocation:
            print(f"✅ Allocation optimale pour {ville_test}:")
            for groupe, info in sorted(allocation.items()):
                priorite = info['priorite']
                emoji = "🔴" if priorite == "Haute" else "🟠" if priorite == "Moyenne" else "🔵"
                print(f"   {emoji} {groupe}: {info['quantite_predite']} unités ({info['pourcentage']:.1f}%) - {priorite}")
        else:
            print("❌ Échec de l'optimisation")
    else:
        print("❌ Aucune ville disponible")
        
except Exception as e:
    print(f"❌ Erreur: {str(e)}")

# Résumé
print("\n" + "=" * 60)
print("📊 RÉSUMÉ DES TESTS")
print("=" * 60)

if nb_demandes >= 50:
    print("✅ Données: OK")
else:
    print("⚠️  Données: Insuffisantes")

try:
    predictor = BloodDemandPredictor()
    if predictor.load_model():
        print("✅ Modèle: OK")
    else:
        print("⚠️  Modèle: Non entraîné")
except:
    print("❌ Modèle: Erreur")

print("\n🎯 Prochaines étapes:")
if nb_demandes < 50:
    print("   1. Générer des données de test")
    print("   2. Entraîner le modèle")
    print("   3. Tester les prédictions")
else:
    print("   1. Lancer le serveur Django")
    print("   2. Lancer le frontend React")
    print("   3. Tester via l'interface web")

print("\n" + "=" * 60)
print("✅ Tests terminés!")
print("=" * 60)
