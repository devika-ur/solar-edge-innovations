import React, { useState, useEffect } from 'react';
import { ReportTable } from './ReportTable';
import { Pagination } from '../Pagination';
import { CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';

const formatINR = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    });
};

/**
 * PaymentHistoryReport Component
 * 
 * Renders summary metrics and flat payment transaction records with client-side UI pagination.
 */
export const PaymentHistoryReport = ({ data = [], summary = {}, isLoading = false }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Reset page to 1 when filters or dataset change
    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    const totalItems = data ? data.length : 0;
    const startIndex = (currentPage - 1) * perPage;
    const paginatedData = data ? data.slice(startIndex, startIndex + perPage) : [];
    return (
        <div className="space-y-4">
            {/* Summary KPI Cards */}
            {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white rounded-xl p-3.5 border border-neutral-200 shadow-2xs">
                        <div className="text-[11px] font-medium text-neutral-500">Total Quotations</div>
                        <div className="text-lg font-bold text-neutral-900 mt-0.5">
                            {summary.totalQuotations || 0}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-neutral-200 shadow-2xs">
                        <div className="text-[11px] font-medium text-neutral-500">Total Invoiced</div>
                        <div className="text-lg font-bold text-neutral-900 mt-0.5">
                            ₹{formatINR(summary.totalQuotationAmount)}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-neutral-200 shadow-2xs">
                        <div className="text-[11px] font-medium text-emerald-700">Total Amount Paid</div>
                        <div className="text-lg font-bold text-emerald-700 mt-0.5">
                            ₹{formatINR(summary.totalAmountPaid)}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-neutral-200 shadow-2xs">
                        <div className="text-[11px] font-medium text-amber-700">Amount to Pay</div>
                        <div className="text-lg font-bold text-amber-700 mt-0.5">
                            ₹{formatINR(summary.totalAmountToPay)}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-neutral-200 shadow-2xs col-span-2 sm:col-span-1">
                        <div className="text-[11px] font-medium text-blue-700">Transactions</div>
                        <div className="text-lg font-bold text-blue-800 mt-0.5">
                            {summary.totalPaymentTransactions || 0}
                        </div>
                    </div>
                </div>
            )}

            {/* Table Container */}
            <ReportTable
                isLoading={isLoading}
                isEmpty={!data || data.length === 0}
                emptyMessage="No payment transactions found matching these filters."
                totalCount={data ? data.length : 0}
                itemLabel="payment records"
                footer={
                    totalItems > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            onPerPageChange={(newPerPage) => {
                                setPerPage(newPerPage);
                                setCurrentPage(1);
                            }}
                            perPageOptions={[5, 10, 25, 50, 100]}
                            itemLabel="payment records"
                        />
                    )
                }
            >
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px] font-semibold">
                            <th className="py-3 px-3.5">Customer</th>
                            <th className="py-3 px-3.5">Quotation No</th>
                            <th className="py-3 px-3.5 whitespace-nowrap">Quotation Date</th>
                            <th className="py-3 px-3.5 text-right whitespace-nowrap">Quotation Total</th>
                            <th className="py-3 px-3.5 whitespace-nowrap">Payment Date</th>
                            <th className="py-3 px-3.5 text-right whitespace-nowrap">Payment Amount</th>
                            <th className="py-3 px-3.5 text-right whitespace-nowrap">Total Paid</th>
                            <th className="py-3 px-3.5 text-right whitespace-nowrap">Balance</th>
                            <th className="py-3 px-3.5 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {paginatedData.map((item, idx) => {
                            const isPaid = item.payment_status_raw === 'paid';
                            const isPartial = item.payment_status_raw === 'partially_paid';

                            return (
                                <tr key={item.payment_id ? `pay-${item.payment_id}` : `quote-${item.quotation_id}-${idx}`} className="hover:bg-neutral-50/70 transition-colors">
                                    {/* Customer */}
                                    <td className="py-3 px-3.5 font-semibold text-neutral-900">
                                        <div>{item.customer_name}</div>
                                        {item.customer_contact && item.customer_contact !== '-' && (
                                            <div className="text-[11px] font-normal text-neutral-400">
                                                {item.customer_contact}
                                            </div>
                                        )}
                                    </td>

                                    {/* Quotation No */}
                                    <td className="py-3 px-3.5 font-mono font-medium text-neutral-800 whitespace-nowrap">
                                        {item.quotation_number}
                                    </td>

                                    {/* Quotation Date */}
                                    <td className="py-3 px-3.5 whitespace-nowrap text-neutral-600">
                                        {item.quotation_date}
                                    </td>

                                    {/* Quotation Total */}
                                    <td className="py-3 px-3.5 text-right font-medium text-neutral-900 whitespace-nowrap">
                                        ₹{formatINR(item.quotation_total_amount)}
                                    </td>

                                    {/* Payment Date */}
                                    <td className="py-3 px-3.5 whitespace-nowrap text-neutral-700">
                                        <div className="font-medium">{item.payment_date}</div>
                                        {item.payment_method && item.payment_method !== '-' && (
                                            <div className="text-[10px] text-neutral-400">
                                                {item.payment_method}
                                                {item.transaction_reference && item.transaction_reference !== '-' && ` • ${item.transaction_reference}`}
                                            </div>
                                        )}
                                    </td>

                                    {/* Payment Amount */}
                                    <td className="py-3 px-3.5 text-right font-bold text-emerald-700 whitespace-nowrap">
                                        {item.payment_amount > 0 ? `+₹${formatINR(item.payment_amount)}` : '₹0'}
                                    </td>

                                    {/* Total Paid */}
                                    <td className="py-3 px-3.5 text-right font-medium text-neutral-800 whitespace-nowrap">
                                        ₹{formatINR(item.total_paid_after)}
                                    </td>

                                    {/* Balance */}
                                    <td className="py-3 px-3.5 text-right font-bold text-amber-700 whitespace-nowrap">
                                        ₹{formatINR(item.balance_after)}
                                    </td>

                                    {/* Status Badge */}
                                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                                        {isPaid ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 size={10} /> Paid
                                            </span>
                                        ) : isPartial ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                <Clock size={10} /> Partially Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                                                <AlertCircle size={10} /> Pending
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </ReportTable>
        </div>
    );
};

export default PaymentHistoryReport;
