import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import FilterBar from '../components/shared/FilterBar';
import { peso, cn } from '../lib/utils';
import { exportMonthlyReport } from '../lib/exportHelpers';
import { Download } from 'lucide-react';
import Pagination from '../components/shared/Pagination';
import { usePagination } from '../hooks/usePagination';

export default function ReportsPage() {
  const { reportRows, reportsMonth, setReportsMonth, fetchReports, initApp, selectedTruck, truckOptions } = useAppStore();

  useEffect(() => { initApp(); }, []);
  useEffect(() => { fetchReports(); }, [reportsMonth, selectedTruck]);

  const selectedTruckName = truckOptions.find((t) => t._id === selectedTruck)?.truckName;
  const { paginatedItems: paginatedReports, currentPage, totalPages, totalItems, pageSize, handlePageChange, handlePageSizeChange } = usePagination(reportRows, 20);

  const pageTitle = selectedTruckName ? `${selectedTruckName} Reports` : 'Reports';

  const statusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'WORKING DAY') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (s === 'HOLIDAY') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-slate-400/10 text-slate-400 border-slate-400/20';
  };

  const handleDownloadReport = () => {
    const truckLabel = selectedTruckName || 'All Trucks';
    const monthNames: Record<string, string> = { ALL: 'Whole Year', '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December' };
    const year = new Date().getFullYear();
    const reportMonth = monthNames[reportsMonth] || 'Whole Year';
    const periodText = reportsMonth === 'ALL' ? `WHOLE YEAR ${year}` : `${reportMonth.toUpperCase()} ${year}`;
    exportMonthlyReport(reportRows, truckLabel, periodText);
  };

  return (
    <div>
      <div className="glass-card rounded-[28px] border border-slate-200/80 dark:border-slate-700/90 shadow-lg p-5 mb-3.5">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-3">
          <div>
            <h1 className="text-[1.45rem] font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">Monthly report view using the same table columns.</p>
          </div>
          <div className="text-right">
            <div className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500">Reports view</div>
            <div className="font-bold text-sm">Monthly filtering</div>
          </div>
        </div>
      </div>

      <FilterBar showRange={false} showTruck={false} showMonth monthValue={reportsMonth} onMonthChange={setReportsMonth}
        actions={<button onClick={handleDownloadReport} className="min-h-[44px] px-4 rounded-[14px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center gap-1.5"><Download size={16} /> Download Report</button>} />

      <div className="glass-card rounded-[22px] border border-slate-200/90 dark:border-slate-700/90 shadow-sm p-3.5 overflow-hidden">
        <div className="mb-3">
          <h2 className="text-base font-bold tracking-tight">MONTHLY REPORTS</h2>
          <p className="text-sm text-slate-500">Same columns as the trip table, filtered by month.</p>
        </div>
        <div className="rounded-[18px] overflow-auto border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900">
          <table className="w-full trip-table report-table">
            <thead>
              <tr>
                {['Week','Date','Status','Shipment #','Rate','Trips','Crew Salary','Cash Adv.','Reimb.','Expenses','Note','Gross','Net','Payable'].map((h) => (
                  <th key={h} className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 px-2.5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportRows.length === 0 ? (
                <tr><td colSpan={14} className="text-center py-12 text-slate-400">No rows found</td></tr>
              ) : paginatedReports.map((r) => (
                <tr key={r._id} className={cn('hover:bg-blue-50/50 dark:hover:bg-slate-800/50', r.status === 'Holiday' && 'bg-amber-50/50', r.status === 'Day Off' && 'bg-slate-100/70 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400')}>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800">{r.week}</td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800 whitespace-nowrap">{r.dateText}</td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <span className={cn('inline-block px-3 py-1.5 rounded-full text-xs font-bold border', statusBadge(r.status))}>{r.status.toUpperCase()}</span>
                  </td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800 font-semibold text-orange-500">{r.shipmentNumber}</td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800">{peso(r.rate)}</td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800">{r.trips}</td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800">{peso(r.crewSalary)}</td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800">{peso(r.cashAdvance)}</td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800">{peso(r.reimbursements)}</td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800">{peso(r.expenses)}</td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800 max-w-[100px] truncate">{r.note}</td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800">{peso(r.grossIncome)}</td>
                  <td className={cn('text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800 font-semibold', (r.reportNetIncome ?? r.netIncome) < 0 ? 'text-red-500' : 'text-green-500')}>{peso(r.reportNetIncome ?? r.netIncome)}</td>
                  <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800 text-red-500 font-semibold">{peso(r.reportPayable ?? r.payable)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
      </div>
    </div>
  );
}
