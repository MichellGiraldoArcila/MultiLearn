"""
Vistas para listar y detallar cursos.
"""
from rest_framework import generics
from .models import Course
from .serializers import CourseSerializer
from .filters import CourseFilter


class CourseListView(generics.ListAPIView):
    """GET /api/courses/ - Lista cursos con filtros category, level, platform."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filterset_class = CourseFilter


class CourseDetailView(generics.RetrieveAPIView):
    """GET /api/courses/<id>/ - Detalle de un curso."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
