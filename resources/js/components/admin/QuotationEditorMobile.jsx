import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronLeft,
    MoreVertical,
    FileText,
    LayoutGrid,
    Tag,
    Sliders,
    User,
    Calendar,
    Phone,
    ChevronDown,
    ChevronRight,
    Download,
    Loader2,
    Eye,
    Edit3,
    Save,
    RotateCcw,
    Plus,
    Trash2,
    Shield,
    Check,
    X,
    LogOut,
    ZoomIn,
    ZoomOut,
    Sparkles
} from 'lucide-react';
import { QuotationPreview6Pages } from './QuotationPreview6Pages';
import toast from 'react-hot-toast';

export const QuotationEditorMobile = ({
    data,
    onChange,
    onSave,
    onReset,
    onGeneratePdf,
    isGeneratingPdf = false,
    pdfProgress = "",
    onLogout,
    onBack
}) => {
    // Mobile view modes: 'details' (form editor) or 'preview' (live A4 pages)
    const [viewMode, setViewMode] = useState('details');

    // Mobile tabs inside 'details' mode: 'client', 'system', 'pricing', 'more'
    const [activeTab, setActiveTab] = useState('client');

    // More actions dropdown menu
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Zoom level for preview mode: 'fit' or 1.0 (100%)
    const [previewZoom, setPreviewZoom] = useState('fit');

    // Calculated scale for fitting A4 (794px) to mobile screen width
    const previewContainerRef = useRef(null);
    const scaledContentRef = useRef(null);
    const [fitScale, setFitScale] = useState(0.46);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        const updateScale = () => {
            const screenW = window.innerWidth;
            // A4 page width in standard 96dpi web rendering is 794px
            // Leave 16px padding on each side for mobile margins
            const availableW = Math.max(300, screenW - 24);
            const calculated = Math.min(1, availableW / 794);
            setFitScale(calculated);
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    // Accurately measure unscaled content height so wrapper takes up EXACT scaled height (0 extra bottom space)
    useEffect(() => {
        if (viewMode !== 'preview') return;

        const updateHeight = () => {
            if (scaledContentRef.current) {
                setContentHeight(scaledContentRef.current.offsetHeight);
            }
        };

        updateHeight();
        const timer1 = setTimeout(updateHeight, 80);
        const timer2 = setTimeout(updateHeight, 350);

        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined' && scaledContentRef.current) {
            resizeObserver = new ResizeObserver(() => {
                updateHeight();
            });
            resizeObserver.observe(scaledContentRef.current);
        }

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, [viewMode, data]);

    // Helper for deep mutations in quotation data
    const updateField = (path, value) => {
        const keys = path.split('.');
        const newData = JSON.parse(JSON.stringify(data));
        let curr = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            curr = curr[keys[i]];
        }
        curr[keys[keys.length - 1]] = value;
        onChange(newData);
    };

    // Add / remove manufacturer item
    const addManufacturer = () => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.manufacturers.push({
            id: Date.now(),
            item: "Custom Solar Component",
            manufacturer: "Generic Brand",
            origin: "India"
        });
        onChange(newData);
        toast.success("Component added!");
    };

    const removeManufacturer = (index) => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.manufacturers.splice(index, 1);
        onChange(newData);
    };

    // Add / remove permit fee
    const addPermitFee = () => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.permitFees.push({
            id: Date.now(),
            item: "Additional Fee / Permit",
            fee: "Rs.0"
        });
        onChange(newData);
        toast.success("Fee item added!");
    };

    const removePermitFee = (index) => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.permitFees.splice(index, 1);
        onChange(newData);
    };

    // Add / remove term item
    const addTerm = () => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.termsAndConditions.push({
            label: "Additional Clause",
            text: "Terms and condition note."
        });
        onChange(newData);
        toast.success("Clause added!");
    };

    const removeTerm = (index) => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.termsAndConditions.splice(index, 1);
        onChange(newData);
    };

    const currentScale = previewZoom === 'fit' ? fitScale : 1.0;

    return (
        <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-sans select-none overflow-x-hidden pb-safe">
            {/* ════════════════════════════════════════════════════════════
                TOP APP HEADER (Matches Screenshot 1 & 2)
            ════════════════════════════════════════════════════════════ */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-2xs mobile-nav-bar no-print">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            if (viewMode === 'preview') {
                                setViewMode('details');
                            } else if (onBack) {
                                onBack();
                            } else {
                                window.history.back();
                            }
                        }}
                        className="p-1.5 -ml-1 text-neutral-800 hover:text-neutral-950 active:scale-95 transition-transform rounded-xl hover:bg-neutral-100"
                        title={viewMode === 'preview' ? "Back to Edit Details" : "Back to Dashboard"}
                    >
                        <ChevronLeft size={22} className="stroke-[2.5]" />
                    </button>
                    <h1 className="text-base font-black text-neutral-900 tracking-tight">
                        {viewMode === 'details' ? 'Quotation Details' : 'Quotation Preview'}
                    </h1>
                </div>

                <div className="flex items-center gap-1.5 relative">
                    {/* In Preview mode: prominent quick download icon */}
                    {viewMode === 'preview' && (
                        <button
                            type="button"
                            onClick={onGeneratePdf}
                            disabled={isGeneratingPdf}
                            className="p-2 text-blue-600 hover:text-blue-700 active:scale-95 transition-transform rounded-xl hover:bg-blue-50 cursor-pointer"
                            title="Download PDF"
                        >
                            {isGeneratingPdf ? (
                                <Loader2 size={20} className="animate-spin text-blue-600" />
                            ) : (
                                <Download size={20} className="stroke-[2.5]" />
                            )}
                        </button>
                    )}

                    {/* Toggle between Details and Preview */}
                    <button
                        type="button"
                        onClick={() => setViewMode(viewMode === 'details' ? 'preview' : 'details')}
                        className={`p-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                            viewMode === 'preview'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                        }`}
                        title={viewMode === 'details' ? "View Live Quotation Preview" : "Switch to Form Editor"}
                    >
                        {viewMode === 'details' ? <Eye size={19} /> : <Edit3 size={19} />}
                    </button>

                    {/* Three dots overflow menu */}
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-neutral-700 hover:text-neutral-900 active:scale-95 transition-transform rounded-xl hover:bg-neutral-100"
                        title="Options"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {/* Options Dropdown Menu */}
                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSave(true);
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-800 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer"
                                >
                                    <Save size={16} className="text-emerald-600" />
                                    <span>Save Quotation</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onGeneratePdf();
                                    }}
                                    disabled={isGeneratingPdf}
                                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-800 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer"
                                >
                                    <Download size={16} className="text-blue-600" />
                                    <span>Export PDF Document</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        onReset();
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-neutral-800 hover:bg-neutral-50 flex items-center gap-2.5 cursor-pointer"
                                >
                                    <RotateCcw size={16} className="text-amber-600" />
                                    <span>Reset to Default</span>
                                </button>
                                {onLogout && (
                                    <div className="border-t border-neutral-100 mt-1 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                onLogout();
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
                                        >
                                            <LogOut size={16} />
                                            <span>Logout Admin</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* ════════════════════════════════════════════════════════════
                SCREEN 1: QUOTATION DETAILS (FORM EDITOR)
            ════════════════════════════════════════════════════════════ */}
            {viewMode === 'details' && (
                <div className="flex-1 flex flex-col pb-10 mobile-details-form no-print">
                    {/* Segmented Top Tab Bar (Exact match to left screenshot) */}
                    <div className="px-4 py-3 bg-white border-b border-neutral-200/80 sticky top-[57px] z-30">
                        <div className="grid grid-cols-4 gap-1.5 bg-neutral-100 p-1 rounded-2xl border border-neutral-200/70">
                            {[
                                { id: 'client', label: 'Client & Ref', icon: FileText },
                                { id: 'system', label: 'System', icon: LayoutGrid },
                                { id: 'pricing', label: 'Pricing', icon: Tag },
                                { id: 'more', label: 'More', icon: Sliders }
                            ].map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveTab(item.id)}
                                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-blue-50 text-blue-600 shadow-2xs border border-blue-200/90'
                                                : 'text-neutral-500 hover:text-neutral-900'
                                        }`}
                                    >
                                        <Icon size={16} className={`mb-1 ${isActive ? 'text-blue-600' : 'text-neutral-400'}`} />
                                        <span className="truncate max-w-full leading-tight">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scrollable Form Body */}
                    <div className="p-4 space-y-4 max-w-md mx-auto w-full">
                        {/* ──────── TAB 1: CLIENT & REF ──────── */}
                        {activeTab === 'client' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                {/* Green Reference & Date Card (Screenshot Match) */}
                                <div className="bg-[#EBFBF3] border border-[#BFF3D4] rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
                                    <div className="w-8 h-8 rounded-xl bg-[#D6F7E4] text-[#1A4D2E] flex items-center justify-center shrink-0 mt-0.5">
                                        <FileText size={17} className="stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-[#133E24]">
                                            Quotation Reference & Date
                                        </h3>
                                        <p className="text-[11px] text-[#22673E] mt-0.5 font-medium">
                                            Appears on header of Page 1
                                        </p>
                                    </div>
                                </div>

                                {/* Reference No & Date Inputs */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Quote Reference No
                                        </label>
                                        <input
                                            type="text"
                                            value={data.refNo || ''}
                                            onChange={(e) => updateField('refNo', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs transition-all"
                                            placeholder="DCR:09-26-13"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Date
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={data.date || ''}
                                                onChange={(e) => updateField('date', e.target.value)}
                                                className="w-full pl-3 pr-8 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs transition-all"
                                                placeholder="06/09/2026"
                                            />
                                            <Calendar size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* System Title & Subtitle */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1 truncate">
                                            System Title (Page 1)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.systemTitle || ''}
                                            onChange={(e) => updateField('systemTitle', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs transition-all uppercase"
                                            placeholder="SOLAR POWERPLANT"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1 truncate">
                                            System Subtitle (Page 1)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.systemSubtitle || ''}
                                            onChange={(e) => updateField('systemSubtitle', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs transition-all"
                                            placeholder="Grid Tie System"
                                        />
                                    </div>
                                </div>

                                {/* Blue Client Information Card Header (Screenshot Match) */}
                                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-3 flex items-center justify-between shadow-2xs">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-[#DBEAFE] text-blue-700 flex items-center justify-center shrink-0">
                                            <User size={17} className="stroke-[2.5]" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-blue-950">
                                                Client Information
                                            </h3>
                                            <p className="text-[10px] text-blue-600 font-medium">
                                                Used on Page 1 cover cards and Page 4 table
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-blue-500" />
                                </div>

                                {/* Client Name */}
                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                        Client Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.clientInfo?.name || ''}
                                        onChange={(e) => updateField('clientInfo.name', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs transition-all uppercase tracking-wide"
                                        placeholder="SUNIL"
                                    />
                                </div>

                                {/* Address / Location */}
                                <div>
                                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                        Address / Location
                                    </label>
                                    <input
                                        type="text"
                                        value={data.clientInfo?.address || ''}
                                        onChange={(e) => updateField('clientInfo.address', e.target.value)}
                                        className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs transition-all uppercase"
                                        placeholder="ELAKAMON"
                                    />
                                </div>

                                {/* 3 Rows Downwards: Contact No, Capacity, Type */}
                                <div className="space-y-3.5 pt-1">
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Contact No
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={data.clientInfo?.contactNo || ''}
                                                onChange={(e) => updateField('clientInfo.contactNo', e.target.value)}
                                                className="w-full pl-3 pr-8 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs transition-all"
                                                placeholder="7306251522"
                                            />
                                            <Phone size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Capacity
                                        </label>
                                        <input
                                            type="text"
                                            value={data.clientInfo?.capacity || ''}
                                            onChange={(e) => updateField('clientInfo.capacity', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs transition-all"
                                            placeholder="3Kw"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Type
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={data.clientInfo?.type || 'ON GRID'}
                                                onChange={(e) => updateField('clientInfo.type', e.target.value)}
                                                className="w-full pl-3 pr-8 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-black text-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none shadow-2xs transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="ON GRID">ON GRID</option>
                                                <option value="OFF GRID">OFF GRID</option>
                                                <option value="HYBRID">HYBRID</option>
                                            </select>
                                            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ──────── TAB 2: SYSTEM (MANUFACTURERS & TECH) ──────── */}
                        {activeTab === 'system' && (
                            <div className="space-y-5 animate-in fade-in duration-150">
                                {/* Proposed Manufacturers Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <Sliders size={14} className="text-emerald-600" />
                                            Proposed Manufacturers (Page 3)
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addManufacturer}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold hover:bg-emerald-100 cursor-pointer active:scale-95"
                                        >
                                            <Plus size={12} />
                                            <span>Add</span>
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {(data.manufacturers || []).map((mfg, idx) => (
                                            <div key={mfg.id || idx} className="bg-white border border-neutral-200/90 rounded-2xl p-3 shadow-2xs relative space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md">
                                                        #{idx + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeManufacturer(idx)}
                                                        className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer"
                                                        title="Delete row"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>

                                                <input
                                                    type="text"
                                                    value={mfg.item}
                                                    onChange={(e) => updateField(`manufacturers.${idx}.item`, e.target.value)}
                                                    className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-900 focus:bg-white focus:border-blue-600 outline-none"
                                                    placeholder="Component item name"
                                                />

                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        value={mfg.manufacturer}
                                                        onChange={(e) => updateField(`manufacturers.${idx}.manufacturer`, e.target.value)}
                                                        className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-900 focus:bg-white focus:border-blue-600 outline-none"
                                                        placeholder="Manufacturer (e.g. MICROTEK)"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={mfg.origin}
                                                        onChange={(e) => updateField(`manufacturers.${idx}.origin`, e.target.value)}
                                                        className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-900 focus:bg-white focus:border-blue-600 outline-none"
                                                        placeholder="Country (e.g. India)"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Technical Specs Section */}
                                <div className="pt-2 border-t border-neutral-200">
                                    <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                        <FileText size={14} className="text-blue-600" />
                                        Technical Specifications (Page 4)
                                    </h3>

                                    <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
                                        <p className="text-[11px] font-black text-blue-900 uppercase">1. Solar PV Modules</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                value={data.technicalSpecs?.solarPvModules?.brand || ''}
                                                onChange={(e) => updateField('technicalSpecs.solarPvModules.brand', e.target.value)}
                                                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold"
                                                placeholder="Brand (MICROTEK)"
                                            />
                                            <input
                                                type="text"
                                                value={data.technicalSpecs?.solarPvModules?.qty || ''}
                                                onChange={(e) => updateField('technicalSpecs.solarPvModules.qty', e.target.value)}
                                                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold"
                                                placeholder="Qty (6 Nos)"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.technicalSpecs?.solarPvModules?.model || ''}
                                            onChange={(e) => updateField('technicalSpecs.solarPvModules.model', e.target.value)}
                                            className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium"
                                            placeholder="Model description"
                                        />

                                        <p className="text-[11px] font-black text-blue-900 uppercase pt-2 border-t border-neutral-100">2. Solar Inverter</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                value={data.technicalSpecs?.inverter?.brand || ''}
                                                onChange={(e) => updateField('technicalSpecs.inverter.brand', e.target.value)}
                                                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold"
                                                placeholder="Inverter Brand"
                                            />
                                            <input
                                                type="text"
                                                value={data.technicalSpecs?.inverter?.qty || ''}
                                                onChange={(e) => updateField('technicalSpecs.inverter.qty', e.target.value)}
                                                className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold"
                                                placeholder="Qty (1 Nos)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ──────── TAB 3: PRICING & FEES ──────── */}
                        {activeTab === 'pricing' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="bg-white border border-neutral-200 rounded-2xl p-3.5 space-y-3 shadow-2xs">
                                    <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <Tag size={14} className="text-emerald-600" />
                                        System Pricing Summary (Page 5)
                                    </h3>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Pricing Header Title
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={data.pricing?.headerTitle || ''}
                                            onChange={(e) => updateField('pricing.headerTitle', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:border-blue-600 outline-none leading-relaxed min-h-[75px] resize-y"
                                            placeholder="System spec pricing title..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                                Total Payable (Rs)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.pricing?.totalPayable || ''}
                                                onChange={(e) => updateField('pricing.totalPayable', e.target.value)}
                                                className="w-full px-3 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-black text-emerald-950 font-mono"
                                                placeholder="2,10,000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                                Roof Type Label
                                            </label>
                                            <input
                                                type="text"
                                                value={data.pricing?.roofTypeLabel || ''}
                                                onChange={(e) => updateField('pricing.roofTypeLabel', e.target.value)}
                                                className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold"
                                                placeholder="Project Cost..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                                            Amount in Words
                                        </label>
                                        <input
                                            type="text"
                                            value={data.pricing?.amountInWords || ''}
                                            onChange={(e) => updateField('pricing.amountInWords', e.target.value)}
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium italic"
                                            placeholder="(Two Lakh Ten Thousand only)"
                                        />
                                    </div>
                                </div>

                                {/* KSEB Permit Fees */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                                            KSEB Permit Fees Table
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addPermitFee}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold hover:bg-blue-100 cursor-pointer active:scale-95"
                                        >
                                            <Plus size={12} />
                                            <span>Add Fee</span>
                                        </button>
                                    </div>

                                    {(data.permitFees || []).map((fee, idx) => (
                                        <div key={fee.id || idx} className="bg-white border border-neutral-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2.5 transition-all focus-within:border-blue-300">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <span className="text-[10px] font-black font-mono text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-md shrink-0">
                                                        #{idx + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={fee.item}
                                                        onChange={(e) => updateField(`permitFees.${idx}.item`, e.target.value)}
                                                        className="font-bold text-xs text-neutral-900 bg-transparent outline-none flex-1 border-b border-transparent focus:border-blue-400 pb-0.5"
                                                        placeholder="Fee description..."
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removePermitFee(idx)}
                                                    className="text-neutral-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                                                    title="Delete fee item"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div>
                                                <textarea
                                                    rows={fee.fee?.length > 40 ? 3 : 2}
                                                    value={fee.fee}
                                                    onChange={(e) => updateField(`permitFees.${idx}.fee`, e.target.value)}
                                                    className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-mono font-medium text-neutral-800 leading-relaxed focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y min-h-[55px]"
                                                    placeholder="Fee amount / condition..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ──────── TAB 4: MORE (WARRANTIES & TERMS) ──────── */}
                        {activeTab === 'more' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-4 shadow-2xs">
                                    <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                                        <Shield size={14} className="text-amber-600" />
                                        Warranties (Page 5)
                                    </h3>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1.5">
                                            Panel Warranty
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={data.warranties?.panel || ''}
                                            onChange={(e) => updateField('warranties.panel', e.target.value)}
                                            className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs leading-relaxed text-neutral-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y min-h-[95px]"
                                            placeholder="Panel warranty terms..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1.5">
                                            Inverter Warranty
                                        </label>
                                        <input
                                            type="text"
                                            value={data.warranties?.inverter || ''}
                                            onChange={(e) => updateField('warranties.inverter', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 focus:bg-white focus:border-blue-600 outline-none"
                                            placeholder="Inverter warranty..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-700 mb-1.5">
                                            Government Subsidy Note
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={data.subsidyNote || ''}
                                            onChange={(e) => updateField('subsidyNote', e.target.value)}
                                            className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs leading-relaxed text-neutral-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y min-h-[75px]"
                                            placeholder="Subsidy note..."
                                        />
                                    </div>
                                </div>

                                <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-4 shadow-2xs">
                                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                                        <div>
                                            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-wider">
                                                Terms & Conditions (Page 6)
                                            </h3>
                                            <p className="text-[10px] text-neutral-500 font-medium">
                                                {(data.termsAndConditions || []).length} clauses available
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addTerm}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 cursor-pointer active:scale-95 transition-all shadow-2xs"
                                        >
                                            <Plus size={13} />
                                            <span>Add Clause</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3.5">
                                        {(data.termsAndConditions || []).map((term, idx) => {
                                            const textLen = term.text?.length || 0;
                                            const computedRows = textLen > 110 ? 4 : textLen > 50 ? 3 : 2;

                                            return (
                                                <div key={idx} className="bg-neutral-50/70 border border-neutral-200/90 rounded-2xl p-3.5 space-y-2.5 transition-all focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-xs">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <span className="text-[10px] font-black font-mono text-neutral-400 bg-neutral-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                                                                #{idx + 1}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                value={term.label}
                                                                onChange={(e) => updateField(`termsAndConditions.${idx}.label`, e.target.value)}
                                                                className="font-bold text-xs text-neutral-900 bg-transparent outline-none flex-1 border-b border-transparent focus:border-blue-400 pb-0.5"
                                                                placeholder="Clause Title"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTerm(idx)}
                                                            className="text-neutral-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                                                            title="Delete clause"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        rows={computedRows}
                                                        value={term.text}
                                                        onChange={(e) => updateField(`termsAndConditions.${idx}.text`, e.target.value)}
                                                        className="w-full p-3 bg-white border border-neutral-200/90 rounded-xl text-xs leading-relaxed text-neutral-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-y min-h-[55px]"
                                                        placeholder="Clause description..."
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                SCREEN 2 & PRINT / EXPORT STAGE (Single instance in DOM)
                - When viewMode === 'preview': visible with fit zoom controls
                - When viewMode === 'details': placed offscreen unscaled for instant print/PDF export
            ════════════════════════════════════════════════════════════ */}
            <div
                id="quotation-mobile-preview-mount"
                className={
                    viewMode === 'preview'
                        ? 'flex-1 flex flex-col bg-neutral-300/80 preview-screen-view'
                        : 'mobile-preview-hidden-container'
                }
                style={
                    viewMode === 'preview'
                        ? {}
                        : {
                              position: 'fixed',
                              left: '-9999px',
                              top: 0,
                              width: '794px',
                              pointerEvents: 'none',
                              zIndex: -100
                          }
                }
            >
                {/* Preview Controls Bar */}
                {viewMode === 'preview' && (
                    <div className="bg-white/90 backdrop-blur-sm border-b border-neutral-200 px-4 py-2 flex items-center justify-between text-xs sticky top-[57px] z-30 preview-controls-bar no-print">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                                Zoom:
                            </span>
                            <button
                                type="button"
                                onClick={() => setPreviewZoom(previewZoom === 'fit' ? 1.0 : 'fit')}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    previewZoom === 'fit'
                                        ? 'bg-blue-600 text-white shadow-2xs'
                                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                            >
                                {previewZoom === 'fit' ? `Fit (${Math.round(fitScale * 100)}%)` : '100%'}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setViewMode('details')}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                            <Edit3 size={13} />
                            <span>Edit Form</span>
                        </button>
                    </div>
                )}

                {/* Scaled A4 Preview Container with exact pixel-matched height */}
                <div
                    ref={previewContainerRef}
                    className={
                        viewMode === 'preview'
                            ? 'w-full flex-1 overflow-x-auto overflow-y-auto pt-4 pb-28 px-2 flex flex-col items-center'
                            : 'w-[794px]'
                    }
                >
                    <div
                        className="preview-scale-wrapper"
                        style={
                            viewMode === 'preview'
                                ? {
                                      width: `${Math.round(794 * currentScale)}px`,
                                      height: contentHeight > 0 ? `${Math.round(contentHeight * currentScale)}px` : 'auto',
                                      position: 'relative',
                                      margin: '0 auto'
                                  }
                                : { width: '794px' }
                        }
                    >
                        <div
                            ref={scaledContentRef}
                            className="preview-scaled-content shadow-xl print:shadow-none"
                            style={
                                viewMode === 'preview'
                                    ? {
                                          transform: `scale(${currentScale})`,
                                          transformOrigin: 'top left',
                                          width: '794px',
                                          position: 'absolute',
                                          top: 0,
                                          left: 0
                                      }
                                    : {
                                          transform: 'none',
                                          width: '794px',
                                          position: 'static'
                                      }
                            }
                        >
                            <QuotationPreview6Pages data={data} />
                        </div>
                    </div>
                </div>

                {/* Bottom Preview Quick Action Bar */}
                {viewMode === 'preview' && (
                    <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-3 z-30 shadow-lg flex items-center justify-between gap-3 max-w-md mx-auto mobile-action-bar no-print">
                        <button
                            type="button"
                            onClick={() => setViewMode('details')}
                            className="flex-1 py-3 px-4 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Edit3 size={15} />
                            <span>Edit Details</span>
                        </button>
                        <button
                            type="button"
                            onClick={onGeneratePdf}
                            disabled={isGeneratingPdf}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md ${
                                isGeneratingPdf ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isGeneratingPdf ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    <span>Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={15} />
                                    <span>Download PDF</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
