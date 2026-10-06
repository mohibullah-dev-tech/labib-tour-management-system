import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, LogOut, Settings, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { AdminSidebar } from '@/features/admin/components/layout/AdminSidebar';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';

function AdminTopbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="border-border bg-background/95 laptop:px-6 sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="laptop:hidden"
          aria-label="Open admin menu"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin navigation</SheetTitle>
            </SheetHeader>
            <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <NotificationCenter />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="focus-visible:ring-ring flex items-center gap-2 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Avatar className="size-9">
                <AvatarImage src="https://picsum.photos/seed/ltms-admin-user/80/80" alt="" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-foreground font-medium">Admin User</p>
              <p className="text-muted-foreground text-xs font-normal">admin@labibtours.com</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/settings">
                <UserCircle className="mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/settings">
                <Settings className="mr-2 size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/">
                <LogOut className="mr-2 size-4" />
                Log Out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export { AdminTopbar };
