import React from 'react';

/**
 * Common, Reusable Pagination Component for Admin Tables
 * 
 * @param {number} currentPage - Currently active page (1-indexed)
 * @param {number} totalItems - Total count of records
 * @param {number} perPage - Number of items displayed per page
 * @param {function} onPageChange - Callback when a page is selected: (newPage) => void
 * @param {function} onPerPageChange - Callback when per-page size is changed: (newPerPage) => void
 * @param {number[]} perPageOptions - Array of available per-page options (default: [5, 10, 20, 50])
 * @param {string} itemLabel - Noun for the items (e.g. 'quotations', 'inquiries', 'records')
 * @param {boolean} showPerPage - Whether to render the per-page selector dropdown (default: true)
 * @param {string} className - Optional container styling classes
 */
export const Pagination = ({
    currentPage = 1,
    totalItems = 0,
    perPage = 10,
    onPageChange,
    onPerPageChange,
    perPageOptions = [5, 10, 20, 50],
    itemLabel = 'items',
    showPerPage = true,
    className = '',
}) => {
    if (!totalItems || totalItems <= 0) {
        return null;
    }

    const safePerPage = Math.max(1, Number(perPage) || 10);
    const totalPages = Math.ceil(totalItems / safePerPage) || 1;
    const safeCurrentPage = Math.min(Math.max(1, Number(currentPage) || 1), totalPages);

    const startItem = (safeCurrentPage - 1) * safePerPage + 1;
    const endItem = Math.min(safeCurrentPage * safePerPage, totalItems);

    // Smart windowing for page buttons when there are many pages
    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (safeCurrentPage <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }
        if (safeCurrentPage >= totalPages - 3) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages];
    };

    const handlePageClick = (page) => {
        if (typeof page === 'number' && page >= 1 && page <= totalPages && page !== safeCurrentPage) {
            if (onPageChange) {
                onPageChange(page);
            }
        }
    };

    return (
        <div
            className={`px-4 sm:px-6 py-3 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 bg-neutral-50/50 select-none ${className}`}
        >
            {/* Left: Item Range & Per Page Selector */}
            <div className="flex items-center gap-3">
                <span>
                    Showing <strong className="text-neutral-800 font-semibold">{startItem}</strong> to{' '}
                    <strong className="text-neutral-800 font-semibold">{endItem}</strong> of{' '}
                    <strong className="text-neutral-800 font-semibold">{totalItems}</strong> {itemLabel}
                </span>

                {showPerPage && onPerPageChange && (
                    <div className="flex items-center gap-1.5 ml-1">
                        <span className="text-[11px] text-neutral-400">Per page:</span>
                        <select
                            value={safePerPage}
                            onChange={(e) => {
                                const newPerPage = Number(e.target.value);
                                onPerPageChange(newPerPage);
                                if (onPageChange) {
                                    onPageChange(1);
                                }
                            }}
                            className="bg-white border border-neutral-300 rounded-md px-2 py-0.5 text-xs text-neutral-700 outline-none cursor-pointer focus:border-[#1A4D2E]"
                        >
                            {perPageOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Right: Page Navigation Controls */}
            <div className="flex items-center gap-1">
                {/* Prev Button */}
                <button
                    type="button"
                    onClick={() => handlePageClick(safeCurrentPage - 1)}
                    disabled={safeCurrentPage <= 1}
                    className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
                >
                    Prev
                </button>

                {/* Page Number Buttons */}
                {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-neutral-400 select-none">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => handlePageClick(page)}
                            className={`min-w-7 h-7 px-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                safeCurrentPage === page
                                    ? 'bg-[#1A4D2E] text-white shadow-xs'
                                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}

                {/* Next Button */}
                <button
                    type="button"
                    onClick={() => handlePageClick(safeCurrentPage + 1)}
                    disabled={safeCurrentPage >= totalPages}
                    className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;
