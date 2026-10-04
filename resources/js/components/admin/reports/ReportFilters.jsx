import React from 'react';
import {
    Calendar,
    Search,
    RotateCcw,
    FileSpreadsheet,
    FileText,
    Play,
    Filter,
    User,
    CheckCircle2
} from 'lucide-react';

/**
 * ReportFilters Component
 * 
 * Renders server-side filter inputs and export action buttons.
 */
export const ReportFilters = ({
    reportType,
    onReportTypeChange,
    filters,
    onFilterChange,
    onGenerate,
    onReset,
    onExportExcel,
    onExportPdf,
    isLoading,
    hasData,
    clientsList = [],
}) => {
    const isQuotationReport = reportType === 'quotation_history';

    return (
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
            {/* Top Row: Report Type Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-[#1A4D2E]" />
                    <span className="text-xs sm:text-sm font-bold text-neutral-900">Report Type:</span>
                    <select
                        value={reportType}
                        onChange={(e) => onReportTypeChange(e.target.value)}
                        className="bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold text-neutral-800 outline-none cursor-pointer focus:border-[#1A4D2E] focus:bg-white"
                    >
                        <option value="payment_history">Payment History Report</option>
                        <option value="quotation_history">Quotation History Report</option>
                    </select>
                </div>

                <div className="text-[11px] text-neutral-400">
                    Server-side filtered • Non-paginated report dataset
                </div>
            </div>

            {/* Filter Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Date From */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                        <Calendar size={11} className="text-neutral-400" />
                        <span>Date From</span>
                    </label>
                    <input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => onFilterChange('fromDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none focus:border-[#1A4D2E]"
                    />
                </div>

                {/* Date To */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                        <Calendar size={11} className="text-neutral-400" />
                        <span>Date To</span>
                    </label>
                    <input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => onFilterChange('toDate', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none focus:border-[#1A4D2E]"
                    />
                </div>

                {/* Customer Filter */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                        <User size={11} className="text-neutral-400" />
                        <span>Customer</span>
                    </label>
                    {clientsList.length > 0 ? (
                        <select
                            value={filters.customer}
                            onChange={(e) => onFilterChange('customer', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none focus:border-[#1A4D2E]"
                        >
                            <option value="">All Customers</option>
                            {clientsList.map((client, idx) => (
                                <option key={`client-${client.id || 'c'}-${idx}`} value={client.name}>
                                    {client.name} ({client.phone !== '-' ? client.phone : `${client.total_quotations} quotes`})
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            value={filters.customer}
                            onChange={(e) => onFilterChange('customer', e.target.value)}
                            placeholder="Customer name or phone..."
                            className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none focus:border-[#1A4D2E]"
                        />
                    )}
                </div>

                {/* Quotation Number Filter */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                        <Search size={11} className="text-neutral-400" />
                        <span>Quotation Number</span>
                    </label>
                    <input
                        type="text"
                        value={filters.quotationNumber}
                        onChange={(e) => onFilterChange('quotationNumber', e.target.value)}
                        placeholder="e.g. SEI-Q-2026-101"
                        className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none focus:border-[#1A4D2E]"
                    />
                </div>

                {/* Payment Status Filter */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-neutral-400" />
                        <span>Payment Status</span>
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none cursor-pointer focus:border-[#1A4D2E]"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending (Unpaid)</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="paid">Paid (Complete)</option>
                    </select>
                </div>

                {/* Quotation Status Filter (only for quotation report) */}
                {isQuotationReport && (
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-neutral-600">Quotation Status</label>
                        <select
                            value={filters.quotationStatus || 'all'}
                            onChange={(e) => onFilterChange('quotationStatus', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none cursor-pointer focus:border-[#1A4D2E]"
                        >
                            <option value="all">All Quotations</option>
                            <option value="active">Active</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Bottom Row: Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1A4D2E] hover:bg-[#143c24] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                        <Play size={13} className={isLoading ? 'animate-spin' : 'fill-white'} />
                        <span>{isLoading ? 'Generating...' : 'Generate Report'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onReset}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        title="Clear all filters"
                    >
                        <RotateCcw size={13} />
                        <span>Reset</span>
                    </button>
                </div>

                {/* Export Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onExportExcel}
                        disabled={isLoading || !hasData}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                        title="Export current filtered data to Excel"
                    >
                        <FileSpreadsheet size={14} />
                        <span>Export Excel</span>
                    </button>

                    <button
                        type="button"
                        onClick={onExportPdf}
                        disabled={isLoading || !hasData}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                        title="Export current filtered data to PDF"
                    >
                        <FileText size={14} />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportFilters;
