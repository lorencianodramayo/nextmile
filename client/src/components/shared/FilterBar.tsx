import { RotateCcw, CalendarDays } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { RangePreset } from '../../lib/dateHelpers';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FilterBarProps {
  showTruck?: boolean;
  showRange?: boolean;
  showMonth?: boolean;
  monthValue?: string;
  onMonthChange?: (val: string) => void;
  actions?: React.ReactNode;
}

const RANGE_OPTIONS = [
  { value: 'ALL', label: 'All Time' },
  { value: 'CC', label: 'Current Cutoff' },
  { value: 'LC', label: 'Last Cutoff' },
  { value: 'TM', label: 'This Month' },
  { value: 'LM', label: 'Last Month' },
  { value: 'MTD', label: 'Month to Date' },
  { value: 'YTD', label: 'Year to Date' },
  { value: '7', label: 'Last 7 Days' },
  { value: '14', label: 'Last 14 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: 'CUSTOM', label: 'Custom Range' },
];

const MONTHS = [
  { value: 'ALL', label: 'Whole Year' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

// Custom react-select styles for light mode
const selectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: '44px',
    borderRadius: '14px',
    borderColor: state.isFocused ? '#60a5fa' : '#e2e8f0',
    backgroundColor: 'white',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(37,99,235,0.1)' : 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    '&:hover': { borderColor: '#93c5fd' },
    cursor: 'pointer',
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(15,23,42,0.12)',
    border: '1px solid #e2e8f0',
    zIndex: 50,
  }),
  menuList: (base: Record<string, unknown>) => ({
    ...base,
    padding: '4px',
  }),
  option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '0.875rem',
    fontWeight: state.isSelected ? 600 : 400,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'transparent',
    color: state.isSelected ? 'white' : '#334155',
    cursor: 'pointer',
    '&:active': { backgroundColor: state.isSelected ? '#2563eb' : '#dbeafe' },
  }),
  singleValue: (base: Record<string, unknown>) => ({
    ...base,
    color: '#0f172a',
    fontWeight: 500,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: Record<string, unknown>) => ({
    ...base,
    color: '#94a3b8',
    '&:hover': { color: '#64748b' },
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: '#94a3b8',
  }),
};

// Custom react-select styles for dark mode
const selectStylesDark = {
  ...selectStyles,
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: '44px',
    borderRadius: '14px',
    borderColor: state.isFocused ? '#3b82f6' : '#334155',
    backgroundColor: '#0f172a',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    '&:hover': { borderColor: '#3b82f6' },
    cursor: 'pointer',
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    zIndex: 50,
  }),
  menuList: (base: Record<string, unknown>) => ({
    ...base,
    padding: '4px',
  }),
  option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    borderRadius: '10px',
    padding: '10px 12px',
    fontSize: '0.875rem',
    fontWeight: state.isSelected ? 600 : 400,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#1e293b' : 'transparent',
    color: state.isSelected ? 'white' : '#e2e8f0',
    cursor: 'pointer',
    '&:active': { backgroundColor: state.isSelected ? '#2563eb' : '#1e293b' },
  }),
  singleValue: (base: Record<string, unknown>) => ({
    ...base,
    color: '#e2e8f0',
    fontWeight: 500,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: Record<string, unknown>) => ({
    ...base,
    color: '#64748b',
    '&:hover': { color: '#94a3b8' },
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: '#64748b',
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    color: '#e2e8f0',
  }),
};

export default function FilterBar({
  showTruck = true,
  showRange = true,
  showMonth = false,
  monthValue,
  onMonthChange,
  actions,
}: FilterBarProps) {
  const {
    truckOptions,
    selectedTruck,
    setSelectedTruck,
    rangePreset,
    setRangePreset,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    fetchDashboard,
    fetchExpenses,
    theme,
  } = useAppStore();

  const isDark = theme === 'dark';
  const styles = isDark ? selectStylesDark : selectStyles;

  const truckSelectOptions = [
    { value: '', label: 'All Trucks' },
    ...truckOptions.map((t) => ({ value: t._id, label: t.truckName })),
  ];

  const handleRangeChange = (option: { value: string } | null) => {
    if (!option) return;
    setRangePreset(option.value as RangePreset);
    setTimeout(() => { fetchDashboard(); fetchExpenses(); }, 0);
  };

  const handleTruckChange = (option: { value: string } | null) => {
    if (!option) return;
    setSelectedTruck(option.value);
    setTimeout(() => { fetchDashboard(); fetchExpenses(); }, 0);
  };

  // Date range handler (single picker with range selection)
  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start ? `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}` : '');
    setEndDate(end ? `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}` : '');
    setRangePreset('CUSTOM');
    // Only fetch when both dates are selected (range complete)
    if (start && end) {
      setTimeout(() => { fetchDashboard(); fetchExpenses(); }, 0);
    }
  };

  const handleReset = () => {
    setRangePreset('ALL');
    setStartDate('');
    setEndDate('');
    if (!showMonth) {
      setTimeout(() => { fetchDashboard(); fetchExpenses(); }, 0);
    }
  };

  const handleMonthChange = (option: { value: string } | null) => {
    if (!option) return;
    onMonthChange?.(option.value);
  };

  const parsedStart = startDate ? new Date(startDate + 'T00:00:00') : null;
  const parsedEnd = endDate ? new Date(endDate + 'T00:00:00') : null;

  return (
    <div className="glass-card rounded-[22px] border border-slate-200/90 dark:border-slate-700/90 shadow-sm p-4 mb-3.5 relative z-20">
      <div className="flex flex-wrap gap-3 items-end">
        {showRange && (
          <div className="min-w-[180px] flex-1 max-w-[220px]">
            <label className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">
              Date Range
            </label>
            <Select
              options={RANGE_OPTIONS}
              value={RANGE_OPTIONS.find((o) => o.value === rangePreset)}
              onChange={handleRangeChange}
              styles={styles}
              isSearchable={false}
              menuPortalTarget={document.body} styles={{...styles, menuPortal: (base: Record<string, unknown>) => ({...base, zIndex: 9999})}} classNamePrefix="nm-select"
            />
          </div>
        )}

        {showTruck && (
          <div className="min-w-[180px] flex-1 max-w-[220px]">
            <label className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">
              Truck
            </label>
            <Select
              options={truckSelectOptions}
              value={truckSelectOptions.find((o) => o.value === selectedTruck)}
              onChange={handleTruckChange}
              styles={styles}
              isSearchable
              menuPortalTarget={document.body} styles={{...styles, menuPortal: (base: Record<string, unknown>) => ({...base, zIndex: 9999})}} classNamePrefix="nm-select"
              placeholder="Select truck..."
            />
          </div>
        )}

        {showRange && (
          <div className="min-w-[260px] flex-1 max-w-[320px]">
            <label className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <CalendarDays size={12} />
              Period
            </label>
            <DatePicker
              selectsRange
              startDate={parsedStart}
              endDate={parsedEnd}
              onChange={handleDateRangeChange}
              dateFormat="MMM d, yyyy"
              placeholderText="Select date range..."
              className="w-full min-h-[44px] rounded-[14px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 text-sm focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-colors cursor-pointer"
              wrapperClassName="w-full"
              isClearable
              showPopperArrow={false}
              monthsShown={2}
            />
          </div>
        )}

        {showMonth && (
          <div className="min-w-[180px] flex-1 max-w-[220px]">
            <label className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1.5 block">
              Range
            </label>
            <Select
              options={MONTHS}
              value={MONTHS.find((m) => m.value === (monthValue || 'ALL'))}
              onChange={handleMonthChange}
              styles={styles}
              isSearchable={false}
              menuPortalTarget={document.body} styles={{...styles, menuPortal: (base: Record<string, unknown>) => ({...base, zIndex: 9999})}} classNamePrefix="nm-select"
            />
          </div>
        )}

        {showRange && (
          <button
            onClick={handleReset}
            className="min-h-[44px] px-4 rounded-[14px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        )}

        {actions && <div className="flex gap-2 ml-auto">{actions}</div>}
      </div>
    </div>
  );
}
