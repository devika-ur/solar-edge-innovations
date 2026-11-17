import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
    Wallet,
    Plus,
    RefreshCw,
    Search,
    Edit3,
    Trash2,
    X,
    Calendar,
    User,
    Loader2,
    Receipt,
} from 'lucide-react';
import { Pagination } from './Pagination';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

const DEFAULT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'Other'];

const todayStr = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const emptyForm = () => ({
    title: '',
    amount: '',
    expense_date: todayStr(),
    payment_method: 'Cash',
    paid_to: '',
    notes: '',
});

const formatINR = (value) =>
    '₹' + Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const ExpenseManager = ({ onUnauthorized }) => {
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState({ filtered_total: 0, filtered_count: 0, this_month_total: 0, all_time_total: 0, all_time_count: 0 });
    const [methods, setMethods] = useState(DEFAULT_METHODS);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    // Add / Edit modal
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm());
    const [isSaving, setIsSaving] = useState(false);

    // Delete
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const handleAuthError = (res) => {
        if (res.status === 401) {
            if (onUnauthorized) onUnauthorized();
            return true;
        }
        if (res.status === 403) {
            toast.error('Access denied. Expenses are available to Super Admin only.');
            return true;
        }
        return false;
    };

    const loadExpenses = async (isManual = false) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery.trim()) params.append('search', searchQuery.trim());
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const res = await fetch(`/api/admin/expenses?${params.toString()}`, { credentials: 'include' });
            if (handleAuthError(res)) return;

            const data = await res.json();
            if (res.ok && data.success) {
                setExpenses(data.data || []);
                if (data.summary) setSummary(data.summary);
                if (data.payment_methods?.length) setMethods(data.payment_methods);
                if (isManual) toast.success('Expenses refreshed!');
            } else {
                toast.error(data.message || 'Failed to load expenses.');
            }
        } catch {
            toast.error('Unable to connect to server.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        loadExpenses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, reloadKey]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadExpenses();
    };

    const hasFilters = searchQuery || startDate || endDate;

    const handleResetFilters = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
        setReloadKey((k) => k + 1); // reload with the cleared search box
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm());
        setIsFormOpen(true);
    };

    const openEditForm = (expense) => {
        setEditingId(expense.id);
        setForm({
            title: expense.title || '',
            amount: String(expense.amount ?? ''),
            expense_date: expense.expense_date || todayStr(),
            payment_method: expense.payment_method || 'Cash',
            paid_to: expense.paid_to || '',
            notes: expense.notes || '',
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        if (isSaving) return;
        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleFormChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error('Please enter what the expense was for.');
        if (!form.amount || Number(form.amount) <= 0) return toast.error('Amount must be greater than 0.');
        if (!form.expense_date) return toast.error('Please select the expense date.');

        setIsSaving(true);
        try {
            const url = editingId ? `/api/admin/expenses/${editingId}` : '/api/admin/expenses';
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ...form, amount: Number(form.amount) }),
            });
            if (handleAuthError(res)) return;

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(data.message || (editingId ? 'Expense updated.' : 'Expense saved.'));
                setIsFormOpen(false);
                setEditingId(null);
                loadExpenses();
            } else {
                toast.error(data.message || 'Failed to save expense.');
            }
        } catch {
            toast.error('Network error saving expense.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async (password = '') => {
        if (!expenseToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/expenses/${expenseToDelete.id}/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password }),
            });
            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
                return;
            }
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Expense deleted permanently.');
                setExpenseToDelete(null);
                loadExpenses();
            } else {
                toast.error(data.message || 'Failed to delete expense.');
            }
        } catch {
            toast.error('Network error deleting expense.');
        } finally {
            setIsDeleting(false);
        }
    };

    const paginated = useMemo(
        () => expenses.slice((currentPage - 1) * perPage, currentPage * perPage),
        [expenses, currentPage, perPage]
    );

    const inputClass = 'w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#1A4D2E] focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all';
    const labelClass = 'block text-xs font-semibold text-neutral-600 mb-1.5';

    return (
        <div className="w-full px-4 sm:px-8 py-8 space-y-6 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">Other Expenses</h1>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Record and track business expenses such as rent, fuel, salaries and tools. Visible to Super Admin only.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-center">
                    <button
                        type="button"
                        onClick={() => loadExpenses(true)}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 font-semibold rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                    <button
                        type="button"
                        onClick={openAddForm}
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-4 bg-[#1A4D2E] hover:bg-[#143c24] text-white font-semibold rounded-xl text-xs transition-all shadow-xs cursor-pointer whitespace-nowrap"
                    >
                        <Plus size={14} />
                        <span>Add Expense</span>
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">This Month</div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#1A4D2E] mt-1">{formatINR(summary.this_month_total)}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Spent in the current month</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">All Time</div>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-1">{formatINR(summary.all_time_total)}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{summary.all_time_count} expense{summary.all_time_count === 1 ? '' : 's'} recorded</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Showing Total</div>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">{formatINR(summary.filtered_total)}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{summary.filtered_count} matching current filters</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center gap-3">
                <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search expense, paid to, notes..."
                        className="w-full pl-10 pr-24 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#1A4D2E] outline-none transition-all"
                    />
                    <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#1A4D2E] hover:bg-[#143c24] text-white rounded-lg text-xs font-bold cursor-pointer">
                        Search
                    </button>
                </form>
                <div className="flex items-center gap-2">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#1A4D2E]" title="From date" />
                    <span className="text-xs text-neutral-400">to</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#1A4D2E]" title="To date" />
                </div>
                {hasFilters && (
                    <button type="button" onClick={handleResetFilters} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl cursor-pointer whitespace-nowrap">
                        <X size={13} />
                        <span>Reset</span>
                    </button>
                )}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="bg-white rounded-3xl p-12 border border-neutral-200/80 text-center space-y-3">
                    <RefreshCw size={24} className="animate-spin text-[#1A4D2E] mx-auto" />
                    <p className="text-xs font-semibold text-neutral-500">Loading expenses...</p>
                </div>
            ) : expenses.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-neutral-200/80 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center mx-auto">
                        <Wallet size={26} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-neutral-900">No Expenses Found</h3>
                        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                            {hasFilters ? 'No expenses matched your filters.' : 'No expenses recorded yet. Click "Add Expense" to record your first one.'}
                        </p>
                    </div>
                    {!hasFilters && (
                        <button type="button" onClick={openAddForm} className="inline-flex items-center justify-center gap-1.5 h-9 px-4 bg-[#1A4D2E] hover:bg-[#143c24] text-white font-semibold rounded-xl text-xs cursor-pointer">
                            <Plus size={14} />
                            <span>Add Expense</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-4 text-center w-12 font-mono">#</th>
                                    <th className="py-3.5 px-4">Date</th>
                                    <th className="py-3.5 px-4">Expense</th>
                                    <th className="py-3.5 px-4">Paid To / Method</th>
                                    <th className="py-3.5 px-4 text-right">Amount</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {paginated.map((exp, idx) => (
                                    <tr key={exp.id} className="hover:bg-emerald-50/25 transition-colors">
                                        <td className="py-4 px-4 text-center font-mono text-neutral-400 font-semibold">{(currentPage - 1) * perPage + idx + 1}</td>
                                        <td className="py-4 px-4 whitespace-nowrap font-semibold text-neutral-800">{exp.expense_date_formatted}</td>
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-neutral-900">{exp.title}</div>
                                            {exp.notes && <div className="text-[11px] text-neutral-500 mt-0.5 max-w-[260px] truncate" title={exp.notes}>{exp.notes}</div>}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-neutral-800">{exp.paid_to || '-'}</div>
                                            <div className="text-[11px] text-neutral-500 mt-0.5">{exp.payment_method}</div>
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold text-[#1A4D2E] text-sm whitespace-nowrap">{formatINR(exp.amount)}</td>
                                        <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditForm(exp)}
                                                    className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                >
                                                    <Edit3 size={13} />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setExpenseToDelete(exp)}
                                                    className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-xl bg-white hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border border-neutral-200 hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                                                >
                                                    <Trash2 size={13} />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="block md:hidden p-3.5 space-y-3 bg-neutral-50/50">
                        {paginated.map((exp) => (
                            <div key={exp.id} className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="font-bold text-neutral-900 text-sm">{exp.title}</div>
                                        <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                            <Calendar size={11} /> {exp.expense_date_formatted}
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-[#1A4D2E] whitespace-nowrap">{formatINR(exp.amount)}</div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{exp.payment_method}</span>
                                    {exp.paid_to && (
                                        <span className="flex items-center gap-1 text-neutral-500"><User size={11} /> {exp.paid_to}</span>
                                    )}
                                </div>
                                {exp.notes && <p className="text-[11px] text-neutral-500">{exp.notes}</p>}
                                <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                                    <button type="button" onClick={() => openEditForm(exp)} className="flex-1 h-9 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                                        <Edit3 size={13} /> <span>Edit</span>
                                    </button>
                                    <button type="button" onClick={() => setExpenseToDelete(exp)} className="h-9 px-3 rounded-xl bg-white hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border border-neutral-200 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer">
                                        <Trash2 size={13} /> <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={expenses.length}
                        perPage={perPage}
                        onPageChange={setCurrentPage}
                        onPerPageChange={setPerPage}
                        itemLabel="expenses"
                    />
                </div>
            )}

            {/* Add / Edit Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm" onClick={closeForm}>
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-200 max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center">
                                    <Receipt size={18} />
                                </div>
                                <h2 className="text-base font-bold text-neutral-900">{editingId ? 'Edit Expense' : 'Add Expense'}</h2>
                            </div>
                            <button type="button" onClick={closeForm} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                            <div>
                                <label className={labelClass}>Expense For <span className="text-rose-500">*</span></label>
                                <input type="text" value={form.title} onChange={handleFormChange('title')} maxLength={150} placeholder="e.g. Office rent for November" className={inputClass} autoFocus />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Amount (₹) <span className="text-rose-500">*</span></label>
                                    <input type="number" min="0.01" step="0.01" value={form.amount} onChange={handleFormChange('amount')} placeholder="0.00" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Date <span className="text-rose-500">*</span></label>
                                    <input type="date" value={form.expense_date} onChange={handleFormChange('expense_date')} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Payment Method</label>
                                    <select value={form.payment_method} onChange={handleFormChange('payment_method')} className={`${inputClass} cursor-pointer`}>
                                        {(methods.includes(form.payment_method) ? methods : [form.payment_method, ...methods]).map((m) => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Paid To</label>
                                    <input type="text" value={form.paid_to} onChange={handleFormChange('paid_to')} maxLength={150} placeholder="Person or shop (optional)" className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Notes</label>
                                <textarea value={form.notes} onChange={handleFormChange('notes')} rows={3} maxLength={2000} placeholder="Any extra details (optional)" className={`${inputClass} resize-none`} />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button type="button" onClick={closeForm} disabled={isSaving} className="h-10 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-sm font-semibold cursor-pointer disabled:opacity-60">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-sm font-bold shadow-xs cursor-pointer disabled:opacity-60 whitespace-nowrap">
                                    {isSaving && <Loader2 size={15} className="animate-spin" />}
                                    <span>{editingId ? 'Update Expense' : 'Save Expense'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDeleteModal
                isOpen={!!expenseToDelete}
                onClose={() => setExpenseToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Expense"
                message={`Permanently delete "${expenseToDelete?.title}" (${formatINR(expenseToDelete?.amount)})? It will be removed from the database and cannot be recovered.`}
                isDeleting={isDeleting}
            />
        </div>
    );
};
