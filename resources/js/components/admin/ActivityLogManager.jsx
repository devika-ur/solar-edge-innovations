import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    Search,
    Calendar,
    Filter,
    FilterX,
    RotateCcw,
    FileSpreadsheet,
    FileText,
    RefreshCw,
    User,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Edit3,
    PlusCircle,
    LogIn,
    LogOut,
    X,
    ArrowUpDown,
    Download,
    Trash2,
    KeyRound
} from 'lucide-react';
import { Pagination } from './Pagination';
import { exportToExcel } from './reports/ExcelExport';
import { exportToPdf } from './reports/PdfExport';

/**
 * ActivityLogManager Component
 * 
 * Secure Audit Log for tracking all important actions:
 * - Deletions, Approvals, Rejections, Creations, Edits, and Logins/Logouts.
 * - Password-protected gate before displaying any log data.
 * - Auto-locks on tab change, refresh, or after 5 minutes of inactivity.
 * - Permanent, read-only immutable audit trail.
 */
export const ActivityLogManager = ({ _onNavigate, onUnauthorized }) => {
    // 1. Password Protection & Lock States (Defaults to unlocked for Super Admin; auto-locks on 5min inactivity)
    const [isUnlocked, setIsUnlocked] = useState(true);
    const [passwordInput, setPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [authError, setAuthError] = useState('');

    // 2. Data & Loading States
    const [logs, setLogs] = useState([]);
    const [summary, setSummary] = useState({
        total_today: 0,
        deletes_today: 0,
        approvals_today: 0,
        edits_today: 0,
        total_filtered: 0
    });
    const [staffList, setStaffList] = useState(['admin']);
    const [isLoading, setIsLoading] = useState(false);

    // 3. Filters
    const [datePreset, setDatePreset] = useState('today'); // 'today' | 'yesterday' | 'week' | 'month' | 'custom' | 'all'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedStaff, setSelectedStaff] = useState('all');
    const [selectedAction, setSelectedAction] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilter, setShowFilter] = useState(false);

    // 4. Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);

    // 5. Detail Snapshot Modal
    const [selectedLog, setSelectedLog] = useState(null);

    // 6. Clear All Logs (Two-step: Confirm Box -> Password Authentication)
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [clearStep, setClearStep] = useState('confirm'); // 'confirm' | 'auth'
    const [clearPassword, setClearPassword] = useState('');
    const [showClearPassword, setShowClearPassword] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [clearError, setClearError] = useState('');

    const handleOpenClearModal = () => {
        setClearStep('confirm');
        setClearPassword('');
        setShowClearPassword(false);
        setClearError('');
        setIsClearModalOpen(true);
    };

    const handleConfirmClearProceed = () => {
        setClearStep('auth');
        setClearError('');
    };

    const handleExecuteClear = async (e) => {
        if (e) e.preventDefault();
        if (!clearPassword.trim()) {
            setClearError('Please enter your Super Admin password.');
            return;
        }

        setIsClearing(true);
        setClearError('');
        const clearToast = toast.loading('Clearing all activity logs...');

        try {
            const res = await fetch('/api/admin/activity-log/clear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password: clearPassword })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(data.message || 'All activity logs deleted from database.', { id: clearToast });
                setLogs([]);
                setSummary({
                    total_today: 0,
                    deletes_today: 0,
                    approvals_today: 0,
                    edits_today: 0,
                    total_filtered: 0
                });
                setIsClearModalOpen(false);
                setClearPassword('');
            } else {
                const msg = data.message || 'Failed to clear activity logs. Incorrect password.';
                setClearError(msg);
                toast.error(msg, { id: clearToast });
            }
        } catch {
            const msg = 'Network error while attempting to clear activity logs.';
            setClearError(msg);
            toast.error(msg, { id: clearToast });
        } finally {
            setIsClearing(false);
        }
    };

    // Inactivity Timer: 5 minutes (300,000 ms)
    const inactivityTimeoutRef = useRef(null);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimeoutRef.current) {
            clearTimeout(inactivityTimeoutRef.current);
        }
        if (isUnlocked) {
            inactivityTimeoutRef.current = setTimeout(() => {
                setIsUnlocked(false);
                toast('Activity Log locked due to 5 minutes of inactivity.', { icon: '🔒' });
            }, 5 * 60 * 1000); // 5 minutes
        }
    }, [isUnlocked]);

    useEffect(() => {
        if (!isUnlocked) return;

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
        const handleUserActivity = () => resetInactivityTimer();

        events.forEach((ev) => window.addEventListener(ev, handleUserActivity));
        resetInactivityTimer();

        return () => {
            events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
            if (inactivityTimeoutRef.current) {
                clearTimeout(inactivityTimeoutRef.current);
            }
        };
    }, [isUnlocked, resetInactivityTimer]);

    // Handle unlocking via password verification
    const handleUnlockSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!passwordInput.trim()) {
            setAuthError('Please enter the admin password.');
            return;
        }

        setIsVerifying(true);
        setAuthError('');

        try {
            const res = await fetch('/api/admin/activity-log/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ password: passwordInput })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setIsUnlocked(true);
                setPasswordInput('');
                toast.success('Activity Log unlocked.');
            } else {
                setAuthError(data.message || 'Incorrect admin password. Access denied.');
                toast.error(data.message || 'Incorrect password.');
            }
        } catch {
            setAuthError('Network error verifying password.');
            toast.error('Network error verifying password.');
        } finally {
            setIsVerifying(false);
        }
    };

    // Load logs from API
    const loadLogs = useCallback(async () => {
        if (!isUnlocked) return;
        setIsLoading(true);

        try {
            const params = new URLSearchParams();
            params.append('preset', datePreset);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (selectedStaff && selectedStaff !== 'all') params.append('staff', selectedStaff);
            if (selectedAction && selectedAction !== 'all') params.append('action', selectedAction);
            if (searchQuery.trim()) params.append('search', searchQuery.trim());

            const res = await fetch(`/api/admin/activity-log?${params.toString()}`, {
                credentials: 'include'
            });

            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
                return;
            }

            const json = await res.json();
            if (res.ok && json.success) {
                setLogs(json.data || []);
                if (json.summary) setSummary(json.summary);
                if (Array.isArray(json.staff_list)) setStaffList(json.staff_list);
            } else {
                toast.error(json.message || 'Failed to load activity logs.');
            }
        } catch {
            toast.error('Network error loading activity logs.');
        } finally {
            setIsLoading(false);
        }
    }, [isUnlocked, datePreset, startDate, endDate, selectedStaff, selectedAction, searchQuery, onUnauthorized]);

    // Load logs on unlock or filter changes
    useEffect(() => {
        if (isUnlocked) {
            loadLogs();
        }
    }, [isUnlocked, loadLogs]);

    // Date Preset Handler
    const handlePresetChange = (preset) => {
        setDatePreset(preset);
        const today = new Date();
        const formatDate = (d) => d.toISOString().split('T')[0];

        if (preset === 'all' || preset === 'today' || preset === 'yesterday' || preset === 'week' || preset === 'month') {
            setStartDate('');
            setEndDate('');
        } else if (preset === 'custom') {
            if (!startDate) setStartDate(formatDate(today));
            if (!endDate) setEndDate(formatDate(today));
        }
        setCurrentPage(1);
    };

    // Reset filters
    const handleResetFilters = () => {
        setDatePreset('today');
        setStartDate('');
        setEndDate('');
        setSelectedStaff('all');
        setSelectedAction('all');
        setSearchQuery('');
        setCurrentPage(1);
        toast.success('Filters reset to today.');
    };

    // Action Badge Styling
    const renderActionBadge = (action, actionLabel) => {
        switch (action) {
            case 'deleted':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertTriangle size={11} className="text-rose-600" />
                        <span>{actionLabel || 'Deleted'}</span>
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        <span>{actionLabel || 'Approved'}</span>
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <XCircle size={11} className="text-amber-600" />
                        <span>{actionLabel || 'Rejected'}</span>
                    </span>
                );
            case 'reopened':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        <RotateCcw size={11} className="text-orange-600" />
                        <span>{actionLabel || 'Reopened'}</span>
                    </span>
                );
            case 'edited':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Edit3 size={11} className="text-blue-600" />
                        <span>{actionLabel || 'Edited'}</span>
                    </span>
                );
            case 'added':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <PlusCircle size={11} className="text-purple-600" />
                        <span>{actionLabel || 'Added'}</span>
                    </span>
                );
            case 'login':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        <LogIn size={11} className="text-teal-600" />
                        <span>{actionLabel || 'Login'}</span>
                    </span>
                );
            case 'logout':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
                        <LogOut size={11} className="text-neutral-500" />
                        <span>{actionLabel || 'Logout'}</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                        <span>{actionLabel || action}</span>
                    </span>
                );
        }
    };

    // Export Excel / CSV
    const handleExportExcel = () => {
        if (!logs || logs.length === 0) {
            toast.error('No activity records available to export.');
            return;
        }

        const columns = [
            { key: 'time_formatted', label: 'Time' },
            { key: 'staff', label: 'Staff' },
            { key: 'action_label', label: 'Action' },
            { key: 'record', label: 'Record / Target' },
            { key: 'details', label: 'Action Details' },
            { key: 'ip_address', label: 'IP Address' },
        ];

        exportToExcel({
            title: 'Activity Log & Audit Trail',
            filename: `activity_log_${datePreset}_${new Date().toISOString().slice(0, 10)}`,
            data: logs,
            columns,
            summary: {
                'Total Entries': logs.length,
                'Deletes Today': summary.deletes_today,
                'Approvals Today': summary.approvals_today,
            },
            filters: {
                'Date Filter': datePreset.toUpperCase(),
                'Staff': selectedStaff,
                'Action': selectedAction
            }
        });
        toast.success('Activity Log exported successfully.');
    };

    // Export PDF
    const handleExportPdf = () => {
        if (!logs || logs.length === 0) {
            toast.error('No activity records available to export.');
            return;
        }

        const columns = [
            { key: 'time_formatted', label: 'Timestamp (with seconds)' },
            { key: 'staff', label: 'Staff' },
            { key: 'action_label', label: 'Action' },
            { key: 'record', label: 'Record' },
            { key: 'details', label: 'Details' },
        ];

        exportToPdf({
            title: 'Activity Log & Audit Trail',
            filename: `activity_log_${datePreset}_${new Date().toISOString().slice(0, 10)}`,
            data: logs,
            columns,
            summary: {
                'Total Filtered': logs.length,
                'Deletes Today': summary.deletes_today,
                'Approvals Today': summary.approvals_today,
            },
            orientation: 'landscape'
        });
        toast.success('Activity Log PDF generated successfully.');
    };

    // Paginated Slicing
    const totalItems = logs.length;
    const startIndex = (currentPage - 1) * perPage;
    const paginatedLogs = logs.slice(startIndex, startIndex + perPage);

    // ==========================================
    // 1. Password Locked Screen (Gate)
    // ==========================================
    if (!isUnlocked) {
        return (
            <div className="w-full min-h-[80vh] flex items-center justify-center p-4 font-poppins">
                <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-neutral-200/90 space-y-6 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#1A4D2E] border border-emerald-100 flex items-center justify-center mx-auto shadow-2xs">
                        <ShieldCheck size={32} className="stroke-[2.2]" />
                    </div>

                    <div className="space-y-1.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                            Activity Log Protected
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">
                            Audit trails are restricted. Please verify your admin password to decrypt and view activity records.
                        </p>
                    </div>

                    <div className="space-y-4 text-left">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                                <Lock size={12} className="text-[#1A4D2E]" />
                                Admin Password
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="activity_unlock_pin"
                                    id="activity_unlock_pin"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                    data-bwignore="true"
                                    data-form-type="other"
                                    style={{
                                        WebkitTextSecurity: showPassword ? 'none' : 'disc'
                                    }}
                                    value={passwordInput}
                                    onChange={(e) => {
                                        setPasswordInput(e.target.value);
                                        if (authError) setAuthError('');
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleUnlockSubmit();
                                        }
                                    }}
                                    placeholder="Enter your admin password..."
                                    className={`w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border rounded-xl text-xs sm:text-sm font-medium text-neutral-800 outline-none transition-all pr-10 ${
                                        authError ? 'border-rose-500 focus:border-rose-600' : 'border-neutral-300 focus:border-[#1A4D2E]'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {authError && (
                                <p className="text-xs font-medium text-rose-600 mt-1">
                                    {authError}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleUnlockSubmit}
                            disabled={isVerifying}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                        >
                            {isVerifying ? (
                                <>
                                    <RefreshCw size={14} className="animate-spin" />
                                    <span>Verifying Password...</span>
                                </>
                            ) : (
                                <>
                                    <KeyRound size={15} />
                                    <span>Unlock Activity Log</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="pt-2 text-[11px] text-neutral-400 flex items-center justify-center gap-1.5 border-t border-neutral-100">
                        <Lock size={11} />
                        <span>Automatically locks on tab change, refresh, or 5m inactivity</span>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // 2. Unlocked Activity Log Dashboard View
    // ==========================================
    return (
        <div className="w-full px-4 sm:px-8 py-8 space-y-6 font-poppins max-w-7xl mx-auto">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
                            Activity Log & Audit Trail
                        </h1>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck size={11} className="text-emerald-600" />
                            <span>Permanent & Read-Only</span>
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Complete chronological audit trail of all staff deletions, approvals, rejections, additions, and logins.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center flex-wrap">
                    {/* Filter Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowFilter((prev) => !prev)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                            showFilter
                                ? 'bg-neutral-100 border-neutral-300 text-neutral-800'
                                : 'bg-white hover:bg-neutral-50 border-neutral-200/90 text-neutral-700'
                        }`}
                    >
                        {showFilter ? (
                            <>
                                <FilterX size={13} className="text-neutral-500" />
                                <span>Hide Filters</span>
                            </>
                        ) : (
                            <>
                                <Filter size={13} className="text-[#1A4D2E]" />
                                <span>Filter & Search</span>
                            </>
                        )}
                    </button>

                    {/* Refresh */}
                    <button
                        type="button"
                        onClick={() => loadLogs()}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 transition-all cursor-pointer shadow-2xs"
                        title="Refresh activity logs"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>

                    {/* Clear All Logs */}
                    <button
                        type="button"
                        onClick={handleOpenClearModal}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition-all cursor-pointer shadow-2xs"
                        title="Clear all activity logs from database"
                    >
                        <Trash2 size={13} className="text-rose-600" />
                        <span>Clear All Logs</span>
                    </button>
                </div>
            </div>

            {/* Summary KPI Cards (Today) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs">
                    <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                        Total Actions Today
                    </div>
                    <div className="text-2xl font-bold text-neutral-900 mt-1">
                        {summary.total_today}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                        Newest actions first
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs">
                    <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
                        Deletions Today
                    </div>
                    <div className="text-2xl font-bold text-rose-700 mt-1">
                        {summary.deletes_today}
                    </div>
                    <div className="text-[10px] text-rose-600 mt-0.5">
                        Permanent removals
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs">
                    <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                        Approvals Today
                    </div>
                    <div className="text-2xl font-bold text-emerald-700 mt-1">
                        {summary.approvals_today}
                    </div>
                    <div className="text-[10px] text-emerald-600 mt-0.5">
                        Client approved quotes
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs">
                    <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                        Edits Today
                    </div>
                    <div className="text-2xl font-bold text-blue-700 mt-1">
                        {summary.edits_today}
                    </div>
                    <div className="text-[10px] text-blue-600 mt-0.5">
                        Modifications made
                    </div>
                </div>
            </div>

            {/* Collapsible Filter Panel */}
            {showFilter && (
                <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
                    {/* Date Presets Row */}
                    <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-100 pb-3">
                        <span className="text-[11px] font-semibold text-neutral-500 mr-1 flex items-center gap-1">
                            <Calendar size={12} className="text-[#1A4D2E]" />
                            Date Presets:
                        </span>
                        {[
                            { id: 'today', label: 'Today (Default)' },
                            { id: 'yesterday', label: 'Yesterday' },
                            { id: 'week', label: 'Past 7 Days' },
                            { id: 'month', label: 'Past 30 Days' },
                            { id: 'custom', label: 'Custom Date' },
                            { id: 'all', label: 'All Time' },
                        ].map((preset) => {
                            const isActive = datePreset === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handlePresetChange(preset.id)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-[#1A4D2E] text-white shadow-2xs'
                                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                                    }`}
                                >
                                    {preset.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Filter Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Search Input */}
                        <div className="space-y-1 lg:col-span-2">
                            <label className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                                <Search size={11} className="text-neutral-400" />
                                <span>Search Log</span>
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by customer, quote #, details, action..."
                                className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none focus:border-[#1A4D2E]"
                            />
                        </div>

                        {/* Staff Filter */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                                <User size={11} className="text-neutral-400" />
                                <span>Staff Name</span>
                            </label>
                            <select
                                value={selectedStaff}
                                onChange={(e) => setSelectedStaff(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none cursor-pointer focus:border-[#1A4D2E]"
                            >
                                <option value="all">All Staff</option>
                                {staffList.map((s, idx) => (
                                    <option key={`staff-${idx}`} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action Type Filter */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                                <ArrowUpDown size={11} className="text-neutral-400" />
                                <span>Action Type</span>
                            </label>
                            <select
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none cursor-pointer focus:border-[#1A4D2E]"
                            >
                                <option value="all">All Actions</option>
                                <option value="deleted">Deleted</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="reopened">Reopened</option>
                                <option value="edited">Edited</option>
                                <option value="added">Added</option>
                                <option value="login">Login</option>
                                <option value="logout">Logout</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                title="Reset to today"
                            >
                                <RotateCcw size={12} />
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>

                    {/* Custom Date Inputs (if custom preset selected) */}
                    {datePreset === 'custom' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-neutral-600">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none focus:border-[#1A4D2E]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-neutral-600">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs font-medium text-neutral-800 outline-none focus:border-[#1A4D2E]"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Table Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-2xs overflow-hidden">
                {/* Table Header Action Bar */}
                <div className="px-5 py-3.5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/60">
                    <div className="text-xs font-semibold text-neutral-700">
                        Showing {paginatedLogs.length} of {totalItems} activity records ({datePreset === 'today' ? "Today" : datePreset})
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExportExcel}
                            disabled={logs.length === 0}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                            title="Export to Excel / CSV"
                        >
                            <FileSpreadsheet size={13} />
                            <span>Export CSV</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleExportPdf}
                            disabled={logs.length === 0}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-900 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                            title="Export to PDF report"
                        >
                            <FileText size={13} />
                            <span>Export PDF</span>
                        </button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px] font-semibold">
                                <th className="py-3 px-3.5 whitespace-nowrap">Time (with seconds)</th>
                                <th className="py-3 px-3.5">Staff</th>
                                <th className="py-3 px-3.5 text-center">Action</th>
                                <th className="py-3 px-3.5">Record / Target</th>
                                <th className="py-3 px-3.5">Details</th>
                                <th className="py-3 px-3.5 text-right">Snapshot</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                                        <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#1A4D2E]" />
                                        <span>Loading audit entries...</span>
                                    </td>
                                </tr>
                            ) : paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                                        <Clock size={24} className="mx-auto mb-2 text-neutral-300" />
                                        <p className="text-xs font-semibold text-neutral-600">No activity logged for this period.</p>
                                        <p className="text-[11px] text-neutral-400 mt-0.5">Actions performed across the app will record automatically.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors">
                                        {/* Time (with seconds) */}
                                        <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-neutral-700 font-semibold">
                                            {log.time_formatted}
                                        </td>

                                        {/* Staff */}
                                        <td className="py-3 px-3.5 whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1.5 font-semibold text-neutral-900">
                                                <div className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center text-[10px] font-bold uppercase">
                                                    {log.staff.slice(0, 1)}
                                                </div>
                                                <span>{log.staff}</span>
                                            </div>
                                        </td>

                                        {/* Action Badge */}
                                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                                            {renderActionBadge(log.action, log.action_label)}
                                        </td>

                                        {/* Record */}
                                        <td className="py-3 px-3.5 max-w-xs">
                                            <div className="font-semibold text-neutral-900 truncate" title={log.record}>
                                                {log.record}
                                            </div>
                                            <div className="text-[10px] text-neutral-400">
                                                {log.record_type}
                                            </div>
                                        </td>

                                        {/* Details */}
                                        <td className="py-3 px-3.5 max-w-sm text-neutral-600 text-xs">
                                            <p className="line-clamp-2" title={log.details}>
                                                {log.details}
                                            </p>
                                        </td>

                                        {/* Snapshot View Button */}
                                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                                            {(log.old_values || log.new_values) ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedLog(log)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 transition-colors cursor-pointer"
                                                >
                                                    <span>View Data</span>
                                                </button>
                                            ) : (
                                                <span className="text-neutral-300 text-[11px]">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                    <div className="p-4 border-t border-neutral-100">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            perPage={perPage}
                            onPageChange={setCurrentPage}
                            onPerPageChange={(newPerPage) => {
                                setPerPage(newPerPage);
                                setCurrentPage(1);
                            }}
                            perPageOptions={[10, 15, 25, 50, 100]}
                            itemLabel="activity entries"
                        />
                    </div>
                )}
            </div>

            {/* ==========================================
                Modal: View Log Snapshot / Diff
               ========================================== */}
            {selectedLog && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-poppins"
                    onClick={() => setSelectedLog(null)}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-100 space-y-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-neutral-900">
                                        Activity Snapshot
                                    </h3>
                                    {renderActionBadge(selectedLog.action, selectedLog.action_label)}
                                </div>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                    {selectedLog.time_formatted} • Logged by <span className="font-semibold text-neutral-700">{selectedLog.staff}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            <div>
                                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                                    Action Details
                                </span>
                                <p className="text-xs text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                                    {selectedLog.details}
                                </p>
                            </div>

                            {selectedLog.old_values && (
                                <div>
                                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
                                        {selectedLog.action === 'deleted' ? 'Snapshot of Deleted Data' : 'Previous (Old) Values'}
                                    </span>
                                    <pre className="text-[11px] font-mono bg-rose-50/60 p-3 rounded-xl border border-rose-200 text-neutral-800 overflow-x-auto whitespace-pre-wrap max-h-60">
                                        {JSON.stringify(selectedLog.old_values, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.new_values && (
                                <div>
                                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                                        New (Updated) Values
                                    </span>
                                    <pre className="text-[11px] font-mono bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-neutral-800 overflow-x-auto whitespace-pre-wrap max-h-60">
                                        {JSON.stringify(selectedLog.new_values, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 border-t border-neutral-100 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 cursor-pointer"
                            >
                                Close Snapshot
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear All Logs: Two-step Confirm Box & Super Admin Password Authentication */}
            {isClearModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !isClearing) {
                            setIsClearModalOpen(false);
                        }
                    }}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-100 space-y-4 animate-in zoom-in-95 duration-200 font-poppins"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Step 1: Confirm Box */}
                        {clearStep === 'confirm' ? (
                            <>
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shadow-2xs">
                                        <Trash2 size={22} className="stroke-[2.2]" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsClearModalOpen(false)}
                                        className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900 tracking-tight font-poppins">
                                        Clear All Activity Logs?
                                    </h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed mt-1.5 font-poppins">
                                        Are you sure you want to permanently clear all activity logs? This action will completely erase all audit trail entries from the database.
                                    </p>

                                    <div className="mt-3.5 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-2.5">
                                        <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                                        <div className="text-[11px] text-rose-800 leading-snug">
                                            <span className="font-bold block">Permanent & Irreversible</span>
                                            This will delete all activity records currently stored in the database. Nobody can recover them after deletion.
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsClearModalOpen(false)}
                                        className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs sm:text-sm font-semibold text-neutral-700 transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmClearProceed}
                                        className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                    >
                                        <span>Proceed to Authenticate</span>
                                        <Lock size={13} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Step 2: Password Authentication */
                            <>
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shadow-2xs">
                                        <Lock size={22} className="stroke-[2.2]" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => !isClearing && setIsClearModalOpen(false)}
                                        disabled={isClearing}
                                        className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer disabled:opacity-40"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900 tracking-tight font-poppins">
                                        Super Admin Password Required
                                    </h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed mt-1 font-poppins">
                                        Please enter your Super Admin password to verify your authorization and permanently delete all logs from the database.
                                    </p>
                                </div>

                                <div className="space-y-1.5 pt-1">
                                    <label className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
                                        <span className="flex items-center gap-1">
                                            <Lock size={12} className="text-rose-600" />
                                            Admin Password
                                        </span>
                                        <span className="text-[10px] text-neutral-400">Security Check</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="clear_logs_pin"
                                            id="clear_logs_pin"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            autoCapitalize="off"
                                            spellCheck="false"
                                            data-lpignore="true"
                                            data-1p-ignore="true"
                                            data-bwignore="true"
                                            data-form-type="other"
                                            style={{
                                                WebkitTextSecurity: showClearPassword ? 'none' : 'disc'
                                            }}
                                            value={clearPassword}
                                            onChange={(e) => {
                                                setClearPassword(e.target.value);
                                                if (clearError) setClearError('');
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleExecuteClear();
                                                }
                                            }}
                                            placeholder="Enter Super Admin password..."
                                            disabled={isClearing}
                                            className={`w-full px-3 py-2 bg-neutral-50 hover:bg-white focus:bg-white border rounded-xl text-xs font-medium text-neutral-800 outline-none transition-all pr-8 ${
                                                clearError ? 'border-rose-500 focus:border-rose-600' : 'border-neutral-300 focus:border-[#1A4D2E]'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowClearPassword(!showClearPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                        >
                                            {showClearPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    {clearError && (
                                        <p className="text-[11px] font-medium text-rose-600 mt-1">
                                            {clearError}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-neutral-100">
                                    <button
                                        type="button"
                                        onClick={() => setClearStep('confirm')}
                                        disabled={isClearing}
                                        className="px-3 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-40 cursor-pointer"
                                    >
                                        ← Back
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsClearModalOpen(false)}
                                            disabled={isClearing}
                                            className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs sm:text-sm font-semibold text-neutral-700 transition-all cursor-pointer disabled:opacity-40"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleExecuteClear}
                                            disabled={isClearing}
                                            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                        >
                                            {isClearing ? (
                                                <>
                                                    <RefreshCw size={13} className="animate-spin" />
                                                    <span>Deleting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 size={13} />
                                                    <span>Delete All Logs</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityLogManager;
