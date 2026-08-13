import { RouterProvider } from 'react-router';
import { router } from '@/app/router';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        {/* AuthProvider needs QueryClient (it uses TanStack Query internally)
            so it must nest inside QueryProvider, and needs to wrap the router
            so every route — including guards evaluated during routing — can
            call useAuth(). */}
        <AuthProvider>
          {/* TooltipProvider is required once at the root by Radix Tooltip. */}
          <TooltipProvider delayDuration={200}>
            <RouterProvider router={router} />
            {/* Global toast portal — lives once at the app root, never per-page. */}
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
