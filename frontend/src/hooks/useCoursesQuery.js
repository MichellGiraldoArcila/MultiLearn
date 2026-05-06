import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { courses as coursesApi, search as searchApi } from '../services/api';

function normalizeListResponse(data) {
  return {
    results: data?.results ?? [],
    count: data?.count ?? 0,
  };
}

export function coursesQueryOptions({ q, category, platform, page, pageSize }) {
  const trimmed = (q || '').trim();

  return {
    queryKey: ['courses', { q: trimmed, category: category || '', platform: platform || '', page, pageSize }],
    queryFn: async ({ signal }) => {
      const params = {
        category: category || undefined,
        platform: platform || undefined,
        page,
        page_size: pageSize,
      };

      if (trimmed) {
        const { data } = await searchApi.query(trimmed, { ...params, signal });
        return normalizeListResponse(data);
      }

      const { data } = await coursesApi.list({ ...params, signal });
      return normalizeListResponse(data);
    },
    enabled: page >= 1,
    placeholderData: keepPreviousData,
  };
}

export function useCoursesQuery(args) {
  return useQuery(coursesQueryOptions(args));
}

