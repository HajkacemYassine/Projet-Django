# mysite2026/urls.py — remplacer le fichier existant

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from magasin import views as magasin_views

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── API REST (React frontend) ──────────────────────────────────────────
    path('api/', include('magasin.api_urls')),

    # ── Templates Django existants ─────────────────────────────────────────
    path('', magasin_views.accueil, name='accueil'),
    path('magasin/', include('magasin.urls')),
    path('miniprojet/', include('miniprojet.urls')),
    path('blood-api/', include('miniprojet.api_urls')),
    path('ml-api/', include('ml_models.urls')),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
