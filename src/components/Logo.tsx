import React from 'react';
import { useShop } from '../context/ShopContext';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  isSmall?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'dark', isSmall = false }) => {
  const isLight = variant === 'light';
  const { generalSettings } = useShop();

  const customLogo = generalSettings?.logoUrl?.trim();
  const defaultLogo = isLight ? '/bastra-shoily-logo-light.svg' : '/bastra-shoily-logo.svg';
  const logoSrc = customLogo || defaultLogo;

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt={generalSettings?.siteName || 'BOSTROSHOILY | বস্ত্র শৈলী'}
        className={`object-contain transition-transform duration-200 hover:scale-102 max-w-[180px] sm:max-w-[240px] ${
          isLight ? 'brightness-110' : 'mix-blend-multiply'
        } ${isSmall ? 'h-9 sm:h-10' : 'h-10 sm:h-12'}`}
        onError={(e) => {
          // If custom logo fails to load, fallback to default SVG
          const target = e.currentTarget;
          if (target.src !== defaultLogo) {
            target.src = defaultLogo;
          }
        }}
      />
    </div>
  );
};

