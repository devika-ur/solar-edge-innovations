import React, { useState, useRef, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Save,
    RotateCcw,
    Printer,
    FileText,
    User,
    Wrench,
    DollarSign,
    Shield,
    Sliders,
    LogOut,
    Loader2,
    Download
} from 'lucide-react';

export const QuotationFormControls = ({
    data,
    onChange,
    onSave,
    onReset,
    onGeneratePdf,
    isGeneratingPdf = false,
    pdfProgress = "",
    onLogout,
    activeTab: propActiveTab,
    onTabChange
}) => {
    const [localActiveTab, setLocalActiveTab] = useState('client');
    const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;

    const formScrollRef = useRef(null);

    // Scroll form controls to top whenever active tab changes
    useEffect(() => {
        if (formScrollRef.current) {
            formScrollRef.current.scrollTop = 0;
        }
    }, [activeTab]);

    const handleSelectTab = (tabId) => {
        if (onTabChange) {
            onTabChange(tabId);
        } else {
            setLocalActiveTab(tabId);
        }
    };

    // Helper handler for deep state mutations
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

    // Add manufacturer item
    const addManufacturer = () => {
        const newData = JSON.parse(JSON.stringify(data));
        const newId = Date.now();
        newData.manufacturers.push({
            id: newId,
            item: "Custom Solar Component",
            manufacturer: "Generic Brand",
            origin: "India"
        });
        onChange(newData);
    };

    // Remove manufacturer item
    const removeManufacturer = (index) => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.manufacturers.splice(index, 1);
        onChange(newData);
    };

    // Add permit fee row
    const addPermitFee = () => {
        const newData = JSON.parse(JSON.stringify(data));
        const newId = Date.now();
        newData.permitFees.push({
            id: newId,
            item: "Additional Fee / Permit",
            fee: "Rs.0"
        });
        onChange(newData);
    };

    // Remove permit fee row
    const removePermitFee = (index) => {
        const newData = JSON.parse(JSON.stringify(data));
        newData.permitFees.splice(index, 1);
        onChange(newData);
    };

    const mfgPageCount = Math.max(1, Math.ceil((data.manufacturers?.length || 0) / 10));
    const permitFeePageCount = (data.permitFees && data.permitFees.length > 4) ? (1 + Math.ceil((data.permitFees.length - 4) / 6)) : 1;
    const termsPageCount = (data.termsAndConditions && data.termsAndConditions.length > 14) ? Math.ceil(data.termsAndConditions.length / 14) : 1;
    const totalPages = 3 + mfgPageCount + permitFeePageCount + termsPageCount;

    return (
        <div className="w-full h-full bg-white border-r border-neutral-200 flex flex-col font-sans overflow-hidden" data-lenis-prevent>
            {/* Top Editor Toolbar */}
            <div className="p-4 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <div>
                        <h2 className="text-sm font-bold leading-none">Quotation Builder</h2>
                        <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                            {totalPages}-Page Live Editor
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onSave}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
                        title="Save quotation data to local storage"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                    </button>
                    <button
                        onClick={onGeneratePdf}
                        disabled={isGeneratingPdf}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${isGeneratingPdf ? 'bg-blue-400 cursor-not-allowed opacity-80' : 'bg-blue-600 hover:bg-blue-500 cursor-pointer'} text-white rounded-lg text-xs font-bold transition-all shadow-xs`}
                        title={isGeneratingPdf ? (pdfProgress || "Generating PDF document...") : `Generate and download ${totalPages}-page PDF`}
                    >
                        {isGeneratingPdf ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>{pdfProgress || "Exporting..."}</span>
                            </>
                        ) : (
                            <>
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={onReset}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs transition-colors cursor-pointer"
                        title="Reset to default template"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onLogout}
                        className="p-1.5 bg-red-950/80 hover:bg-red-800 text-red-200 rounded-lg text-xs transition-colors cursor-pointer"
                        title="Logout from admin session"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Navigation Form Tabs */}
            <div className="flex overflow-x-auto border-b border-neutral-200 bg-neutral-50 p-1.5 gap-1 scrollbar-none" data-lenis-prevent>
                {[
                    { id: 'client', label: 'Client & Ref', icon: User },
                    { id: 'manufacturers', label: 'Manufacturers', icon: Sliders },
                    { id: 'technical', label: 'Technical', icon: Wrench },
                    { id: 'pricing', label: 'Pricing & Fees', icon: DollarSign },
                    { id: 'terms', label: 'Terms & Warranty', icon: Shield }
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleSelectTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                                ? 'bg-white text-emerald-800 shadow-xs border border-neutral-200/80'
                                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Form Fields Area */}
            <div ref={formScrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-neutral-700" data-lenis-prevent>
                {/* ════════════════════════════════════════════════════════════
                    TAB 1: CLIENT & REFERENCE INFO
                ════════════════════════════════════════════════════════════ */}
                {activeTab === 'client' && (
                    <div className="space-y-4">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 font-medium">
                            <p className="font-bold">Quotation Reference & Date</p>
                            <p className="text-[11px] text-emerald-700 mt-0.5">Appears on header of Page 1</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-neutral-700 mb-1">Quote Reference No</label>
                                <input
                                    type="text"
                                    value={data.refNo}
                                    onChange={(e) => updateField('refNo', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg font-mono focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-neutral-700 mb-1">Date</label>
                                <input
                                    type="text"
                                    value={data.date}
                                    onChange={(e) => updateField('date', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg font-mono focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-neutral-700 mb-1">System Title (Page 1)</label>
                                <input
                                    type="text"
                                    value={data.systemTitle}
                                    onChange={(e) => updateField('systemTitle', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg font-bold focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-neutral-700 mb-1">System Subtitle (Page 1)</label>
                                <input
                                    type="text"
                                    value={data.systemSubtitle}
                                    onChange={(e) => updateField('systemSubtitle', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <hr className="border-neutral-200 my-4" />

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900 font-medium flex items-center justify-between">
                            <div>
                                <p className="font-bold">Client Information</p>
                                <p className="text-[11px] text-blue-700 mt-0.5">Used on Page 1 cover cards and Page 4 table</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSelectTab('technical')}
                                className="text-[11px] font-bold text-blue-700 hover:text-blue-950 underline cursor-pointer"
                            >
                                Technical Specs →
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block font-bold text-neutral-700 mb-2">Client Name</label>
                                <input
                                    type="text"
                                    value={data.clientInfo.name}
                                    onChange={(e) => updateField('clientInfo.name', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg font-bold focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-neutral-700 mb-1">Address / Location</label>
                                <input
                                    type="text"
                                    value={data.clientInfo.address}
                                    onChange={(e) => updateField('clientInfo.address', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-neutral-700 mb-1">Contact No</label>
                                    <input
                                        type="text"
                                        value={data.clientInfo.contactNo}
                                        onChange={(e) => updateField('clientInfo.contactNo', e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg font-mono focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-neutral-700 mb-1">Capacity</label>
                                    <input
                                        type="text"
                                        value={data.clientInfo.capacity}
                                        onChange={(e) => updateField('clientInfo.capacity', e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg font-bold focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-neutral-700 mb-1">Type</label>
                                    <input
                                        type="text"
                                        value={data.clientInfo.type}
                                        onChange={(e) => updateField('clientInfo.type', e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg font-bold focus:bg-white focus:border-emerald-600 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    TAB 2: PROPOSED MANUFACTURERS (Page 3)
                ════════════════════════════════════════════════════════════ */}
                {activeTab === 'manufacturers' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                            <div>
                                <h3 className="font-bold text-neutral-800">Proposed Manufacturers List</h3>
                                <p className="text-[11px] text-neutral-500">Renders on Page 3 ({mfgPageCount} page{mfgPageCount > 1 ? 's' : ''}, {data.manufacturers.length} items)</p>
                            </div>
                            <button
                                onClick={addManufacturer}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Item</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {data.manufacturers.map((item, idx) => (
                                <div key={item.id || idx} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 relative group">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono font-bold text-emerald-800 text-[11px]">Item #{idx + 1}</span>
                                        <button
                                            onClick={() => removeManufacturer(idx)}
                                            className="text-neutral-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                            title="Remove Item"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Item Description</label>
                                        <input
                                            type="text"
                                            value={item.item}
                                            onChange={(e) => {
                                                const newArr = [...data.manufacturers];
                                                newArr[idx].item = e.target.value;
                                                updateField('manufacturers', newArr);
                                            }}
                                            className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md focus:border-emerald-600 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Manufacturer</label>
                                            <input
                                                type="text"
                                                value={item.manufacturer}
                                                onChange={(e) => {
                                                    const newArr = [...data.manufacturers];
                                                    newArr[idx].manufacturer = e.target.value;
                                                    updateField('manufacturers', newArr);
                                                }}
                                                className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md font-bold focus:border-emerald-600 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-0.5">Origin</label>
                                            <input
                                                type="text"
                                                value={item.origin}
                                                onChange={(e) => {
                                                    const newArr = [...data.manufacturers];
                                                    newArr[idx].origin = e.target.value;
                                                    updateField('manufacturers', newArr);
                                                }}
                                                className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md font-medium focus:border-emerald-600 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    TAB 3: TECHNICAL SPECS (Page 4)
                ════════════════════════════════════════════════════════════ */}
                {activeTab === 'technical' && (
                    <div className="space-y-5">
                        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sky-900 font-medium flex items-center justify-between">
                            <div>
                                <p className="font-bold">Technical Specifications</p>
                                <p className="text-[11px] text-sky-700 mt-0.5">Renders on Page 4 (below Client Information)</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSelectTab('client')}
                                className="text-[11px] font-bold text-sky-700 hover:text-sky-950 underline cursor-pointer"
                            >
                                Edit Client Info →
                            </button>
                        </div>

                        {/* Solar PV Modules */}
                        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                            <h3 className="font-bold text-emerald-900 text-xs uppercase tracking-wider">Solar PV Modules</h3>

                            <div>
                                <label className="block font-semibold mb-1">Brand Name</label>
                                <input
                                    type="text"
                                    value={data.technicalSpecs.solarPvModules.brand}
                                    onChange={(e) => updateField('technicalSpecs.solarPvModules.brand', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-bold focus:border-emerald-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Type / Model</label>
                                <input
                                    type="text"
                                    value={data.technicalSpecs.solarPvModules.model}
                                    onChange={(e) => updateField('technicalSpecs.solarPvModules.model', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-semibold focus:border-emerald-600 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold mb-1">Quantity</label>
                                    <input
                                        type="text"
                                        value={data.technicalSpecs.solarPvModules.qty}
                                        onChange={(e) => updateField('technicalSpecs.solarPvModules.qty', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-bold focus:border-emerald-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Warranty Statement</label>
                                    <input
                                        type="text"
                                        value={data.technicalSpecs.solarPvModules.warranty}
                                        onChange={(e) => updateField('technicalSpecs.solarPvModules.warranty', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs focus:border-emerald-600 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* On Grid Inverter */}
                        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                            <h3 className="font-bold text-emerald-900 text-xs uppercase tracking-wider">On Grid Inverter</h3>

                            <div>
                                <label className="block font-semibold mb-1">Inverter Brand</label>
                                <input
                                    type="text"
                                    value={data.technicalSpecs.inverter.brand}
                                    onChange={(e) => updateField('technicalSpecs.inverter.brand', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-bold focus:border-emerald-600 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block font-semibold mb-1">Quantity</label>
                                    <input
                                        type="text"
                                        value={data.technicalSpecs.inverter.qty}
                                        onChange={(e) => updateField('technicalSpecs.inverter.qty', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-bold focus:border-emerald-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Warranty</label>
                                    <input
                                        type="text"
                                        value={data.technicalSpecs.inverter.warranty}
                                        onChange={(e) => updateField('technicalSpecs.inverter.warranty', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-emerald-600 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">Additional Work</label>
                                    <input
                                        type="text"
                                        value={data.technicalSpecs.inverter.additionalWork}
                                        onChange={(e) => updateField('technicalSpecs.inverter.additionalWork', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-emerald-600 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    TAB 4: PRICING & PERMITS (Page 5)
                ════════════════════════════════════════════════════════════ */}
                {activeTab === 'pricing' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block font-bold text-neutral-700 mb-1">System Header Title (Page 5 Top Banner)</label>
                            <textarea
                                rows={2}
                                value={data.pricing.headerTitle}
                                onChange={(e) => updateField('pricing.headerTitle', e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg font-bold text-xs focus:bg-white focus:border-emerald-600 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-neutral-700 mb-1">Roof Type Label</label>
                                <input
                                    type="text"
                                    value={data.pricing.roofTypeLabel}
                                    onChange={(e) => updateField('pricing.roofTypeLabel', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:border-emerald-600 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-neutral-700 mb-1">Total Project Payable (₹)</label>
                                <input
                                    type="text"
                                    value={data.pricing.totalPayable}
                                    onChange={(e) => updateField('pricing.totalPayable', e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg font-extrabold text-sm text-emerald-900 focus:bg-white focus:border-emerald-600 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-neutral-700 mb-1">Amount In Words</label>
                            <input
                                type="text"
                                value={data.pricing.amountInWords}
                                onChange={(e) => updateField('pricing.amountInWords', e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:border-emerald-600 outline-none"
                            />
                        </div>

                        <hr className="border-neutral-200 my-3" />

                        {/* Permit Fees List */}
                        <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                            <div>
                                <h3 className="font-bold text-neutral-800">KSEB Permit Fees Table</h3>
                                <p className="text-[11px] text-neutral-500">Renders on Page 5 middle table ({data.permitFees.length} rows)</p>
                            </div>
                            <button
                                onClick={addPermitFee}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Fee Row</span>
                            </button>
                        </div>

                        <div className="space-y-2">
                            {data.permitFees.map((feeRow, idx) => (
                                <div key={feeRow.id || idx} className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Fee Description"
                                        value={feeRow.item}
                                        onChange={(e) => {
                                            const newArr = [...data.permitFees];
                                            newArr[idx].item = e.target.value;
                                            updateField('permitFees', newArr);
                                        }}
                                        className="flex-1 px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md font-semibold text-xs outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Fee Value"
                                        value={feeRow.fee}
                                        onChange={(e) => {
                                            const newArr = [...data.permitFees];
                                            newArr[idx].fee = e.target.value;
                                            updateField('permitFees', newArr);
                                        }}
                                        className="w-1/2 px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md font-bold text-xs outline-none"
                                    />
                                    <button
                                        onClick={() => removePermitFee(idx)}
                                        className="text-neutral-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                                        title="Remove Fee Row"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block font-bold text-neutral-700 mb-1">Government Subsidy Statement Note</label>
                            <textarea
                                rows={2}
                                value={data.subsidyNote}
                                onChange={(e) => updateField('subsidyNote', e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:border-emerald-600 outline-none text-xs"
                            />
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    TAB 5: TERMS & WARRANTY (Page 5 & Page 6)
                ════════════════════════════════════════════════════════════ */}
                {activeTab === 'terms' && (
                    <div className="space-y-4">
                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                            <h3 className="font-bold text-emerald-900 text-xs uppercase tracking-wider">Warranty Statements (Page 5)</h3>
                            <div>
                                <label className="block font-semibold mb-1">Panel Warranty</label>
                                <textarea
                                    rows={2}
                                    value={data.warranties.panel}
                                    onChange={(e) => updateField('warranties.panel', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md text-xs outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">Inverter Warranty</label>
                                <input
                                    type="text"
                                    value={data.warranties.inverter}
                                    onChange={(e) => updateField('warranties.inverter', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md text-xs outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-semibold mb-1">Isolator</label>
                                    <input
                                        type="text"
                                        value={data.warranties.isolator}
                                        onChange={(e) => updateField('warranties.isolator', e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md text-xs outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">ACDB / Dongle</label>
                                    <input
                                        type="text"
                                        value={data.warranties.acdb}
                                        onChange={(e) => updateField('warranties.acdb', e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-md text-xs outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                            <h3 className="font-bold text-emerald-900 text-xs uppercase tracking-wider">Terms and Conditions (Page 6)</h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1" data-lenis-prevent>
                                {data.termsAndConditions.map((term, idx) => (
                                    <div key={idx} className="p-2 bg-white border border-neutral-200 rounded-lg space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-emerald-950 text-[10px] uppercase">#{idx + 1} {term.label}</span>
                                        </div>
                                        <textarea
                                            rows={2}
                                            value={term.text}
                                            onChange={(e) => {
                                                const newArr = [...data.termsAndConditions];
                                                newArr[idx].text = e.target.value;
                                                updateField('termsAndConditions', newArr);
                                            }}
                                            className="w-full px-2 py-1 bg-neutral-50 border border-neutral-200 rounded text-xs outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
