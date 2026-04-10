import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export default function AppLayout() {
  const { sidebarCollapsed, theme } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      {/* Gradient orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-600/[0.06] dark:bg-blue-600/[0.08] blur-3xl" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-500/[0.05] dark:bg-teal-500/[0.06] blur-3xl" />
      </div>

      <Sidebar />
      <main
        className={cn(
          'relative min-h-screen transition-all duration-300 ease-in-out p-5',
          sidebarCollapsed ? 'ml-[84px]' : 'ml-[260px]'
        )}
      >
        <div className="max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
