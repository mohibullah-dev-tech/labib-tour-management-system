import { RouterProvider } from 'react-router';
import { router } from '@/app/router';
import { QueryProvider } from '@/app/providers/QueryProvider';

function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  );
}

export default App;
