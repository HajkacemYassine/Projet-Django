import boto3
import json
import joblib
import tarfile
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SageMakerIntegration:
    def __init__(self, region='us-east-1'):
        self.region = region
        self.sagemaker_client = None
        self.sagemaker_runtime = None
        self.s3_client = None
        self.endpoint_name = 'blood-demand-predictor'
        
    def initialize_clients(self, aws_access_key=None, aws_secret_key=None):
        """Initialise les clients AWS"""
        try:
            if aws_access_key and aws_secret_key:
                self.sagemaker_client = boto3.client(
                    'sagemaker',
                    region_name=self.region,
                    aws_access_key_id=aws_access_key,
                    aws_secret_access_key=aws_secret_key
                )
                self.sagemaker_runtime = boto3.client(
                    'sagemaker-runtime',
                    region_name=self.region,
                    aws_access_key_id=aws_access_key,
                    aws_secret_access_key=aws_secret_key
                )
                self.s3_client = boto3.client(
                    's3',
                    region_name=self.region,
                    aws_access_key_id=aws_access_key,
                    aws_secret_access_key=aws_secret_key
                )
            else:
                self.sagemaker_client = boto3.client('sagemaker', region_name=self.region)
                self.sagemaker_runtime = boto3.client('sagemaker-runtime', region_name=self.region)
                self.s3_client = boto3.client('s3', region_name=self.region)
            return True
        except Exception as e:
            logger.error(f"Erreur initialisation AWS: {e}")
            return False
    
    def package_model(self, model_path, output_path='model.tar.gz'):
        """Package le modèle pour SageMaker"""
        try:
            with tarfile.open(output_path, 'w:gz') as tar:
                tar.add(model_path, arcname='model.pkl')
            return output_path
        except Exception as e:
            logger.error(f"Erreur packaging modèle: {e}")
            return None
    
    def upload_to_s3(self, file_path, bucket_name, s3_key):
        """Upload le modèle vers S3"""
        try:
            self.s3_client.upload_file(file_path, bucket_name, s3_key)
            s3_uri = f"s3://{bucket_name}/{s3_key}"
            logger.info(f"Modèle uploadé: {s3_uri}")
            return s3_uri
        except Exception as e:
            logger.error(f"Erreur upload S3: {e}")
            return None
    
    def create_model(self, model_name, model_data_url, role_arn):
        """Crée un modèle SageMaker"""
        try:
            response = self.sagemaker_client.create_model(
                ModelName=model_name,
                PrimaryContainer={
                    'Image': f'683313688378.dkr.ecr.{self.region}.amazonaws.com/sagemaker-scikit-learn:1.0-1-cpu-py3',
                    'ModelDataUrl': model_data_url,
                },
                ExecutionRoleArn=role_arn
            )
            logger.info(f"Modèle créé: {model_name}")
            return response
        except Exception as e:
            logger.error(f"Erreur création modèle: {e}")
            return None
    
    def create_endpoint_config(self, config_name, model_name, instance_type='ml.t2.medium'):
        """Crée une configuration d'endpoint"""
        try:
            response = self.sagemaker_client.create_endpoint_config(
                EndpointConfigName=config_name,
                ProductionVariants=[{
                    'VariantName': 'AllTraffic',
                    'ModelName': model_name,
                    'InitialInstanceCount': 1,
                    'InstanceType': instance_type,
                }]
            )
            logger.info(f"Config endpoint créée: {config_name}")
            return response
        except Exception as e:
            logger.error(f"Erreur création config: {e}")
            return None
    
    def create_endpoint(self, endpoint_name, config_name):
        """Crée un endpoint SageMaker"""
        try:
            response = self.sagemaker_client.create_endpoint(
                EndpointName=endpoint_name,
                EndpointConfigName=config_name
            )
            logger.info(f"Endpoint créé: {endpoint_name}")
            return response
        except Exception as e:
            logger.error(f"Erreur création endpoint: {e}")
            return None
    
    def deploy_model(self, model_path, bucket_name, role_arn):
        """Déploie le modèle complet sur SageMaker"""
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        model_name = f"blood-demand-model-{timestamp}"
        config_name = f"blood-demand-config-{timestamp}"
        
        # Package et upload
        packaged_model = self.package_model(model_path)
        if not packaged_model:
            return None
        
        s3_key = f"models/{model_name}/model.tar.gz"
        model_data_url = self.upload_to_s3(packaged_model, bucket_name, s3_key)
        if not model_data_url:
            return None
        
        # Créer modèle, config et endpoint
        if not self.create_model(model_name, model_data_url, role_arn):
            return None
        
        if not self.create_endpoint_config(config_name, model_name):
            return None
        
        if not self.create_endpoint(self.endpoint_name, config_name):
            return None
        
        return {
            'endpoint_name': self.endpoint_name,
            'model_name': model_name,
            'status': 'deploying'
        }
    
    def predict_with_endpoint(self, features):
        """Fait une prédiction via l'endpoint SageMaker"""
        try:
            payload = json.dumps({'features': features})
            response = self.sagemaker_runtime.invoke_endpoint(
                EndpointName=self.endpoint_name,
                ContentType='application/json',
                Body=payload
            )
            result = json.loads(response['Body'].read().decode())
            return result
        except Exception as e:
            logger.error(f"Erreur prédiction endpoint: {e}")
            return None
    
    def get_endpoint_status(self):
        """Vérifie le statut de l'endpoint"""
        try:
            response = self.sagemaker_client.describe_endpoint(
                EndpointName=self.endpoint_name
            )
            return {
                'status': response['EndpointStatus'],
                'creation_time': response['CreationTime'].isoformat(),
                'last_modified': response['LastModifiedTime'].isoformat()
            }
        except Exception as e:
            logger.error(f"Erreur statut endpoint: {e}")
            return None
    
    def delete_endpoint(self):
        """Supprime l'endpoint pour économiser les coûts"""
        try:
            self.sagemaker_client.delete_endpoint(EndpointName=self.endpoint_name)
            logger.info(f"Endpoint supprimé: {self.endpoint_name}")
            return True
        except Exception as e:
            logger.error(f"Erreur suppression endpoint: {e}")
            return False
