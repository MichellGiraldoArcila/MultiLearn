"""
Motor de recomendaciones híbrido (interacciones + preferencias explícitas):
  score = w_sim * sim + w_cat * cat + w_pop * pop + w_lvl * level + w_goal * goal
"""
from collections import Counter

from django.db.models import Count, Q

from apps.courses.models import Course, Favorite, UserInteraction
from apps.search.search_engine import get_similarity_to_favorites
from apps.users.preferences_schema import default_preferences

WEIGHT_SIMILARITY = 0.52
WEIGHT_CATEGORY = 0.30
WEIGHT_POPULARITY = 0.10
WEIGHT_LEVEL = 0.05
WEIGHT_GOAL = 0.03

BLEND_IMPLICIT = 0.55
BLEND_EXPLICIT = 0.45

MAX_RECOMMENDATIONS = 10


def _get_user_favorite_course_ids(user):
    return list(Favorite.objects.filter(user=user).values_list('course_id', flat=True))


def _get_category_preference_weights(user):
    fav_cats = list(
        Favorite.objects.filter(user=user).values_list('course__category', flat=True)
    )
    view_cats = list(
        UserInteraction.objects.filter(user=user, interaction_type='view').values_list(
            'course__category', flat=True
        )
    )
    counts = Counter((c or '').strip().lower() for c in fav_cats + view_cats if c)
    if not counts:
        return {}
    total = sum(counts.values())
    return {cat: count / total for cat, count in counts.items()}


def _explicit_category_weights(user):
    prefs = user.preferences or default_preferences()
    tags = prefs.get('interests') or []
    if not tags:
        return {}
    n = len(tags)
    return {str(t).lower().strip(): 1.0 / n for t in tags}


def _blend_category_weights(implicit, explicit):
    if not implicit:
        return explicit
    if not explicit:
        return implicit
    keys = set(implicit) | set(explicit)
    out = {}
    for k in keys:
        out[k] = BLEND_IMPLICIT * implicit.get(k, 0.0) + BLEND_EXPLICIT * explicit.get(k, 0.0)
    s = sum(out.values())
    if s <= 0:
        return implicit
    for k in out:
        out[k] /= s
    return out


def _course_explicit_category_score(course, explicit_w):
    if not explicit_w:
        return 0.0
    cat_key = (course.category or '').strip().lower()
    if cat_key in explicit_w:
        return explicit_w[cat_key]
    best = 0.0
    for tag, w in explicit_w.items():
        if tag in cat_key or cat_key in tag:
            best = max(best, w * 0.85)
    return best


def _norm_course_level(course):
    l = (course.level or '').lower()
    if 'begin' in l:
        return 1
    if 'inter' in l:
        return 2
    if 'advanc' in l:
        return 3
    return 2


def _norm_user_level(prefs):
    ul = (prefs.get('level') or '').lower()
    if ul == 'beginner':
        return 1
    if ul == 'intermediate':
        return 2
    if ul == 'advanced':
        return 3
    return 0


def _level_match_score(user, course):
    prefs = user.preferences or default_preferences()
    u = _norm_user_level(prefs)
    c = _norm_course_level(course)
    if u == 0:
        return 0.5
    diff = abs(u - c)
    return max(0.0, 1.0 - 0.35 * diff)


def _goal_match_score(user, course):
    prefs = user.preferences or default_preferences()
    goal = (prefs.get('goal') or '').strip().lower()
    if len(goal) < 3:
        return 0.0
    tokens = [t for t in goal.replace(',', ' ').split() if len(t) > 2]
    if not tokens:
        return 0.0
    blob = f'{(course.title or "")} {(course.description or "")} {(course.category or "")}'.lower()
    hits = sum(1 for t in tokens if t in blob)
    return min(1.0, hits / max(len(tokens), 1))


def _get_popularity_scores():
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


def _cold_start_with_preferences(user, favorite_ids, pop_scores):
    """Sin favoritos: prioriza categorías de intereses y popularidad."""
    prefs = user.preferences or default_preferences()
    tags = [str(t).lower().strip() for t in (prefs.get('interests') or [])]
    base_qs = Course.objects.exclude(id__in=favorite_ids)
    qs = base_qs
    if tags:
        q_obj = Q()
        for t in tags:
            q_obj |= Q(category__icontains=t)
        filtered = base_qs.filter(q_obj)
        if filtered.exists():
            qs = filtered
    explicit_w = _explicit_category_weights(user)
    scored = []
    for course in qs:
        cat_part = _course_explicit_category_score(course, explicit_w) if explicit_w else 0.3
        pop = pop_scores.get(course.id, 0.0)
        lvl = _level_match_score(user, course)
        goal = _goal_match_score(user, course)
        score = (
            0.45 * cat_part
            + 0.40 * pop
            + 0.10 * lvl
            + 0.05 * goal
        )
        scored.append((course, score))
    scored.sort(key=lambda x: -x[1])
    if not scored:
        courses = list(
            Course.objects.exclude(id__in=favorite_ids).order_by('-rating')[:MAX_RECOMMENDATIONS]
        )
        return [(c, float(c.rating or 0)) for c in courses]
    return scored[:MAX_RECOMMENDATIONS]


def get_recommendations_for_user(user):
    """
    Lista de (course, score) ordenada por score descendente, máx 10.
    """
    favorite_ids = set(_get_user_favorite_course_ids(user))
    pop_scores = _get_popularity_scores()

    if not favorite_ids:
        return _cold_start_with_preferences(user, favorite_ids, pop_scores)

    sim_scores = get_similarity_to_favorites(
        list(favorite_ids),
        exclude_course_ids=list(favorite_ids),
    )
    implicit_cat = _get_category_preference_weights(user)
    explicit_cat = _explicit_category_weights(user)
    cat_weights = _blend_category_weights(implicit_cat, explicit_cat)

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
        if cat_score == 0.0 and explicit_cat:
            cat_score = _course_explicit_category_score(course, explicit_cat)
        pop = pop_scores.get(course_id, 0.0)
        sim_norm = sim / max_sim if max_sim else 0.0
        lvl = _level_match_score(user, course)
        goal = _goal_match_score(user, course)
        score = (
            WEIGHT_SIMILARITY * sim_norm
            + WEIGHT_CATEGORY * cat_score
            + WEIGHT_POPULARITY * pop
            + WEIGHT_LEVEL * lvl
            + WEIGHT_GOAL * goal
        )
        scored.append((course, score))

    scored.sort(key=lambda x: -x[1])
    return scored[:MAX_RECOMMENDATIONS]
