import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

const formatINR = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    });
};

/**
 * Reusable Frontend PDF Export Utility
 * 
 * Generates and downloads multi-page PDF reports using jspdf + jspdf-autotable
 * without making any additional backend API calls.
 * 
 * @param {Object} options
 * @param {string} options.title - Report title (e.g. 'Payment History Report')
 * @param {string} options.filename - Output filename without extension
 * @param {Array<Object>} options.data - Filtered rows array
 * @param {Array<Object>} options.columns - Column definitions: [{ key, label, format?: 'currency'|'number'|'text'|'date' }]
 * @param {Object} [options.summary] - Summary KPI numbers
 * @param {Object} [options.filters] - Applied filter metadata
 * @param {string} [options.orientation] - 'portrait' or 'landscape' (default: 'landscape')
 */
export const exportToPdf = ({
    title = 'Report',
    filename = 'report',
    data = [],
    columns = [],
    summary = null,
    filters = null,
    orientation = 'landscape',
}) => {
    try {
        if (!data || data.length === 0) {
            toast.error('No data available to export.');
            return;
        }

        const doc = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 1. Header Banner
        doc.setFillColor(26, 77, 46); // Brand Green #1A4D2E
        doc.rect(0, 0, pageWidth, 24, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('SOLAR EDGE INNOVATIONS', 14, 10);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(title.toUpperCase(), 14, 16);

        doc.setFontSize(8);
        const dateStr = `Generated: ${new Date().toLocaleString('en-IN')}`;
        doc.text(dateStr, pageWidth - 14, 13, { align: 'right' });

        let currentY = 30;

        // 2. Applied Filters Row
        if (filters) {
            const filterParts = [];
            if (filters.fromDate && filters.toDate) {
                filterParts.push(`Date: ${filters.fromDate} to ${filters.toDate}`);
            } else if (filters.fromDate) {
                filterParts.push(`From: ${filters.fromDate}`);
            } else if (filters.toDate) {
                filterParts.push(`To: ${filters.toDate}`);
            }
            if (filters.customer) filterParts.push(`Customer: ${filters.customer}`);
            if (filters.quotationNumber) filterParts.push(`Quotation No: ${filters.quotationNumber}`);
            if (filters.status && filters.status !== 'all') filterParts.push(`Status: ${filters.status}`);

            if (filterParts.length > 0) {
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(80, 80, 80);
                doc.text(`Applied Filters: ${filterParts.join('  |  ')}`, 14, currentY);
                currentY += 6;
            }
        }

        // 3. Summary Cards Strip
        if (summary) {
            const summaryCards = [];
            if (summary.totalQuotations !== undefined) {
                summaryCards.push({ label: 'Total Quotations', value: String(summary.totalQuotations) });
            }
            if (summary.totalQuotationAmount !== undefined) {
                summaryCards.push({ label: 'Total Invoiced', value: `Rs. ${formatINR(summary.totalQuotationAmount)}` });
            }
            if (summary.totalAmountPaid !== undefined) {
                summaryCards.push({ label: 'Total Paid', value: `Rs. ${formatINR(summary.totalAmountPaid)}` });
            }
            if (summary.totalAmountToPay !== undefined) {
                summaryCards.push({ label: 'Balance Outstanding', value: `Rs. ${formatINR(summary.totalAmountToPay)}` });
            }
            if (summary.totalPaymentTransactions !== undefined) {
                summaryCards.push({ label: 'Transactions', value: String(summary.totalPaymentTransactions) });
            }

            if (summaryCards.length > 0) {
                const cardWidth = (pageWidth - 28) / summaryCards.length;
                summaryCards.forEach((card, idx) => {
                    const x = 14 + idx * cardWidth;
                    doc.setFillColor(248, 250, 252);
                    doc.setDrawColor(226, 232, 240);
                    doc.roundedRect(x, currentY, cardWidth - 3, 13, 2, 2, 'FD');

                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 116, 139);
                    doc.text(card.label, x + 3, currentY + 4.5);

                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(15, 23, 42);
                    doc.text(card.value, x + 3, currentY + 10);
                });
                currentY += 17;
            }
        }

        // 4. Build Table Rows
        const head = [columns.map(c => c.label)];
        const body = data.map(item => {
            return columns.map(col => {
                let val = item[col.key];
                if (val === null || val === undefined) return '-';

                if (col.format === 'currency') {
                    return `Rs. ${formatINR(val)}`;
                }
                return String(val);
            });
        });

        // 5. Render AutoTable
        autoTable(doc, {
            head: head,
            body: body,
            startY: currentY,
            margin: { left: 14, right: 14, top: 20, bottom: 15 },
            theme: 'striped',
            showHead: 'everyPage', // Repeat table header on every page (Req 13)
            headStyles: {
                fillColor: [26, 77, 46], // #1A4D2E
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
                cellPadding: 2.5,
                halign: 'left',
            },
            bodyStyles: {
                fontSize: 7.5,
                textColor: [30, 41, 59],
                cellPadding: 2,
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            didDrawPage: (hookData) => {
                // Footer with Page Numbers
                const pageNumber = hookData.pageNumber;
                const totalPages = doc.internal.getNumberOfPages();

                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(148, 163, 184);

                doc.text(
                    'Solar Edge Innovations • Official Management Report • Confidential',
                    14,
                    pageHeight - 6
                );

                doc.text(
                    `Page ${pageNumber} of ${totalPages}`,
                    pageWidth - 14,
                    pageHeight - 6,
                    { align: 'right' }
                );
            },
        });

        // Safe Filename
        const cleanFilename = (filename || 'report').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        doc.save(`${cleanFilename}.pdf`);

        toast.success('PDF report exported successfully!');
    } catch (err) {
        console.error('PDF export error:', err);
        toast.error('Failed to export PDF report.');
    }
};

export default exportToPdf;
