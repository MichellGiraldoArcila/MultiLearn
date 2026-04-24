"""Constantes y valores por defecto para el JSONField `preferences`."""

ALLOWED_INTEREST_TAGS = frozenset(
    {
        'programming',
        'design',
        'cooking',
        'music',
        'business',
        'data',
        'devops',
        'languages',
        'marketing',
        'science',
    }
)

ALLOWED_LEVELS = frozenset({'beginner', 'intermediate', 'advanced', ''})


def default_preferences():
    return {
        'interests': [],
        'level': '',
        'goal': '',
    }
