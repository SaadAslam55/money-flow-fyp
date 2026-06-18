import { Outlet } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AIChatbot } from '@/components/ai/AIChatbot';

export function AppLayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
      <AIChatbot position="bottom-right" />
    </AppLayout>
  );
}
