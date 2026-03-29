export default function PasswordChecklist({ password }) {
  const pwd = password || '';
  const checks = {
    min8: pwd.length >= 8,
    hasLower: /[a-z]/.test(pwd),
    hasUpper: /[A-Z]/.test(pwd),
    hasSpecial: /[^A-Za-z0-9]/.test(pwd),
  };

  const itemClass = (ok) =>
    ok ? 'text-emerald-600 dark:text-emerald-300' : 'text-gray-500 dark:text-slate-400';

  const icon = (ok) => (ok ? '✔' : '✖');

  return (
    <ul className="space-y-1 text-sm">
      <li className={itemClass(checks.min8)}>
        {icon(checks.min8)} 8 caracteres
      </li>
      <li className={itemClass(checks.hasLower)}>
        {icon(checks.hasLower)} 1 minúscula
      </li>
      <li className={itemClass(checks.hasUpper)}>
        {icon(checks.hasUpper)} 1 mayúscula
      </li>
      <li className={itemClass(checks.hasSpecial)}>
        {icon(checks.hasSpecial)} 1 carácter especial
      </li>
    </ul>
  );
}

