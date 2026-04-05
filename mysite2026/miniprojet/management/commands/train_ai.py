from django.core.management.base import BaseCommand
from ml_models.blood_demand_predictor import BloodDemandPredictor
from miniprojet.models import DemandeUrgente
import os


class Command(BaseCommand):
    help = 'Entraine le modele IA de prediction de demande en sang'

    def handle(self, *args, **options):
        self.stdout.write('=' * 60)
        self.stdout.write(self.style.SUCCESS('ENTRAINEMENT DU MODELE IA'))
        self.stdout.write('=' * 60)
        
        # Verifier les donnees
        nb_demandes = DemandeUrgente.objects.count()
        self.stdout.write(f'\nNombre de demandes: {nb_demandes}')
        
        if nb_demandes < 10:
            self.stdout.write(self.style.WARNING(
                '\nATTENTION: Pas assez de donnees (minimum 10)'
            ))
            self.stdout.write('Executez: python manage.py shell < ml_models/generate_test_data.py')
            return
        
        # Entrainer le modele
        self.stdout.write('\nEntrainement en cours...')
        predictor = BloodDemandPredictor()
        success = predictor.train_model()
        
        if success:
            self.stdout.write(self.style.SUCCESS('\nSUCCES! Modele entraine'))
            self.stdout.write(f'Sauvegarde: {predictor.model_path}')
            
            # Tester une prediction
            test_pred = predictor.predict_demand('O+', 'Tunis')
            if test_pred is not None:
                self.stdout.write(f'\nTest prediction O+ Tunis: {test_pred} unites')
        else:
            self.stdout.write(self.style.ERROR('\nERREUR lors de l\'entrainement'))
        
        self.stdout.write('\n' + '=' * 60)
