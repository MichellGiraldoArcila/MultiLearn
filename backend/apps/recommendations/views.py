"""
GET /api/recommendations/ - Recomendaciones personalizadas (JWT obligatorio).
GET /api/recommendations/roadmap/ - Roadmap de aprendizaje.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .recommendation_engine import get_recommendations_for_user
from .roadmap import build_learning_roadmap
from .cache import get_cached_recommendations, set_cached_recommendations


class RecommendationsView(APIView):
    """GET /api/recommendations/ - Hasta 10 cursos recomendados para el usuario."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        cached = get_cached_recommendations(user.id)
        if cached is not None:
            return Response(cached)
        recommendations = get_recommendations_for_user(user)
        payload = {
            "user": user.id,
            "recommendations": [
                {
                    "id": c.id,
                    "title": c.title,
                    "platform": c.platform,
                    "rating": float(c.rating) if c.rating is not None else None,
                    "score": round(score, 4),
                }
                for c, score in recommendations
            ],
        }
        set_cached_recommendations(user.id, payload)
        return Response(payload)


class LearningRoadmapView(APIView):
    """GET /api/recommendations/roadmap/ — orden sugerido de cursos según preferencias."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = build_learning_roadmap(request.user)
        return Response(data)
