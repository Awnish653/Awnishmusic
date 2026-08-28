import React, { useState, useEffect } from 'react';
import { getSafeImageUrl, generateFallbackCover } from '../utils/image';

export type ImageType = 'song' | 'artist' | 'album' | 'playlist';

export interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: any;
  alt: string;
  fallbackTitle?: string;
  type?: ImageType;
  containerClassName?: string;
  isCircle?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallbackTitle,
  type = 'song',
  containerClassName = '',
  className = '',
  isCircle = false,
  ...props
}) => {
  const targetTitle = fallbackTitle || alt || 'AwnishX';
  const imgType: ImageType = (type as ImageType) || 'song';
  const resolvedInitialSrc = getSafeImageUrl(src, targetTitle, imgType);

  const [imgSrc, setImgSrc] = useState<string>(resolvedInitialSrc);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const nextUrl = getSafeImageUrl(src, targetTitle, imgType);
    setImgSrc(nextUrl);
    setHasError(false);
    setIsLoaded(false);
  }, [src, targetTitle, imgType]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(generateFallbackCover(targetTitle, imgType));
    }
  };

  return (
    <div className={`relative overflow-hidden ${isCircle ? 'rounded-full' : ''} ${containerClassName}`}>
      {/* Subtle skeleton shimmer while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-zinc-800/80 animate-pulse" />
      )}

      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={handleError}
        onLoad={() => setIsLoaded(true)}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
