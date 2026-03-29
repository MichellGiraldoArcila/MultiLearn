"""
Cache de recomendaciones por usuario. Se invalida al cambiar favoritos.
"""
_recommendation_cache = {}  # user_id -> payload (dict con user, recommendations)


def get_cached_recommendations(user_id):
    return _recommendation_cache.get(user_id)


def set_cached_recommendations(user_id, payload):
    _recommendation_cache[user_id] = payload


def invalidate_cache_for_user(user_id):
    _recommendation_cache.pop(user_id, None)
