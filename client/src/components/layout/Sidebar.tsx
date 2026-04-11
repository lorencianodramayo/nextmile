import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Route,
  HandCoins,
  BarChart3,
  Truck,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trips', icon: Route, label: 'Trips' },
  { to: '/expenses', icon: HandCoins, label: 'Expenses' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/trucks', icon: Truck, label: 'Trucks' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useAppStore();
  const isOpen = !sidebarCollapsed;

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen z-50 flex flex-col gap-4 p-4 border-r transition-all duration-300 ease-in-out',
        // Glass styling
        'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/80 dark:border-slate-700/80',
        'shadow-[4px_0_20px_rgba(15,23,42,0.05)] dark:shadow-[4px_0_20px_rgba(0,0,0,0.2)]',
        // Desktop: always visible
        'hidden lg:flex',
        sidebarCollapsed ? 'lg:w-[56px] lg:px-1.5' : 'lg:w-[260px]',
        // Mobile: slide-out drawer when open
        isOpen && '!flex w-[280px]'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/60', sidebarCollapsed ? 'flex-col' : 'justify-between')}>
        {isOpen && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl grid place-items-center font-black text-white bg-gradient-to-br from-blue-600 to-blue-700 shadow-md flex-shrink-0 text-sm">
              N
            </div>
            <div className="min-w-0">
              <div className="font-bold tracking-tight leading-none text-sm text-slate-900 dark:text-slate-100">NEXTMILE</div>
              <div className="text-[0.65rem] text-slate-400 mt-0.5">Trucking Services</div>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="hidden lg:grid w-9 h-9 rounded-xl place-items-center font-black text-white bg-gradient-to-br from-blue-600 to-blue-700 shadow-md text-sm">
            N
          </div>
        )}
        {/* Desktop toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'hidden lg:grid w-8 h-8 rounded-lg place-items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0',
            sidebarCollapsed && 'w-9 mt-1'
          )}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        {/* Mobile close */}
        <button onClick={toggleSidebar} className="lg:hidden w-8 h-8 rounded-lg grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0">
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 pt-0.5 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-xl font-medium text-sm transition-all duration-150 group',
                sidebarCollapsed ? 'justify-center p-2' : 'px-3 py-2.5',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
              )
            }
          >
            <Icon size={20} strokeWidth={2} className="flex-shrink-0" />
            {isOpen && <span>{label}</span>}
            {sidebarCollapsed && (
              <span className="hidden lg:block absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 bg-slate-800 dark:bg-slate-700 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60]">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn('pt-3 border-t border-slate-200/60 dark:border-slate-700/60', sidebarCollapsed && 'flex flex-col items-center')}>
        <button
          onClick={toggleTheme}
          className={cn(
            'w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-3',
            sidebarCollapsed ? 'justify-center p-2' : 'px-3 py-2.5'
          )}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          {isOpen && <span className="text-xs font-medium">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>}
        </button>

        {isOpen && (
          <>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">ROBIN SANTOS</div>
            <div className="text-[0.65rem] text-slate-400 mt-0.5 flex items-center">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 shadow-[0_0_4px_rgba(34,197,94,0.8)] live-dot" />
              Live Data Connected
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
