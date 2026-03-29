import { useMemo } from 'react';

function checksFromPassword(password) {
  const pwd = password || '';
  return {
    min8: pwd.length >= 8,
    hasLower: /[a-z]/.test(pwd),
    hasUpper: /[A-Z]/.test(pwd),
    hasSpecial: /[^A-Za-z0-9]/.test(pwd),
  };
}

function strengthFromChecks(checks) {
  const passed = Object.values(checks).filter(Boolean).length;
  if (passed <= 1) {
    return { label: 'Débil', color: 'bg-red-500', pct: 25 };
  }
  if (passed <= 3) {
    return { label: 'Media', color: 'bg-amber-500', pct: 66 };
  }
  return { label: 'Fuerte', color: 'bg-emerald-500', pct: 100 };
}

export default function PasswordStrengthBar({ password }) {
  const checks = useMemo(() => checksFromPassword(password), [password]);
  const strength = useMemo(() => strengthFromChecks(checks), [checks]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-500 dark:text-slate-300">Seguridad</div>
        <div className="text-sm font-semibold text-gray-700 dark:text-slate-200">{strength.label}</div>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${strength.pct}%` }}
        />
      </div>
    </div>
  );
}

