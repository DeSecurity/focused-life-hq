import { Sidebar } from './Sidebar';
import { QuickAddDialog } from '@/components/dialogs/QuickAddDialog';
import { useApp } from '@/contexts/AppContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <div className="h-screen overflow-y-auto">
          {children}
        </div>
      </main>
      <QuickAddDialog />
    </div>
  );
}
