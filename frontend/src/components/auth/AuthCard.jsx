export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-md mx-auto mt-20 px-0">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 backdrop-blur-md bg-white/80 dark:bg-slate-900/80">
        {title && (
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center">{title}</h1>
        )}
        {subtitle && (
          <p className="text-slate-600 dark:text-slate-300 text-center mt-2 text-sm">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}

