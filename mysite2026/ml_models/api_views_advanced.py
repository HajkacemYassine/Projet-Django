from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from django.db.models import Sum, Avg
from ml_models.blood_demand_predictor import BloodDemandPredictor
from ml_models.alert_system import BloodAlertSystem
from ml_models.visualizer import BloodDataVisualizer
from ml_models.sagemaker_integration import SageMakerIntegration
from miniprojet.models import Hopital, DemandeUrgente


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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_with_alerts(request):
    """Prédit la demande et génère des alertes si nécessaire"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        ville = request.data.get('ville')
        auto_create = request.data.get('auto_create_demand', False)
        
        logger.info(f"Prediction request - ville: {ville}, auto_create: {auto_create}")
        
        if not ville:
            return Response({'error': 'ville est requise'}, status=status.HTTP_400_BAD_REQUEST)
        
        predictor = BloodDemandPredictor()
        predictions = predictor.predict_all_groups(ville)
        
        logger.info(f"Predictions result: {predictions}")
        
        if predictions is None:
            return Response({
                'error': 'Modèle non entraîné. Cliquez sur "Entraîner le Modèle" d\'abord.',
                'action_required': 'train_model'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not predictions:
            return Response({
                'error': 'Impossible de faire les prédictions pour cette ville',
                'ville': ville
            }, status=status.HTTP_400_BAD_REQUEST)
        
        alert_system = BloodAlertSystem()
        alerts = alert_system.check_critical_demand(predictions, ville)
        
        logger.info(f"Alerts generated: {len(alerts)}")
        
        if auto_create and alerts:
            for alert in alerts:
                alert_system.create_automatic_demand(alert)
        
        return Response({
            'ville': ville,
            'predictions': predictions,
            'alerts': alerts,
            'demandes_auto_creees': auto_create and len(alerts) > 0
        })
    except Exception as e:
        logger.error(f"Error in predict_with_alerts: {str(e)}")
        return Response({
            'error': f'Erreur serveur: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_visualizations(request):
    """Génère tous les graphiques de visualisation"""
    try:
        days = int(request.query_params.get('days', 30))
        groupe_sanguin = request.query_params.get('groupe_sanguin')
        
        visualizer = BloodDataVisualizer()
        
        charts = {}
        
        try:
            charts['demand_by_blood_type'] = visualizer.generate_demand_by_blood_type(days)
        except Exception as e:
            charts['demand_by_blood_type'] = None
            
        try:
            charts['demand_timeline'] = visualizer.generate_demand_timeline(groupe_sanguin, days)
        except Exception as e:
            charts['demand_timeline'] = None
            
        try:
            charts['city_heatmap'] = visualizer.generate_city_heatmap(days)
        except Exception as e:
            charts['city_heatmap'] = None
            
        try:
            charts['donation_vs_demand'] = visualizer.generate_donation_vs_demand(days)
        except Exception as e:
            charts['donation_vs_demand'] = None
        
        return Response({
            'charts': charts,
            'periode_jours': days
        })
    except Exception as e:
        return Response({
            'error': str(e),
            'charts': {},
            'periode_jours': 30
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_prediction_chart(request):
    """Génère un graphique comparant prédictions et historique"""
    ville = request.data.get('ville')
    
    if not ville:
        return Response({'error': 'ville est requise'}, status=status.HTTP_400_BAD_REQUEST)
    
    predictor = BloodDemandPredictor()
    predictions = predictor.predict_all_groups(ville)
    
    if not predictions:
        return Response({'error': 'Modèle non entraîné'}, status=status.HTTP_400_BAD_REQUEST)
    
    date_limite = datetime.now() - timedelta(days=30)
    historical = DemandeUrgente.objects.filter(
        date_demande__gte=date_limite,
        hopital__ville=ville
    ).values('groupe_sanguin').annotate(avg=Avg('quantite'))
    
    historical_avg = {item['groupe_sanguin']: item['avg'] for item in historical}
    
    visualizer = BloodDataVisualizer()
    chart = visualizer.generate_prediction_comparison(predictions, historical_avg)
    
    return Response({
        'chart': chart,
        'predictions': predictions,
        'historical_avg': historical_avg
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deploy_to_sagemaker(request):
    """Déploie le modèle sur AWS SageMaker"""
    bucket_name = request.data.get('bucket_name')
    role_arn = request.data.get('role_arn')
    aws_access_key = request.data.get('aws_access_key')
    aws_secret_key = request.data.get('aws_secret_key')
    region = request.data.get('region', 'us-east-1')
    
    if not bucket_name or not role_arn:
        return Response({
            'error': 'bucket_name et role_arn sont requis'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    sagemaker = SageMakerIntegration(region=region)
    
    if not sagemaker.initialize_clients(aws_access_key, aws_secret_key):
        return Response({
            'error': 'Erreur initialisation AWS'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    predictor = BloodDemandPredictor()
    model_path = predictor.model_path
    
    result = sagemaker.deploy_model(model_path, bucket_name, role_arn)
    
    if result:
        return Response({
            'message': 'Déploiement lancé',
            'endpoint_name': result['endpoint_name'],
            'status': result['status']
        })
    else:
        return Response({
            'error': 'Erreur lors du déploiement'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sagemaker_endpoint_status(request):
    """Vérifie le statut de l'endpoint SageMaker"""
    region = request.query_params.get('region', 'us-east-1')
    
    sagemaker = SageMakerIntegration(region=region)
    
    if not sagemaker.initialize_clients():
        return Response({
            'error': 'Erreur initialisation AWS'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    status_info = sagemaker.get_endpoint_status()
    
    if status_info:
        return Response(status_info)
    else:
        return Response({
            'error': 'Endpoint non trouvé'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_alert_history(request):
    """Récupère l'historique des alertes"""
    days = int(request.query_params.get('days', 7))
    
    alert_system = BloodAlertSystem()
    history = alert_system.get_alert_history(days)
    
    return Response({
        'periode_jours': days,
        'alertes': history
    })
