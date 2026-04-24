"""
Procesamiento NLP bilingüe (es/en) para el motor de búsqueda.

- Detección automática del idioma (langdetect).
- Preferencia: spaCy (es_core_news_sm / en_core_web_sm) para lematización.
- Si spaCy no está instalado: fallback sin dependencias (tokens + stopwords básicas).
"""
from __future__ import annotations

import re
from typing import Literal

LanguageCode = Literal["es", "en"]

_nlp_models: dict[str, object] = {}
# Si spaCy falla al cargar un idioma, no reintentar en cada petición.
_spacy_unavailable: dict[str, bool] = {}

_STOPWORDS_ES = frozenset(
    """
    el la los las un una unos unas lo le les de del al a ante bajo cabe con contra desde
    durante en entre hacia hasta mediante para por según sin sobre tras y e ni que o u
    como cuando donde mientras quien cual cuales este esta esto estos esas están ser es
    son fue fueron ha han he hay sido si no muy más menos muy todo todos toda también
    """.split()
)

_STOPWORDS_EN = frozenset(
    """
    the a an and or but if as at by for from in into of on onto over off out up down
    with without within about above below between through during before after against
    is are was were be been being has have had having do does did doing will would
    could should may might must shall can need this that these those it its they them
    their there then than so such some any many much few more most other another not
    no nor only own same just also both each few same very what which who whom whose
    how when where why all both each few more most other some such than too very
    """.split()
)


def _get_nlp(lang: LanguageCode):
    """Carga el modelo spaCy indicado una sola vez (lazy)."""
    global _nlp_models
    if lang not in _nlp_models:
        import spacy

        model_name = "es_core_news_sm" if lang == "es" else "en_core_web_sm"
        try:
            _nlp_models[lang] = spacy.load(model_name)
        except OSError as e:
            raise RuntimeError(
                f"Modelo spaCy '{model_name}' no encontrado. "
                f"Ejecuta: python -m spacy download {model_name}"
            ) from e
    return _nlp_models[lang]


def _fallback_tokenize(normalized_lower_text: str, lang: LanguageCode) -> str:
    """Sin spaCy: quita stopwords básicas y tokeniza por espacios."""
    stops = _STOPWORDS_ES if lang == "es" else _STOPWORDS_EN
    tokens = []
    for w in normalized_lower_text.split():
        if not w or w in stops:
            continue
        if w.isalnum() or any(ch.isdigit() for ch in w):
            tokens.append(w)
    return " ".join(tokens).strip()


def detect_query_language(text: str) -> Literal["es", "en", "unknown"]:
    """
    Detecta el idioma de la consulta del usuario.

    Para textos muy cortos o ambiguos devuelve 'unknown' (el motor probará es y en).
    """
    if not text or not str(text).strip():
        return "unknown"
    raw = str(text).strip()
    if len(raw) < 4:
        return "unknown"
    try:
        from langdetect import detect, detect_langs

        candidates = detect_langs(raw)
        if candidates:
            best = candidates[0]
            code = (best.lang or "").lower()
            prob = getattr(best, "prob", 0.0) or 0.0
            if prob >= 0.40:
                if code.startswith("es"):
                    return "es"
                if code.startswith("en"):
                    return "en"
        code = detect(raw).lower()
        if code.startswith("es"):
            return "es"
        if code.startswith("en"):
            return "en"
    except Exception:
        return "unknown"
    return "unknown"


def process_text(text: str, lang: LanguageCode) -> str:
    """
    Procesa texto para búsqueda: limpia, minúsculas, stopwords, lematización si spaCy existe.
    """
    if not text or not str(text).strip():
        return ""
    raw = str(text).strip()
    raw = re.sub(r"[^\w\s]", " ", raw)
    raw = re.sub(r"\s+", " ", raw)
    raw = raw.lower()

    if _spacy_unavailable.get(lang):
        return _fallback_tokenize(raw, lang)

    try:
        nlp = _get_nlp(lang)
        doc = nlp(raw)
        tokens = []
        for token in doc:
            if token.is_stop:
                continue
            if token.is_alpha or token.is_digit:
                lemma = token.lemma_.strip().lower()
                if lemma:
                    tokens.append(lemma)
        return " ".join(tokens).strip()
    except RuntimeError:
        _spacy_unavailable[lang] = True
        return _fallback_tokenize(raw, lang)
