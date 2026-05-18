from django.urls import path
from ml_models import api_views
from ml_models import api_views_advanced as advanced
from ml_models import api_views_enhanced as enhanced

urlpatterns = [
    # Fonctionnalités de base
    path('train/', api_views.train_prediction_model, name='train_model'),
    path('predict/', api_views.predict_blood_demand, name='predict_demand'),
    path('predict-all/', api_views.predict_all_blood_types, name='predict_all'),
    path('statistics/', api_views.get_demand_statistics, name='demand_statistics'),
    
    # Fonctionnalités avancées (alertes et visualisations)
    path('predict-with-alerts/', advanced.predict_with_alerts, name='predict_alerts'),
    path('visualizations/', advanced.get_visualizations, name='visualizations'),
    path('prediction-chart/', advanced.generate_prediction_chart, name='prediction_chart'),
    path('alert-history/', advanced.get_alert_history, name='alert_history'),
    
    # Nouvelles fonctionnalités améliorées
    path('train-advanced/', enhanced.train_advanced_model, name='train_advanced'),
    path('predict-week/', enhanced.predict_next_week, name='predict_week'),
    path('model-performance/', enhanced.get_model_performance, name='model_performance'),
    path('optimize-stock/', enhanced.optimize_stock, name='optimize_stock'),
    path('donor-availability/', enhanced.get_donor_availability, name='donor_availability'),
    path('predict-recommendations/', enhanced.predict_with_recommendations, name='predict_recommendations'),
    path('demand-trends/', enhanced.get_demand_trends, name='demand_trends'),
    path('simulate-shortage/', enhanced.simulate_shortage_scenario, name='simulate_shortage'),
    
    # AWS SageMaker
    path('sagemaker/deploy/', advanced.deploy_to_sagemaker, name='sagemaker_deploy'),
    path('sagemaker/status/', advanced.sagemaker_endpoint_status, name='sagemaker_status'),
]
