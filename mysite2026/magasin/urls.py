from django.urls import path,include
from . import views
urlpatterns = [
 path('', views.index, name='index'),
 path('fournisseur/', views.fournisseur, name='fournisseur'),
 path('produit/', views.produit, name='produit'),
 path('administration/', views.administration, name='administration'),
 path('catalogue/', views.catalogue, name='catalogue'),
path('catalogue/<int:categorie_id>/', views.catalogue, name='catalogue_par_categorie'),

 ]