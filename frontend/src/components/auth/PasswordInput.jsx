import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
}) {
  const [show, setShow] = useState(false);

  const inputBase =
    'flex-1 px-4 py-3 rounded-l-xl border-r-0 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white';

  const buttonBase =
    'px-3 py-3 rounded-r-xl border-l outline-none transition focus:ring-2 focus:ring-blue-500/30 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';

  const errorStyles =
    'border-red-300 dark:border-red-700 bg-red-50/10';

  const okStyles =
    'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900';

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}

      <div className="flex items-stretch">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`${inputBase} ${error ? errorStyles : okStyles}`}
          aria-invalid={!!error}
        />

        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className={`${buttonBase} ${error ? errorStyles : okStyles} border-l-0`}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && <div className="text-xs text-red-700 dark:text-red-300">{error}</div>}
    </div>
  );
}

