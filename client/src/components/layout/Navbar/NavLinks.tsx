import { memo } from 'react';
import { Link, useLocation } from 'react-router';
import { NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';

export interface NavLinksProps {
  /** True when the navbar is rendering over a hero image (light text on transparent bg). */
  onTransparentSurface?: boolean;
  className?: string;
}

/**
 * Desktop horizontal nav list with smooth scrolling to in-page section hashes.
 */
const NavLinks = memo(function NavLinks({
  onTransparentSurface = false,
  className,
}: NavLinksProps) {
  const { pathname, hash } = useLocation();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.includes('#')) {
      const targetHash = path.slice(path.indexOf('#') + 1);
      if (pathname === '/') {
        const el = document.getElementById(targetHash);
        if (el) {
          e.preventDefault();
          window.history.pushState(null, '', path);
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  return (
    <ul className={cn('flex items-center gap-1', className)}>
      {NAV_ITEMS.map((item) => {
        const isHashLink = item.path.includes('#');
        const itemHash = isHashLink ? item.path.slice(item.path.indexOf('#')) : '';
        const isActive = isHashLink
          ? pathname === '/' && hash === itemHash
          : item.path === '/'
            ? pathname === '/' && !hash
            : pathname.startsWith(item.path);

        return (
          <li key={item.path}>
            <Link
              to={item.path}
              onClick={(e) => handleLinkClick(e, item.path)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'focus-visible:ring-primary rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
                onTransparentSurface
                  ? 'text-white/90 hover:bg-white/10 hover:text-white'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                isActive &&
                  (onTransparentSurface
                    ? 'decoration-primary font-semibold text-white underline underline-offset-4'
                    : 'text-primary bg-primary-50 dark:bg-primary-950 font-semibold'),
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
});

export { NavLinks };
