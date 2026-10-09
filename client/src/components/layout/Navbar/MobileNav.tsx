import { memo } from 'react';
import { Link, useLocation } from 'react-router';
import { Search, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { NAV_ITEMS } from '@/config/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME_PATH } from '@/features/auth/constants/permissions';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface MobileNavProps {
  /** Called after any nav action so the parent Drawer can close itself. */
  onNavigate?: () => void;
}

/**
 * Content rendered inside the mobile Drawer (see ui/drawer.tsx). Kept as
 * its own component (not inlined in Navbar) so it's independently
 * memoizable — it only needs to re-render on route change, never on the
 * Navbar's scroll-driven re-renders.
 */
const MobileNav = memo(function MobileNav({ onNavigate }: MobileNavProps) {
  const { isAuthenticated, role, logout } = useAuth();
  const { pathname, hash } = useLocation();

  const handleLinkClick = (path: string) => {
    onNavigate?.();
    if (path.includes('#')) {
      const targetHash = path.slice(path.indexOf('#') + 1);
      if (pathname === '/') {
        setTimeout(() => {
          const el = document.getElementById(targetHash);
          if (el) {
            window.history.pushState(null, '', path);
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  return (
    <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
      <ul className="flex flex-col gap-1">
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
                onClick={() => handleLinkClick(item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'focus-visible:ring-primary block rounded-md px-4 py-3 text-base font-medium transition-colors focus-visible:ring-2 focus-visible:outline-hidden',
                  'text-foreground/80 hover:bg-muted hover:text-foreground',
                  isActive && 'bg-primary-50 text-primary dark:bg-primary-950 font-semibold',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <Separator className="my-4" />

      <div className="flex flex-col gap-2 px-1">
        <Button variant="outline" className="justify-start gap-2" onClick={onNavigate}>
          <Search className="size-4" />
          Search
        </Button>

        {isAuthenticated && role ? (
          <>
            <Button variant="outline" className="justify-start gap-2" onClick={onNavigate} asChild>
              <Link to={ROLE_HOME_PATH[role]}>
                <User className="size-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant="secondary"
              className="justify-start gap-2"
              onClick={() => {
                logout();
                onNavigate?.();
              }}
            >
              <LogOut className="size-4" />
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="justify-start gap-2" onClick={onNavigate} asChild>
              <Link to="/login">
                <LogIn className="size-4" />
                Login
              </Link>
            </Button>
            <Button
              variant="secondary"
              className="justify-start gap-2"
              onClick={onNavigate}
              asChild
            >
              <Link to="/register">
                <UserPlus className="size-4" />
                Register
              </Link>
            </Button>
          </>
        )}

        <Button className="mt-2" onClick={onNavigate} asChild>
          <Link to="/booking">Book Tour</Link>
        </Button>
      </div>
    </nav>
  );
});

export { MobileNav };
