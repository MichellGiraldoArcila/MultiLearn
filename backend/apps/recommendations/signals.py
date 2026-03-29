"""
Invalida el cache de recomendaciones cuando el usuario cambia sus favoritos.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.courses.models import Favorite
from .cache import invalidate_cache_for_user


@receiver(post_save, sender=Favorite)
def favorite_saved(sender, instance, **kwargs):
    invalidate_cache_for_user(instance.user_id)


@receiver(post_delete, sender=Favorite)
def favorite_deleted(sender, instance, **kwargs):
    invalidate_cache_for_user(instance.user_id)
