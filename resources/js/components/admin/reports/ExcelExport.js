import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

/**
 * Reusable Frontend Excel Export Utility
 * 
 * Exports already-filtered report dataset directly to formatted .xlsx workbook
 * without making any additional backend API calls.
 * 
 * @param {Object} options
 * @param {string} options.title - Report title (e.g. 'Payment History Report')
 * @param {string} options.filename - Output filename without extension
 * @param {Array<Object>} options.data - Filtered rows array
 * @param {Array<Object>} options.columns - Column definitions: [{ key, label, format?: 'currency'|'number'|'text'|'date' }]
 * @param {Object} [options.summary] - Summary KPI numbers to include in header
 * @param {Object} [options.filters] - Applied filter metadata for context
 */
export const exportToExcel = ({
    title = 'Report',
    filename = 'report',
    data = [],
    columns = [],
    summary = null,
    filters = null,
}) => {
    try {
        if (!data || data.length === 0) {
            toast.error('No data available to export.');
            return;
        }

        // Build array-of-arrays (AOA) for worksheet
        const aoa = [];

        // 1. Company Branding & Report Title
        aoa.push(['SOLAR EDGE INNOVATIONS']);
        aoa.push([title.toUpperCase()]);
        aoa.push([`Generated On: ${new Date().toLocaleString('en-IN')}`]);

        // 2. Applied Filters Info
        if (filters) {
            const filterParts = [];
            if (filters.fromDate && filters.toDate) {
                filterParts.push(`Date Range: ${filters.fromDate} to ${filters.toDate}`);
            } else if (filters.fromDate) {
                filterParts.push(`From Date: ${filters.fromDate}`);
            } else if (filters.toDate) {
                filterParts.push(`To Date: ${filters.toDate}`);
            }
            if (filters.customer) filterParts.push(`Customer: ${filters.customer}`);
            if (filters.quotationNumber) filterParts.push(`Quotation: ${filters.quotationNumber}`);
            if (filters.status && filters.status !== 'all') filterParts.push(`Status: ${filters.status}`);

            if (filterParts.length > 0) {
                aoa.push([`Filters: ${filterParts.join(' | ')}`]);
            }
        }

        // 3. Summary Statistics (listed one by one below)
        if (summary) {
            aoa.push([]);
            aoa.push(['SUMMARY:']);
            if (summary.totalQuotations !== undefined) {
                aoa.push(['Total Quotations:', summary.totalQuotations]);
            }
            if (summary.totalQuotationAmount !== undefined) {
                aoa.push(['Total Invoiced:', `₹${Number(summary.totalQuotationAmount).toLocaleString('en-IN')}`]);
            }
            if (summary.totalAmountPaid !== undefined) {
                aoa.push(['Total Paid:', `₹${Number(summary.totalAmountPaid).toLocaleString('en-IN')}`]);
            }
            if (summary.totalAmountToPay !== undefined) {
                aoa.push(['Balance Outstanding:', `₹${Number(summary.totalAmountToPay).toLocaleString('en-IN')}`]);
            }
            if (summary.totalPaymentTransactions !== undefined) {
                aoa.push(['Total Transactions:', summary.totalPaymentTransactions]);
            }
            if (summary.statusCounts) {
                if (summary.statusCounts.paid !== undefined) {
                    aoa.push(['Paid Quotations:', summary.statusCounts.paid]);
                }
                if (summary.statusCounts.partially_paid !== undefined) {
                    aoa.push(['Partially Paid Quotations:', summary.statusCounts.partially_paid]);
                }
                if (summary.statusCounts.pending !== undefined) {
                    aoa.push(['Pending Quotations:', summary.statusCounts.pending]);
                }
            }
        }

        // Blank separator row
        aoa.push([]);

        // 4. Table Column Headers
        const headerRow = columns.map(c => c.label);
        aoa.push(headerRow);

        // 5. Data Rows
        data.forEach(item => {
            const row = columns.map(col => {
                let val = item[col.key];
                if (val === null || val === undefined) return '';

                if (col.format === 'currency' || col.format === 'number') {
                    const num = Number(val);
                    return isNaN(num) ? val : num;
                }
                return val;
            });
            aoa.push(row);
        });

        // 6. Summary Total Row if applicable
        if (summary) {
            const footerRow = columns.map((col, idx) => {
                if (idx === 0) return 'TOTAL SUMMARY';
                if (col.key === 'quotation_total_amount' || col.key === 'total_amount') return Number(summary.totalQuotationAmount || 0);
                if (col.key === 'payment_amount' || col.key === 'amount_paid') return Number(summary.totalAmountPaid || 0);
                if (col.key === 'balance_after' || col.key === 'amount_to_pay') return Number(summary.totalAmountToPay || 0);
                return '';
            });
            aoa.push(footerRow);
        }

        // Create workbook and worksheet
        const ws = XLSX.utils.aoa_to_sheet(aoa);

        // Set column widths
        const colWidths = columns.map((col, idx) => {
            let maxLen = col.label.length;
            data.forEach(row => {
                const cellVal = String(row[col.key] || '');
                if (cellVal.length > maxLen) maxLen = Math.min(cellVal.length, 40);
            });
            if (idx === 0) maxLen = Math.max(maxLen, 28);
            if (idx === 1) maxLen = Math.max(maxLen, 20);
            return { wch: Math.max(maxLen + 3, 14) };
        });
        ws['!cols'] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');

        // Safe Filename
        const cleanFilename = (filename || 'report').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        XLSX.writeFile(wb, `${cleanFilename}.xlsx`);

        toast.success('Excel report exported successfully!');
    } catch (err) {
        console.error('Excel export error:', err);
        toast.error('Failed to export Excel report.');
    }
};

export default exportToExcel;
