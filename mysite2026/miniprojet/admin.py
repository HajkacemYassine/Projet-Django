from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Donneur)
admin.site.register(Hopital)
admin.site.register(Don)
admin.site.register(DemandeUrgente)
admin.site.register(Campagne)
admin.site.register(Inscription)
admin.site.register(Reponse_Appel)
admin.site.register(DonneeSante)

# Chatbot
admin.site.register(ConversationChatbot)
admin.site.register(MessageChatbot)

# Prédiction Stock
@admin.register(StockSang)
class StockSangAdmin(admin.ModelAdmin):
    list_display = ('groupe_sanguin', 'quantite_actuelle', 'niveau_stock', 'seuil_alerte', 'seuil_critique', 'date_maj')
    list_filter = ('groupe_sanguin',)
    search_fields = ('groupe_sanguin',)

@admin.register(PredictionStock)
class PredictionStockAdmin(admin.ModelAdmin):
    list_display = ('groupe_sanguin', 'date_prediction', 'quantite_predite', 'confiance', 'date_calcul')
    list_filter = ('groupe_sanguin', 'date_prediction')
    search_fields = ('groupe_sanguin',)
    ordering = ('-date_prediction',)
