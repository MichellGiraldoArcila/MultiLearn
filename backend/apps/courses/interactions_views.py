"""
POST /api/interactions/ - Registrar vista, clic o favorito (para recomendaciones).
"""
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import UserInteraction
from .interactions_serializers import UserInteractionSerializer


class UserInteractionCreateView(generics.CreateAPIView):
    """POST /api/interactions/ - Crear interacción (view, favorite, click)."""
    queryset = UserInteraction.objects.all()
    serializer_class = UserInteractionSerializer
    permission_classes = [IsAuthenticated]
