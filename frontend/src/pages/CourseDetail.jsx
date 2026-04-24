import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courses as coursesApi, interactions } from '../services/api';
import { getVideoEmbedFromUrl } from '../utils/videoEmbed';
import LoadingSpinner from '../components/LoadingSpinner';
import PageContainer from '../components/layout/PageContainer';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await coursesApi.detail(id);
        setCourse(data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Curso no encontrado' : 'Error al cargar el curso');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (!course?.id) return;
    const token = localStorage.getItem('access_token');
    if (token) {
      interactions.create(course.id, 'view').catch(() => {});
    }
  }, [course?.id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error || !course) {
    return (
      <PageContainer maxWidthClass="max-w-3xl" className="py-12 text-center">
        <p className="text-[var(--color-text-muted)]">{error || 'Curso no encontrado'}</p>
        <Link to="/" className="mt-4 inline-block text-primary-600 font-medium hover:underline">
          Volver al inicio
        </Link>
      </PageContainer>
    );
  }

  const imageUrl =
    course.image_url ||
    `https://placehold.co/800x400/00d975/ffffff?text=${encodeURIComponent(course.title || '')}`;
  const rating = course.rating != null ? Number(course.rating).toFixed(1) : '—';
  const embed = getVideoEmbedFromUrl(course.video_url);

  const getPlatformTargetUrl = () => {
    const platform = (course.platform || '').toLowerCase();
    const rawUrl = course.url || '';
    const title = course.title || '';

    const urlLower = rawUrl.toLowerCase();
    if (rawUrl) {
      const looksCoursera = platform.includes('coursera') && urlLower.includes('/learn/');
      const looksUdemy = platform.includes('udemy') && urlLower.includes('/course/');
      const looksEdx = platform.includes('edx') && urlLower.includes('/course/');
      const looksPlatzi = platform.includes('platzi') && urlLower.includes('platzi.com');

      if (looksCoursera || looksUdemy || looksEdx || looksPlatzi) {
        return rawUrl;
      }
    }

    if (platform.includes('coursera')) {
      return `https://www.coursera.org/search?query=${encodeURIComponent(title)}`;
    }
    if (platform.includes('udemy')) {
      return `https://www.udemy.com/courses/search/?q=${encodeURIComponent(title)}`;
    }
    if (platform.includes('platzi')) {
      return `https://platzi.com/search/?q=${encodeURIComponent(title)}`;
    }
    if (platform.includes('edx')) {
      return `https://www.edx.org/search?q=${encodeURIComponent(title)}`;
    }

    return rawUrl;
  };

  return (
    <PageContainer maxWidthClass="max-w-4xl" className="py-8">
      <div className="rounded-2xl overflow-hidden border border-[color:var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-card)]">
        <div className="w-full h-40 bg-[var(--color-bg-muted)]">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 rounded-lg bg-accent-muted text-[var(--color-accent)] text-sm font-medium border border-[color:var(--color-border)]">
              {course.platform}
            </span>
            <span className="px-3 py-1 rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text)] text-sm border border-[color:var(--color-border)]">
              {course.category}
            </span>
            <span className="px-3 py-1 rounded-lg bg-[var(--color-bg-muted)] text-[var(--color-text)] text-sm border border-[color:var(--color-border)]">
              {course.level}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-2">{course.title}</h1>
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 text-lg mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[var(--color-text-muted)]">{rating}</span>
          </div>
          {course.instructor && (
            <p className="text-[var(--color-text-muted)] mb-4">
              <span className="font-medium text-[var(--color-text)]">Instructor:</span> {course.instructor}
            </p>
          )}

          {embed && (
            <section className="mb-8" aria-label="Vídeo del curso">
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Vídeo</h2>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[color:var(--color-border)] bg-black shadow-sm dark:shadow-glow-sm">
                <iframe
                  title={`Reproductor: ${course.title || 'curso'}`}
                  src={embed.embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </section>
          )}

          {course.video_url && !embed && (
            <p className="mb-8 text-sm text-amber-700 dark:text-amber-400/90 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              La URL del vídeo no es reconocida como YouTube o Vimeo embebible. Comprueba el enlace en el panel de
              administración.
            </p>
          )}

          {course.description && (
            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Descripción</h2>
              <p className="text-[var(--color-text-muted)] whitespace-pre-wrap">{course.description}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const targetUrl = getPlatformTargetUrl();
                if (!targetUrl) return;
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm dark:shadow-glow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!course?.platform}
              title="Abrir en la plataforma"
            >
              Ir a la plataforma
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
            <Link
              to="/"
              className="inline-flex items-center px-5 py-2.5 rounded-xl font-medium border border-[color:var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
