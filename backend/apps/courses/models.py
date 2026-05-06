"""
Modelos Course y Favorite.
"""
from django.conf import settings
from django.db import models
from django.db.models.functions import Lower


class Course(models.Model):
    id = models.BigAutoField(primary_key=True)
    title = models.CharField('título', max_length=255)
    description = models.TextField('descripción', blank=True)
    platform = models.CharField('plataforma', max_length=100)
    instructor = models.CharField('instructor', max_length=255, blank=True)
    category = models.CharField('categoría', max_length=100)
    level = models.CharField('nivel', max_length=50)
    rating = models.DecimalField('valoración', max_digits=3, decimal_places=2, null=True, blank=True)
    url = models.URLField('enlace', max_length=500, blank=True)
    image_url = models.URLField('imagen', max_length=500, blank=True)
    video_url = models.URLField(
        'video (YouTube/Vimeo)',
        max_length=500,
        blank=True,
        help_text='URL del vídeo promocional o introducción (YouTube o Vimeo).',
    )
    created_at = models.DateTimeField('fecha de creación', auto_now_add=True)

    class Meta:
        verbose_name = 'curso'
        verbose_name_plural = 'cursos'
        ordering = ['-created_at']
        indexes = [
            # ordering / paginación
            models.Index(fields=['-created_at'], name='course_created_at_desc'),
            # filtros case-insensitive (iexact) -> índices funcionales
            models.Index(Lower('category'), name='course_category_lower_idx'),
            models.Index(Lower('platform'), name='course_platform_lower_idx'),
            models.Index(Lower('level'), name='course_level_lower_idx'),
        ]

    def __str__(self):
        return self.title


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name='usuario',
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='favorited_by',
        verbose_name='curso',
    )
    created_at = models.DateTimeField('fecha de creación', auto_now_add=True)

    class Meta:
        verbose_name = 'favorito'
        verbose_name_plural = 'favoritos'
        ordering = ['-created_at']
        unique_together = [['user', 'course']]

    def __str__(self):
        return f'{self.user.email} - {self.course.title}'


class UserInteraction(models.Model):
    """Registro de interacciones (vista, favorito, clic) para recomendaciones."""
    INTERACTION_TYPES = (
        ('view', 'Vista'),
        ('favorite', 'Favorito'),
        ('click', 'Clic'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='interactions',
        verbose_name='usuario',
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='interactions',
        verbose_name='curso',
    )
    interaction_type = models.CharField(
        'tipo',
        max_length=20,
        choices=INTERACTION_TYPES,
    )
    created_at = models.DateTimeField('fecha', auto_now_add=True)

    class Meta:
        verbose_name = 'interacción'
        verbose_name_plural = 'interacciones'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.course.title} ({self.interaction_type})'
