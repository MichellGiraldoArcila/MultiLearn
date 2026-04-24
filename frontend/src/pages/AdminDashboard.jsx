import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminCourses } from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';
import PageContainer from '../components/layout/PageContainer';
import InputField from '../components/auth/InputField';

const emptyForm = () => ({
  title: '',
  description: '',
  platform: '',
  instructor: '',
  category: '',
  level: '',
  rating: '',
  url: '',
  image_url: '',
  video_url: '',
});

function buildPayload(form) {
  const ratingRaw = (form.rating ?? '').toString().trim();
  let rating = null;
  if (ratingRaw !== '') {
    const n = parseFloat(ratingRaw);
    rating = Number.isFinite(n) ? n : null;
  }
  return {
    title: form.title.trim(),
    description: (form.description || '').trim(),
    platform: form.platform.trim(),
    instructor: (form.instructor || '').trim(),
    category: form.category.trim(),
    level: form.level.trim(),
    rating,
    url: (form.url || '').trim(),
    image_url: (form.image_url || '').trim(),
    video_url: (form.video_url || '').trim(),
  };
}

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [mode, setMode] = useState('create');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCourses = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await adminCourses.list({ page_size: 100 });
      const rows = data.results ?? data ?? [];
      setCourses(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setCourses([]);
      setError(getApiErrorMessage(e, 'No se pudieron cargar los cursos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm());
    setMode('create');
    setEditingId(null);
    setFormError('');
  };

  const startEdit = (course) => {
    setMode('edit');
    setEditingId(course.id);
    setForm({
      title: course.title || '',
      description: course.description || '',
      platform: course.platform || '',
      instructor: course.instructor || '',
      category: course.category || '',
      level: course.level || '',
      rating: course.rating != null ? String(course.rating) : '',
      url: course.url || '',
      image_url: course.image_url || '',
      video_url: course.video_url || '',
    });
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const payload = buildPayload(form);
    if (!payload.title || !payload.platform || !payload.category || !payload.level) {
      setFormError('Completa título, plataforma, categoría y nivel.');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'edit' && editingId != null) {
        await adminCourses.update(editingId, payload);
      } else {
        await adminCourses.create(payload);
      }
      resetForm();
      await loadCourses();
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'No se pudo guardar el curso.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`¿Eliminar el curso «${course.title}»? Esta acción no se puede deshacer.`)) {
      return;
    }
    setError('');
    try {
      await adminCourses.remove(course.id);
      if (editingId === course.id) resetForm();
      await loadCourses();
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar el curso.'));
    }
  };

  return (
    <PageContainer className="py-10 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Panel de administración</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Crear, editar y eliminar cursos del catálogo.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
        >
          Volver al inicio
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      <section className="mb-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {mode === 'edit' ? 'Editar curso' : 'Nuevo curso'}
          </h2>
          {mode === 'edit' && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-200 text-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="adm-title"
              label="Título *"
              value={form.title}
              onChange={(v) => updateField('title', v)}
              placeholder="Ej. Python desde cero"
            />
            <InputField
              id="adm-platform"
              label="Plataforma *"
              value={form.platform}
              onChange={(v) => updateField('platform', v)}
              placeholder="Udemy, Coursera…"
            />
          </div>

          <div>
            <label htmlFor="adm-desc" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Descripción
            </label>
            <textarea
              id="adm-desc"
              rows={4}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Resumen del curso"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="adm-category"
              label="Categoría *"
              value={form.category}
              onChange={(v) => updateField('category', v)}
              placeholder="programming, design…"
            />
            <InputField
              id="adm-level"
              label="Nivel *"
              value={form.level}
              onChange={(v) => updateField('level', v)}
              placeholder="beginner, intermediate…"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="adm-instructor"
              label="Instructor"
              value={form.instructor}
              onChange={(v) => updateField('instructor', v)}
              placeholder="Nombre"
            />
            <InputField
              id="adm-rating"
              label="Valoración (0–5)"
              type="text"
              value={form.rating}
              onChange={(v) => updateField('rating', v)}
              placeholder="Opcional"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="adm-url"
              label="URL del curso"
              value={form.url}
              onChange={(v) => updateField('url', v)}
              placeholder="https://…"
            />
            <InputField
              id="adm-image"
              label="URL de imagen"
              value={form.image_url}
              onChange={(v) => updateField('image_url', v)}
              placeholder="https://…"
            />
          </div>

          <div>
            <InputField
              id="adm-video"
              label="URL del vídeo (YouTube o Vimeo)"
              value={form.video_url}
              onChange={(v) => updateField('video_url', v)}
              placeholder="https://www.youtube.com/watch?v=… o https://vimeo.com/…"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Opcional. Se mostrará embebido en la página del curso.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
          >
            {saving ? 'Guardando…' : mode === 'edit' ? 'Actualizar curso' : 'Crear curso'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Cursos publicados</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="inline-block w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-sm">No hay cursos. Crea el primero con el formulario superior.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-600 dark:text-slate-400">
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Plataforma</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Categoría</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800/80 last:border-0">
                    <td className="px-4 py-3 text-slate-900 dark:text-white max-w-xs truncate">{c.title}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 hidden sm:table-cell">{c.platform}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 hidden md:table-cell">{c.category}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="text-primary-600 dark:text-primary-400 hover:underline mr-4"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
