"""
Filtros para la API de cursos.
"""
import django_filters
from .models import Course


class CourseFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category', lookup_expr='iexact')
    level = django_filters.CharFilter(field_name='level', lookup_expr='iexact')
    platform = django_filters.CharFilter(field_name='platform', lookup_expr='iexact')

    class Meta:
        model = Course
        fields = ['category', 'level', 'platform']
