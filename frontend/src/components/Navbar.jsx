import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import SearchBar from './SearchBar';
import { auth as authApi } from '../services/api';

function Brand() {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="w-10 h-10 rounded-2xl bg-primary-600/10 dark:bg-primary-600/20 border border-primary-600/30 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9.5 3.5c-2 0-3.5 1.5-3.5 3.5v.4c-1.2.5-2 1.7-2 3v1c0 1.3.8 2.5 2 3v.4c0 2 1.5 3.5 3.5 3.5H14.5c2 0 3.5-1.5 3.5-3.5v-.4c1.2-.5 2-1.7 2-3v-1c0-1.3-.8-2.5-2-3V7c0-2-1.5-3.5-3.5-3.5H9.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 8.6c0-1.1.9-2 2-2h1.2c1.1 0 2 .9 2 2v.2c0 .8-.5 1.5-1.2 1.8l-.6.2c-.4.1-.7.5-.7.9V13"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 16.8h.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          MultiLearn
        </div>
        <div className="hidden sm:block text-xs text-slate-600 dark:text-slate-300">
          Aprende sin límites, en un solo lugar
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const isLoggedIn = !!localStorage.getItem('access_token');
  const [profileName, setProfileName] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const loadMe = async () => {
      if (!isLoggedIn) {
        setProfileName('');
        return;
      }
      setProfileLoading(true);
      try {
        const { data } = await authApi.me();
        setProfileName(data?.name || data?.email || '');
      } catch (e) {
        setProfileName('');
      } finally {
        setProfileLoading(false);
      }
    };
    loadMe();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onDocMouseDown = (e) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [profileMenuOpen]);

  const initials = (() => {
    const safe = (profileName || '').trim();
    if (!safe) return 'ML';
    const parts = safe.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || '';
    const second = parts.length > 1 ? parts[1]?.[0] || '' : '';
    return (first + second).toUpperCase();
  })();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
    setProfileMenuOpen(false);
    window.location.reload();
  };

  const debounceRef = useRef(null);
  const qFromUrl = (() => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  })();

  const syncSearchRoute = (q, { immediate = false } = {}) => {
    const trimmed = (q || '').trim();
    const params = new URLSearchParams(location.search);
    if (trimmed) params.set('q', trimmed);
    else params.delete('q');

    const nextSearch = params.toString();
    const nextPath = `/search${nextSearch ? `?${nextSearch}` : ''}`;

    if (immediate) {
      navigate(nextPath, { replace: false });
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate(nextPath, { replace: true });
    }, 150);
  };

  const handleSearchSubmit = (q) => {
    setSearchOpen(false);
    syncSearchRoute(q, { immediate: true });
  };

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16 gap-3">
          <Link to="/" className="flex items-center">
            <Brand />
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <SearchBar
              onSubmit={handleSearchSubmit}
              onQueryChange={(q) => syncSearchRoute(q)}
              initialValue={qFromUrl}
              placeholder="Buscar cursos..."
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              onClick={() => toggleTheme()}
              aria-label="Cambiar tema"
              title="Tema"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m16.95-6.95-.7.7M6.45 17.55l-.7.7m12.9 0-.7-.7M6.45 6.45l-.7-.7M12 7a5 5 0 100 10 5 5 0 000-10z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18a6 6 0 100-12 6 6 0 000 12z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"
                  />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {isLoggedIn ? (
              <>
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                    aria-label="Abrir menú de perfil"
                    title="Mi perfil"
                  >
                    <span className="w-9 h-9 rounded-2xl bg-primary-600/10 dark:bg-primary-600/20 border border-primary-600/30 flex items-center justify-center">
                      {profileLoading ? (
                        <span className="inline-block w-3 h-3 border-2 border-primary-600/60 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-primary-700 dark:text-primary-300 font-bold text-sm">{initials}</span>
                      )}
                    </span>
                  </button>

                  {profileMenuOpen && (
                    <div className="fixed top-14 md:top-16 right-0 w-full max-w-xs sm:max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur shadow-lg overflow-hidden">
                      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="text-sm text-slate-600 dark:text-slate-300">Cuenta</div>
                        <div className="text-slate-900 dark:text-white font-semibold break-words leading-tight">
                          {profileName || '—'}
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm"
                        >
                          <span className="w-8 h-8 rounded-xl bg-primary-600/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-700 dark:text-primary-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </span>
                          Cursos
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/favorites');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm"
                        >
                          <span className="w-8 h-8 rounded-xl bg-primary-600/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-700 dark:text-primary-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </span>
                          Favoritos
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/recommendations');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm"
                        >
                          <span className="w-8 h-8 rounded-xl bg-primary-600/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-700 dark:text-primary-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          Recomendaciones
                        </button>

                        <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm"
                        >
                          <span className="w-8 h-8 rounded-xl bg-primary-600/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-700 dark:text-primary-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7a4 4 0 100-8 4 4 0 000 8z" />
                            </svg>
                          </span>
                          Mi perfil
                        </button>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300 text-sm mt-1"
                        >
                          <span className="w-8 h-8 rounded-xl bg-red-600/10 flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-700 dark:text-red-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 11-4 0v-1" />
                            </svg>
                          </span>
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>

        {searchOpen && (
          <div className="md:hidden pb-3">
            <SearchBar
              onSubmit={handleSearchSubmit}
              onQueryChange={(q) => syncSearchRoute(q)}
              initialValue={qFromUrl}
              placeholder="Buscar cursos..."
            />
          </div>
        )}
      </div>
    </header>
  );
}
