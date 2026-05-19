import BrandLogo from './BrandLogo';

export default function AuthPageLogo() {
  return (
    <div className="flex items-center justify-center mb-6">
      <BrandLogo variant="auth" className="rounded-lg bg-white px-2 py-1" />
    </div>
  );
}
