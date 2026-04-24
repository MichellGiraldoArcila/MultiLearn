"""Rutas de administración de cursos (prefijo api/admin/courses/)."""
from django.urls import path

from .admin_views import CourseAdminListCreateView, CourseAdminDetailView

urlpatterns = [
    path('', CourseAdminListCreateView.as_view(), name='admin_course_list_create'),
    path('<int:pk>/', CourseAdminDetailView.as_view(), name='admin_course_detail'),
]
