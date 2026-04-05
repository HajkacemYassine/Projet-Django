from django.core.mail import send_mail
from django.conf import settings
from miniprojet.models import Hopital, DemandeUrgente
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class BloodAlertSystem:
    def __init__(self):
        self.thresholds = {
            'O+': 8,
            'O-': 5,
            'A+': 7,
            'A-': 4,
            'B+': 6,
            'B-': 3,
            'AB+': 5,
            'AB-': 2,
        }
    
    def check_critical_demand(self, predictions, ville):
        """Vérifie si les prédictions dépassent les seuils critiques"""
        alerts = []
        
        for groupe, quantite in predictions.items():
            threshold = self.thresholds.get(groupe, 5)
            if quantite >= threshold:
                alerts.append({
                    'groupe_sanguin': groupe,
                    'quantite_predite': quantite,
                    'seuil': threshold,
                    'niveau': 'critique' if quantite >= threshold * 1.5 else 'élevé',
                    'ville': ville
                })
        
        return alerts
    
    def send_alert_notification(self, alerts, hopital_email=None):
        """Envoie des notifications par email"""
        if not alerts:
            return
        
        message = "Alertes de demande en sang:\n\n"
        for alert in alerts:
            message += f"- {alert['groupe_sanguin']} à {alert['ville']}: "
            message += f"{alert['quantite_predite']} unités prédites "
            message += f"(seuil: {alert['seuil']}) - Niveau: {alert['niveau']}\n"
        
        try:
            send_mail(
                'Alerte: Demande élevée en sang prévue',
                message,
                settings.DEFAULT_FROM_EMAIL,
                [hopital_email] if hopital_email else [settings.ADMIN_EMAIL],
                fail_silently=False,
            )
            logger.info(f"Alerte envoyée: {len(alerts)} alertes")
        except Exception as e:
            logger.error(f"Erreur envoi email: {e}")
    
    def create_automatic_demand(self, alert):
        """Crée automatiquement une demande urgente basée sur l'alerte"""
        try:
            hopitaux = Hopital.objects.filter(ville=alert['ville'], valide=True)
            if hopitaux.exists():
                hopital = hopitaux.first()
                DemandeUrgente.objects.create(
                    hopital=hopital,
                    groupe_sanguin=alert['groupe_sanguin'],
                    quantite=alert['quantite_predite'],
                    date_demande=datetime.now().date(),
                    delai=(datetime.now() + timedelta(days=7)).date(),
                    statut='active',
                    description=f"Demande automatique générée par prédiction IA (niveau: {alert['niveau']})"
                )
                return True
        except Exception as e:
            logger.error(f"Erreur création demande auto: {e}")
        return False
    
    def get_alert_history(self, days=7):
        """Récupère l'historique des alertes"""
        date_limite = datetime.now() - timedelta(days=days)
        demandes_auto = DemandeUrgente.objects.filter(
            date_demande__gte=date_limite,
            description__contains='prédiction IA'
        ).values('groupe_sanguin', 'quantite', 'date_demande', 'ville')
        
        return list(demandes_auto)
