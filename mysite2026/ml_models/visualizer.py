import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import io
import base64
from datetime import datetime, timedelta
from miniprojet.models import DemandeUrgente, Don
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate

sns.set_style('whitegrid')


class BloodDataVisualizer:
    def __init__(self):
        self.colors = {
            'A+': '#FF6B6B', 'A-': '#FFB6B6',
            'B+': '#4ECDC4', 'B-': '#95E1D3',
            'AB+': '#F38181', 'AB-': '#FFCCCC',
            'O+': '#AA96DA', 'O-': '#C5B9E5',
        }
    
    def plot_to_base64(self, fig):
        """Convertit un graphique matplotlib en base64"""
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.read()).decode()
        plt.close(fig)
        return f"data:image/png;base64,{image_base64}"
    
    def generate_demand_by_blood_type(self, days=30):
        """Graphique de demande par groupe sanguin"""
        date_limite = datetime.now() - timedelta(days=days)
        
        data = DemandeUrgente.objects.filter(
            date_demande__gte=date_limite
        ).values('groupe_sanguin').annotate(
            total=Sum('quantite')
        ).order_by('-total')
        
        df = pd.DataFrame(data)
        if df.empty:
            return None
        
        fig, ax = plt.subplots(figsize=(10, 6))
        colors = [self.colors.get(g, '#999999') for g in df['groupe_sanguin']]
        ax.bar(df['groupe_sanguin'], df['total'], color=colors)
        ax.set_xlabel('Groupe Sanguin', fontsize=12)
        ax.set_ylabel('Quantité Totale', fontsize=12)
        ax.set_title(f'Demande par Groupe Sanguin ({days} derniers jours)', fontsize=14)
        
        return self.plot_to_base64(fig)
    
    def generate_demand_timeline(self, groupe_sanguin=None, days=30):
        """Graphique de l'évolution temporelle de la demande"""
        date_limite = datetime.now() - timedelta(days=days)
        
        queryset = DemandeUrgente.objects.filter(date_demande__gte=date_limite)
        if groupe_sanguin:
            queryset = queryset.filter(groupe_sanguin=groupe_sanguin)
        
        data = queryset.annotate(
            date=TruncDate('date_demande')
        ).values('date').annotate(
            total=Sum('quantite')
        ).order_by('date')
        
        df = pd.DataFrame(data)
        if df.empty:
            return None
        
        fig, ax = plt.subplots(figsize=(12, 6))
        ax.plot(df['date'], df['total'], marker='o', linewidth=2, markersize=6)
        ax.fill_between(df['date'], df['total'], alpha=0.3)
        ax.set_xlabel('Date', fontsize=12)
        ax.set_ylabel('Quantité', fontsize=12)
        title = f'Évolution de la Demande'
        if groupe_sanguin:
            title += f' - {groupe_sanguin}'
        ax.set_title(title, fontsize=14)
        plt.xticks(rotation=45)
        
        return self.plot_to_base64(fig)
    
    def generate_prediction_comparison(self, predictions, historical_avg):
        """Compare les prédictions avec les moyennes historiques"""
        groupes = list(predictions.keys())
        pred_values = list(predictions.values())
        hist_values = [historical_avg.get(g, 0) for g in groupes]
        
        fig, ax = plt.subplots(figsize=(12, 6))
        x = range(len(groupes))
        width = 0.35
        
        ax.bar([i - width/2 for i in x], hist_values, width, label='Moyenne Historique', alpha=0.8)
        ax.bar([i + width/2 for i in x], pred_values, width, label='Prédiction', alpha=0.8)
        
        ax.set_xlabel('Groupe Sanguin', fontsize=12)
        ax.set_ylabel('Quantité', fontsize=12)
        ax.set_title('Prédictions vs Historique', fontsize=14)
        ax.set_xticks(x)
        ax.set_xticklabels(groupes)
        ax.legend()
        
        return self.plot_to_base64(fig)
    
    def generate_city_heatmap(self, days=30):
        """Heatmap de la demande par ville et groupe sanguin"""
        date_limite = datetime.now() - timedelta(days=days)
        
        data = DemandeUrgente.objects.filter(
            date_demande__gte=date_limite
        ).values('hopital__ville', 'groupe_sanguin').annotate(
            total=Sum('quantite')
        )
        
        df = pd.DataFrame(data)
        if df.empty:
            return None
        
        pivot = df.pivot_table(
            values='total',
            index='hopital__ville',
            columns='groupe_sanguin',
            fill_value=0
        )
        
        fig, ax = plt.subplots(figsize=(10, 6))
        sns.heatmap(pivot, annot=True, fmt='.0f', cmap='YlOrRd', ax=ax)
        ax.set_title(f'Demande par Ville et Groupe Sanguin ({days} jours)', fontsize=14)
        ax.set_xlabel('Groupe Sanguin', fontsize=12)
        ax.set_ylabel('Ville', fontsize=12)
        
        return self.plot_to_base64(fig)
    
    def generate_donation_vs_demand(self, days=30):
        """Compare les dons et les demandes"""
        date_limite = datetime.now() - timedelta(days=days)
        
        demandes = DemandeUrgente.objects.filter(
            date_demande__gte=date_limite
        ).values('groupe_sanguin').annotate(total=Sum('quantite'))
        
        dons = Don.objects.filter(
            date_don__gte=date_limite
        ).values('donneur__groupe_sanguin').annotate(total=Count('id'))
        
        df_demandes = pd.DataFrame(demandes).rename(columns={'total': 'demandes'})
        df_dons = pd.DataFrame(dons).rename(
            columns={'donneur__groupe_sanguin': 'groupe_sanguin', 'total': 'dons'}
        )
        
        df = pd.merge(df_demandes, df_dons, on='groupe_sanguin', how='outer').fillna(0)
        
        if df.empty:
            return None
        
        fig, ax = plt.subplots(figsize=(12, 6))
        x = range(len(df))
        width = 0.35
        
        ax.bar([i - width/2 for i in x], df['demandes'], width, label='Demandes', color='#FF6B6B')
        ax.bar([i + width/2 for i in x], df['dons'], width, label='Dons', color='#4ECDC4')
        
        ax.set_xlabel('Groupe Sanguin', fontsize=12)
        ax.set_ylabel('Quantité', fontsize=12)
        ax.set_title('Dons vs Demandes', fontsize=14)
        ax.set_xticks(x)
        ax.set_xticklabels(df['groupe_sanguin'])
        ax.legend()
        
        return self.plot_to_base64(fig)
