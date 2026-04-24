"""
CRUD de cursos reservado a usuarios con is_staff (IsAdminUser).
"""
from rest_framework import generics
from rest_framework.permissions import IsAdminUser

from .models import Course
from .serializers import CourseSerializer


class CourseAdminListCreateView(generics.ListCreateAPIView):
    """GET lista / POST crear — requiere staff."""

    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    permission_classes = [IsAdminUser]


class CourseAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET detalle / PUT PATCH actualizar / DELETE — requiere staff."""

    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAdminUser]
