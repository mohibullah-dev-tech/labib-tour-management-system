import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, Search, LogIn, UserPlus, Compass, LogOut, User } from 'lucide-react';
import { useScrolled } from '@/hooks/useScrolled';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME_PATH } from '@/features/auth/constants/permissions';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavLinks } from '@/components/layout/Navbar/NavLinks';
import { MobileNav } from '@/components/layout/Navbar/MobileNav';
import { Container } from '@/components/common/Container';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { cn } from '@/lib/utils';

export interface NavbarProps {
  /**
   * When true, the navbar starts fully transparent (for pages with a
   * full-bleed hero image behind it) and becomes solid once the user
   * scrolls past the threshold. When false (default), it's always solid
   * — the correct choice for every page that doesn't have a hero.
   */
  transparentOnTop?: boolean;
}

/**
 * Sticky primary navigation. Solid/transparent state is driven by
 * `useScrolled` — a single boolean flip, not per-pixel style
 * recalculation, so scrolling stays smooth.
 */
function Navbar({ transparentOnTop = false }: NavbarProps) {
  const scrolled = useScrolled(24);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isTransparent = transparentOnTop && !scrolled;
  const { user, role, isAuthenticated, logout } = useAuth();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-colors duration-300',
        isTransparent
          ? 'bg-transparent'
          : 'border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 border-b shadow-sm backdrop-blur',
      )}
    >
      <Container>
        <nav aria-label="Primary" className="flex h-16 items-center justify-between gap-4">
          {/* Logo — placeholder wordmark until brand assets exist. */}
          <Link
            to="/"
            className={cn(
              'font-display flex items-center gap-2 text-lg font-semibold tracking-tight transition-colors',
              isTransparent ? 'text-white' : 'text-foreground',
            )}
          >
            <Compass
              className={cn('size-6', isTransparent ? 'text-white' : 'text-primary')}
              aria-hidden="true"
            />
            LTMS
          </Link>

          {/* Desktop nav — hidden below the laptop breakpoint. */}
          <NavLinks onTransparentSurface={isTransparent} className="laptop:flex hidden" />

          {/* Desktop actions */}
          <div className="laptop:flex hidden items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Search"
                  className={
                    isTransparent ? 'text-white hover:bg-white/10 hover:text-white' : undefined
                  }
                >
                  <Search className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search tours</TooltipContent>
            </Tooltip>

            {/* Dark / Light Mode Switcher */}
            <ThemeToggle onTransparentSurface={isTransparent} />

            {isAuthenticated && user && role ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account menu"
                    className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <Avatar className="size-9">
                      <AvatarImage src={user.avatarUrl} alt="" />
                      <AvatarFallback>
                        {user.fullName
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-foreground font-medium">{user.fullName}</p>
                    <p className="text-muted-foreground text-xs font-normal">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={ROLE_HOME_PATH[role]}>
                      <User className="mr-2 size-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => logout()}>
                    <LogOut className="mr-2 size-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className={cn(
                    'gap-2',
                    isTransparent && 'text-white hover:bg-white/10 hover:text-white',
                  )}
                  asChild
                >
                  <Link to="/login">
                    <LogIn className="size-4" />
                    Login
                  </Link>
                </Button>
                <Button
                  variant={isTransparent ? 'outline' : 'secondary'}
                  className={cn(
                    'gap-2',
                    isTransparent && 'border-white/40 bg-transparent text-white hover:bg-white/10',
                  )}
                  asChild
                >
                  <Link to="/register">
                    <UserPlus className="size-4" />
                    Register
                  </Link>
                </Button>
              </>
            )}
            <Button asChild>
              <Link to="/booking">Book Tour</Link>
            </Button>
          </div>

          {/* Mobile: theme toggle + hamburger opens the bottom Drawer */}
          <div className="laptop:hidden flex items-center gap-1.5">
            <ThemeToggle onTransparentSurface={isTransparent} />
            <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className={cn(isTransparent && 'text-white hover:bg-white/10 hover:text-white')}
                >
                  <Menu className="size-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Menu</DrawerTitle>
                </DrawerHeader>
                <MobileNav onNavigate={() => setMobileOpen(false)} />
              </DrawerContent>
            </Drawer>
          </div>
        </nav>
      </Container>
    </header>
  );
}

export { Navbar };
