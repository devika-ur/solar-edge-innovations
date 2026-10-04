import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
    CreditCard,
    Search,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    FileText,
    Pencil,
    Calendar
} from 'lucide-react';
import { Pagination } from './Pagination';

const formatINR = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    });
};

export const PaymentManager = ({ onNavigate, onUnauthorized }) => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({
        total_quotations: 0,
        total_amount: 0,
        total_paid: 0,
        total_balance: 0,
        pending_count: 0,
        partially_paid_count: 0,
        paid_count: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modals
    const [selectedPaymentForAdd, setSelectedPaymentForAdd] = useState(null);
    const [selectedPaymentForHistory, setSelectedPaymentForHistory] = useState(null);
    const [selectedPaymentForEditTotal, setSelectedPaymentForEditTotal] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const loadPayments = async (isManual = false) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery.trim()) params.append('search', searchQuery.trim());
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const res = await fetch(`/api/admin-payments.php?${params.toString()}`, {
                credentials: 'include',
            });

            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
                return;
            }

            const data = await res.json();
            if (res.ok && data.success) {
                setPayments(data.data || []);
                if (data.stats) setStats(data.stats);
                if (isManual) toast.success('Payments refreshed');
            } else {
                toast.error(data.message || 'Failed to load payments.');
            }
        } catch {
            toast.error('Network error loading payments.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, [statusFilter]);

    useEffect(() => {
        const handler = setTimeout(() => loadPayments(), 300);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const totalPages = Math.ceil(payments.length / perPage) || 1;
    const paginatedPayments = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return payments.slice(start, start + perPage);
    }, [payments, currentPage, perPage]);



    const handlePaymentAdded = () => {
        loadPayments();
        setSelectedPaymentForAdd(null);
    };

    const handleTotalUpdated = () => {
        loadPayments();
        setSelectedPaymentForEditTotal(null);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <CreditCard size={20} className="text-[#1A4D2E]" />
                        <span>Payments</span>
                    </h1>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        Track customer payments and balances for quotations.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadPayments(true)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        title="Refresh"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={() => onNavigate && onNavigate('quotation')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                        <FileText size={14} />
                        <span>New Quotation</span>
                    </button>
                </div>
            </div>

            {/* Simple 3 Stats Cards (Status Breakdown removed as requested) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-4 border border-neutral-200">
                    <div className="text-xs font-medium text-neutral-500">Total Invoiced</div>
                    <div className="text-xl font-bold text-neutral-900 mt-1">₹{formatINR(stats.total_amount)}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">{stats.total_quotations} quotations</div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-neutral-200">
                    <div className="text-xs font-medium text-emerald-700">Amount Paid</div>
                    <div className="text-xl font-bold text-emerald-700 mt-1">₹{formatINR(stats.total_paid)}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">
                        {stats.total_amount > 0 ? `${((stats.total_paid / stats.total_amount) * 100).toFixed(0)}% received` : '0%'}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-neutral-200">
                    <div className="text-xs font-medium text-amber-700">Amount to Pay</div>
                    <div className="text-xl font-bold text-amber-700 mt-1">₹{formatINR(stats.total_balance)}</div>
                    <div className="text-xs text-neutral-400 mt-0.5">Outstanding balance</div>
                </div>
            </div>

            {/* Simple Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search customer, quotation ref, phone..."
                        className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-neutral-200 rounded-lg focus:outline-hidden focus:border-[#1A4D2E]"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'pending', label: 'Pending' },
                        { id: 'partially_paid', label: 'Partially Paid' },
                        { id: 'paid', label: 'Paid' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                statusFilter === tab.id
                                    ? 'bg-white text-neutral-900 font-bold shadow-2xs'
                                    : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
                {isLoading ? (
                    <div className="py-16 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                        <RefreshCw size={15} className="animate-spin text-emerald-700" />
                        <span>Loading payments...</span>
                    </div>
                ) : paginatedPayments.length === 0 ? (
                    <div className="py-16 text-center text-xs text-neutral-500">
                        No quotations found.
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px] font-semibold">
                                        <th className="py-3 px-4">Customer Name</th>
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">Quotation Number</th>
                                        <th className="py-3 px-4 text-right">Total Amount</th>
                                        <th className="py-3 px-4 text-right">Amount Paid</th>
                                        <th className="py-3 px-4 text-right">Amount to Pay</th>
                                        <th className="py-3 px-4 text-center">Payment Status</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {paginatedPayments.map((item) => {
                                        const isPaid = item.status === 'paid' || item.balance_amount <= 0;
                                        return (
                                            <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                                                <td className="py-3.5 px-4 font-semibold text-neutral-900">
                                                    <div>{item.client_name}</div>
                                                    {item.client_phone && item.client_phone !== '-' && (
                                                        <div className="text-[11px] font-normal text-neutral-400">
                                                            {item.client_phone}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600 text-xs font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={12} className="text-neutral-400 shrink-0" />
                                                        <span>{item.quotation_date || item.created_at_formatted}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-mono font-medium text-neutral-800 whitespace-nowrap">
                                                    {item.ref_no}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-medium text-neutral-900">
                                                    <div className="flex items-center justify-end gap-1.5 group">
                                                        <span>₹{formatINR(item.total_amount)}</span>
                                                        <button
                                                            onClick={() => setSelectedPaymentForEditTotal(item)}
                                                            className="text-neutral-400 hover:text-neutral-800 p-1 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
                                                            title="Edit Total Amount / Add Remarks"
                                                        >
                                                            <Pencil size={11} />
                                                        </button>
                                                    </div>
                                                    {item.remarks && (
                                                        <div className="text-[10px] text-neutral-400 italic">
                                                            {item.remarks}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                                                    ₹{formatINR(item.amount_paid)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-semibold text-amber-700">
                                                    ₹{formatINR(item.balance_amount)}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    {item.status === 'paid' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <CheckCircle2 size={11} /> Paid
                                                        </span>
                                                    ) : item.status === 'partially_paid' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                                            <Clock size={11} /> Partially Paid
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                                                            <AlertCircle size={11} /> Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => setSelectedPaymentForAdd(item)}
                                                            disabled={isPaid}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                                                isPaid
                                                                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                                                    : 'bg-[#1A4D2E] hover:bg-[#143c24] text-white'
                                                            }`}
                                                        >
                                                            Add Payment
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedPaymentForHistory(item)}
                                                            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors cursor-pointer"
                                                        >
                                                            History
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="block md:hidden divide-y divide-neutral-100">
                            {paginatedPayments.map((item) => {
                                const isPaid = item.status === 'paid' || item.balance_amount <= 0;
                                return (
                                    <div key={item.id} className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-semibold text-neutral-900 text-sm">{item.client_name}</div>
                                                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                                                    <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                                                        <Calendar size={11} />
                                                        {item.quotation_date || item.created_at_formatted}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="font-mono text-neutral-700 font-medium">{item.ref_no}</span>
                                                </div>
                                            </div>
                                            <div>
                                                {item.status === 'paid' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        Paid
                                                    </span>
                                                ) : item.status === 'partially_paid' ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                                        Partially Paid
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-200">
                                                        Pending
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 bg-neutral-50 p-2.5 rounded-lg text-center text-xs">
                                            <div>
                                                <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                                                    <span>Total</span>
                                                    <button
                                                        onClick={() => setSelectedPaymentForEditTotal(item)}
                                                        className="text-neutral-400 hover:text-neutral-700"
                                                    >
                                                        <Pencil size={9} />
                                                    </button>
                                                </div>
                                                <div className="font-semibold text-neutral-900">₹{formatINR(item.total_amount)}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-emerald-700">Paid</div>
                                                <div className="font-semibold text-emerald-700">₹{formatINR(item.amount_paid)}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-amber-700">Balance</div>
                                                <div className="font-semibold text-amber-700">₹{formatINR(item.balance_amount)}</div>
                                            </div>
                                        </div>

                                        {item.remarks && (
                                            <div className="text-[11px] text-neutral-500 italic bg-neutral-50 px-2 py-1 rounded">
                                                Note: {item.remarks}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSelectedPaymentForAdd(item)}
                                                disabled={isPaid}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                                                    isPaid
                                                        ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                                        : 'bg-[#1A4D2E] text-white'
                                                }`}
                                            >
                                                Add Payment
                                            </button>
                                            <button
                                                onClick={() => setSelectedPaymentForHistory(item)}
                                                className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 text-xs font-medium cursor-pointer"
                                            >
                                                History
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Common Pagination Component */}
                        <Pagination
                            currentPage={currentPage}
                            totalItems={payments.length}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            onPerPageChange={setPerPage}
                            itemLabel="quotations"
                        />
                    </>
                )}
            </div>

            {/* Simple Add Payment Modal */}
            {selectedPaymentForAdd && (
                <AddPaymentModal
                    payment={selectedPaymentForAdd}
                    onClose={() => setSelectedPaymentForAdd(null)}
                    onSuccess={handlePaymentAdded}
                    onUnauthorized={onUnauthorized}
                />
            )}

            {/* Simple Payment History Modal */}
            {selectedPaymentForHistory && (
                <PaymentHistoryModal
                    payment={selectedPaymentForHistory}
                    onClose={() => setSelectedPaymentForHistory(null)}
                    onOpenAddPayment={() => {
                        setSelectedPaymentForAdd(selectedPaymentForHistory);
                        setSelectedPaymentForHistory(null);
                    }}
                    onUnauthorized={onUnauthorized}
                />
            )}

            {/* Edit Total Amount Modal */}
            {selectedPaymentForEditTotal && (
                <EditTotalModal
                    payment={selectedPaymentForEditTotal}
                    onClose={() => setSelectedPaymentForEditTotal(null)}
                    onSuccess={handleTotalUpdated}
                    onUnauthorized={onUnauthorized}
                />
            )}
        </div>
    );
};

/**
 * Clean Add Payment Modal (with editable Total Amount & Remarks)
 */
const AddPaymentModal = ({ payment, onClose, onSuccess, onUnauthorized }) => {
    const alreadyPaid = Number(payment.amount_paid) || 0;

    // Editable total amount & remarks
    const [isEditingTotal, setIsEditingTotal] = useState(false);
    const [totalAmount, setTotalAmount] = useState(Number(payment.total_amount) || 0);
    const [totalRemarks, setTotalRemarks] = useState(payment.remarks || '');

    const currentTotal = Number(totalAmount) || 0;
    const amountToPay = Math.max(0, currentTotal - alreadyPaid);

    const [paymentAmountInput, setPaymentAmountInput] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [transactionReference, setTransactionReference] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const parsedInputAmount = Number(paymentAmountInput) || 0;
    const balanceAfterPayment = Math.max(0, amountToPay - parsedInputAmount);

    useEffect(() => {
        if (!paymentAmountInput) {
            setErrorMsg('');
            return;
        }

        if (parsedInputAmount <= 0) {
            setErrorMsg('Payment amount must be greater than 0.');
        } else if (parsedInputAmount > amountToPay) {
            setErrorMsg(`Payment amount cannot exceed Amount to Pay (₹${formatINR(amountToPay)}).`);
        } else {
            setErrorMsg('');
        }
    }, [paymentAmountInput, amountToPay, parsedInputAmount]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (currentTotal <= 0) {
            setErrorMsg('Total amount must be greater than 0.');
            return;
        }

        if (currentTotal < alreadyPaid) {
            setErrorMsg(`Total amount cannot be less than already paid (₹${formatINR(alreadyPaid)}).`);
            return;
        }

        if (parsedInputAmount <= 0) {
            setErrorMsg('Payment amount must be greater than 0.');
            return;
        }

        if (parsedInputAmount > amountToPay) {
            setErrorMsg(`Payment cannot exceed ₹${formatINR(amountToPay)}.`);
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/admin-payments.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    quotation_id: payment.quotation_id,
                    payment_amount: parsedInputAmount,
                    payment_method: paymentMethod,
                    transaction_reference: transactionReference.trim() || undefined,
                    notes: notes.trim(),
                    new_total_amount: currentTotal !== Number(payment.total_amount) ? currentTotal : undefined,
                    total_remarks: totalRemarks.trim() || undefined,
                }),
            });

            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
                return;
            }

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Payment recorded successfully!');
                onSuccess();
            } else {
                setErrorMsg(data.message || 'Failed to save payment.');
                toast.error(data.message || 'Failed to save payment.');
            }
        } catch {
            setErrorMsg('Network error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200 space-y-4 relative">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-base font-bold text-neutral-900">Add Payment</h2>
                        <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{payment.client_name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-neutral-400">
                                <Calendar size={11} />
                                {payment.quotation_date || payment.created_at_formatted}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-neutral-700 font-medium">{payment.ref_no}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* 3-box summary with Edit Total toggle */}
                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200/70 text-center">
                        <div>
                            <div className="text-[11px] text-neutral-500 flex items-center justify-center gap-1">
                                <span>Total Amount</span>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingTotal(!isEditingTotal)}
                                    className="text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
                                    title="Edit Total Amount"
                                >
                                    <Pencil size={10} />
                                </button>
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-neutral-900 mt-0.5">
                                ₹{formatINR(currentTotal)}
                            </div>
                        </div>
                        <div className="border-x border-neutral-200 px-1">
                            <div className="text-[11px] text-emerald-700">Already Paid</div>
                            <div className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5">
                                ₹{formatINR(alreadyPaid)}
                            </div>
                        </div>
                        <div>
                            <div className="text-[11px] text-amber-700 font-semibold">Amount to Pay</div>
                            <div className="text-xs sm:text-sm font-bold text-amber-700 mt-0.5">
                                ₹{formatINR(amountToPay)}
                            </div>
                        </div>
                    </div>

                    {/* Inline Total Amount Editor (if user clicked edit) */}
                    {isEditingTotal && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between font-semibold text-amber-900">
                                <span>Edit Quotation Total & Remarks:</span>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingTotal(false)}
                                    className="text-amber-700 hover:underline text-[11px]"
                                >
                                    Done
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[11px] text-neutral-600 block mb-0.5">New Total (₹)</label>
                                    <input
                                        type="number"
                                        min={alreadyPaid}
                                        step="0.01"
                                        value={totalAmount}
                                        onChange={(e) => setTotalAmount(e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-semibold focus:outline-hidden"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-neutral-600 block mb-0.5">Reduction / Discount Remarks</label>
                                    <input
                                        type="text"
                                        value={totalRemarks}
                                        onChange={(e) => setTotalRemarks(e.target.value)}
                                        placeholder="e.g. ₹10,000 discount given"
                                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount Input */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                            <label htmlFor="amount-paid-input">Amount Paid (₹) *</label>
                            {amountToPay > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setPaymentAmountInput(amountToPay.toString())}
                                    className="text-[11px] text-[#1A4D2E] hover:underline font-medium cursor-pointer"
                                >
                                    Pay full balance (₹{formatINR(amountToPay)})
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm">
                                ₹
                            </span>
                            <input
                                id="amount-paid-input"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={amountToPay}
                                required
                                autoFocus
                                value={paymentAmountInput}
                                onChange={(e) => setPaymentAmountInput(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full pl-8 pr-4 py-2 text-sm font-semibold bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E]"
                            />
                        </div>
                    </div>

                    {/* Balance After Payment (Read-only dynamic) */}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
                        <span className="text-neutral-600 font-medium">Balance After Payment:</span>
                        <span
                            className={`font-bold font-mono text-sm ${
                                balanceAfterPayment === 0 ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                        >
                            ₹{formatINR(balanceAfterPayment)}
                        </span>
                    </div>

                    {/* Validation Error */}
                    {errorMsg && (
                        <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                            {errorMsg}
                        </div>
                    )}

                    {/* Payment Mode */}
                    <div className="space-y-1 text-xs">
                        <label className="text-neutral-700 font-semibold">Payment Mode</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-hidden text-xs"
                        >
                            <option value="UPI">UPI</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Card">Card</option>
                        </select>
                    </div>

                    {/* Transaction Reference (placed below Payment Mode) */}
                    <div className="space-y-1 text-xs">
                        <label className="text-neutral-700 font-semibold">Transaction Reference</label>
                        <input
                            type="text"
                            value={transactionReference}
                            onChange={(e) => setTransactionReference(e.target.value)}
                            placeholder="e.g. UTR / Cheque No"
                            className="w-full px-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-hidden text-xs font-mono"
                        />
                    </div>

                    {/* Note Textbox Below */}
                    <div className="space-y-1 text-xs">
                        <label className="text-neutral-700 font-semibold">Note (Optional)</label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Advance payment"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-hidden text-xs resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !!errorMsg || parsedInputAmount <= 0}
                            className="px-4 py-2 bg-[#1A4D2E] hover:bg-[#143c24] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Edit Quotation Total Amount Modal (with Remarks)
 */
const EditTotalModal = ({ payment, onClose, onSuccess, onUnauthorized }) => {
    const alreadyPaid = Number(payment.amount_paid) || 0;
    const [totalAmount, setTotalAmount] = useState(Number(payment.total_amount) || 0);
    const [remarks, setRemarks] = useState(payment.remarks || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const parsedTotal = Number(totalAmount) || 0;
    const newBalance = Math.max(0, parsedTotal - alreadyPaid);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (parsedTotal <= 0) {
            setErrorMsg('Total amount must be greater than 0.');
            return;
        }

        if (parsedTotal < alreadyPaid) {
            setErrorMsg(`Total amount cannot be less than already paid (₹${formatINR(alreadyPaid)}).`);
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');

        try {
            const res = await fetch('/api/admin-payments-update-total.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    quotation_id: payment.quotation_id,
                    total_amount: parsedTotal,
                    remarks: remarks.trim(),
                }),
            });

            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
                return;
            }

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Quotation total updated successfully!');
                onSuccess();
            } else {
                setErrorMsg(data.message || 'Failed to update total amount.');
            }
        } catch {
            setErrorMsg('Network error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-200 space-y-4 relative">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-base font-bold text-neutral-900">Edit Quotation Total</h2>
                        <div className="text-xs text-neutral-500 mt-0.5">
                            {payment.client_name} • <span className="font-mono">{payment.ref_no}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                    {/* Total Amount Input */}
                    <div className="space-y-1">
                        <label className="font-semibold text-neutral-700">Total Quotation Amount (₹) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min={alreadyPaid}
                            required
                            autoFocus
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-semibold bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#1A4D2E]"
                        />
                    </div>

                    {/* Dynamic Balance Preview */}
                    <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
                        <div className="flex justify-between text-neutral-500">
                            <span>Already Paid:</span>
                            <span className="font-semibold text-emerald-700">₹{formatINR(alreadyPaid)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-700 font-medium">
                            <span>New Amount to Pay:</span>
                            <span className="font-bold text-amber-700">₹{formatINR(newBalance)}</span>
                        </div>
                    </div>

                    {/* Remarks / Reason Input */}
                    <div className="space-y-1">
                        <label className="font-semibold text-neutral-700">
                            Remarks / Reason for Price Change
                        </label>
                        <textarea
                            rows={2}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="e.g. ₹10,000 discount negotiated with client on inverters"
                            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#1A4D2E] resize-none"
                        />
                    </div>

                    {errorMsg && (
                        <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                            {errorMsg}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || parsedTotal <= 0 || parsedTotal < alreadyPaid}
                            className="px-4 py-2 bg-[#1A4D2E] hover:bg-[#143c24] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            {isSubmitting ? 'Saving...' : 'Update Total'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Simple, Clean Payment History Modal
 */
const PaymentHistoryModal = ({ payment, onClose, onOpenAddPayment, onUnauthorized }) => {
    const [historyData, setHistoryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [historyPage, setHistoryPage] = useState(1);
    const historyPerPage = 5;

    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin-payments-history.php?id=${payment.quotation_id || payment.id}`, {
                credentials: 'include',
            });

            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
                return;
            }

            const data = await res.json();
            if (res.ok && data.success) {
                setHistoryData(data.data);
            } else {
                toast.error(data.message || 'Failed to load history.');
            }
        } catch {
            toast.error('Network error loading history.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
        setHistoryPage(1);
    }, [payment]);

    const master = historyData?.master || payment;
    const histories = historyData?.histories || [];
    const isFullyPaid = master.status === 'paid' || master.balance_amount <= 0;

    const totalHistoryPages = Math.ceil(histories.length / historyPerPage) || 1;
    const paginatedHistories = histories.slice(
        (historyPage - 1) * historyPerPage,
        historyPage * historyPerPage
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-2xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-neutral-200 space-y-4 relative max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                    <div>
                        <h2 className="text-base font-bold text-neutral-900">Payment History</h2>
                        <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>{master.client_name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-neutral-400">
                                <Calendar size={11} />
                                {master.quotation_date || master.created_at_formatted}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-neutral-700 font-medium">{master.ref_no}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Summary Strip */}
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl text-xs">
                    <div>
                        <span className="text-neutral-500">Total:</span>{' '}
                        <span className="font-semibold text-neutral-900">₹{formatINR(master.total_amount)}</span>
                    </div>
                    <div>
                        <span className="text-emerald-700 font-medium">Paid:</span>{' '}
                        <span className="font-semibold text-emerald-700">₹{formatINR(master.amount_paid)}</span>
                    </div>
                    <div>
                        <span className="text-amber-700 font-medium">Balance:</span>{' '}
                        <span className="font-semibold text-amber-700">₹{formatINR(master.balance_amount)}</span>
                    </div>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {isLoading ? (
                        <div className="py-8 text-center text-xs text-neutral-400">Loading history...</div>
                    ) : histories.length === 0 ? (
                        <div className="py-8 text-center text-xs text-neutral-400">
                            No payments recorded yet.
                        </div>
                    ) : (
                        paginatedHistories.map((tx) => (
                            <div
                                key={tx.id}
                                className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1.5 text-xs"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="font-bold text-emerald-700">
                                        +₹{formatINR(tx.payment_amount)}
                                        <span className="ml-2 font-normal text-[11px] text-neutral-500">
                                            ({tx.payment_method || 'Cash'})
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-neutral-400">
                                        {tx.payment_date_formatted}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                                    <span>Total Paid: ₹{formatINR(tx.total_paid_after)}</span>
                                    <span>Remaining: ₹{formatINR(tx.balance_after)}</span>
                                </div>
                                {tx.transaction_reference && (
                                    <div className="text-[11px] font-mono text-neutral-600">
                                        <span className="text-neutral-400">Ref:</span> {tx.transaction_reference}
                                    </div>
                                )}
                                {tx.notes && (
                                    <div className="text-[11px] text-neutral-500 italic">
                                        "{tx.notes}"
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* History Pagination */}
                {histories.length > historyPerPage && (
                    <div className="flex items-center justify-between pt-2 px-1 text-xs text-neutral-500 border-t border-neutral-100">
                        <span>
                            Page <strong className="text-neutral-800">{historyPage}</strong> of <strong className="text-neutral-800">{totalHistoryPages}</strong> ({histories.length} payments)
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                                disabled={historyPage === 1}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 transition-colors"
                            >
                                <ChevronLeft size={12} />
                                <span>Prev</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                                disabled={historyPage === totalHistoryPages}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 transition-colors"
                            >
                                <span>Next</span>
                                <ChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <button
                        onClick={onClose}
                        className="px-3.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                    >
                        Close
                    </button>
                    {!isFullyPaid && (
                        <button
                            onClick={onOpenAddPayment}
                            className="px-3.5 py-1.5 bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-semibold rounded-lg cursor-pointer"
                        >
                            Add Payment
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
