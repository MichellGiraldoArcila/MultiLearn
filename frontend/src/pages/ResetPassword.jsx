import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../components/auth/AuthCard';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import PageContainer from '../components/layout/PageContainer';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <PageContainer
      as="main"
      fullWidth
      className="min-h-screen bg-gray-50 dark:bg-gradient-to-br from-slate-900 to-slate-800 flex items-start justify-center pt-20 pb-12"
    >
      <AuthCard>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Reset contraseña</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-center text-sm">
          Ingresa tu correo y crea una nueva contraseña segura.
        </p>

        {serverError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-200 text-sm mb-4">
            {serverError}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-100 text-sm mb-4">
            {success}
          </div>
        )}

        <ResetPasswordForm
          onError={(msg) => setServerError(msg)}
          onSuccess={() => {
            setServerError('');
            setSuccess('Contraseña actualizada correctamente. Ya puedes iniciar sesión.');
            setTimeout(() => navigate('/login', { replace: true }), 800);
          }}
        />

        <div className="pt-2 text-center text-sm">
          <Link to="/login" className="text-sm text-gray-500 hover:underline">
            Volver al login
          </Link>
        </div>
      </AuthCard>
    </PageContainer>
  );
}

