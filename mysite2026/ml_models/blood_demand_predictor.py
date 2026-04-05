import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from datetime import datetime, timedelta
from django.db.models import Count, Sum
from miniprojet.models import DemandeUrgente, Don


class BloodDemandPredictor:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.model_path = os.path.join(os.path.dirname(__file__), 'trained_models', 'demand_model.pkl')
        
    def prepare_training_data(self):
        """Prépare les données d'entraînement depuis la base de données"""
        demandes = DemandeUrgente.objects.all().values(
            'groupe_sanguin', 'quantite', 'date_demande', 'hopital__ville'
        )
        
        if not demandes:
            return None
            
        df = pd.DataFrame(demandes)
        df['date_demande'] = pd.to_datetime(df['date_demande'])
        df['mois'] = df['date_demande'].dt.month
        df['jour_semaine'] = df['date_demande'].dt.dayofweek
        df['annee'] = df['date_demande'].dt.year
        
        # Encoder les variables catégorielles
        self.label_encoders['groupe_sanguin'] = LabelEncoder()
        self.label_encoders['ville'] = LabelEncoder()
        
        df['groupe_sanguin_encoded'] = self.label_encoders['groupe_sanguin'].fit_transform(df['groupe_sanguin'])
        df['ville_encoded'] = self.label_encoders['ville'].fit_transform(df['hopital__ville'])
        
        X = df[['groupe_sanguin_encoded', 'ville_encoded', 'mois', 'jour_semaine', 'annee']]
        y = df['quantite']
        
        return X, y
    
    def train_model(self):
        """Entraîne le modèle de prédiction"""
        data = self.prepare_training_data()
        if data is None:
            return False
            
        X, y = data
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        
        # Sauvegarder le modèle
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'encoders': self.label_encoders
        }, self.model_path)
        
        return True
    
    def load_model(self):
        """Charge le modèle pré-entraîné"""
        if os.path.exists(self.model_path):
            data = joblib.load(self.model_path)
            self.model = data['model']
            self.label_encoders = data['encoders']
            return True
        return False
    
    def predict_demand(self, groupe_sanguin, ville, date=None):
        """Prédit la demande pour un groupe sanguin et une ville"""
        if self.model is None:
            if not self.load_model():
                return None
        
        if date is None:
            date = datetime.now()
        
        try:
            groupe_encoded = self.label_encoders['groupe_sanguin'].transform([groupe_sanguin])[0]
            
            # Essayer d'abord avec la ville telle quelle, puis en minuscules
            try:
                ville_encoded = self.label_encoders['ville'].transform([ville])[0]
            except ValueError:
                # Essayer en minuscules
                ville_encoded = self.label_encoders['ville'].transform([ville.lower()])[0]
        except ValueError:
            return None
        
        features = np.array([[
            groupe_encoded,
            ville_encoded,
            date.month,
            date.weekday(),
            date.year
        ]])
        
        prediction = self.model.predict(features)[0]
        return max(0, int(prediction))
    
    def predict_all_groups(self, ville, date=None):
        """Prédit la demande pour tous les groupes sanguins"""
        # Charger le modèle si nécessaire
        if self.model is None:
            if not self.load_model():
                return None  # Retourne None au lieu de {}
        
        groupes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        predictions = {}
        
        for groupe in groupes:
            pred = self.predict_demand(groupe, ville, date)
            if pred is not None:
                predictions[groupe] = pred
        
        # Si aucune prédiction n'a réussi, retourner None
        if not predictions:
            return None
            
        return predictions
    
    def get_historical_stats(self, groupe_sanguin=None, days=30):
        """Récupère les statistiques historiques"""
        date_limite = datetime.now() - timedelta(days=days)
        
        queryset = DemandeUrgente.objects.filter(date_demande__gte=date_limite)
        if groupe_sanguin:
            queryset = queryset.filter(groupe_sanguin=groupe_sanguin)
        
        stats = queryset.aggregate(
            total_demandes=Count('id'),
            quantite_totale=Sum('quantite'),
            quantite_moyenne=Sum('quantite') / Count('id') if queryset.count() > 0 else 0
        )
        
        return stats
