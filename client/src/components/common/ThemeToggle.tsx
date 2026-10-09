import { Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme, type Theme } from '@/lib/theme/useTheme';
import { cn } from '@/lib/utils';

export interface ThemeToggleProps {
  onTransparentSurface?: boolean;
  className?: string;
  variant?: 'dropdown' | 'compact';
}

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

/**
 * Ultra-premium Light / Dark / System theme switcher.
 * Supports direct 1-click toggle and dropdown menu selection,
 * adapting seamlessly to transparent hero surfaces and solid navbars.
 */
function ThemeToggle({
  onTransparentSurface = false,
  className,
  variant = 'compact',
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const handleToggle = () => {
    // Quick flip between light and dark
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  if (variant === 'compact') {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Current: ${theme} (${resolvedTheme}) — Click to toggle`}
        className={cn(
          'relative size-9 rounded-full transition-all duration-300',
          onTransparentSurface
            ? 'border-white/20 bg-white/10 text-white backdrop-blur-xs hover:bg-white/20 hover:text-white'
            : 'border-border/70 bg-background/80 hover:bg-muted text-foreground border shadow-2xs',
          className,
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {resolvedTheme === 'dark' ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex items-center justify-center text-amber-300"
            >
              <Moon className="size-4" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex items-center justify-center text-amber-500"
            >
              <Sun className="size-4" />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  // Full Dropdown variant
  const ActiveIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Theme settings"
          className={cn(
            'size-9 rounded-full transition-colors',
            onTransparentSurface
              ? 'text-white hover:bg-white/15'
              : 'border-border/70 text-foreground border',
            className,
          )}
        >
          <ActiveIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {OPTIONS.map(({ value, label, icon: OptionIcon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn('gap-2.5 text-xs', theme === value && 'text-primary font-semibold')}
          >
            <OptionIcon className="size-3.5" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ThemeToggle };
