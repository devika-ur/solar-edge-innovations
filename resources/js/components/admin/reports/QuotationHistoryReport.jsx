import React, { useState, useEffect } from 'react';
import { ReportTable } from './ReportTable';
import { Pagination } from '../Pagination';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const formatINR = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    });
};

/**
 * QuotationHistoryReport Component
 * 
 * Renders server-side filtered quotation history report with client-side UI pagination.
 */
export const QuotationHistoryReport = ({ data = [], summary = {}, isLoading = false }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Reset to page 1 on filter/data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    const totalItems = data ? data.length : 0;
    const startIndex = (currentPage - 1) * perPage;
    const paginatedData = data ? data.slice(startIndex, startIndex + perPage) : [];

    const statusCounts = summary?.statusCounts || { pending: 0, partially_paid: 0, paid: 0 };

    return (
        <div className="space-y-4">
            {/* Summary KPI Cards */}
            {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl p-3.5 border border-neutral-200 shadow-2xs">
                        <div className="text-[11px] font-medium text-neutral-500">Total Quotations</div>
                        <div className="text-lg font-bold text-neutral-900 mt-0.5">
                            {summary.totalQuotations || 0}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                            {statusCounts.paid || 0} Paid • {statusCounts.partially_paid || 0} Partial • {statusCounts.pending || 0} Pending
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-neutral-200 shadow-2xs">
                        <div className="text-[11px] font-medium text-neutral-500">Total Invoiced</div>
                        <div className="text-lg font-bold text-neutral-900 mt-0.5">
                            ₹{formatINR(summary.totalQuotationAmount)}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-3.5 border border-neutral-200 shadow-2xs">
                        <div className="text-[11px] font-medium text-emerald-700">Amount Paid</div>
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
                </div>
            )}

            {/* Table Container */}
            <ReportTable
                isLoading={isLoading}
                isEmpty={!data || data.length === 0}
                emptyMessage="No quotations found matching these filters."
                totalCount={data ? data.length : 0}
                itemLabel="quotations"
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
                            itemLabel="quotations"
                        />
                    )
                }
            >
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px] font-semibold">
                            <th className="py-3 px-3.5 whitespace-nowrap">Quotation Date</th>
                            <th className="py-3 px-3.5">Quotation No</th>
                            <th className="py-3 px-3.5">Customer Name</th>
                            <th className="py-3 px-3.5">Contact Details</th>
                            <th className="py-3 px-3.5 text-right whitespace-nowrap">Total Amount</th>
                            <th className="py-3 px-3.5 text-right whitespace-nowrap">Amount Paid</th>
                            <th className="py-3 px-3.5 text-right whitespace-nowrap">Amount to Pay</th>
                            <th className="py-3 px-3.5 text-center">Payment Status</th>
                            <th className="py-3 px-3.5 text-center">Quote Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {paginatedData.map((quote) => {
                            const isPaid = quote.payment_status_raw === 'paid';
                            const isPartial = quote.payment_status_raw === 'partially_paid';

                            return (
                                <tr key={quote.quotation_id} className="hover:bg-neutral-50/70 transition-colors">
                                    {/* Quotation Date */}
                                    <td className="py-3 px-3.5 whitespace-nowrap text-neutral-700 font-medium">
                                        {quote.quotation_date}
                                    </td>

                                    {/* Quotation No */}
                                    <td className="py-3 px-3.5 font-mono font-bold text-neutral-900 whitespace-nowrap">
                                        {quote.quotation_number}
                                    </td>

                                    {/* Customer Name */}
                                    <td className="py-3 px-3.5 font-semibold text-neutral-900">
                                        <div>{quote.customer_name}</div>
                                        {quote.customer_address && quote.customer_address !== '-' && (
                                            <div className="text-[10px] text-neutral-400 truncate max-w-[160px]">
                                                {quote.customer_address}
                                            </div>
                                        )}
                                    </td>

                                    {/* Contact Details */}
                                    <td className="py-3 px-3.5 text-neutral-600 font-mono text-[11px]">
                                        {quote.customer_contact}
                                    </td>

                                    {/* Total Amount */}
                                    <td className="py-3 px-3.5 text-right font-medium text-neutral-900 whitespace-nowrap">
                                        ₹{formatINR(quote.quotation_total_amount)}
                                    </td>

                                    {/* Amount Paid */}
                                    <td className="py-3 px-3.5 text-right font-semibold text-emerald-700 whitespace-nowrap">
                                        ₹{formatINR(quote.amount_paid)}
                                    </td>

                                    {/* Amount to Pay */}
                                    <td className="py-3 px-3.5 text-right font-bold text-amber-700 whitespace-nowrap">
                                        ₹{formatINR(quote.amount_to_pay)}
                                    </td>

                                    {/* Payment Status Badge */}
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

                                    {/* Quotation Status */}
                                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 text-neutral-600">
                                            {quote.quotation_status || 'Active'}
                                        </span>
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

export default QuotationHistoryReport;
