import { createBrowserRouter } from 'react-router';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/**
 * Central route table. Feature modules will register their own route
 * objects here as they're built (e.g. `...authRoutes`, `...bookingRoutes`)
 * instead of this file growing into a monolith.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
