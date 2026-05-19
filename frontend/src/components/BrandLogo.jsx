const SIZE_CLASS = {
  nav: 'h-11 sm:h-12',
  auth: 'h-20 sm:h-24',
  sm: 'h-8',
};

export default function BrandLogo({ variant = 'nav', className = '' }) {
  const heightClass = SIZE_CLASS[variant] || SIZE_CLASS.nav;

  return (
    <img
      src="/multilearn-logo.png"
      alt="MultiLearn"
      className={`w-auto max-w-full object-contain ${heightClass} ${className}`.trim()}
      decoding="async"
    />
  );
}
