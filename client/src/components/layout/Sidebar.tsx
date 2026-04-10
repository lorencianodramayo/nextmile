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

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen z-50 flex flex-col gap-4 p-4 glass border-r border-slate-200/80 dark:border-slate-700/90 shadow-[8px_0_24px_rgba(15,23,42,0.04)] dark:shadow-[8px_0_24px_rgba(0,0,0,0.18)] transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[84px] px-3' : 'w-[260px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/75 dark:border-slate-700/90">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-[42px] h-[42px] rounded-[14px] grid place-items-center font-black text-white bg-gradient-to-br from-blue-600 to-blue-700 shadow-[0_10px_22px_rgba(37,99,235,0.25)] flex-shrink-0 text-lg">
              N
            </div>
            <div className="min-w-0">
              <div className="font-bold tracking-tight leading-none text-slate-900 dark:text-slate-100">
                NEXTMILE
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Trucking Services
              </div>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-[38px] h-[38px] rounded-xl grid place-items-center bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-slate-200 hover:bg-blue-100 dark:hover:bg-slate-700 flex-shrink-0 transition-colors shadow-sm"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5 pt-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 px-3.5 py-3 rounded-[14px] font-semibold text-[0.92rem] transition-all duration-200 group',
                sidebarCollapsed && 'justify-center px-0',
                isActive
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)]'
                  : 'text-slate-500 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-white'
              )
            }
          >
            <Icon size={22} strokeWidth={2} className="flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:scale-105" />
            {!sidebarCollapsed && <span className="whitespace-nowrap">{label}</span>}
            {sidebarCollapsed && (
              <span className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {label}
                <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900" />
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-slate-200/75 dark:border-slate-700/90">
        <button
          onClick={toggleTheme}
          className={cn(
            'w-full min-h-[46px] border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 rounded-[18px] px-4 py-3 shadow-sm flex items-center gap-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-3',
            sidebarCollapsed && 'justify-center px-3'
          )}
        >
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          {!sidebarCollapsed && (
            <span className="text-sm">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          )}
        </button>

        {!sidebarCollapsed && (
          <>
            <div className="text-[1.1rem] font-bold text-slate-900 dark:text-slate-100 leading-tight">
              ROBIN SANTOS
            </div>
            <div className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5 shadow-[0_0_6px_rgba(34,197,94,0.8)] live-dot" />
              Live Data Connected
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
