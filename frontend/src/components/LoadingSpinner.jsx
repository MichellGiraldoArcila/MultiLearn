export default function LoadingSpinner({ size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className="flex justify-center items-center p-8">
      <div
        className={`${sizeClass} border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
        role="status"
        aria-label="Cargando"
      />
    </div>
  );
}
