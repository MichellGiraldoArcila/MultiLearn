# Generated manually for video_url field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0002_add_user_interaction'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='video_url',
            field=models.URLField(
                blank=True,
                help_text='URL del vídeo promocional o introducción (YouTube o Vimeo).',
                max_length=500,
                verbose_name='video (YouTube/Vimeo)',
            ),
        ),
    ]
