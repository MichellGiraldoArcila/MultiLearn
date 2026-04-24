"""
URL configuration for portal de cursos.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/courses/', include('apps.courses.urls')),
    path('api/admin/courses/', include('apps.courses.admin_urls')),
    path('api/favorites/', include('apps.courses.favorites_urls')),
    path('api/interactions/', include('apps.courses.interactions_urls')),
    path('api/search/', include('apps.search.urls')),
    path('api/recommendations/', include('apps.recommendations.urls')),
]
