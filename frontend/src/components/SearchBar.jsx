import { useEffect, useState } from 'react';

export default function SearchBar({ onSubmit, onQueryChange, placeholder = 'Buscar...', initialValue = '' }) {
  const [q, setQ] = useState(initialValue || '');

  useEffect(() => {
    setQ(initialValue || '');
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = q?.trim() || '';
    onSubmit(trimmed);
    onQueryChange?.(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-stretch w-full">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            const next = e.target.value;
            setQ(next);
            onQueryChange?.(next);
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-l-xl border border-[color:var(--color-border)] border-r-0 bg-[var(--color-bg-muted)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:bg-[var(--color-bg-elevated)] focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 outline-none transition text-sm sm:px-4 sm:py-2.5"
          aria-label="Buscar cursos"
        />
        <button
          type="submit"
          className="px-2 py-2 rounded-r-xl border border-l-0 border-[color:var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] transition flex items-center justify-center sm:px-3 sm:py-2.5"
          aria-label="Buscar"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
