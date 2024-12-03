# Generated by Django 5.1.3 on 2024-12-03 15:09

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0012_hive_playlist_url'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hive',
            name='creator',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='hives', to=settings.AUTH_USER_MODEL),
        ),
    ]
