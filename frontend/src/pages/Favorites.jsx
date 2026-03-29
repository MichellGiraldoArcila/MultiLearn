import { useState, useEffect } from 'react';
import { favorites as favoritesApi } from '../services/api';
import CourseCard from '../components/CourseCard';
import PageContainer from '../components/layout/PageContainer';

export default function Favorites() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await favoritesApi.list();
      setList(data.results ?? data ?? []);
    } catch (err) {
      setError(err.response?.status === 401 ? 'Inicia sesión para ver favoritos' : 'Error al cargar favoritos');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

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
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
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
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Mis favoritos</h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        Cursos que guardaste para ver después.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-100 text-sm">
          {error}
        </div>
      )}

      {list.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <p className="mb-4">Aún no tienes cursos en favoritos.</p>
          <p className="text-sm">Añade cursos desde la página principal con el botón de corazón.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((fav) => (
            <CourseCard
              key={fav.id}
              course={fav.course}
              isFavorite
              favoriteId={fav.id}
              onFavoriteChange={fetchFavorites}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
