import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, Search, LogIn, UserPlus, Compass } from 'lucide-react';
import { useScrolled } from '@/hooks/useScrolled';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { NavLinks } from '@/components/layout/Navbar/NavLinks';
import { MobileNav } from '@/components/layout/Navbar/MobileNav';
import { Container } from '@/components/common/Container';
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

            <Button
              variant="ghost"
              className={cn(
                'gap-2',
                isTransparent && 'text-white hover:bg-white/10 hover:text-white',
              )}
            >
              <LogIn className="size-4" />
              Login
            </Button>
            <Button
              variant={isTransparent ? 'outline' : 'secondary'}
              className={cn(
                'gap-2',
                isTransparent && 'border-white/40 bg-transparent text-white hover:bg-white/10',
              )}
            >
              <UserPlus className="size-4" />
              Register
            </Button>
            <Button>Book Tour</Button>
          </div>

          {/* Mobile: hamburger opens the bottom Drawer */}
          <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className={cn(
                  'laptop:hidden',
                  isTransparent && 'text-white hover:bg-white/10 hover:text-white',
                )}
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
        </nav>
      </Container>
    </header>
  );
}

export { Navbar };
