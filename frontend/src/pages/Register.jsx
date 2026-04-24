import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { auth } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PasswordInput from '../components/auth/PasswordInput';
import PasswordStrengthBar from '../components/auth/PasswordStrengthBar';
import PasswordChecklist from '../components/auth/PasswordChecklist';
import PageContainer from '../components/layout/PageContainer';
import InterestChipPicker from '../components/preferences/InterestChipPicker';
import { LEVEL_OPTIONS, defaultPreferences } from '../constants/preferences';

const registerSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .refine((v) => /[a-z]/.test(v), 'Debe incluir al menos 1 minúscula')
    .refine((v) => /[A-Z]/.test(v), 'Debe incluir al menos 1 mayúscula')
    .refine((v) => /[^A-Za-z0-9]/.test(v), 'Debe incluir al menos 1 carácter especial'),
});

export default function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [prefs, setPrefs] = useState(() => defaultPreferences());

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await auth.register({
        name: values.name,
        email: values.email,
        password: values.password,
        preferences: {
          interests: prefs.interests,
          level: prefs.level || '',
          goal: (prefs.goal || '').trim(),
        },
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Error al registrarse'));
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
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-primary-600 dark:text-primary-300"
            >
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

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Crear cuenta</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-center text-sm">
          Regístrate para guardar favoritos y ver recomendaciones.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-200 text-sm">
              {serverError}
            </div>
          )}

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputField
                id="name"
                label="Nombre"
                value={field.value || ''}
                onChange={(v) => field.onChange(v)}
                placeholder="Tu nombre"
                error={errors.name?.message}
                autoComplete="name"
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <InputField
                id="email"
                label="Email"
                value={field.value || ''}
                onChange={(v) => field.onChange(v)}
                placeholder="tu@email.com"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                id="password"
                label="Contraseña"
                value={field.value || ''}
                onChange={(v) => field.onChange(v)}
                placeholder="Mínimo 8, 1 minúscula, 1 mayúscula y 1 especial"
                autoComplete="new-password"
                error={errors.password?.message}
              />
            )}
          />

          <PasswordStrengthBar password={passwordValue} />
          <PasswordChecklist password={passwordValue} />

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-4">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Preferencias de aprendizaje (opcional)</p>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Intereses</p>
              <InterestChipPicker
                value={prefs.interests}
                onChange={(interests) => setPrefs((p) => ({ ...p, interests }))}
              />
            </div>
            <div>
              <label htmlFor="reg-level" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                Nivel
              </label>
              <select
                id="reg-level"
                value={prefs.level}
                onChange={(e) => setPrefs((p) => ({ ...p, level: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              >
                {LEVEL_OPTIONS.map((o) => (
                  <option key={o.id || 'none'} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="reg-goal" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                Objetivo
              </label>
              <textarea
                id="reg-goal"
                rows={2}
                value={prefs.goal}
                onChange={(e) => setPrefs((p) => ({ ...p, goal: e.target.value }))}
                placeholder='Ej. "Ser desarrollador frontend"'
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full py-3 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </AuthCard>
    </PageContainer>
  );
}
