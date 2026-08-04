import { memo } from 'react';
import { NavLink } from 'react-router';
import { NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';

export interface NavLinksProps {
  /** True when the navbar is rendering over a hero image (light text on transparent bg). */
  onTransparentSurface?: boolean;
  className?: string;
}

/**
 * Desktop horizontal nav list. Memoized: it only ever re-renders when the
 * route changes or the transparent/solid surface flips — not on every
 * Navbar re-render caused by unrelated state (e.g. a dropdown opening).
 * React Router's <NavLink> sets `aria-current="page"` on the active link
 * automatically, satisfying "Active Route Highlight" without extra code.
 */
const NavLinks = memo(function NavLinks({
  onTransparentSurface = false,
  className,
}: NavLinksProps) {
  return (
    <ul className={cn('flex items-center gap-1', className)}>
      {NAV_ITEMS.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                onTransparentSurface
                  ? 'text-white/90 hover:bg-white/10 hover:text-white'
                  : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                isActive &&
                  (onTransparentSurface
                    ? 'text-white'
                    : 'text-primary bg-primary-50 dark:bg-primary-950'),
              )
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
});

export { NavLinks };
