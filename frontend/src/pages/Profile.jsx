import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import PageContainer from '../components/layout/PageContainer';

function initialsFromName(name) {
  const safe = (name || '').trim();
  if (!safe) return 'ML';
  const parts = safe.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || '';
  const second = parts.length > 1 ? parts[1]?.[0] || '' : '';
  return (first + second).toUpperCase();
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await auth.me();
        setProfile(data);
      } catch (err) {
        setError('No se pudo cargar tu perfil. Vuelve a iniciar sesión.');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/', { replace: true });
    window.location.reload();
  };

  const name = profile?.name || profile?.email || '';
  const avatarText = initialsFromName(name);

  if (loading) {
    return (
      <PageContainer maxWidthClass="max-w-4xl" className="py-8">
        <div className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-56 mb-4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-64 mb-6" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidthClass="max-w-4xl" className="py-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-600/10 dark:bg-primary-600/20 border border-primary-600/30 flex items-center justify-center">
              <span className="text-primary-700 dark:text-primary-300 font-bold text-lg">{avatarText}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mi perfil</h1>
              <p className="text-slate-600 dark:text-slate-300">{name}</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Mis datos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <div className="text-xs text-slate-500 dark:text-slate-400">Nombre</div>
                <div className="font-medium text-slate-800 dark:text-slate-100">{profile?.name || '—'}</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                <div className="font-medium text-slate-800 dark:text-slate-100">{profile?.email || '—'}</div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/reset-password"
                className="text-lg font-semibold text-slate-900 dark:text-white hover:underline transition"
              >
                Cambiar contraseña
              </Link>
            </div>
          </section>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl font-medium border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

