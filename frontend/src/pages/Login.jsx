import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { auth } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PasswordInput from '../components/auth/PasswordInput';
import PageContainer from '../components/layout/PageContainer';
import AuthPageLogo from '../components/AuthPageLogo';

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
      if (!data?.access || !data?.refresh) {
        setServerError('Respuesta del servidor incompleta. No se recibieron tokens.');
        return;
      }
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      const next = from && from !== '/' ? from : '/dashboard';
      navigate(next, { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Error al iniciar sesión'));
    }
  };

  return (
    <PageContainer
      as="main"
      fullWidth
      className="min-h-screen bg-gray-50 dark:bg-gradient-to-br from-slate-900 to-slate-800 flex items-start justify-center pt-20 pb-12"
    >
      <AuthCard>
        <AuthPageLogo />

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
