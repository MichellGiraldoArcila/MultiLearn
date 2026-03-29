"""
Señales para invalidar el cache del motor de búsqueda cuando cambian los cursos.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Course


def _invalidate_search_cache():
    try:
        from apps.search.search_engine import invalidate_cache
        invalidate_cache()
    except Exception:
        pass


@receiver(post_save, sender=Course)
def course_saved(sender, instance, **kwargs):
    _invalidate_search_cache()


@receiver(post_delete, sender=Course)
def course_deleted(sender, instance, **kwargs):
    _invalidate_search_cache()
