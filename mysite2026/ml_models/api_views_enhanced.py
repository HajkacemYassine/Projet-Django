from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from ml_models.blood_demand_predictor import BloodDemandPredictor
from ml_models.alert_system import BloodAlertSystem
from miniprojet.models import DemandeUrgente, Donneur
from django.db.models import Count, Sum, Q
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_next_week(request):
    """Prédit la demande pour les 7 prochains jours"""
    ville = request.data.get('ville', 'Tunis')
    
    predictor = BloodDemandPredictor()
    predictions = predictor.predict_next_week(ville)
    
    if not predictions:
        return Response({
            'error': 'Impossible de faire les prédictions. Entraînez d\'abord le modèle.',
            'action_required': 'train_model'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'ville': ville,
        'predictions_semaine': predictions,
        'total_jours': len(predictions)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_model_performance(request):
    """Retourne les métriques de performance du modèle"""
    predictor = BloodDemandPredictor()
    
    if not predictor.load_model():
        return Response({
            'error': 'Aucun modèle entraîné trouvé',
            'action_required': 'train_model'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    feature_importance = predictor.get_feature_importance()
    
    return Response({
        'metrics': predictor.model_metrics,
        'feature_importance': feature_importance,
        'model_loaded': True
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def optimize_stock(request):
    """Optimise l'allocation des stocks basée sur les prédictions"""
    ville = request.data.get('ville', 'Tunis')
    
    predictor = BloodDemandPredictor()
    allocation = predictor.optimize_stock_allocation(ville)
    
    if not allocation:
        return Response({
            'error': 'Impossible d\'optimiser les stocks. Entraînez d\'abord le modèle.',
            'action_required': 'train_model'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'ville': ville,
        'allocation_optimale': allocation,
        'date_calcul': datetime.now().strftime('%Y-%m-%d %H:%M')
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_donor_availability(request):
    """Analyse la disponibilité des donneurs par groupe sanguin"""
    ville = request.query_params.get('ville')
    
    query = Donneur.objects.filter(actif=True)
    if ville:
        query = query.filter(ville=ville)
    
    # Statistiques par groupe sanguin
    disponibilite = query.values('groupe_sanguin').annotate(
        total=Count('id'),
        eligibles=Count('id', filter=Q(eligible=True))
    ).order_by('-total')
    
    # Calculer le taux de disponibilité
    for item in disponibilite:
        item['taux_disponibilite'] = round(
            (item['eligibles'] / item['total'] * 100) if item['total'] > 0 else 0, 
            2
        )
    
    return Response({
        'ville': ville or 'Toutes',
        'disponibilite_par_groupe': list(disponibilite),
        'total_donneurs_actifs': query.count()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_with_recommendations(request):
    """Prédictions avec recommandations intelligentes"""
    ville = request.data.get('ville', 'Tunis')
    
    predictor = BloodDemandPredictor()
    predictions = predictor.predict_all_groups(ville)
    
    if not predictions:
        return Response({
            'error': 'Impossible de faire les prédictions. Entraînez d\'abord le modèle.',
            'action_required': 'train_model'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Générer des recommandations
    recommendations = []
    
    for groupe, quantite in predictions.items():
        if quantite >= 8:
            recommendations.append({
                'groupe': groupe,
                'action': 'Lancer une campagne urgente',
                'priorite': 'Critique',
                'quantite_predite': quantite,
                'message': f'Demande élevée prévue pour {groupe} ({quantite} unités). Action immédiate requise.'
            })
        elif quantite >= 5:
            recommendations.append({
                'groupe': groupe,
                'action': 'Contacter les donneurs',
                'priorite': 'Moyenne',
                'quantite_predite': quantite,
                'message': f'Demande modérée pour {groupe} ({quantite} unités). Prévoir une collecte.'
            })
    
    # Vérifier la disponibilité des donneurs
    donneurs_disponibles = Donneur.objects.filter(
        ville=ville,
        actif=True,
        eligible=True
    ).values('groupe_sanguin').annotate(count=Count('id'))
    
    disponibilite = {d['groupe_sanguin']: d['count'] for d in donneurs_disponibles}
    
    return Response({
        'ville': ville,
        'predictions': predictions,
        'recommendations': recommendations,
        'donneurs_disponibles': disponibilite,
        'date_prediction': datetime.now().strftime('%Y-%m-%d')
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_demand_trends(request):
    """Analyse les tendances de demande sur plusieurs périodes"""
    groupe_sanguin = request.query_params.get('groupe_sanguin')
    ville = request.query_params.get('ville')
    
    # Derniers 7, 30 et 90 jours
    periods = [7, 30, 90]
    trends = {}
    
    for days in periods:
        date_limite = datetime.now() - timedelta(days=days)
        query = DemandeUrgente.objects.filter(date_demande__gte=date_limite)
        
        if groupe_sanguin:
            query = query.filter(groupe_sanguin=groupe_sanguin)
        if ville:
            query = query.filter(hopital__ville=ville)
        
        stats = query.aggregate(
            total=Count('id'),
            quantite_totale=Sum('quantite'),
            urgentes=Count('id', filter=Q(est_urgente=True))
        )
        
        trends[f'{days}_jours'] = {
            'total_demandes': stats['total'] or 0,
            'quantite_totale': stats['quantite_totale'] or 0,
            'demandes_urgentes': stats['urgentes'] or 0,
            'moyenne_par_jour': round((stats['quantite_totale'] or 0) / days, 2)
        }
    
    return Response({
        'groupe_sanguin': groupe_sanguin or 'Tous',
        'ville': ville or 'Toutes',
        'tendances': trends
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simulate_shortage_scenario(request):
    """Simule un scénario de pénurie et propose des solutions"""
    ville = request.data.get('ville', 'Tunis')
    groupe_critique = request.data.get('groupe_sanguin')
    
    predictor = BloodDemandPredictor()
    
    # Prédictions actuelles
    predictions = predictor.predict_all_groups(ville)
    if not predictions:
        return Response({
            'error': 'Modèle non entraîné',
            'action_required': 'train_model'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Groupes compatibles
    compatibles = predictor.get_blood_type_compatibility(groupe_critique)
    
    # Solutions alternatives
    solutions = []
    for groupe_compatible in compatibles:
        if groupe_compatible != groupe_critique:
            pred = predictions.get(groupe_compatible, 0)
            if pred < 5:  # Stock disponible
                solutions.append({
                    'groupe_alternatif': groupe_compatible,
                    'disponibilite_estimee': pred,
                    'compatibilite': 'Totale',
                    'recommandation': f'Utiliser {groupe_compatible} comme alternative'
                })
    
    # Donneurs disponibles
    donneurs = Donneur.objects.filter(
        ville=ville,
        groupe_sanguin=groupe_critique,
        actif=True,
        eligible=True
    ).count()
    
    return Response({
        'scenario': {
            'ville': ville,
            'groupe_critique': groupe_critique,
            'demande_predite': predictions.get(groupe_critique, 0),
            'donneurs_disponibles': donneurs
        },
        'solutions_alternatives': solutions,
        'groupes_compatibles': compatibles,
        'niveau_risque': 'Élevé' if donneurs < 10 else 'Modéré' if donneurs < 20 else 'Faible'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def train_advanced_model(request):
    """Entraîne le modèle avec algorithme avancé"""
    use_gradient_boosting = request.data.get('use_gradient_boosting', False)
    
    predictor = BloodDemandPredictor()
    success = predictor.train_model(use_gradient_boosting=use_gradient_boosting)
    
    if success:
        return Response({
            'message': 'Modèle entraîné avec succès',
            'metrics': predictor.model_metrics,
            'model_type': predictor.model_metrics.get('model_type'),
            'status': 'success'
        })
    else:
        return Response({
            'message': 'Pas assez de données pour entraîner le modèle',
            'status': 'error'
        }, status=status.HTTP_400_BAD_REQUEST)
