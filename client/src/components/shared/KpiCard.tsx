import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  previousValue?: number;
  currentValue?: number;
  subtitle: string;
  icon: ReactNode;
  colorClass?: string;
  /** For KPIs where lower is better (e.g. expenses, payable), invert the color logic */
  invertTrend?: boolean;
}

function getDelta(current: number | undefined, previous: number | undefined) {
  if (current === undefined || previous === undefined || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export default function KpiCard({
  label, value, previousValue, currentValue, subtitle, icon,
  colorClass = 'bg-blue-600/10 text-blue-600',
  invertTrend = false,
}: KpiCardProps) {
  const delta = getDelta(currentValue, previousValue);

  const isPositive = delta !== null && delta > 0;
  const isNegative = delta !== null && delta < 0;
  const isNeutral = delta === null || delta === 0;

  // For inverted KPIs (expenses, payable), positive delta = bad (red), negative = good (green)
  const goodDirection = invertTrend ? isNegative : isPositive;
  const badDirection = invertTrend ? isPositive : isNegative;

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
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-tight">
          {subtitle}
        </p>
        {delta !== null && !isNeutral && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-[0.68rem] font-semibold whitespace-nowrap flex-shrink-0 px-1.5 py-0.5 rounded-md',
              goodDirection && 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
              badDirection && 'text-red-500 dark:text-red-400 bg-red-500/10',
            )}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{isPositive ? '+' : ''}{delta.toFixed(1)}%</span>
          </div>
        )}
        {isNeutral && previousValue !== undefined && previousValue > 0 && (
          <div className="flex items-center gap-0.5 text-[0.68rem] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
            <Minus size={12} />
            <span>0%</span>
          </div>
        )}
      </div>
    </div>
  );
}
