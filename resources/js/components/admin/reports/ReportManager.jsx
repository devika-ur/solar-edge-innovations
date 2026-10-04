import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, RefreshCw } from 'lucide-react';
import { ReportFilters } from './ReportFilters';
import { PaymentHistoryReport } from './PaymentHistoryReport';
import { QuotationHistoryReport } from './QuotationHistoryReport';
import { exportToExcel } from './ExcelExport';
import { exportToPdf } from './PdfExport';

/**
 * ReportManager Component
 * 
 * Central hub for the "Reports" tab.
 * Connects dedicated report APIs to table rendering and direct Excel/PDF exports.
 */
export const ReportManager = ({ onUnauthorized }) => {
    // 1. Report Type
    const [reportType, setReportType] = useState('payment_history');

    // 2. Filter State
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        customer: '',
        quotationNumber: '',
        status: 'all',
        quotationStatus: 'all',
        customerSearch: '',
    });

    // 3. Client List for Dropdown
    const [clientsList, setClientsList] = useState([]);

    // 4. Report Data & Summary
    const [reportData, setReportData] = useState(null);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch clients list on mount for autocomplete/selector
    const loadClientsList = async () => {
        try {
            const res = await fetch('/api/admin-reports-clients-list.php', {
                credentials: 'include',
            });
            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
                return;
            }
            const data = await res.json();
            if (res.ok && data.success && Array.isArray(data.data)) {
                setClientsList(data.data);
            }
        } catch {
            // Ignore client list background load error
        }
    };

    useEffect(() => {
        loadClientsList();
    }, []);

    // Filtered clients list based on optional search text in filter
    const filteredClientsList = useMemo(() => {
        if (!filters.customerSearch || !filters.customerSearch.trim()) {
            return clientsList;
        }
        const q = filters.customerSearch.trim().toLowerCase();
        return clientsList.filter(
            c => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
        );
    }, [clientsList, filters.customerSearch]);

    // Update individual filter
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Reset all filters
    const handleReset = () => {
        setFilters({
            fromDate: '',
            toDate: '',
            customer: '',
            quotationNumber: '',
            status: 'all',
            quotationStatus: 'all',
            customerSearch: '',
        });
        toast.success('Filters cleared.');
    };

    // Generate Report by querying the specific dedicated report API
    const generateReport = useCallback(async (customType = null) => {
        const type = customType || reportType;
        setIsLoading(true);

        try {
            const params = new URLSearchParams();
            if (filters.fromDate) params.append('fromDate', filters.fromDate);
            if (filters.toDate) params.append('toDate', filters.toDate);
            if (filters.customer) params.append('customer', filters.customer);
            if (filters.quotationNumber) params.append('quotationNumber', filters.quotationNumber);
            if (filters.status && filters.status !== 'all') params.append('status', filters.status);
            if (filters.quotationStatus && filters.quotationStatus !== 'all') params.append('quotationStatus', filters.quotationStatus);

            let endpoint = '';
            if (type === 'payment_history') {
                endpoint = `/api/admin-reports-payment-history.php?${params.toString()}`;
            } else if (type === 'quotation_history') {
                endpoint = `/api/admin-reports-quotation-history.php?${params.toString()}`;
            }

            const res = await fetch(endpoint, {
                credentials: 'include',
            });

            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
                return;
            }

            const json = await res.json();
            if (res.ok && json.success) {
                setReportData(json.data);
                setSummary(json.summary || null);
            } else {
                toast.error(json.message || 'Failed to generate report.');
            }
        } catch {
            toast.error('Network error generating report.');
        } finally {
            setIsLoading(false);
        }
    }, [reportType, filters, onUnauthorized]);

    // Auto-generate on initial load or report type switch
    useEffect(() => {
        setReportData(null);
        setSummary(null);
        generateReport(reportType);
    }, [reportType]);

    // Check if we have active data to export
    const hasDataToExport = useMemo(() => {
        if (!reportData) return false;
        return Array.isArray(reportData) && reportData.length > 0;
    }, [reportData]);

    // 1. Export Excel Handler
    const handleExportExcel = () => {
        if (!hasDataToExport) {
            toast.error('No report data to export.');
            return;
        }

        const dateTag = filters.fromDate && filters.toDate
            ? `${filters.fromDate}_to_${filters.toDate}`
            : new Date().toISOString().slice(0, 10);

        if (reportType === 'payment_history') {
            const columns = [
                { key: 'customer_name', label: 'Customer Name' },
                { key: 'customer_contact', label: 'Customer Contact' },
                { key: 'quotation_number', label: 'Quotation Number' },
                { key: 'quotation_date', label: 'Quotation Date' },
                { key: 'quotation_total_amount', label: 'Quotation Total', format: 'currency' },
                { key: 'payment_date', label: 'Payment Date' },
                { key: 'payment_amount', label: 'Payment Amount', format: 'currency' },
                { key: 'total_paid_after', label: 'Total Paid', format: 'currency' },
                { key: 'balance_after', label: 'Balance Due', format: 'currency' },
                { key: 'payment_status', label: 'Payment Status' },
                { key: 'payment_method', label: 'Payment Method' },
                { key: 'transaction_reference', label: 'Transaction Reference' },
                { key: 'notes', label: 'Notes' },
            ];

            exportToExcel({
                title: 'Payment History Report',
                filename: `payment_history_${dateTag}`,
                data: reportData,
                columns,
                summary,
                filters,
            });
        } else if (reportType === 'quotation_history') {
            const columns = [
                { key: 'quotation_date', label: 'Quotation Date' },
                { key: 'quotation_number', label: 'Quotation Number' },
                { key: 'customer_name', label: 'Customer Name' },
                { key: 'customer_contact', label: 'Contact' },
                { key: 'customer_address', label: 'Address' },
                { key: 'system_capacity', label: 'Capacity' },
                { key: 'system_type', label: 'System Type' },
                { key: 'quotation_total_amount', label: 'Total Amount', format: 'currency' },
                { key: 'amount_paid', label: 'Amount Paid', format: 'currency' },
                { key: 'amount_to_pay', label: 'Amount to Pay', format: 'currency' },
                { key: 'payment_status', label: 'Payment Status' },
                { key: 'quotation_status', label: 'Quotation Status' },
            ];

            exportToExcel({
                title: 'Quotation History Report',
                filename: `quotation_history_${dateTag}`,
                data: reportData,
                columns,
                summary,
                filters,
            });
        }
    };

    // 2. Export PDF Handler
    const handleExportPdf = () => {
        if (!hasDataToExport) {
            toast.error('No report data to export.');
            return;
        }

        const dateTag = filters.fromDate && filters.toDate
            ? `${filters.fromDate}_to_${filters.toDate}`
            : new Date().toISOString().slice(0, 10);

        if (reportType === 'payment_history') {
            const columns = [
                { key: 'customer_name', label: 'Customer' },
                { key: 'quotation_number', label: 'Quote No' },
                { key: 'quotation_date', label: 'Quote Date' },
                { key: 'quotation_total_amount', label: 'Total', format: 'currency' },
                { key: 'payment_date', label: 'Pay Date' },
                { key: 'payment_amount', label: 'Paid', format: 'currency' },
                { key: 'total_paid_after', label: 'Total Paid', format: 'currency' },
                { key: 'balance_after', label: 'Balance', format: 'currency' },
                { key: 'payment_status', label: 'Status' },
                { key: 'transaction_reference', label: 'Ref No' },
            ];

            exportToPdf({
                title: 'Payment History Report',
                filename: `payment_history_${dateTag}`,
                data: reportData,
                columns,
                summary,
                filters,
                orientation: 'landscape',
            });
        } else if (reportType === 'quotation_history') {
            const columns = [
                { key: 'quotation_date', label: 'Date' },
                { key: 'quotation_number', label: 'Quotation No' },
                { key: 'customer_name', label: 'Customer Name' },
                { key: 'customer_contact', label: 'Contact' },
                { key: 'system_capacity', label: 'Capacity' },
                { key: 'quotation_total_amount', label: 'Total Amount', format: 'currency' },
                { key: 'amount_paid', label: 'Amount Paid', format: 'currency' },
                { key: 'amount_to_pay', label: 'Amount to Pay', format: 'currency' },
                { key: 'payment_status', label: 'Status' },
            ];

            exportToPdf({
                title: 'Quotation History Report',
                filename: `quotation_history_${dateTag}`,
                data: reportData,
                columns,
                summary,
                filters,
                orientation: 'landscape',
            });
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <BarChart3 size={20} className="text-[#1A4D2E]" />
                        <span>Reports & Export Center</span>
                    </h1>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        Generate comprehensive, non-paginated reports with server-side filters and instant Excel/PDF exports.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => generateReport()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                >
                    <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Filter Controls Component */}
            <ReportFilters
                reportType={reportType}
                onReportTypeChange={setReportType}
                filters={filters}
                onFilterChange={handleFilterChange}
                onGenerate={() => generateReport()}
                onReset={handleReset}
                onExportExcel={handleExportExcel}
                onExportPdf={handleExportPdf}
                isLoading={isLoading}
                hasData={hasDataToExport}
                clientsList={filteredClientsList}
            />

            {/* Report Content View */}
            {reportType === 'payment_history' && (
                <PaymentHistoryReport
                    data={reportData || []}
                    summary={summary}
                    isLoading={isLoading}
                />
            )}

            {reportType === 'quotation_history' && (
                <QuotationHistoryReport
                    data={reportData || []}
                    summary={summary}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default ReportManager;
