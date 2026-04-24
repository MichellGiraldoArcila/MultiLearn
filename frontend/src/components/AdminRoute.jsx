import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../services/api';

/**
 * Exige JWT + usuario con is_staff en el backend.
 */
export default function AdminRoute({ children }) {
  const location = useLocation();
  const [state, setState] = useState('loading');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setState('guest');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await auth.adminStatus();
        if (cancelled) return;
        setState(data?.is_staff ? 'ok' : 'forbidden');
      } catch {
        if (!cancelled) setState('guest');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'loading') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2 px-4">
        <span className="inline-block w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Verificando permisos de administrador…</p>
      </div>
    );
  }

  if (state === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (state === 'forbidden') {
    return <Navigate to="/" replace />;
  }

  return children;
}
