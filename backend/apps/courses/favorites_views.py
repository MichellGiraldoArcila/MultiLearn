"""
Vistas para favoritos (requieren JWT).
"""
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from .models import Favorite
from .serializers import FavoriteSerializer
from core.permissions import IsOwnerOrReadOnly


class FavoriteListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/favorites/ - Listar favoritos del usuario o agregar uno."""
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('course')


class FavoriteDestroyView(generics.DestroyAPIView):
    """DELETE /api/favorites/<id>/ - Eliminar un favorito."""
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
