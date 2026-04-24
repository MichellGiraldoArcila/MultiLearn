import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendations as recApi, courses as coursesApi, favorites as favoritesApi } from '../services/api';
import CourseCard from '../components/CourseCard';
import Pagination from '../components/Pagination';
import PageContainer from '../components/layout/PageContainer';

const PAGE_SIZE = 8;

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritesMap, setFavoritesMap] = useState({}); // courseId -> favoriteId
  const [page, setPage] = useState(1);
  const [roadmap, setRoadmap] = useState(null);

  const fetchFavorites = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setFavoritesMap({});
      return;
    }
    try {
      const { data: favData } = await favoritesApi.list();
      const results = favData.results ?? favData ?? [];
      const map = {};
      results.forEach((fav) => {
        const cid = fav?.course?.id;
        if (cid != null) map[cid] = fav.id;
      });
      setFavoritesMap(map);
    } catch (err) {
      setFavoritesMap({});
    }
  };

  useEffect(() => {
    const fetchRec = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await recApi.list();
        const recs = res?.recommendations ?? [];

        // El backend no envía image_url en recomendaciones, así que buscamos
        // el detalle del curso para traer la imagen real.
        const enriched = await Promise.all(
          recs.map(async (r) => {
            try {
              const { data: course } = await coursesApi.detail(r.id);
              return { ...r, image_url: course?.image_url || null, category: course?.category || null };
            } catch (e) {
              return { ...r, image_url: null, category: null };
            }
          })
        );

        setData({ ...res, recommendations: enriched });
      } catch (err) {
        setError(err.response?.status === 401 ? 'Inicia sesión para ver recomendaciones' : 'Error al cargar recomendaciones');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRec();
    fetchFavorites();
    (async () => {
      try {
        const { data } = await recApi.roadmap();
        setRoadmap(data);
      } catch {
        setRoadmap(null);
      }
    })();
  }, []);

  useEffect(() => {
    // Si cambian las recomendaciones (por login/logout), reiniciamos paginación.
    setPage(1);
  }, [data]);

  if (loading) {
    return (
      <PageContainer className="py-8">
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="w-full h-40 bg-slate-100 dark:bg-slate-800" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Recomendaciones para ti</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        Cursos sugeridos según favoritos, interacciones y las preferencias de tu perfil.
      </p>

      {roadmap?.steps?.length > 0 && (
        <section className="mb-10 rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-bg-elevated)] p-5 md:p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Roadmap de aprendizaje</h2>
          {roadmap.summary && (
            <p className="text-sm text-[var(--color-text-muted)] mb-4">{roadmap.summary}</p>
          )}
          <ol className="space-y-3">
            {roadmap.steps.map((step) => (
              <li
                key={step.order}
                className="flex flex-wrap items-start gap-3 rounded-xl border border-[color:var(--color-border)] bg-[var(--color-bg-muted)]/50 px-4 py-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-sm font-bold text-[var(--color-accent)]">
                  {step.order}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/courses/${step.course.id}`}
                    className="font-medium text-[var(--color-text)] hover:text-primary-600 hover:underline"
                  >
                    {step.course.title}
                  </Link>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {step.course.platform} · {step.course.category} · {step.course.level}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">{step.reason}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-100 text-sm">
          {error}
        </div>
      )}

      {data && (!data.recommendations || data.recommendations.length === 0) ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400 space-y-2">
          <p>No hay recomendaciones todavía.</p>
          <p className="text-sm">
            Marca favoritos o configura intereses y nivel en{' '}
            <Link to="/profile" className="text-primary-600 hover:underline font-medium">
              tu perfil
            </Link>{' '}
            para mejorar los resultados.
          </p>
        </div>
      ) : data?.recommendations?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recommendations
              .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
              .map((rec) => (
            <CourseCard
              key={rec.id}
              course={{
                id: rec.id,
                title: rec.title,
                platform: rec.platform,
                rating: rec.rating,
                image_url: rec.image_url,
                category: rec.category,
              }}
              showScore={rec.score}
              isFavorite={favoritesMap[rec.id] != null}
              favoriteId={favoritesMap[rec.id]}
              onFavoriteChange={fetchFavorites}
            />
              ))}
          </div>

          <Pagination
            count={data.recommendations.length}
            pageSize={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            siblingCount={2}
            labels={{ prev: 'Atrás', next: 'Next' }}
          />
        </>
      ) : null}
    </PageContainer>
  );
}
