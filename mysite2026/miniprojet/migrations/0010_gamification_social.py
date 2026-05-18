# Generated migration for gamification and social features

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('miniprojet', '0009_notification'),
    ]

    operations = [
        # Mission
        migrations.CreateModel(
            name='Mission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titre', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('type_mission', models.CharField(choices=[('hebdo', 'Hebdomadaire'), ('mensuel', 'Mensuelle'), ('special', 'Spéciale')], default='hebdo', max_length=10)),
                ('objectif', models.IntegerField(help_text='Nombre requis pour compléter')),
                ('recompense_pts', models.IntegerField(default=50)),
                ('emoji', models.CharField(default='🎯', max_length=10)),
                ('date_debut', models.DateField()),
                ('date_fin', models.DateField()),
                ('statut', models.CharField(choices=[('active', 'Active'), ('terminee', 'Terminée'), ('expiree', 'Expirée')], default='active', max_length=10)),
            ],
        ),
        # ProgressionMission
        migrations.CreateModel(
            name='ProgressionMission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('progres', models.IntegerField(default=0)),
                ('completee', models.BooleanField(default=False)),
                ('date_debut', models.DateTimeField(auto_now_add=True)),
                ('date_fin', models.DateTimeField(blank=True, null=True)),
                ('donneur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='progressions', to='miniprojet.donneur')),
                ('mission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='progressions', to='miniprojet.mission')),
            ],
        ),
        migrations.AddConstraint(
            model_name='progressionmission',
            constraint=models.UniqueConstraint(fields=('donneur', 'mission'), name='unique_progression'),
        ),
        # Parrainage
        migrations.CreateModel(
            name='Parrainage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=20, unique=True)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('actif', models.BooleanField(default=True)),
                ('premier_don_fait', models.BooleanField(default=False, help_text='Le filleul a fait son 1er don')),
                ('parrain', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='filleuls', to='miniprojet.donneur')),
                ('filleul', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parrains', to='miniprojet.donneur')),
            ],
        ),
        # Equipe
        migrations.CreateModel(
            name='Equipe',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('code_invite', models.CharField(max_length=20, unique=True)),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('avatar_emoji', models.CharField(default='🏢', max_length=10)),
                ('createur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='equipes_creees', to='miniprojet.donneur')),
                ('membres', models.ManyToManyField(blank=True, related_name='equipes', to='miniprojet.donneur')),
            ],
        ),
        # Post
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type_post', models.CharField(choices=[('temoignage', '💬 Témoignage'), ('remerciement', '🙏 Remerciement'), ('annonce', '📢 Annonce'), ('celebration', '🎉 Célébration')], default='temoignage', max_length=20)),
                ('contenu', models.TextField()),
                ('image_url', models.URLField(blank=True, default='')),
                ('date_post', models.DateTimeField(auto_now_add=True)),
                ('epingle', models.BooleanField(default=False)),
                ('auteur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='posts', to=settings.AUTH_USER_MODEL)),
                ('likes', models.ManyToManyField(blank=True, related_name='posts_likes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-date_post'],
            },
        ),
        # Commentaire
        migrations.CreateModel(
            name='Commentaire',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contenu', models.TextField()),
                ('date_comment', models.DateTimeField(auto_now_add=True)),
                ('auteur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='commentaires', to='miniprojet.post')),
            ],
            options={
                'ordering': ['date_comment'],
            },
        ),
        # Story
        migrations.CreateModel(
            name='Story',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contenu', models.TextField()),
                ('image_url', models.URLField(blank=True, default='')),
                ('emoji', models.CharField(default='🩸', max_length=10)),
                ('date_story', models.DateTimeField(auto_now_add=True)),
                ('auteur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stories', to=settings.AUTH_USER_MODEL)),
                ('vues', models.ManyToManyField(blank=True, related_name='stories_vues', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-date_story'],
            },
        ),
    ]
