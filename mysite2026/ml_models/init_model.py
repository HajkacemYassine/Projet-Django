"""
Script pour initialiser le modèle IA automatiquement
Exécuter avec: python manage.py shell < ml_models/init_model.py
"""

from ml_models.blood_demand_predictor import BloodDemandPredictor
from miniprojet.models import DemandeUrgente
import os

print("=" * 60)
print("INITIALISATION DU MODÈLE IA")
print("=" * 60)

# Vérifier s'il y a des données
nb_demandes = DemandeUrgente.objects.count()
print(f"\n✓ Nombre de demandes dans la base: {nb_demandes}")

if nb_demandes < 50:
    print("\n⚠️  ATTENTION: Pas assez de données (minimum 50 recommandé)")
    print("   Exécutez d'abord: python manage.py shell < ml_models/generate_test_data.py")
else:
    print(f"✓ Données suffisantes pour l'entraînement")

# Vérifier si le modèle existe
predictor = BloodDemandPredictor()
model_exists = os.path.exists(predictor.model_path)

if model_exists:
    print(f"\n✓ Modèle existant trouvé: {predictor.model_path}")
    print("  Le modèle est prêt à être utilisé.")
else:
    print(f"\n⚠️  Aucun modèle trouvé à: {predictor.model_path}")
    
    if nb_demandes >= 50:
        print("\n🎓 Entraînement du modèle en cours...")
        success = predictor.train_model()
        
        if success:
            print("✅ Modèle entraîné avec succès!")
            print(f"   Sauvegardé à: {predictor.model_path}")
        else:
            print("❌ Erreur lors de l'entraînement")
    else:
        print("   Impossible d'entraîner: pas assez de données")

print("\n" + "=" * 60)
print("RÉSUMÉ")
print("=" * 60)
print(f"Données: {nb_demandes} demandes")
print(f"Modèle: {'✅ Prêt' if os.path.exists(predictor.model_path) else '❌ Non entraîné'}")
print("=" * 60)
