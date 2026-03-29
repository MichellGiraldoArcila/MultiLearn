import { useState, useEffect } from 'react';
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
        Cursos sugeridos según tus favoritos e intereses.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-100 text-sm">
          {error}
        </div>
      )}

      {data && (!data.recommendations || data.recommendations.length === 0) ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <p>Añade algunos cursos a favoritos para recibir recomendaciones personalizadas.</p>
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
