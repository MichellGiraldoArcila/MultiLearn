import { INTEREST_OPTIONS } from '../../constants/preferences';

/**
 * Selección tipo chips (toggle). `value` es lista de ids activos.
 */
export default function InterestChipPicker({ value, onChange, disabled = false }) {
  const selected = new Set(value || []);

  const toggle = (id) => {
    if (disabled) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange?.([...next]);
  };

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Intereses">
      {INTEREST_OPTIONS.map(({ id, label }) => {
        const on = selected.has(id);
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => toggle(id)}
            className={[
              'px-3 py-1.5 rounded-full text-sm font-medium border transition',
              on
                ? 'border-[color:var(--color-border-accent)] bg-accent-muted text-[var(--color-accent)] shadow-sm dark:shadow-glow-sm'
                : 'border-[color:var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:border-[color:var(--color-border-accent)]',
              disabled ? 'opacity-50 cursor-not-allowed' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {on ? '✓ ' : ''}
            {label}
          </button>
        );
      })}
    </div>
  );
}
