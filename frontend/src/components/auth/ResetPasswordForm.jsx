import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { auth } from '../../services/api';
import InputField from './InputField';
import PasswordInput from './PasswordInput';
import PasswordStrengthBar from './PasswordStrengthBar';
import PasswordChecklist from './PasswordChecklist';

const resetSchema = z
  .object({
    email: z.string().email('Email inválido'),
    new_password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .refine((v) => /[a-z]/.test(v), 'Debe incluir al menos 1 minúscula')
      .refine((v) => /[A-Z]/.test(v), 'Debe incluir al menos 1 mayúscula')
      .refine((v) => /[^A-Za-z0-9]/.test(v), 'Debe incluir al menos 1 carácter especial'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  });

export default function ResetPasswordForm({
  defaultEmail = '',
  emailReadOnly = false,
  submitLabel = 'Actualizar contraseña',
  onSuccess,
  onError,
}) {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(resetSchema),
    mode: 'onChange',
    defaultValues: {
      email: defaultEmail,
      new_password: '',
      confirm_password: '',
    },
  });

  const newPassword = watch('new_password');
  const confirmPassword = watch('confirm_password');

  const checks = useMemo(() => ({
    min8: (newPassword || '').length >= 8,
    hasLower: /[a-z]/.test(newPassword || ''),
    hasUpper: /[A-Z]/.test(newPassword || ''),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword || ''),
    match: !!newPassword && newPassword === (confirmPassword || ''),
  }), [newPassword, confirmPassword]);

  const currentEmail = watch('email');
  useEffect(() => {
    if (!defaultEmail) return;
    if (currentEmail === defaultEmail) return;
    reset({ email: defaultEmail, new_password: '', confirm_password: '' });
  }, [defaultEmail, currentEmail, reset]);

  const canSubmit = isValid && !isSubmitting;

  const handleValidSubmit = async (values) => {
    const payload = {
      email: values.email,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    };
    try {
      const res = await auth.resetPassword(payload);
      if (onSuccess) onSuccess(res?.data);
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.email?.[0] || err.message;
      if (onError) onError(detail || 'No se pudo actualizar la contraseña.');
      // Para que RHF refleje el fallo, marcamos error global en consola.
      // (No usamos setError para mantener el formulario reutilizable.)
    }
  };

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4">
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <InputField
            id="reset-email"
            label="Correo electrónico"
            value={field.value || ''}
            onChange={(v) => field.onChange(v)}
            error={errors.email?.message}
            placeholder="tu@email.com"
            type="email"
            autoComplete="email"
            readOnly={emailReadOnly}
          />
        )}
      />

      <Controller
        name="new_password"
        control={control}
        render={({ field }) => (
          <PasswordInput
            id="reset-new-password"
            label="Nueva contraseña"
            value={field.value || ''}
            onChange={(v) => field.onChange(v)}
            placeholder="Mínimo 8, 1 minúscula, 1 mayúscula y 1 especial"
            autoComplete="new-password"
            error={errors.new_password?.message}
          />
        )}
      />

      <PasswordStrengthBar password={newPassword || ''} />
      <PasswordChecklist password={newPassword || ''} />

      <Controller
        name="confirm_password"
        control={control}
        render={({ field }) => (
          <PasswordInput
            id="reset-confirm-password"
            label="Confirmar contraseña"
            value={field.value || ''}
            onChange={(v) => field.onChange(v)}
            placeholder="Repite la nueva contraseña"
            autoComplete="new-password"
            error={errors.confirm_password?.message}
          />
        )}
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Actualizando...' : submitLabel}
      </button>
    </form>
  );
}

