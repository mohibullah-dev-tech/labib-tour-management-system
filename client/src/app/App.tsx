import { RouterProvider } from 'react-router';
import { router } from '@/app/router';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        {/* TooltipProvider is required once at the root by Radix Tooltip. */}
        <TooltipProvider delayDuration={200}>
          <RouterProvider router={router} />
          {/* Global toast portal — lives once at the app root, never per-page. */}
          <Toaster />
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
