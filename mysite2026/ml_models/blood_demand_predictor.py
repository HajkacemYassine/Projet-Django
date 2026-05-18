import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
from datetime import datetime, timedelta
from django.db.models import Count, Sum, Avg, Q
from miniprojet.models import DemandeUrgente, Don, Donneur
import logging

logger = logging.getLogger(__name__)


class BloodDemandPredictor:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.scaler = StandardScaler()
        self.model_path = os.path.join(os.path.dirname(__file__), 'trained_models', 'demand_model.pkl')
        self.model_metrics = {}
        
    def prepare_training_data(self):
        """Prépare les données d'entraînement avec features avancées"""
        demandes = DemandeUrgente.objects.all().values(
            'groupe_sanguin', 'quantite', 'date_demande', 'hopital__ville', 'statut'
        )
        
        if not demandes:
            return None
            
        df = pd.DataFrame(demandes)
        df['date_demande'] = pd.to_datetime(df['date_demande'])
        
        # Features temporelles avancées
        df['mois'] = df['date_demande'].dt.month
        df['jour_semaine'] = df['date_demande'].dt.dayofweek
        df['annee'] = df['date_demande'].dt.year
        df['trimestre'] = df['date_demande'].dt.quarter
        df['semaine_annee'] = df['date_demande'].dt.isocalendar().week
        df['est_weekend'] = df['jour_semaine'].isin([5, 6]).astype(int)
        df['est_debut_mois'] = (df['date_demande'].dt.day <= 10).astype(int)
        
        # Features saisonnières
        df['saison'] = df['mois'].apply(self._get_season)
        
        # Features d'urgence (basé sur le statut)
        df['urgence'] = (df['statut'] == 'active').astype(int)
        
        # Statistiques par ville et groupe sanguin
        for ville in df['hopital__ville'].unique():
            for groupe in df['groupe_sanguin'].unique():
                mask = (df['hopital__ville'] == ville) & (df['groupe_sanguin'] == groupe)
                if mask.sum() > 0:
                    df.loc[mask, 'demande_moyenne_ville_groupe'] = df.loc[mask, 'quantite'].mean()
                else:
                    df.loc[mask, 'demande_moyenne_ville_groupe'] = 0
        
        # Encoder les variables catégorielles
        self.label_encoders['groupe_sanguin'] = LabelEncoder()
        self.label_encoders['ville'] = LabelEncoder()
        self.label_encoders['saison'] = LabelEncoder()
        
        df['groupe_sanguin_encoded'] = self.label_encoders['groupe_sanguin'].fit_transform(df['groupe_sanguin'])
        df['ville_encoded'] = self.label_encoders['ville'].fit_transform(df['hopital__ville'])
        df['saison_encoded'] = self.label_encoders['saison'].fit_transform(df['saison'])
        
        # Sélection des features
        feature_columns = [
            'groupe_sanguin_encoded', 'ville_encoded', 'mois', 'jour_semaine', 
            'annee', 'trimestre', 'semaine_annee', 'est_weekend', 'est_debut_mois',
            'saison_encoded', 'urgence', 'demande_moyenne_ville_groupe'
        ]
        
        X = df[feature_columns]
        y = df['quantite']
        
        return X, y
    
    def _get_season(self, month):
        """Détermine la saison selon le mois"""
        if month in [12, 1, 2]:
            return 'hiver'
        elif month in [3, 4, 5]:
            return 'printemps'
        elif month in [6, 7, 8]:
            return 'ete'
        else:
            return 'automne'
    
    def train_model(self, use_gradient_boosting=False):
        """Entraîne le modèle avec validation croisée et métriques"""
        data = self.prepare_training_data()
        if data is None:
            logger.warning("Pas de données pour l'entraînement")
            return False
            
        X, y = data
        
        # Split train/test
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Normalisation
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Choix du modèle
        if use_gradient_boosting:
            self.model = GradientBoostingRegressor(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
        else:
            self.model = RandomForestRegressor(
                n_estimators=200,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
        
        # Entraînement
        self.model.fit(X_train_scaled, y_train)
        
        # Évaluation
        y_pred = self.model.predict(X_test_scaled)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        # Validation croisée
        cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=5, scoring='neg_mean_absolute_error')
        
        self.model_metrics = {
            'mae': float(mae),
            'r2_score': float(r2),
            'cv_mae_mean': float(-cv_scores.mean()),
            'cv_mae_std': float(cv_scores.std()),
            'n_samples': len(X),
            'model_type': 'GradientBoosting' if use_gradient_boosting else 'RandomForest'
        }
        
        logger.info(f"Modèle entraîné - MAE: {mae:.2f}, R²: {r2:.2f}")
        
        # Sauvegarder le modèle
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'encoders': self.label_encoders,
            'scaler': self.scaler,
            'metrics': self.model_metrics
        }, self.model_path)
        
        return True
    
    def load_model(self):
        """Charge le modèle pré-entraîné"""
        if os.path.exists(self.model_path):
            data = joblib.load(self.model_path)
            self.model = data['model']
            self.label_encoders = data['encoders']
            self.scaler = data.get('scaler', StandardScaler())
            self.model_metrics = data.get('metrics', {})
            logger.info(f"Modèle chargé - Métriques: {self.model_metrics}")
            return True
        logger.warning("Aucun modèle trouvé")
        return False
    
    def predict_demand(self, groupe_sanguin, ville, date=None):
        """Prédit la demande avec features avancées"""
        if self.model is None:
            if not self.load_model():
                return None
        
        if date is None:
            date = datetime.now()
        
        try:
            groupe_encoded = self.label_encoders['groupe_sanguin'].transform([groupe_sanguin])[0]
            
            try:
                ville_encoded = self.label_encoders['ville'].transform([ville])[0]
            except ValueError:
                ville_encoded = self.label_encoders['ville'].transform([ville.lower()])[0]
            
            # Calculer les features avancées
            mois = date.month
            jour_semaine = date.weekday()
            annee = date.year
            trimestre = (mois - 1) // 3 + 1
            semaine_annee = date.isocalendar()[1]
            est_weekend = 1 if jour_semaine in [5, 6] else 0
            est_debut_mois = 1 if date.day <= 10 else 0
            saison = self._get_season(mois)
            saison_encoded = self.label_encoders['saison'].transform([saison])[0]
            
            # Statistiques historiques
            demande_moyenne = self._get_historical_average(groupe_sanguin, ville)
            
            features = np.array([[
                groupe_encoded,
                ville_encoded,
                mois,
                jour_semaine,
                annee,
                trimestre,
                semaine_annee,
                est_weekend,
                est_debut_mois,
                saison_encoded,
                0,  # urgence (par défaut)
                demande_moyenne
            ]])
            
            # Normalisation
            features_scaled = self.scaler.transform(features)
            
            prediction = self.model.predict(features_scaled)[0]
            return max(0, int(prediction))
            
        except Exception as e:
            logger.error(f"Erreur prédiction: {e}")
            return None
    
    def _get_historical_average(self, groupe_sanguin, ville):
        """Calcule la moyenne historique pour un groupe et une ville"""
        try:
            avg = DemandeUrgente.objects.filter(
                groupe_sanguin=groupe_sanguin,
                hopital__ville=ville
            ).aggregate(avg=Avg('quantite'))['avg']
            return float(avg) if avg else 0.0
        except:
            return 0.0
    
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
        """Récupère les statistiques historiques détaillées"""
        try:
            date_limite = datetime.now() - timedelta(days=days)
            
            queryset = DemandeUrgente.objects.filter(date_demande__gte=date_limite)
            if groupe_sanguin:
                queryset = queryset.filter(groupe_sanguin=groupe_sanguin)
            
            stats = queryset.aggregate(
                total_demandes=Count('id'),
                quantite_totale=Sum('quantite'),
                quantite_moyenne=Avg('quantite'),
                demandes_actives=Count('id', filter=Q(statut='active'))
            )
            
            # Convertir les valeurs None en 0
            for key in stats:
                if stats[key] is None:
                    stats[key] = 0
            
            # Ajouter les métriques du modèle
            stats['model_metrics'] = self.model_metrics if self.model_metrics else {}
            
            return stats
        except Exception as e:
            logger.error(f"Erreur get_historical_stats: {e}")
            return {
                'total_demandes': 0,
                'quantite_totale': 0,
                'quantite_moyenne': 0,
                'demandes_actives': 0,
                'model_metrics': {}
            }
    
    def predict_next_week(self, ville):
        """Prédit la demande pour les 7 prochains jours"""
        predictions = []
        groupes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        
        for i in range(7):
            date = datetime.now() + timedelta(days=i)
            day_predictions = {}
            
            for groupe in groupes:
                pred = self.predict_demand(groupe, ville, date)
                if pred is not None:
                    day_predictions[groupe] = pred
            
            predictions.append({
                'date': date.strftime('%Y-%m-%d'),
                'jour': date.strftime('%A'),
                'predictions': day_predictions
            })
        
        return predictions
    
    def get_feature_importance(self):
        """Retourne l'importance des features"""
        if self.model is None or not hasattr(self.model, 'feature_importances_'):
            return None
        
        feature_names = [
            'Groupe sanguin', 'Ville', 'Mois', 'Jour semaine', 
            'Année', 'Trimestre', 'Semaine', 'Weekend', 'Début mois',
            'Saison', 'Urgence', 'Moyenne historique'
        ]
        
        importances = self.model.feature_importances_
        feature_importance = dict(zip(feature_names, importances))
        
        # Trier par importance
        return dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True))
    
    def get_blood_type_compatibility(self, groupe_sanguin):
        """Retourne les groupes compatibles pour une transfusion"""
        compatibility = {
            'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
            'O+': ['O+', 'A+', 'B+', 'AB+'],
            'A-': ['A-', 'A+', 'AB-', 'AB+'],
            'A+': ['A+', 'AB+'],
            'B-': ['B-', 'B+', 'AB-', 'AB+'],
            'B+': ['B+', 'AB+'],
            'AB-': ['AB-', 'AB+'],
            'AB+': ['AB+']
        }
        return compatibility.get(groupe_sanguin, [])
    
    def optimize_stock_allocation(self, ville):
        """Optimise l'allocation des stocks basée sur les prédictions"""
        predictions = self.predict_all_groups(ville)
        if not predictions:
            return None
        
        total_predicted = sum(predictions.values())
        
        allocation = {}
        for groupe, quantite in predictions.items():
            percentage = (quantite / total_predicted * 100) if total_predicted > 0 else 0
            allocation[groupe] = {
                'quantite_predite': quantite,
                'pourcentage': round(percentage, 2),
                'priorite': 'Haute' if quantite >= 8 else 'Moyenne' if quantite >= 5 else 'Basse',
                'groupes_compatibles': self.get_blood_type_compatibility(groupe)
            }
        
        return allocation
