import { memo } from 'react';
import { NavLink, Link } from 'react-router';
import { Search, LogIn, UserPlus } from 'lucide-react';
import { NAV_ITEMS } from '@/config/navigation';
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
  return (
    <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'block rounded-md px-4 py-3 text-base font-medium transition-colors',
                  'text-foreground/80 hover:bg-muted hover:text-foreground',
                  isActive && 'bg-primary-50 text-primary dark:bg-primary-950',
                )
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      <Separator className="my-4" />

      <div className="flex flex-col gap-2 px-1">
        <Button variant="outline" className="justify-start gap-2" onClick={onNavigate}>
          <Search className="size-4" />
          Search
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={onNavigate}>
          <LogIn className="size-4" />
          Login
        </Button>
        <Button variant="secondary" className="justify-start gap-2" onClick={onNavigate}>
          <UserPlus className="size-4" />
          Register
        </Button>
        <Button className="mt-2" onClick={onNavigate} asChild>
          <Link to="/booking">Book Tour</Link>
        </Button>
      </div>
    </nav>
  );
});

export { MobileNav };
