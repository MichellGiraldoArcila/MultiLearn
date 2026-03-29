export default function PageContainer({
  children,
  className = '',
  maxWidthClass = 'max-w-7xl',
  fullWidth = false,
  as: As = 'main',
}) {
  return (
    <As
      className={`
        w-full
        ${!fullWidth ? `${maxWidthClass} mx-auto` : ''}
        px-4 sm:px-6 lg:px-8
        ${className}
      `}
    >
      {children}
    </As>
  );
}

