import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Aspect ratio class applied to the wrapper while loading (e.g. 'aspect-[4/3]'). */
  aspectClassName?: string;
  wrapperClassName?: string;
}

/**
 * Wraps a native lazy-loaded <img> with a Skeleton shown until it decodes.
 * Native `loading="lazy"` already defers offscreen image requests — this
 * component's job is purely the loading *state* (no layout shift, no
 * blank flash the instant an image scrolls into view).
 */
function LazyImage({
  aspectClassName,
  wrapperClassName,
  className,
  alt,
  onLoad,
  ...props
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('relative overflow-hidden', aspectClassName, wrapperClassName)}>
      {!loaded && <Skeleton className="absolute inset-0 size-full rounded-none" />}
      <img
        loading="lazy"
        decoding="async"
        alt={alt}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        className={cn(
          'size-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { LazyImage };
