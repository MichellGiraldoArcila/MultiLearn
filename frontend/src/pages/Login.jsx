import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { auth } from '../services/api';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PasswordInput from '../components/auth/PasswordInput';
import PageContainer from '../components/layout/PageContainer';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [serverError, setServerError] = useState('');

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  const email = watch('email');
  const password = watch('password');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const { data } = await auth.login(values.email, values.password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      const next = from && from !== '/' ? from : '/dashboard';
      navigate(next, { replace: true });
      window.location.reload();
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setServerError(err.response?.data?.detail || 'Usuario o contraseña incorrectos');
      } else {
        setServerError(
          err.response?.data?.detail ||
            err.response?.data?.email?.[0] ||
            err.response?.data?.password?.[0] ||
            'Error al iniciar sesión'
        );
      }
    }
  };

  return (
    <PageContainer
      as="main"
      fullWidth
      className="min-h-screen bg-gray-50 dark:bg-gradient-to-br from-slate-900 to-slate-800 flex items-start justify-center pt-20 pb-12"
    >
      <AuthCard>
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-600/10 dark:bg-primary-600/20 border border-primary-600/30 flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-primary-600 dark:text-primary-300">
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
              <path d="M12 16.8h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Iniciar sesión</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-center text-sm">
          Aprende con recomendaciones personalizadas y guarda tus favoritos.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-200 text-sm">
              {serverError}
            </div>
          )}

          <InputField
            id="email"
            label="Email"
            value={email}
            onChange={(v) => setValue('email', v, { shouldValidate: true })}
            placeholder="tu@email.com"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
          />

          <PasswordInput
            id="password"
            label="Contraseña"
            value={password}
            onChange={(v) => setValue('password', v, { shouldValidate: true })}
            placeholder="Tu contraseña"
            autoComplete="current-password"
            error={errors.password?.message}
          />

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full py-3 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="flex justify-center pt-1">
            <Link to="/reset-password" className="text-sm text-gray-500 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </AuthCard>
    </PageContainer>
  );
}
