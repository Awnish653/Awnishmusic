import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'minimal' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  onClick
}) => {
  const sizeMap = {
    xs: 'text-lg',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 group cursor-pointer select-none ${className}`}
    >
      <span
        className={`font-serif-title ${currentSize} font-bold tracking-tight text-[#FAF8F5] group-hover:text-[#E5F939] transition-colors`}
        style={{ letterSpacing: '-0.02em' }}
      >
        awnishxmusic
      </span>
    </div>
  );
};

