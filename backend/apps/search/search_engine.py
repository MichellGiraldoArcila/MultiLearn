"""
Motor de búsqueda: dos índices TF-IDF (es / en) sobre el mismo catálogo,
similitud coseno y fusión sin duplicados.

Rendimiento:
- Los corpus se vectorizan solo al iniciar o tras invalidate_cache() (cambios en cursos).
- Por petición: 1 transformación + 1 cosine si el idioma es claro; si es 'unknown',
  se consultan ambos espacios y se toma el máximo por curso (misma lista de ids).
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from .nlp_processor import detect_query_language, process_text

# Cache compartido de cursos y dos espacios TF-IDF paralelos
_vectorizer_es = None
_matrix_es = None
_vectorizer_en = None
_matrix_en = None
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
    global _vectorizer_es, _matrix_es, _vectorizer_en, _matrix_en, _course_ids, _courses_list
    _vectorizer_es = None
    _matrix_es = None
    _vectorizer_en = None
    _matrix_en = None
    _course_ids = None
    _courses_list = None


def _ensure_vectors():
    """Construye matrices TF-IDF es + en si el cache está vacío (una pasada por catálogo)."""
    global _vectorizer_es, _matrix_es, _vectorizer_en, _matrix_en, _course_ids, _courses_list
    if _matrix_es is not None and _matrix_en is not None and _courses_list is not None:
        return
    from apps.courses.models import Course

    courses = list(Course.objects.all().order_by("id"))
    if not courses:
        empty = TfidfVectorizer()
        z = np.zeros((0, 0))
        _vectorizer_es = empty
        _matrix_es = z
        _vectorizer_en = TfidfVectorizer()
        _matrix_en = z
        _course_ids = []
        _courses_list = []
        return

    docs_es = [process_text(_build_document(c), "es") for c in courses]
    docs_en = [process_text(_build_document(c), "en") for c in courses]
    docs_es = [d or " " for d in docs_es]
    docs_en = [d or " " for d in docs_en]

    _vectorizer_es = TfidfVectorizer()
    _matrix_es = _vectorizer_es.fit_transform(docs_es)
    _vectorizer_en = TfidfVectorizer()
    _matrix_en = _vectorizer_en.fit_transform(docs_en)

    _course_ids = [c.id for c in courses]
    _courses_list = courses


def _scores_for_query(processed_query: str, lang: str) -> np.ndarray:
    """Vector de similitud por fila del corpus según idioma del preprocesamiento."""
    if lang == "es":
        vec = _vectorizer_es.transform([processed_query])
        return cosine_similarity(vec, _matrix_es).ravel()
    vec = _vectorizer_en.transform([processed_query])
    return cosine_similarity(vec, _matrix_en).ravel()


def search(query: str, category: str = None, platform: str = None, level: str = None):
    """
    Busca cursos por texto (NLP + TF-IDF + cosine similarity).
    Filtros opcionales: category, platform, level.
    Devuelve lista de (course, similarity_score) ordenada por score descendente.
    """
    _ensure_vectors()
    if _matrix_es is None or _matrix_es.shape[0] == 0:
        return []

    raw = query or ""
    lang = detect_query_language(raw)

    if lang == "unknown":
        pq_es = process_text(raw, "es") or " "
        pq_en = process_text(raw, "en") or " "
        scores = np.maximum(_scores_for_query(pq_es, "es"), _scores_for_query(pq_en, "en"))
    else:
        pq = process_text(raw, lang) or " "
        scores = _scores_for_query(pq, lang)

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
    máxima similitud coseno respecto a los cursos en reference_course_ids,
    tomando el mejor score entre los espacios es y en.

    Devuelve: dict { course_id: similarity_float }
    """
    _ensure_vectors()
    exclude = set(exclude_course_ids or [])
    if not reference_course_ids or _matrix_es is None or _matrix_es.shape[0] == 0:
        return {}
    try:
        ref_indices = [_course_ids.index(cid) for cid in reference_course_ids if cid in _course_ids]
    except ValueError:
        return {}
    if not ref_indices:
        return {}

    ref_es = _matrix_es[ref_indices]
    sims_es = cosine_similarity(_matrix_es, ref_es)
    max_es = np.max(sims_es, axis=1)

    ref_en = _matrix_en[ref_indices]
    sims_en = cosine_similarity(_matrix_en, ref_en)
    max_en = np.max(sims_en, axis=1)

    max_sim = np.maximum(max_es, max_en)

    result = {}
    for i, course in enumerate(_courses_list):
        if course.id in exclude:
            continue
        result[course.id] = float(max_sim[i])
    return result
