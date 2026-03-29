"""
Procesamiento NLP para el motor de búsqueda.
Limpia texto, convierte a minúsculas, elimina stopwords y lematiza.
"""
import re

_nlp = None


def _get_nlp():
    """Carga el modelo spaCy una sola vez (lazy)."""
    global _nlp
    if _nlp is None:
        import spacy
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            raise RuntimeError(
                "Modelo spaCy 'en_core_web_sm' no encontrado. "
                "Ejecuta: python -m spacy download en_core_web_sm"
            )
    return _nlp


def process_text(text: str) -> str:
    """
    Procesa texto para búsqueda: limpia, minúsculas, quita stopwords, lematiza.

    Ejemplo:
        Input:  "Learning Python programming for beginners"
        Output: "learn python program beginner"
    """
    if not text or not str(text).strip():
        return ""
    text = str(text).strip()
    # Limpiar: solo letras, números y espacios
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    text = text.lower()
    nlp = _get_nlp()
    doc = nlp(text)
    tokens = []
    for token in doc:
        if token.is_stop:
            continue
        if token.is_alpha or token.is_digit:
            tokens.append(token.lemma_)
    return " ".join(tokens).strip()
