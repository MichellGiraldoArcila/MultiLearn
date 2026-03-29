"""
Motor de recomendaciones híbrido:
  score = 0.6 * similarity_score + 0.3 * category_preference + 0.1 * popularity_score
"""
from collections import Counter
from django.db.models import Count

from apps.courses.models import Course, Favorite, UserInteraction
from apps.search.search_engine import get_similarity_to_favorites

# Pesos del algoritmo híbrido
WEIGHT_SIMILARITY = 0.6
WEIGHT_CATEGORY = 0.3
WEIGHT_POPULARITY = 0.1

MAX_RECOMMENDATIONS = 10


def _get_user_favorite_course_ids(user):
    return list(Favorite.objects.filter(user=user).values_list('course_id', flat=True))


def _get_category_preference_weights(user):
    """
    Categorías más frecuentes en favoritos e interacciones del usuario.
    Devuelve dict category_lower -> peso en [0, 1].
    """
    fav_cats = list(
        Favorite.objects.filter(user=user)
        .values_list('course__category', flat=True)
    )
    view_cats = list(
        UserInteraction.objects.filter(user=user, interaction_type='view')
        .values_list('course__category', flat=True)
    )
    counts = Counter((c or '').strip().lower() for c in fav_cats + view_cats if c)
    if not counts:
        return {}
    total = sum(counts.values())
    return {cat: count / total for cat, count in counts.items()}


def _get_popularity_scores():
    """
    Por cada curso: combinación de rating (0-1) y número de visualizaciones (0-1).
    Devuelve dict course_id -> score en [0, 1].
    """
    view_counts = dict(
        UserInteraction.objects.filter(interaction_type='view')
        .values('course_id')
        .annotate(cnt=Count('id'))
        .values_list('course_id', 'cnt')
    )
    max_views = max(view_counts.values()) if view_counts else 1
    courses = Course.objects.all()
    result = {}
    for c in courses:
        rating_norm = (float(c.rating) / 5.0) if c.rating is not None else 0.0
        views = view_counts.get(c.id, 0)
        view_norm = views / max_views
        result[c.id] = (rating_norm + view_norm) / 2.0
    return result


def get_recommendations_for_user(user):
    """
    Devuelve lista de (course, score) ordenada por score descendente, máx 10.
    Excluye cursos que el usuario ya tiene en favoritos.
    """
    favorite_ids = set(_get_user_favorite_course_ids(user))

    # Usuario nuevo: sin favoritos → cursos más populares por rating
    if not favorite_ids:
        courses = (
            Course.objects.exclude(id__in=favorite_ids)
            .order_by('-rating')
            .only('id', 'title', 'platform', 'rating')[:MAX_RECOMMENDATIONS]
        )
        return [(c, float(c.rating or 0)) for c in courses]

    # Híbrido: similarity + category + popularity
    sim_scores = get_similarity_to_favorites(
        list(favorite_ids),
        exclude_course_ids=list(favorite_ids),
    )
    cat_weights = _get_category_preference_weights(user)
    pop_scores = _get_popularity_scores()

    # Normalizar similarity a [0,1] si hay valores
    sim_values = list(sim_scores.values())
    max_sim = max(sim_values) if sim_values else 1.0

    scored = []
    for course_id, sim in sim_scores.items():
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            continue
        cat_key = (course.category or '').strip().lower()
        cat_score = cat_weights.get(cat_key, 0.0)
        pop = pop_scores.get(course_id, 0.0)
        sim_norm = sim / max_sim if max_sim else 0.0
        score = (
            WEIGHT_SIMILARITY * sim_norm
            + WEIGHT_CATEGORY * cat_score
            + WEIGHT_POPULARITY * pop
        )
        scored.append((course, score))

    scored.sort(key=lambda x: -x[1])
    return scored[:MAX_RECOMMENDATIONS]
