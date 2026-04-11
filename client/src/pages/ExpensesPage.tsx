import { useEffect, useState, useMemo } from 'react';
import { useAppStore, type ExpenseRow } from '../store/useAppStore';
import FilterBar from '../components/shared/FilterBar';
import Modal from '../components/shared/Modal';
import { peso, toInputDate } from '../lib/utils';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Pagination from '../components/shared/Pagination';
import { usePagination } from '../hooks/usePagination';

export default function ExpensesPage() {
  const { expenseRows, selectedTruck, truckOptions, expensesMonth, setExpensesMonth, fetchExpenses, initApp, addExpense, updateExpense, deleteExpense } = useAppStore();
  const [expenseModal, setExpenseModal] = useState(false);
  const [editRow, setEditRow] = useState<ExpenseRow | null>(null);
  const [deleteModal, setDeleteModal] = useState<ExpenseRow | null>(null);
  const [showTruckWarning, setShowTruckWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ date: toInputDate(new Date()), category: '', amount: '', description: '' });

  useEffect(() => { initApp(); }, []);
  useEffect(() => { fetchExpenses(); }, [expensesMonth]);

  const selectedTruckName = truckOptions.find((t) => t._id === selectedTruck)?.truckName;
  const pageTitle = selectedTruckName ? `${selectedTruckName} Expenses` : 'Expenses';

  const filteredRows = useMemo(() => {
    let rows = expenseRows;
    if (expensesMonth !== 'ALL') {
      rows = rows.filter((r) => {
        const d = new Date(r.dateIso);
        return String(d.getMonth() + 1) === expensesMonth;
      });
    }
    return rows.sort((a, b) => new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime());
  }, [expenseRows, expensesMonth]);

  const { paginatedItems: paginatedExpenses, currentPage, totalPages, totalItems, pageSize, handlePageChange, handlePageSizeChange } = usePagination(filteredRows, 20);

  const breakdown = useMemo(() => {
    const byCategory: Record<string, number> = {};
    filteredRows.forEach((r) => {
      const cat = (r.category || 'Others').trim().toUpperCase();
      byCategory[cat] = (byCategory[cat] || 0) + r.amount;
    });
    const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, amt]) => sum + amt, 0);
    return { entries, total };
  }, [filteredRows]);

  const openAdd = () => {
    if (!selectedTruck) { setShowTruckWarning(true); return; }
    setEditRow(null);
    setForm({ date: toInputDate(new Date()), category: '', amount: '', description: '' });
    setExpenseModal(true);
  };

  const openEdit = (row: ExpenseRow) => {
    setEditRow(row);
    setForm({ date: row.dateIso, category: row.category, amount: String(row.amount), description: row.description });
    setExpenseModal(true);
  };

  const handleSave = async () => {
    if (!selectedTruck) { setShowTruckWarning(true); return; }
    if (!form.date) { alert('Date is required.'); return; }
    if (!form.category.trim()) { alert('Category is required.'); return; }
    if (!form.amount) { alert('Amount is required.'); return; }
    setLoading(true);
    try {
      const payload = { truckId: selectedTruck, date: form.date, category: form.category, amount: Number(form.amount), description: form.description };
      if (editRow) { await updateExpense(editRow._id, payload); }
      else { await addExpense(payload); }
      setExpenseModal(false);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Failed to save'); }
    finally { setLoading(false); }
  };

  const inputClass = 'w-full min-h-[44px] rounded-[14px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 outline-none transition-colors';

  return (
    <div>
      <div className="glass-card rounded-[28px] border border-slate-200/80 dark:border-slate-700/90 shadow-lg p-5 mb-3.5">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-3">
          <div>
            <h1 className="text-[1.45rem] font-bold tracking-tight">{pageTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">Track company expenses by category, month, and total distribution.</p>
          </div>
          <div className="text-right">
            <div className="text-[0.72rem] font-bold tracking-wider uppercase text-slate-500">Expenses view</div>
            <div className="font-bold text-sm">Connected to EXPENSES</div>
          </div>
        </div>
      </div>

      <FilterBar showRange={false} showTruck={false} showMonth monthValue={expensesMonth} onMonthChange={setExpensesMonth}
        actions={<button onClick={openAdd} className="min-h-[44px] px-4 rounded-[14px] bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm font-semibold shadow-[0_10px_20px_rgba(37,99,235,0.18)] hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-1.5"><Plus size={18} /> Add Expense</button>} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-3">
        {/* Table */}
        <div className="glass-card rounded-[22px] border border-slate-200/90 dark:border-slate-700/90 shadow-sm overflow-hidden">
          <div className="p-3.5 pb-2">
            <h2 className="text-base font-bold tracking-tight">Expense Records</h2>
            <p className="text-sm text-slate-500">Operational costs and maintenance logs</p>
          </div>
          <div className="overflow-auto border-t border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900">
            <table className="w-full">
              <thead>
                <tr>
                  {['Date', 'Category', 'Amount', 'Description', 'Actions'].map((h) => (
                    <th key={h} className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 px-3 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400">No rows found</td></tr>
                ) : paginatedExpenses.map((r) => (
                  <tr key={r._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50">
                    <td className="text-center text-xs px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 whitespace-nowrap">{r.dateText}</td>
                    <td className="text-center text-xs px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[0.72rem] font-bold bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">{r.category}</span>
                    </td>
                    <td className="text-center text-xs px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 text-red-500 font-semibold">{peso(r.amount)}</td>
                    <td className="text-center text-xs px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">{r.description}</td>
                    <td className="text-center text-xs px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(r)} className="w-[34px] h-[34px] rounded-xl inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-600 transition-all"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteModal(r)} className="w-[34px] h-[34px] rounded-xl inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div class="px-3.5 pb-3">
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          <div className="glass-card rounded-[22px] border border-slate-200/90 dark:border-slate-700/90 shadow-sm p-4">
            <h2 className="text-base font-bold tracking-tight mb-1">Expense Breakdown</h2>
            <p className="text-sm text-slate-500 mb-4">Distribution by category</p>
            <div className="flex flex-col gap-4">
              {breakdown.entries.length === 0 ? (
                <div className="text-sm text-slate-400">No expenses found</div>
              ) : breakdown.entries.map(([category, amount]) => {
                const pct = breakdown.total ? (amount / breakdown.total) * 100 : 0;
                return (
                  <div key={category} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center gap-3 font-bold text-sm tracking-tight">
                      <span>{category}</span>
                      <span>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-[22px] border border-slate-200/90 dark:border-slate-700/90 shadow-sm p-5 flex flex-col justify-center min-h-[110px]">
            <div className="text-[0.72rem] text-slate-500 uppercase tracking-wider font-semibold">Total Expenses</div>
            <div className="text-[1.8rem] font-extrabold tracking-tight leading-none mt-1.5">{peso(breakdown.total)}</div>
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title={editRow ? 'Edit Expense' : 'Add Expense'} wide
        footer={<><button onClick={() => setExpenseModal(false)} className="px-4 py-2.5 rounded-[14px] border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button><button onClick={handleSave} disabled={loading} className="px-6 py-2.5 rounded-[14px] bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm font-semibold shadow-[0_10px_20px_rgba(37,99,235,0.18)] disabled:opacity-50">{loading ? 'Saving...' : editRow ? 'Update' : 'Save'}</button></>}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">Date</label><DatePicker selected={form.date ? new Date(form.date + 'T00:00:00') : new Date()} onChange={(d: Date | null) => { if (d) setForm({ ...form, date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }); }} dateFormat="MMM d, yyyy" className={inputClass + ' cursor-pointer'} wrapperClassName="w-full" showPopperArrow={false} /></div>
          <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Category</label><input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} /></div>
          <div><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Amount</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} /></div>
          <div className="col-span-2"><label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} /></div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete expense?" footer={<><button onClick={() => setDeleteModal(null)} className="px-4 py-2.5 rounded-[14px] border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button><button onClick={async () => { if (deleteModal) { await deleteExpense(deleteModal._id); setDeleteModal(null); } }} className="px-6 py-2.5 rounded-[14px] bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Delete</button></>}>
        <p>Are you sure?<br /><strong>{deleteModal?.dateText} / {deleteModal?.category}</strong></p>
      </Modal>

      {/* Truck Warning */}
      <Modal open={showTruckWarning} onClose={() => setShowTruckWarning(false)} title="">
        <div className="text-center py-4">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-amber-500/10 grid place-items-center text-amber-500"><AlertTriangle size={28} /></div>
          <div className="font-bold text-lg mb-1">Please select a truck first!</div>
          <p className="text-sm text-slate-500">Choose a truck from the Dashboard filter bar.</p>
        </div>
      </Modal>
    </div>
  );
}
