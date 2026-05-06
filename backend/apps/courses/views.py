"""
Vistas para listar y detallar cursos.
"""
import hashlib

from django.db.models import Max
from django.http import HttpResponseNotModified
from django.utils.decorators import method_decorator
from django.utils.http import quote_etag
from django.views.decorators.http import condition
from django.views.decorators.cache import cache_page
from rest_framework import generics
from rest_framework.response import Response
from .models import Course
from .serializers import CourseSerializer, CourseListSerializer
from .filters import CourseFilter


def _normalize_filter_param(request, key: str):
    v = (request.GET.get(key) or '').strip()
    return v or None


def _courses_filtered_queryset(request):
    qs = Course.objects.all()
    category = _normalize_filter_param(request, 'category')
    platform = _normalize_filter_param(request, 'platform')
    level = _normalize_filter_param(request, 'level')
    if category:
        qs = qs.filter(category__iexact=category)
    if platform:
        qs = qs.filter(platform__iexact=platform)
    if level:
        qs = qs.filter(level__iexact=level)
    return qs


def courses_last_modified(request, *args, **kwargs):
    """
    Last-Modified por combinación de filtros.
    Se basa en el máximo created_at del subset filtrado.
    """
    qs = _courses_filtered_queryset(request)
    return qs.aggregate(m=Max('created_at')).get('m')


def courses_etag(request, *args, **kwargs):
    """
    ETag estable (barato) basado en:
    - filtros
    - page/page_size
    - last_modified + count (captura altas/bajas)
    """
    qs = _courses_filtered_queryset(request)
    last_mod = qs.aggregate(m=Max('created_at')).get('m')
    count = qs.count()

    page = (request.GET.get('page') or '1').strip()
    page_size = (request.GET.get('page_size') or '20').strip()
    category = request.GET.get('category', '')
    platform = request.GET.get('platform', '')
    level = request.GET.get('level', '')

    raw = f'v1|p={page}|s={page_size}|c={category}|pl={platform}|l={level}|m={last_mod}|n={count}'
    digest = hashlib.sha256(raw.encode('utf-8')).hexdigest()
    return digest


class CourseListView(generics.ListAPIView):
    """GET /api/courses/ - Lista cursos con filtros category, level, platform."""
    serializer_class = CourseListSerializer
    filterset_class = CourseFilter

    # Cache por URL completa (incluye querystring: page, filtros, etc).
    # Mejora mucho TTFB en listados repetidos.
    @method_decorator(condition(etag_func=courses_etag, last_modified_func=courses_last_modified))
    @method_decorator(cache_page(60))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get_queryset(self):
        # No hay relaciones FK/M2M en Course -> no aplica select_related/prefetch_related.
        # Usamos only() para reducir lectura desde DB y transferencia.
        return (
            Course.objects.only(
                'id',
                'title',
                'platform',
                'category',
                'level',
                'rating',
                'image_url',
                'video_url',
                'created_at',  # requerido para ordering por default
            )
            .all()
        )

    def list(self, request, *args, **kwargs):
        # Soporte explícito para 304 cuando viene If-None-Match/If-Modified-Since.
        # (condition() suele cubrirlo, pero esto evita trabajo si entra por aquí).
        inm = request.META.get('HTTP_IF_NONE_MATCH')
        etag = courses_etag(request, *args, **kwargs)
        if inm and inm.strip('"') == etag:
            return HttpResponseNotModified()

        response = super().list(request, *args, **kwargs)
        # Headers de caching para navegador/CDN.
        response['Cache-Control'] = 'public, max-age=60, stale-while-revalidate=120'
        response['ETag'] = quote_etag(etag)
        last_mod = courses_last_modified(request, *args, **kwargs)
        if last_mod is not None:
            response['Last-Modified'] = last_mod.strftime('%a, %d %b %Y %H:%M:%S GMT')
        return response


class CourseDetailView(generics.RetrieveAPIView):
    """GET /api/courses/<id>/ - Detalle de un curso."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
