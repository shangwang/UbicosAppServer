# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-04-30 06:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_auto_20180430_0536'),
    ]

    operations = [
        migrations.CreateModel(
            name='ActivityIndex',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('page_number', models.IntegerField()),
                ('activity_type', models.CharField(max_length=40)),
            ],
        ),
    ]
