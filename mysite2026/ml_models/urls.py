from django.urls import path
from ml_models import api_views
from ml_models import api_views_advanced as advanced

urlpatterns = [
    path('train/', api_views.train_prediction_model, name='train_model'),
    path('predict/', api_views.predict_blood_demand, name='predict_demand'),
    path('predict-all/', api_views.predict_all_blood_types, name='predict_all'),
    path('statistics/', api_views.get_demand_statistics, name='demand_statistics'),
    
    # Fonctionnalités avancées
    path('predict-with-alerts/', advanced.predict_with_alerts, name='predict_alerts'),
    path('visualizations/', advanced.get_visualizations, name='visualizations'),
    path('prediction-chart/', advanced.generate_prediction_chart, name='prediction_chart'),
    path('alert-history/', advanced.get_alert_history, name='alert_history'),
    
    # AWS SageMaker
    path('sagemaker/deploy/', advanced.deploy_to_sagemaker, name='sagemaker_deploy'),
    path('sagemaker/status/', advanced.sagemaker_endpoint_status, name='sagemaker_status'),
]
