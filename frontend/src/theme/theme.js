/** Clave en localStorage (debe coincidir con el uso previo del proyecto). */
export const THEME_STORAGE_KEY = 'theme';

/** @typedef {'light' | 'dark'} ThemeId */

/**
 * Lee el tema guardado sin modificar el DOM.
 * @returns {ThemeId}
 */
export function getStoredTheme() {
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  if (raw === 'dark' || raw === 'light') return raw;
  return 'light';
}

/**
 * Aplica clase `dark` en `<html>` y persiste en localStorage.
 * @param {ThemeId} theme
 */
export function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Inicialización antes del primer paint (llamar desde main.jsx).
 * @returns {ThemeId}
 */
export function initThemeFromStorage() {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}

/**
 * @param {ThemeId} current
 * @returns {ThemeId}
 */
export function toggleThemeId(current) {
  return current === 'dark' ? 'light' : 'dark';
}
