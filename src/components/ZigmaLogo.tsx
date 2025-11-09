interface ZigmaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light';
  className?: string;
}

export function ZigmaLogo({ size = 'md', variant = 'default', className = '' }: ZigmaLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const bgClass = variant === 'light' 
    ? 'bg-muted' 
    : 'bg-foreground';

  const textClass = variant === 'light'
    ? 'text-foreground'
    : 'text-background';

  return (
    <div className={`${sizeClasses[size]} ${bgClass} rounded-lg flex items-center justify-center ${className}`}>
      <span className={`${textClass} font-semibold`}>Z</span>
    </div>
  );
}

