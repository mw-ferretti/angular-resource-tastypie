# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Song',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False, auto_created=True, verbose_name='ID')),
                ('rank', models.IntegerField(blank=True, null=True)),
                ('song', models.CharField(blank=True, null=True, max_length=200)),
                ('artist', models.CharField(blank=True, null=True, max_length=100)),
            ],
            options={
                'ordering': ['rank'],
            },
            bases=(models.Model,),
        ),
    ]
