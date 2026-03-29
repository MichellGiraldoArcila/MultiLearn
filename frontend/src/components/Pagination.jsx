export default function Pagination({
  count = 0,
  pageSize = 20,
  page = 1,
  onPageChange,
  siblingCount = 2,
  labels = { prev: 'Atrás', next: 'Next' },
}) {
  const safeCount = Number.isFinite(count) ? count : 0;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
  const totalPages = Math.max(1, Math.ceil(safeCount / safePageSize));
  const current = Math.max(1, Math.min(page, totalPages));

  if (totalPages <= 1) return null;

  const windowSize = siblingCount * 2 + 1;
  const half = Math.floor(windowSize / 2);
  const start = Math.max(1, current - half);
  const end = Math.min(totalPages, start + windowSize - 1);
  const finalStart = Math.max(1, end - windowSize + 1);

  const pages = Array.from({ length: end - finalStart + 1 }, (_, idx) => finalStart + idx);

  const baseButton =
    'min-h-9 px-2 sm:px-3 rounded-lg border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/30';

  const disabledClass = 'opacity-50 cursor-not-allowed';

  const prevDisabled = current <= 1;
  const nextDisabled = current >= totalPages;

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginación">
      <button
        type="button"
        disabled={prevDisabled}
        onClick={() => onPageChange?.(current - 1)}
        className={`${baseButton} ${prevDisabled ? disabledClass : ''} ${
          prevDisabled
            ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        {labels.prev}
      </button>

      <div className="flex items-center gap-2">
        {pages.map((p) => {
          const active = p === current;
          return (
            <button
              key={p}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => onPageChange?.(p)}
              className={`${baseButton} ${
                active
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              } ${active ? 'cursor-default' : ''}`}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={nextDisabled}
        onClick={() => onPageChange?.(current + 1)}
        className={`${baseButton} ${nextDisabled ? disabledClass : ''} ${
          nextDisabled
            ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        {labels.next}
      </button>
    </nav>
  );
}

