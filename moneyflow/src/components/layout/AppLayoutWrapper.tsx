import { Outlet } from 'react-router-dom';
import { AppLayout } from './AppLayout';

export function AppLayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
