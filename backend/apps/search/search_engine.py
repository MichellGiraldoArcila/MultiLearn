"""
Motor de búsqueda: cache de vectores TF-IDF y similitud coseno.
Recalcula solo cuando cambian los cursos.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from .nlp_processor import process_text

# Cache: (vectorizer, matrix, list of course_ids, list of Course instances)
_vectorizer = None
_matrix = None
_course_ids = None
_courses_list = None


def _build_document(course) -> str:
    """Construye el texto a vectorizar: título + descripción + categoría."""
    parts = [
        getattr(course, "title", "") or "",
        getattr(course, "description", "") or "",
        getattr(course, "category", "") or "",
    ]
    return " ".join(parts).strip()


def invalidate_cache():
    """Invalida el cache de vectores (llamar cuando se crean/actualizan/eliminan cursos)."""
    global _vectorizer, _matrix, _course_ids, _courses_list
    _vectorizer = None
    _matrix = None
    _course_ids = None
    _courses_list = None


def _ensure_vectors():
    """Construye vectores TF-IDF si el cache está vacío."""
    global _vectorizer, _matrix, _course_ids, _courses_list
    if _matrix is not None and _courses_list is not None:
        return
    from apps.courses.models import Course
    courses = list(Course.objects.all().order_by("id"))
    if not courses:
        _vectorizer = TfidfVectorizer()
        _matrix = np.zeros((0, 0))
        _course_ids = []
        _courses_list = []
        return
    documents = [process_text(_build_document(c)) for c in courses]
    # Evitar vacíos para que TfidfVectorizer no falle
    documents = [d or " " for d in documents]
    _vectorizer = TfidfVectorizer()
    _matrix = _vectorizer.fit_transform(documents)
    _course_ids = [c.id for c in courses]
    _courses_list = courses


def search(query: str, category: str = None, platform: str = None, level: str = None):
    """
    Busca cursos por texto (NLP + TF-IDF + cosine similarity).
    Filtros opcionales: category, platform, level.
    Devuelve lista de (course, similarity_score) ordenada por score descendente.
    """
    _ensure_vectors()
    if _matrix is None or _matrix.shape[0] == 0:
        return []
    processed_query = process_text(query or "")
    if not processed_query.strip():
        processed_query = " "
    query_vec = _vectorizer.transform([processed_query])
    scores = cosine_similarity(query_vec, _matrix).ravel()
    results = []
    for i, course in enumerate(_courses_list):
        if category and (getattr(course, "category", "") or "").lower() != category.lower():
            continue
        if platform and (getattr(course, "platform", "") or "").lower() != platform.lower():
            continue
        if level and (getattr(course, "level", "") or "").lower() != level.lower():
            continue
        results.append((course, float(scores[i])))
    results.sort(key=lambda x: -x[1])
    return results


def get_similarity_to_favorites(reference_course_ids, exclude_course_ids=None):
    """
    Para cada curso del corpus (excluyendo exclude_course_ids), devuelve la
    máxima similitud coseno respecto a los cursos en reference_course_ids.
    Útil para recomendaciones content-based.
    Devuelve: dict { course_id: similarity_float }
    """
    _ensure_vectors()
    exclude = set(exclude_course_ids or [])
    if not reference_course_ids or _matrix is None or _matrix.shape[0] == 0:
        return {}
    try:
        ref_indices = [_course_ids.index(cid) for cid in reference_course_ids if cid in _course_ids]
    except ValueError:
        return {}
    if not ref_indices:
        return {}
    ref_matrix = _matrix[ref_indices]
    sims = cosine_similarity(_matrix, ref_matrix)
    max_sim = np.max(sims, axis=1)
    result = {}
    for i, course in enumerate(_courses_list):
        if course.id in exclude:
            continue
        result[course.id] = float(max_sim[i])
    return result
