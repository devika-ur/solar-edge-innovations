import React from 'react';
import { RefreshCw, FileQuestion } from 'lucide-react';

/**
 * ReportTable Component
 * 
 * Reusable table container for reports with loading and empty states.
 */
export const ReportTable = ({
    isLoading,
    isEmpty,
    emptyMessage = 'No records match the selected filters.',
    totalCount = 0,
    itemLabel = 'records',
    children,
    footer = null,
}) => {
    return (
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
            {/* Header Strip */}
            <div className="px-4 sm:px-6 py-3 border-b border-neutral-100 flex items-center justify-between text-xs text-neutral-500 bg-neutral-50/50">
                <span>
                    Total Results: <strong className="text-neutral-900 font-bold">{totalCount}</strong> {itemLabel}
                </span>
                <span className="text-[11px] text-neutral-400">
                    Complete dataset • Ready for Export
                </span>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="py-24 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
                    <RefreshCw size={20} className="animate-spin text-[#1A4D2E]" />
                    <span className="font-medium text-neutral-600">Generating report...</span>
                    <span className="text-[11px] text-neutral-400">Querying database with applied filters</span>
                </div>
            ) : isEmpty ? (
                <div className="py-20 text-center text-xs text-neutral-500 flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                        <FileQuestion size={24} />
                    </div>
                    <span className="font-semibold text-neutral-800 text-sm">{emptyMessage}</span>
                    <span className="text-neutral-400 text-[11px] max-w-sm">
                        Try clearing or broadening your date range or customer filters above, then click "Generate Report".
                    </span>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        {children}
                    </div>
                    {footer && (
                        <div className="border-t border-neutral-100 bg-white">
                            {footer}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReportTable;
