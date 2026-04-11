import { useEffect, useState, useMemo } from 'react';
import { useAppStore, type TripRow } from '../store/useAppStore';
import FilterBar from '../components/shared/FilterBar';
import TripModal from '../components/shared/TripModal';
import Modal from '../components/shared/Modal';
import { peso, cn } from '../lib/utils';
import { exportTripsCsv, exportPayslip } from '../lib/exportHelpers';
import { Plus, Search, Download, FileText, Pencil, Trash2, Check, AlertTriangle } from 'lucide-react';
import Pagination from '../components/shared/Pagination';
import { usePagination } from '../hooks/usePagination';
import ExpenseBreakdownModal from '../components/shared/ExpenseBreakdownModal';

export default function TripsPage() {
  const { tripRows, loading, selectedTruck, truckOptions, initApp, deleteTrip, toggleTripPaid, searchQuery, setSearchQuery, startDate, endDate } = useAppStore();
  const [tripModal, setTripModal] = useState(false);
  const [editRow, setEditRow] = useState<TripRow | null>(null);
  const [deleteModal, setDeleteModal] = useState<TripRow | null>(null);
  const [showTruckWarning, setShowTruckWarning] = useState(false);
  const [expenseBreakdown, setExpenseBreakdown] = useState<{truckId: string; dateIso: string; dateText: string} | null>(null);

  useEffect(() => { initApp(); }, []);

  const selectedTruckName = truckOptions.find((t) => t._id === selectedTruck)?.truckName;
  const pageTitle = selectedTruckName ? `${selectedTruckName} Trips` : 'Trips';

  const filteredRows = useMemo(() => {
    if (!searchQuery) return tripRows;
    return tripRows.filter((r) => r.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tripRows, searchQuery]);

  const { paginatedItems: paginatedRows, currentPage, totalPages, totalItems, pageSize, handlePageChange, handlePageSizeChange } = usePagination(filteredRows, 20);

  const handleAddTrip = () => {
    if (!selectedTruck) { setShowTruckWarning(true); return; }
    setEditRow(null);
    setTripModal(true);
  };

  const handleExportCsv = () => exportTripsCsv(filteredRows);
  const handleExportPayslip = () => {
    const truckLabel = truckOptions.find((t) => t._id === selectedTruck)?.truckName || "All Trucks";
    exportPayslip(filteredRows, truckLabel, startDate && endDate ? `${startDate} to ${endDate}` : "All Dates");
  };

  const statusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'WORKING DAY') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (s === 'HOLIDAY') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-slate-400/10 text-slate-400 border-slate-400/20';
  };

  return (
    <div>
      <div className="glass-card rounded-[28px] border border-slate-200/80 dark:border-slate-700/90 shadow-lg p-5 mb-3.5">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-3">
          <div>
            <h1 className="text-[1.45rem] font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage trips, filter records, and add new entries.</p>
          </div>
          <div className="text-right">
            <div className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500">Trips view</div>
            <div className="font-bold text-sm">Live data from database</div>
          </div>
        </div>
      </div>

      <FilterBar
        showTruck={true}
        actions={
          <button onClick={handleAddTrip} className="min-h-[44px] px-4 rounded-[14px] bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm font-semibold shadow-[0_10px_20px_rgba(37,99,235,0.18)] hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-1.5">
            <Plus size={18} /> Add Trip
          </button>
        }
      />

      <div className="glass-card rounded-[22px] border border-slate-200/90 dark:border-slate-700/90 shadow-sm p-3.5 overflow-hidden">
        <div className="flex flex-col gap-3 mb-3">
          <div>
            <h2 className="text-base font-bold tracking-tight">Trip Records</h2>
            <p className="text-sm text-slate-500">Filter, edit, export, and generate payslips.</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex-grow min-w-[240px] relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input type="text" placeholder="Search Shipment Number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[44px] rounded-[14px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm pl-9 pr-3.5 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 outline-none transition-colors" />
            </div>
            <button onClick={handleExportCsv} className="min-h-[44px] px-3 rounded-[14px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center gap-1.5">
              <Download size={16} /> CSV
            </button>
            <button onClick={handleExportPayslip} className="min-h-[44px] px-3 rounded-[14px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center gap-1.5">
              <FileText size={16} /> Payslip
            </button>
          </div>
        </div>

        <div className="rounded-[18px] overflow-auto border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900">
          <table className="w-full trip-table">
            <thead>
              <tr>
                {['Week','Date','Status','Shipment #','Rate','Trips','Crew Salary','Cash Adv.','Reimb.','Expenses','Note','Gross','Net','Payable','Action'].map((h) => (
                  <th key={h} className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 px-2.5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={15} className="text-center py-12 text-slate-400 animate-pulse">Loading...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={15} className="text-center py-12 text-slate-400">No rows found</td></tr>
              ) : (
                paginatedRows.map((r) => (
                  <tr key={r._id} className={cn('hover:bg-blue-50/50 dark:hover:bg-slate-800/50', r.status === 'Holiday' && 'bg-amber-50/50', r.status === 'Day Off' && 'bg-slate-50/80 text-slate-400')}>
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
                    <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800 max-w-[120px]">
                      {(r as any).hasExpenses || r.note ? (
                        <button
                          onClick={() => { if ((r as any).hasExpenses) setExpenseBreakdown({ truckId: typeof r.truck === 'string' ? r.truck : (r.truck as any)?._id || selectedTruck, dateIso: r.dateIso, dateText: r.dateText }); }}
                          className={cn('text-left text-xs truncate block max-w-[120px]', (r as any).hasExpenses ? 'text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium' : 'text-slate-500 cursor-default')}
                          title={r.note}
                        >{r.note || '—'}</button>
                      ) : (<span className="text-slate-300">—</span>)}
                    </td>
                    <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800">{peso(r.grossIncome)}</td>
                    <td className={cn('text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800 font-semibold', r.netIncome < 0 ? 'text-red-500' : 'text-green-500')}>{peso(r.netIncome)}</td>
                    <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800 text-red-500 font-semibold">{r.paid ? '₱0.00' : peso(r.payable)}</td>
                    <td className="text-center text-xs px-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => toggleTripPaid(r._id)} className={cn('w-[34px] h-[34px] rounded-xl inline-flex items-center justify-center border transition-all', r.paid ? 'bg-green-500/10 border-green-500/25 text-green-500 hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-green-500/10 hover:border-green-500/25 hover:text-green-500')} title="Toggle paid"><Check size={14} /></button>
                        <button onClick={() => { setEditRow(r); setTripModal(true); }} className="w-[34px] h-[34px] rounded-xl inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-600 transition-all" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteModal(r)} className="w-[34px] h-[34px] rounded-xl inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
      </div>

      <TripModal open={tripModal} onClose={() => { setTripModal(false); setEditRow(null); }} editRow={editRow} />

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete trip?" footer={<><button onClick={() => setDeleteModal(null)} className="px-4 py-2.5 rounded-[14px] border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button><button onClick={async () => { if (deleteModal) { await deleteTrip(deleteModal._id); setDeleteModal(null); } }} className="px-6 py-2.5 rounded-[14px] bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Delete</button></>}>
        <p>Are you sure?<br /><strong>{deleteModal?.dateText} / {deleteModal?.shipmentNumber}</strong></p>
      </Modal>

      <ExpenseBreakdownModal
        open={!!expenseBreakdown}
        onClose={() => setExpenseBreakdown(null)}
        truckId={expenseBreakdown?.truckId || ''}
        dateIso={expenseBreakdown?.dateIso || ''}
        dateText={expenseBreakdown?.dateText || ''}
      />

      <Modal open={showTruckWarning} onClose={() => setShowTruckWarning(false)} title="">
        <div className="text-center py-4">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-amber-500/10 grid place-items-center text-amber-500"><AlertTriangle size={28} /></div>
          <div className="font-bold text-lg mb-1">Please select a truck first!</div>
          <p className="text-sm text-slate-500">Choose a truck from the Dashboard filter bar to add a trip.</p>
        </div>
      </Modal>
    </div>
  );
}
