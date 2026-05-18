from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('magasin', '0009_rename_name_categorie_nom'),
    ]

    operations = [
        # Ajouter les nouveaux champs à Commande
        migrations.AddField(
            model_name='commande',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='commandes_magasin', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='commande',
            name='statut',
            field=models.CharField(choices=[('en_attente', 'En attente'), ('confirmee', 'Confirmée'), ('expediee', 'Expédiée'), ('livree', 'Livrée'), ('annulee', 'Annulée')], default='en_attente', max_length=20),
        ),
        migrations.AddField(
            model_name='commande',
            name='adresse_livraison',
            field=models.TextField(default=''),
        ),
        migrations.AddField(
            model_name='commande',
            name='telephone',
            field=models.CharField(default='', max_length=20),
        ),
        migrations.AddField(
            model_name='commande',
            name='notes',
            field=models.TextField(blank=True, default=''),
        ),
        # Créer le modèle ItemCommande
        migrations.CreateModel(
            name='ItemCommande',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantite', models.IntegerField(default=1)),
                ('prix_unitaire', models.DecimalField(decimal_places=3, max_digits=10)),
                ('commande', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='magasin.commande')),
                ('produit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='magasin.produit')),
            ],
        ),
    ]
