import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import PageContainer from '../components/layout/PageContainer';
import InputField from '../components/auth/InputField';
import InterestChipPicker from '../components/preferences/InterestChipPicker';
import { LEVEL_OPTIONS, defaultPreferences } from '../constants/preferences';

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
  const [name, setName] = useState('');
  const [prefs, setPrefs] = useState(() => defaultPreferences());
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await auth.me();
        setProfile(data);
        setName(data?.name || '');
        setPrefs({ ...defaultPreferences(), ...(data?.preferences || {}) });
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveMsg('');
    setError('');
    setSaving(true);
    try {
      await auth.updateMe({
        name: name.trim(),
        preferences: {
          interests: prefs.interests || [],
          level: prefs.level || '',
          goal: (prefs.goal || '').trim(),
        },
      });
      setSaveMsg('Cambios guardados.');
      const { data } = await auth.me();
      setProfile(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron guardar los cambios.'));
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.name || profile?.email || '';
  const avatarText = initialsFromName(displayName);

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
      <div className="bg-[var(--color-bg-elevated)] rounded-2xl border border-[color:var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[color:var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-muted border border-[color:var(--color-border-accent)] flex items-center justify-center text-[var(--color-accent)] font-bold text-lg">
              {avatarText}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">Mi perfil</h1>
              <p className="text-[var(--color-text-muted)]">{displayName}</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-200 text-sm">
              {error}
            </div>
          )}
          {saveMsg && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-sm">
              {saveMsg}
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Mis datos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                id="profile-name"
                label="Nombre"
                value={name}
                onChange={setName}
                placeholder="Tu nombre"
                autoComplete="name"
              />
              <div className="p-4 rounded-xl border border-[color:var(--color-border)] bg-[var(--color-bg-muted)]">
                <div className="text-xs text-[var(--color-text-muted)]">Email</div>
                <div className="font-medium text-[var(--color-text)]">{profile?.email || '—'}</div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">Preferencias de aprendizaje</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Se usan para recomendaciones y tu roadmap. Elige temas y describe tu objetivo.
            </p>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)] mb-2">Intereses</p>
                <InterestChipPicker
                  value={prefs.interests}
                  onChange={(interests) => setPrefs((p) => ({ ...p, interests }))}
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="profile-level" className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Nivel
                </label>
                <select
                  id="profile-level"
                  value={prefs.level || ''}
                  onChange={(e) => setPrefs((p) => ({ ...p, level: e.target.value }))}
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text)] outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {LEVEL_OPTIONS.map((o) => (
                    <option key={o.id || 'none'} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="profile-goal" className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Objetivo
                </label>
                <textarea
                  id="profile-goal"
                  rows={3}
                  value={prefs.goal || ''}
                  onChange={(e) => setPrefs((p) => ({ ...p, goal: e.target.value }))}
                  disabled={saving}
                  placeholder='Ej. "Ser desarrollador frontend"'
                  className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text)] outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:opacity-50"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm dark:shadow-glow-sm disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <Link
              to="/reset-password"
              className="inline-flex items-center px-6 py-2.5 rounded-xl font-medium border border-[color:var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]"
            >
              Cambiar contraseña
            </Link>
          </div>
        </form>

        <div className="p-6 md:p-8 pt-0 flex justify-center border-t border-[color:var(--color-border)]">
          <button
            type="button"
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-xl font-medium border border-[color:var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)]"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
