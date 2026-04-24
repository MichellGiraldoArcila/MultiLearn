/** Etiquetas alineadas con backend `ALLOWED_INTEREST_TAGS` */
export const INTEREST_OPTIONS = [
  { id: 'programming', label: 'Programación' },
  { id: 'design', label: 'Diseño' },
  { id: 'data', label: 'Datos' },
  { id: 'devops', label: 'DevOps' },
  { id: 'business', label: 'Negocios' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'languages', label: 'Idiomas' },
  { id: 'music', label: 'Música' },
  { id: 'cooking', label: 'Cocina' },
  { id: 'science', label: 'Ciencia' },
];

export const LEVEL_OPTIONS = [
  { id: '', label: 'Sin especificar' },
  { id: 'beginner', label: 'Principiante' },
  { id: 'intermediate', label: 'Intermedio' },
  { id: 'advanced', label: 'Avanzado' },
];

export function defaultPreferences() {
  return { interests: [], level: '', goal: '' };
}
