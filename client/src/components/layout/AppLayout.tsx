import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { Menu } from 'lucide-react';

export default function AppLayout() {
  const { sidebarCollapsed, theme, toggleSidebar } = useAppStore();

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

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <Sidebar />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 glass border-b border-slate-200/80 dark:border-slate-700/90">
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-xl grid place-items-center bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-slate-200"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg grid place-items-center font-black text-white bg-gradient-to-br from-blue-600 to-blue-700 text-sm">N</div>
          <span className="font-bold tracking-tight text-sm">NEXTMILE</span>
        </div>
      </div>

      <main
        className={cn(
          'relative min-h-screen transition-all duration-300 ease-in-out p-4 lg:p-5',
          // Desktop: offset by sidebar width
          'lg:ml-[260px]',
          sidebarCollapsed && 'lg:ml-[72px]',
          // Mobile: no offset, add top padding for mobile header
          'ml-0 pt-[72px] lg:pt-5'
        )}
      >
        <div className="max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
