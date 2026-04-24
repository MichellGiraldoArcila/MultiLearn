# Generated manually: preferences JSONField, migrate desde interests

from django.db import migrations, models


def default_preferences():
    return {'interests': [], 'level': '', 'goal': ''}


def forwards_interests_to_preferences(apps, schema_editor):
    User = apps.get_model('users', 'User')
    for u in User.objects.all():
        prefs = default_preferences()
        raw = getattr(u, 'interests', None)
        if isinstance(raw, list) and raw:
            prefs['interests'] = [str(x).lower().strip() for x in raw if x]
        u.preferences = prefs
        u.save(update_fields=['preferences'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='preferences',
            field=models.JSONField(
                blank=True,
                default=default_preferences,
                help_text='interests (lista de tags), level, goal',
                verbose_name='preferencias',
            ),
        ),
        migrations.RunPython(forwards_interests_to_preferences, noop_reverse),
        migrations.RemoveField(
            model_name='user',
            name='interests',
        ),
    ]
