import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  colorClass?: string;
}

export default function KpiCard({ label, value, subtitle, icon, colorClass = 'bg-blue-600/10 text-blue-600' }: KpiCardProps) {
  return (
    <div className="relative p-[18px] min-h-[122px] rounded-[22px] bg-gradient-to-b from-white to-slate-50/95 dark:from-slate-900 dark:to-slate-800/90 border border-slate-200/90 dark:border-slate-700/90 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between gap-2.5 kpi-glow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.72rem] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-2 leading-none">
            {label}
          </div>
          <div className="text-[1.7rem] font-bold leading-none tracking-tight">
            {value}
          </div>
        </div>
        <div className={cn('w-[42px] h-[42px] rounded-[14px] grid place-items-center flex-shrink-0', colorClass)}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-tight">
        {subtitle}
      </p>
    </div>
  );
}
