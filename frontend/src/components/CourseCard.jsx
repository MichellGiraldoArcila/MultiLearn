import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { favorites as favoritesApi } from '../services/api';

function deriveImageQuery(course) {
  const title = (course?.title || '').toLowerCase();
  const category = (course?.category || '').toLowerCase();

  const t = `${title} ${category}`.trim();

  if (/(python|django|flask|java|javascript|react|node|typescript|sql|algoritmo|machine learning|data science)/i.test(t)) {
    return 'machine learning, programming, technology';
  }
  if (/(design|ui|ux|figma|branding|logo)/i.test(t)) {
    return 'ui design, ux, creative';
  }
  if (/(cooking|cook|chef|cocina|repost|baking|pasta|italian|mexicana|japanese)/i.test(t)) {
    return 'cooking, kitchen, food';
  }
  if (/(music|musica|guitarra|piano|singing|audio|production)/i.test(t)) {
    return 'music, audio, studio';
  }
  if (/(business|finance|marketing|negociacion|negotiation|management|liderazgo|emprend)/i.test(t)) {
    return 'business, analytics, strategy';
  }
  return 'education, courses, technology';
}

function resolveCourseImage(course) {
  if (course?.image_url) return course.image_url;
  const query = deriveImageQuery(course);
  // source.unsplash.com suele ser más estable con /800x450/?query que con /featured/.
  const safeQuery = query || 'education,courses,technology';
  return `https://source.unsplash.com/800x450/?${encodeURIComponent(safeQuery)}`;
}

function placeholderDataUri({ title = 'Curso', platform = '' } = {}) {
  const safeTitle = (title || '').slice(0, 30);
  const safePlatform = (platform || '').slice(0, 20);
  const bg1 = '#00ff88';
  const bg2 = '#047857';
  const textColor = '#ffffff';

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${bg1}"/>
        <stop offset="1" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#g)"/>
    <rect x="40" y="40" width="720" height="370" rx="22" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.25)"/>
    <text x="70" y="210" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="42" font-weight="700" fill="${textColor}">
      ${safeTitle}
    </text>
    <text x="70" y="270" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="22" font-weight="500" fill="rgba(255,255,255,0.92)">
      ${safePlatform}
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function CourseCard({
  course,
  isFavorite = false,
  favoriteId = null,
  onFavoriteChange,
  showScore,
}) {
  const [loading, setLoading] = useState(false);
  const isLoggedIn = !!localStorage.getItem('access_token');
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

  // Mantener sincronía cuando el padre refresca favoritos (ej. al cargar la página).
  useEffect(() => {
    setLocalIsFavorite(isFavorite);
  }, [isFavorite]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    // Optimistic UI: cambia visualmente de inmediato.
    const currentlyFavorite = isFavorite;
    setLocalIsFavorite(!currentlyFavorite);
    try {
      if (currentlyFavorite && favoriteId) {
        await favoritesApi.remove(favoriteId);
        onFavoriteChange?.();
      } else {
        await favoritesApi.add(course.id);
        onFavoriteChange?.();
      }
    } catch (err) {
      console.error(err);
      // Revertir si falla la operación.
      setLocalIsFavorite(currentlyFavorite);
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = resolveCourseImage(course);
  const ratingValue = course.rating != null ? Number(course.rating) : null;
  const ratingText = ratingValue != null ? ratingValue.toFixed(1) : '—';
  const filledStars = ratingValue != null ? Math.max(0, Math.min(5, Math.round(ratingValue))) : 0;
  const favoriteButtonClass = localIsFavorite
    ? 'p-1.5 sm:p-2 rounded-xl border border-red-400/50 text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition disabled:opacity-50'
    : 'p-1.5 sm:p-2 rounded-xl border border-[color:var(--color-border)] text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-400/40 hover:bg-[var(--color-bg-muted)] transition disabled:opacity-50';

  return (
    <article className="surface-card w-full max-w-sm mx-auto min-w-0 overflow-hidden hover:-translate-y-1">
      <Link to={`/courses/${course.id}`} className="block group">
        <div className="w-full h-40 bg-[var(--color-bg-muted)] relative border-b border-[color:var(--color-border)]">
          <img
            src={imageUrl}
            alt={course.title ? `Imagen de ${course.title}` : 'Imagen del curso'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const img = e.currentTarget;
              const tried = img.getAttribute('data-img-fallback') || '0';
              const courseSeed = `${course?.id || 0}-${course?.title || ''}-${course?.platform || ''}`;

              // 0 -> fallback alterno (picsum)
              if (tried === '0') {
                img.setAttribute('data-img-fallback', '1');
                img.src = `https://picsum.photos/seed/${encodeURIComponent(courseSeed)}/800/450`;
                return;
              }

              // 1 -> placeholder embebido (garantiza que no quede vacío)
              img.setAttribute('data-img-fallback', '2');
              img.src = placeholderDataUri({ title: course?.title, platform: course?.platform });
            }}
          />
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[var(--color-bg-elevated)]/95 border border-[color:var(--color-border)] text-xs font-medium text-[var(--color-text)] break-words whitespace-normal max-w-full">
            {course.platform}
          </span>
          {showScore != null && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-primary-600 text-white text-xs font-medium shadow-sm dark:shadow-glow-sm break-words whitespace-normal max-w-full">
              Relevancia {Number(showScore).toFixed(2)}
            </span>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-[var(--color-text)] mb-1 leading-snug break-words text-sm sm:text-base">
            {course.title}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 text-xs sm:text-sm">
              <div className="flex items-center gap-0.5" aria-label={`Rating ${ratingText}`}>
                {Array.from({ length: 5 }).map((_, idx) => {
                  const starIndex = idx + 1;
                  const filled = starIndex <= filledStars;
                  return (
                    <svg
                      key={idx}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      viewBox="0 0 20 20"
                      fill={filled ? 'currentColor' : 'none'}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={filled ? 0 : 1.5}
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  );
                })}
              </div>
              <span className="text-[var(--color-text-muted)] text-xs sm:text-sm">{ratingText}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4 flex gap-2 border-t border-[color:var(--color-border)] pt-3 bg-[var(--color-bg-muted)]/50">
        <Link
          to={`/courses/${course.id}`}
          className="flex-1 py-2 text-center rounded-xl text-xs sm:text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm dark:shadow-glow-sm transition active:scale-[0.99]"
        >
          Ver curso
        </Link>
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={loading}
          className={favoriteButtonClass}
          title={localIsFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          {loading ? (
            <span className="inline-flex items-center justify-center w-5 h-5 sm:w-5 sm:h-5">
              <span className="inline-block w-4 h-4 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            </span>
          ) : (
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill={localIsFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </article>
  );
}
