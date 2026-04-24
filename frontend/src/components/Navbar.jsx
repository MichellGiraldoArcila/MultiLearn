import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import SearchBar from './SearchBar';
import ThemeToggle from './ui/ThemeToggle';
import { auth as authApi } from '../services/api';
import { applyTheme, getStoredTheme, toggleThemeId } from '../theme/theme';

function Brand() {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="w-10 h-10 rounded-2xl bg-accent-muted border border-[color:var(--color-border-accent)] dark:shadow-glow-sm flex items-center justify-center text-[var(--color-accent)]">
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
        <div className="text-lg sm:text-xl font-bold text-[var(--color-text)]">
          MultiLearn
        </div>
        <div className="hidden sm:block text-xs text-[var(--color-text-muted)]">
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
  const [theme, setTheme] = useState(getStoredTheme);
  const isLoggedIn = !!localStorage.getItem('access_token');
  const [profileName, setProfileName] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const loadMe = async () => {
      if (!isLoggedIn) {
        setProfileName('');
        setIsStaff(false);
        return;
      }
      setProfileLoading(true);
      try {
        const { data } = await authApi.me();
        setProfileName(data?.name || data?.email || '');
        setIsStaff(!!data?.is_staff);
      } catch (e) {
        setProfileName('');
        setIsStaff(false);
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

  const handleToggleTheme = () => setTheme((t) => toggleThemeId(t));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[color:var(--color-border)] bg-[var(--color-header-bg)] backdrop-blur-md shadow-sm dark:shadow-[0_0_24px_rgba(0,255,136,0.06)]">
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
            <ThemeToggle theme={theme} onToggle={handleToggleTheme} />

            <button
              type="button"
              className="md:hidden p-2 rounded-xl border border-[color:var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-accent)] hover:border-[color:var(--color-border-accent)] transition"
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
                    className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl border border-transparent hover:border-[color:var(--color-border)] hover:bg-[var(--color-bg-muted)] transition"
                    aria-label="Abrir menú de perfil"
                    title="Mi perfil"
                  >
                    <span className="w-9 h-9 rounded-2xl bg-accent-muted border border-[color:var(--color-border-accent)] text-[var(--color-accent)] flex items-center justify-center">
                      {profileLoading ? (
                        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
                      ) : (
                        <span className="font-bold text-sm">{initials}</span>
                      )}
                    </span>
                  </button>

                  {profileMenuOpen && (
                    <div className="fixed top-14 md:top-16 right-0 w-full max-w-xs sm:max-w-sm rounded-2xl border border-[color:var(--color-border)] bg-[var(--color-bg-elevated)] backdrop-blur-md shadow-xl dark:shadow-glow overflow-hidden">
                      <div className="p-4 border-b border-[color:var(--color-border)]">
                        <div className="text-sm text-[var(--color-text-muted)]">Cuenta</div>
                        <div className="text-[var(--color-text)] font-semibold break-words leading-tight">
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
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--color-bg-muted)] text-[var(--color-text)] text-sm"
                        >
                          <span className="w-8 h-8 rounded-xl bg-accent-muted flex items-center justify-center text-[var(--color-accent)]">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--color-bg-muted)] text-[var(--color-text)] text-sm"
                        >
                          <span className="w-8 h-8 rounded-xl bg-accent-muted flex items-center justify-center text-[var(--color-accent)]">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--color-bg-muted)] text-[var(--color-text)] text-sm"
                        >
                          <span className="w-8 h-8 rounded-xl bg-accent-muted flex items-center justify-center text-[var(--color-accent)]">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          Recomendaciones
                        </button>

                        {isStaff && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              navigate('/admin-dashboard');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--color-bg-muted)] text-[var(--color-text)] text-sm"
                          >
                            <span className="w-8 h-8 rounded-xl bg-accent-muted flex items-center justify-center text-[var(--color-accent)]">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v3m0 0v3m0-3h6m-6 0H6m9-9v3m0 0v3m0-3h3m-3 0h-3m-3-9v3m0 0v3m0-3h3m-3 0H6" />
                              </svg>
                            </span>
                            Panel admin
                          </button>
                        )}

                        <div className="h-px bg-[color:var(--color-border)] my-2" />

                        <button
                          type="button"
                          onClick={() => {
                            setProfileMenuOpen(false);
                            navigate('/profile');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--color-bg-muted)] text-[var(--color-text)] text-sm"
                        >
                          <span className="w-8 h-8 rounded-xl bg-accent-muted flex items-center justify-center text-[var(--color-accent)]">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                  className="px-3 py-1.5 rounded-xl text-sm font-medium border border-[color:var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-muted)] transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm dark:shadow-glow-sm transition"
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
