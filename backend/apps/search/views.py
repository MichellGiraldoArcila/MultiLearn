"""
Endpoint de búsqueda inteligente con NLP.
"""
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

from .search_engine import search


class SearchView(APIView):
    """
    GET /api/search/?q=texto&category=&platform=&level=
    Devuelve cursos ordenados por relevancia (similarity_score).
    """

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        category = request.query_params.get("category", "").strip() or None
        platform = request.query_params.get("platform", "").strip() or None
        level = request.query_params.get("level", "").strip() or None

        if not q:
            return Response(
                {"query": "", "results": [], "error": "Parámetro 'q' requerido"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            results = search(query=q, category=category, platform=platform, level=level)
        except RuntimeError as e:
            return Response(
                {"query": q, "results": [], "error": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        payload = {
            "query": q,
            "results": [
                {
                    "id": course.id,
                    "title": course.title,
                    "platform": course.platform,
                    "rating": float(course.rating) if course.rating is not None else None,
                    "similarity_score": round(score, 4),
                }
                for course, score in results
            ],
        }
        return Response(payload)
