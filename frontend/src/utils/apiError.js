/**
 * Mensaje legible a partir de respuestas Axios + DRF/JWT (detail, campos, anidados).
 */
export function getApiErrorMessage(error, fallback = 'Ha ocurrido un error. Intenta de nuevo.') {
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado. Revisa tu conexión.';
    }
    if (error?.message === 'Network Error' || !navigator.onLine) {
      return 'No hay conexión con el servidor. Comprueba tu red o que el API esté en ejecución.';
    }
    return fallback;
  }

  const { data, status } = error.response;

  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (data?.detail != null) {
    const d = data.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) {
      return d
        .map((item) => (typeof item === 'string' ? item : item?.message || JSON.stringify(item)))
        .filter(Boolean)
        .join(' ')
        || fallback;
    }
  }

  const pieces = [];

  function walk(obj, prefix = '') {
    if (obj == null) return;
    if (typeof obj === 'string') {
      pieces.push(obj);
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach((item) => walk(item, prefix));
      return;
    }
    if (typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (Array.isArray(val)) {
          val.forEach((v) => {
            if (typeof v === 'string') pieces.push(v);
            else walk(v);
          });
        } else if (typeof val === 'string') {
          pieces.push(val);
        } else if (val && typeof val === 'object') {
          walk(val, `${prefix}${key}.`);
        }
      }
    }
  }

  walk(data);

  if (pieces.length) {
    return [...new Set(pieces)].join(' ');
  }

  if (status === 401) {
    return 'Sesión inválida o credenciales incorrectas.';
  }
  if (status === 403) {
    return 'No tienes permiso para realizar esta acción.';
  }
  if (status >= 500) {
    return 'Error en el servidor. Intenta más tarde.';
  }

  return fallback;
}
