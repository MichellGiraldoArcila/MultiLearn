export default function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  error,
  readOnly = false,
  disabled = false,
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        readOnly={readOnly}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300 dark:border-red-700 bg-red-50/10' : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          text-slate-900 dark:text-white`}
        aria-invalid={!!error}
        aria-readonly={readOnly}
      />
      {error && <div className="text-xs text-red-700 dark:text-red-300">{error}</div>}
    </div>
  );
}

