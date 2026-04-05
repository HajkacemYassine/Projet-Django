from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from ml_models.blood_demand_predictor import BloodDemandPredictor
from miniprojet.models import Hopital


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def train_prediction_model(request):
    """Entraîne le modèle de prédiction"""
    predictor = BloodDemandPredictor()
    success = predictor.train_model()
    
    if success:
        return Response({
            'message': 'Modèle entraîné avec succès',
            'status': 'success'
        })
    else:
        return Response({
            'message': 'Pas assez de données pour entraîner le modèle',
            'status': 'error'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_blood_demand(request):
    """Prédit la demande pour un groupe sanguin spécifique"""
    groupe_sanguin = request.data.get('groupe_sanguin')
    ville = request.data.get('ville')
    date_str = request.data.get('date')
    
    if not groupe_sanguin or not ville:
        return Response({
            'error': 'groupe_sanguin et ville sont requis'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    date = datetime.strptime(date_str, '%Y-%m-%d') if date_str else None
    
    predictor = BloodDemandPredictor()
    prediction = predictor.predict_demand(groupe_sanguin, ville, date)
    
    if prediction is None:
        return Response({
            'error': 'Impossible de faire la prédiction. Entraînez d\'abord le modèle.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    stats = predictor.get_historical_stats(groupe_sanguin)
    
    return Response({
        'groupe_sanguin': groupe_sanguin,
        'ville': ville,
        'date': date.strftime('%Y-%m-%d') if date else datetime.now().strftime('%Y-%m-%d'),
        'prediction_quantite': prediction,
        'statistiques_historiques': stats
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_all_blood_types(request):
    """Prédit la demande pour tous les groupes sanguins"""
    ville = request.data.get('ville')
    date_str = request.data.get('date')
    
    if not ville:
        return Response({
            'error': 'ville est requise'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    date = datetime.strptime(date_str, '%Y-%m-%d') if date_str else None
    
    predictor = BloodDemandPredictor()
    predictions = predictor.predict_all_groups(ville, date)
    
    if not predictions:
        return Response({
            'error': 'Impossible de faire les prédictions. Entraînez d\'abord le modèle.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'ville': ville,
        'date': date.strftime('%Y-%m-%d') if date else datetime.now().strftime('%Y-%m-%d'),
        'predictions': predictions
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_demand_statistics(request):
    """Récupère les statistiques de demande"""
    groupe_sanguin = request.query_params.get('groupe_sanguin')
    days = int(request.query_params.get('days', 30))
    
    predictor = BloodDemandPredictor()
    stats = predictor.get_historical_stats(groupe_sanguin, days)
    
    return Response({
        'groupe_sanguin': groupe_sanguin or 'Tous',
        'periode_jours': days,
        'statistiques': stats
    })
