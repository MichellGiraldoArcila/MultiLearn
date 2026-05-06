import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { favorites as favoritesApi } from '../services/api';
import CourseCard from '../components/CourseCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import PageContainer from '../components/layout/PageContainer';
import { useQueryClient } from '@tanstack/react-query';
import { coursesQueryOptions, useCoursesQuery } from '../hooks/useCoursesQuery';

const CATEGORIES = ['programming', 'design', 'cooking', 'music', 'business'];
const PLATFORMS = ['Udemy', 'Coursera', 'Platzi', 'edX'];
const PAGE_SIZE = 20;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const queryFromUrl = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [platform, setPlatform] = useState(searchParams.get('platform') || '');
  const [error, setError] = useState(null);
  const [favoritesMap, setFavoritesMap] = useState({}); // courseId -> favoriteId
  const pageFromUrl = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const debounceRef = useRef(null);

  useEffect(() => {
    setSearchInput(queryFromUrl);
    setSearchQuery(queryFromUrl);
  }, [queryFromUrl]);

  const fetchFavorites = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setFavoritesMap({});
      return;
    }
    try {
      const { data } = await favoritesApi.list();
      const results = data.results ?? data ?? [];
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
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const coursesQuery = useCoursesQuery({
    q: searchQuery,
    category,
    platform,
    page: pageFromUrl,
    pageSize: PAGE_SIZE,
  });

  const courses = coursesQuery.data?.results ?? [];
  const count = coursesQuery.data?.count ?? 0;
  const loading = coursesQuery.isLoading;

  useEffect(() => {
    if (!coursesQuery.error) {
      setError(null);
      return;
    }
    const err = coursesQuery.error;
    setError(err?.response?.data?.detail || err?.message || 'Error al cargar cursos');
  }, [coursesQuery.error]);

  const totalPages = useMemo(() => {
    if (!count || count <= 0) return 0;
    return Math.max(1, Math.ceil(count / PAGE_SIZE));
  }, [count]);

  // Prefetch automático de la página siguiente (N+1).
  useEffect(() => {
    if (!totalPages || pageFromUrl >= totalPages) return;
    const nextPage = pageFromUrl + 1;

    queryClient.prefetchQuery(
      coursesQueryOptions({
        q: searchQuery,
        category,
        platform,
        page: nextPage,
        pageSize: PAGE_SIZE,
      })
    );
  }, [queryClient, totalPages, pageFromUrl, searchQuery, category, platform]);

  const syncQInUrl = (q, { resetPage = false } = {}) => {
    const next = new URLSearchParams(searchParamsRef.current);
    if (q) next.set('q', q);
    else next.delete('q');
    if (resetPage) next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearch = (q) => {
    // Click en la lupa / Enter: actualizamos inmediato.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput(q);
    setSearchQuery(q);
    syncQInUrl(q, { resetPage: true });
  };

  const handleQueryChange = (q) => {
    setSearchInput(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const trimmed = (q || '').trim();
      setSearchQuery(trimmed);
      syncQInUrl(trimmed, { resetPage: true });
    }, 150);
  };

  const handleFilter = (key, value) => {
    if (key === 'category') setCategory(value);
    if (key === 'platform') setPlatform(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  return (
    <PageContainer className="py-6 md:py-8">
      <section className="mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Descubre cursos
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Búsqueda inteligente por título, categoría y plataforma.
        </p>
        <div className="w-full mb-6">
          <SearchBar
            onSubmit={handleSearch}
            onQueryChange={handleQueryChange}
            initialValue={queryFromUrl}
            placeholder="Ej: python para principiantes, diseño UI..."
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={category}
            onChange={(e) => handleFilter('category', e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-slate-900 dark:text-white"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={platform}
            onChange={(e) => handleFilter('platform', e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-slate-900 dark:text-white"
          >
            <option value="">Todas las plataformas</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </section>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              className="animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
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
      ) : (
        <section>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
            {searchInput.trim() ? `Búsqueda: "${searchInput.trim()}"` : 'Cursos'}
          </h2>
          {courses.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 py-8">No se encontraron cursos.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((item) => {
                const course = item.course || item;
                const favId = favoritesMap[course.id];
                const isFavorite = favId != null;
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    showScore={item.similarity_score}
                    isFavorite={isFavorite}
                    favoriteId={favId}
                    onFavoriteChange={fetchFavorites}
                  />
                );
              })}
            </div>
          )}

          {count > 0 && (
            <Pagination
              count={count}
              pageSize={PAGE_SIZE}
              page={pageFromUrl}
              onPageChange={handlePageChange}
              siblingCount={2}
              labels={{ prev: 'Atrás', next: 'Next' }}
            />
          )}
        </section>
      )}
    </PageContainer>
  );
}
