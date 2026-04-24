"""
Roadmap de aprendizaje: orden sugerido de cursos según preferencias y nivel.
"""
from django.db.models import Q

from apps.courses.models import Course
from apps.users.preferences_schema import default_preferences

from .recommendation_engine import _norm_course_level, _norm_user_level

MAX_ROADMAP = 12


def _serialize_course(course):
    return {
        'id': course.id,
        'title': course.title,
        'platform': course.platform,
        'category': course.category,
        'level': course.level,
        'rating': float(course.rating) if course.rating is not None else None,
    }


def build_learning_roadmap(user):
    """
    Devuelve lista ordenada de cursos y breve resumen textual.
    Prioriza: categorías de intereses → progresión de nivel (principiante primero si aplica) → rating.
    """
    prefs = user.preferences or default_preferences()
    interests = [str(t).lower().strip() for t in (prefs.get('interests') or [])]
    user_level_num = _norm_user_level(prefs)

    qs = Course.objects.all()
    if interests:
        q_obj = Q()
        for t in interests:
            q_obj |= Q(category__icontains=t)
        qs = qs.filter(q_obj)

    courses = list(qs)

    def sort_key(c):
        cl = _norm_course_level(c)
        # Si el usuario definió nivel, acercamos cursos del mismo nivel; si no, orden por dificultad creciente.
        if user_level_num:
            level_distance = abs(cl - user_level_num)
        else:
            level_distance = cl
        rating = float(c.rating) if c.rating is not None else 0.0
        return (level_distance, -rating)

    courses.sort(key=sort_key)

    steps = []
    for i, c in enumerate(courses[:MAX_ROADMAP], start=1):
        reason_parts = []
        cat = (c.category or '').lower()
        for t in interests:
            if t in cat:
                reason_parts.append(f'Alineado con tu interés «{t}»')
                break
        if user_level_num and _norm_course_level(c) == user_level_num:
            reason_parts.append('Coincide con tu nivel')
        if not reason_parts:
            reason_parts.append('Siguiente paso sugerido según catálogo y rating')
        steps.append(
            {
                'order': i,
                'course': _serialize_course(c),
                'reason': ' · '.join(reason_parts),
            }
        )

    goal = (prefs.get('goal') or '').strip()
    summary_parts = []
    if interests:
        summary_parts.append('Temas: ' + ', '.join(interests))
    if prefs.get('level'):
        summary_parts.append(f"Nivel declarado: {prefs['level']}")
    if goal:
        summary_parts.append(f'Objetivo: {goal[:120]}' + ('…' if len(goal) > 120 else ''))

    summary = '. '.join(summary_parts) if summary_parts else 'Roadmap general por categorías y progresión de nivel.'

    return {'steps': steps, 'summary': summary}
