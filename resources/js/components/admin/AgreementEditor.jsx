import React, { useState, useEffect, useRef } from 'react';
import * as jspdfLib from 'jspdf';
import html2canvas from 'html2canvas-pro';
import toast from 'react-hot-toast';
import {
    Download,
    RotateCcw,
    FileSignature,
    Copy,
    Sparkles,
    Check,
    ZoomIn,
    ZoomOut,
    Eye,
    EyeOff,
    User,
    Building2,
    Calendar,
    CreditCard
} from 'lucide-react';
import headerImg from '../../assets/header.jpeg';
import footerImg from '../../assets/footer.jpeg';
import paleBlueSolarEcoEmblem from '../../assets/Pale Blue Solar Eco Emblem.png';

const jsPDF = jspdfLib.jsPDF || jspdfLib.default?.jsPDF || jspdfLib.default;

// Default official payment terms for clause 19
const DEFAULT_PAYMENT_TERMS = `• Milestone 1: 20% Advance upon signing agreement & completion of site feasibility survey.
• Milestone 2: 60% upon delivery of Solar PV Panels, Inverter, Structure and BoS materials to site.
• Milestone 3: 20% upon completion of installation, testing, DISCOM inspection & net-meter grid synchronization.`;

export const AgreementEditor = ({ onLogout, onBack, onNavigate }) => {
    // Screen responsiveness
    const [isMobile, setIsMobile] = useState(() => {
        return typeof window !== 'undefined' && window.innerWidth < 1024;
    });
    const [mobileTab, setMobileTab] = useState('edit'); // 'edit' or 'preview'

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Form fields state
    const [fields, setFields] = useState(() => {
        try {
            const saved = localStorage.getItem('solaredge_agreement_fields_v5');
            if (saved) return JSON.parse(saved);
        } catch {}

        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const month = monthNames[now.getMonth()];
        const year = String(now.getFullYear());
        const dateFormatted = `${day}/${String(now.getMonth() + 1).padStart(2, '0')}/${year}`;

        return {
            executionDay: day,
            executionMonth: month,
            executionYear: year,
            consumerName: 'SUNIL',
            consumerAddress: 'KATTAKKAL HOUSE, AYIROOR PO, VARKALA, KERALA 695310',
            secondPartyName: 'SOLAREDGE INNOVATIONS',
            secondPartyAddress: '476/5, AYIROOR VARKALA ROAD, ELAKAMON, VARKALA 695310',
            paymentTerms: DEFAULT_PAYMENT_TERMS,
            firstPartySignName: 'SUNIL',
            firstPartySignDate: dateFormatted,
            secondPartySignName: 'SOLAREDGE INNOVATIONS',
            secondPartySignDate: dateFormatted,
        };
    });

    // Formatting & View controls
    const [fontSizeOffset, setFontSizeOffset] = useState(0); // -1, 0, +1
    const [previewScale, setPreviewScale] = useState(0.85);
    const [showPreview, setShowPreview] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [copied, setCopied] = useState(false);

    // Save fields to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('solaredge_agreement_fields_v5', JSON.stringify(fields));
        } catch {}
    }, [fields]);

    const handleFieldChange = (key, value) => {
        setFields(prev => {
            const updated = { ...prev, [key]: value };
            if (key === 'consumerName' && (!prev.firstPartySignName || prev.firstPartySignName === prev.consumerName)) {
                updated.firstPartySignName = value;
            }
            return updated;
        });
    };

    // Reset to default
    const handleReset = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const month = monthNames[now.getMonth()];
        const year = String(now.getFullYear());
        const dateFormatted = `${day}/${String(now.getMonth() + 1).padStart(2, '0')}/${year}`;

        const defaultFields = {
            executionDay: day,
            executionMonth: month,
            executionYear: year,
            consumerName: 'SUNIL',
            consumerAddress: 'KATTAKKAL HOUSE, AYIROOR PO, VARKALA, KERALA 695310',
            secondPartyName: 'SOLAREDGE INNOVATIONS',
            secondPartyAddress: '476/5, AYIROOR VARKALA ROAD, ELAKAMON, VARKALA 695310',
            paymentTerms: DEFAULT_PAYMENT_TERMS,
            firstPartySignName: 'SUNIL',
            firstPartySignDate: dateFormatted,
            secondPartySignName: 'SOLAREDGE INNOVATIONS',
            secondPartySignDate: dateFormatted,
        };
        setFields(defaultFields);
        toast.success('Reset to official MNRE Model Agreement template!');
    };

    // Copy full text
    const handleCopyText = () => {
        const fullText = `Annexure 2\nModel Draft Agreement between Consumer & Vendor for installation of grid connected rooftop solar (RTS) project under PM – Surya Ghar: Muft Bijli Yojana\n\nThis agreement is executed on ${fields.executionDay || '------'} (Day) ${fields.executionMonth || '------'} (Month) ${fields.executionYear || '------'} (Year) for design, supply, installation, commissioning and 5-year comprehensive maintenance of RTS project/system along with warranty under PM Surya Ghar: Muft Bijli Yojana\n\nBetween\n${fields.consumerName} having address at ${fields.consumerAddress}\n\nAnd\n${fields.secondPartyName} having registered office at ${fields.secondPartyAddress}`;
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        toast.success('Agreement text copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Multi-page PDF Download Handler with high-resolution canvas capture
    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);
        const toastId = toast.loading('Generating Letterhead Agreement PDF (5 pages)...');

        const savedScale = previewScale;
        setPreviewScale(1);
        await new Promise((resolve) => setTimeout(resolve, 140));

        try {
            const pageElements = document.querySelectorAll('.agreement-printable-sheet');
            if (pageElements.length === 0) {
                toast.error('No agreement pages found to generate PDF.', { id: toastId });
                return;
            }

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true,
            });

            for (let i = 0; i < pageElements.length; i++) {
                const sheet = pageElements[i];
                const canvas = await html2canvas(sheet, {
                    scale: 2.2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: sheet.scrollWidth,
                    windowHeight: sheet.scrollHeight,
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                if (i > 0) {
                    pdf.addPage('a4', 'portrait');
                }
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            }

            const cleanConsumerName = (fields.consumerName || 'Consumer')
                .replace(/[^a-zA-Z0-9_-]/g, '_')
                .substring(0, 25);
            const fileName = `MNRE_Letterhead_Agreement_${cleanConsumerName}.pdf`;

            pdf.save(fileName);
            toast.success(`Agreement downloaded: ${fileName}`, { id: toastId });
        } catch (err) {
            console.error('PDF export error:', err);
            toast.error('Failed to generate PDF. Please try again.', { id: toastId });
        } finally {
            setPreviewScale(savedScale);
            setIsGeneratingPdf(false);
        }
    };

    // Base font size matches Letterhead body text: 14px default
    const baseFontSize = 14 + fontSizeOffset;

    return (
        <div
            className="w-full flex flex-col font-sans bg-[#F4F6F9] min-h-[calc(100vh-135px)] h-[calc(100vh-135px)] overflow-hidden relative"
            data-lenis-prevent
        >
            {/* Top Action & Status Bar - Sticky at top */}
            <div className="no-print shrink-0 bg-white border-b border-neutral-200/90 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs z-30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1A4D2E] border border-emerald-200/60 flex items-center justify-center shadow-2xs">
                        <FileSignature size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">
                                MNRE Model Agreement
                            </h1>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-[#1A4D2E] border border-emerald-200/80">
                                Annexure 2 • 5 Pages
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 font-medium">
                            Official PM – Surya Ghar Agreement formatted with letterhead header & footer on all pages
                        </p>
                    </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    {/* Mobile Tab Toggle */}
                    {isMobile && (
                        <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                            <button
                                onClick={() => setMobileTab('edit')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    mobileTab === 'edit'
                                        ? 'bg-white text-[#1A4D2E] shadow-2xs'
                                        : 'text-neutral-600'
                                }`}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setMobileTab('preview')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    mobileTab === 'preview'
                                        ? 'bg-white text-[#1A4D2E] shadow-2xs'
                                        : 'text-neutral-600'
                                }`}
                            >
                                Preview
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer"
                        title="Reset template to official default values"
                    >
                        <RotateCcw size={14} />
                        <span className="hidden sm:inline">Reset</span>
                    </button>

                    <button
                        onClick={handleCopyText}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer"
                        title="Copy agreement summary text"
                    >
                        {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                            showPreview
                                ? 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200/80'
                                : 'text-white bg-[#1A4D2E] hover:bg-[#143c24] shadow-xs'
                        }`}
                        title={showPreview ? 'Hide live letterhead preview' : 'Show live letterhead preview'}
                    >
                        {showPreview ? (
                            <>
                                <EyeOff size={14} className="text-neutral-500" />
                                <span>Hide Preview</span>
                            </>
                        ) : (
                            <>
                                <Eye size={14} className="text-white" />
                                <span>Show Preview</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#1A4D2E] hover:bg-[#143c24] active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        title="Download official 5-page PDF"
                    >
                        <Download size={15} />
                        <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF (5p)'}</span>
                    </button>
                </div>
            </div>

            {/* Split Screen Workspace - Fixed Left Panel & Independently Scrollable Right Preview */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                {/* Left Column: Fixed sidebar with internal scroll */}
                <div
                    className={`agreement-editor-controls w-full h-full border-b lg:border-b-0 border-neutral-200/90 bg-white flex flex-col p-4 sm:p-5 gap-4 overflow-y-auto z-20 ${
                        isMobile && mobileTab !== 'edit' ? 'hidden' : ''
                    } ${
                        showPreview
                            ? 'lg:w-[460px] xl:w-[500px] 2xl:w-[540px] lg:border-r shrink-0'
                            : 'lg:w-full lg:flex-1 lg:border-r-0'
                    }`}
                >
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-emerald-600" />
                            Agreement Details & Signatories
                        </span>
                        {/* Font size adjustment */}
                        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                            <button
                                onClick={() => setFontSizeOffset(prev => Math.max(-2, prev - 0.5))}
                                className="px-2 py-0.5 text-[11px] font-bold text-neutral-600 hover:text-neutral-900 rounded cursor-pointer"
                                title="Decrease text size"
                            >
                                A-
                            </button>
                            <span className="text-[11px] font-mono px-1 font-bold text-neutral-700">
                                {baseFontSize}px
                            </span>
                            <button
                                onClick={() => setFontSizeOffset(prev => Math.min(2, prev + 0.5))}
                                className="px-2 py-0.5 text-[11px] font-bold text-neutral-600 hover:text-neutral-900 rounded cursor-pointer"
                                title="Increase text size"
                            >
                                A+
                            </button>
                        </div>
                    </div>

                    {/* Section 1: Execution Date */}
                    <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D2E]">
                            <Calendar size={14} />
                            <span>Agreement Execution Date</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                            <div>
                                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Day</label>
                                <input
                                    type="text"
                                    value={fields.executionDay}
                                    onChange={(e) => handleFieldChange('executionDay', e.target.value)}
                                    placeholder="e.g. 06"
                                    className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Month</label>
                                <input
                                    type="text"
                                    value={fields.executionMonth}
                                    onChange={(e) => handleFieldChange('executionMonth', e.target.value)}
                                    placeholder="e.g. November"
                                    className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Year</label>
                                <input
                                    type="text"
                                    value={fields.executionYear}
                                    onChange={(e) => handleFieldChange('executionYear', e.target.value)}
                                    placeholder="e.g. 2026"
                                    className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: First Party (Consumer) */}
                    <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D2E]">
                            <User size={14} />
                            <span>First Party (Consumer / Purchaser / Owner)</span>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Consumer Full Name</label>
                            <input
                                type="text"
                                value={fields.consumerName}
                                onChange={(e) => handleFieldChange('consumerName', e.target.value)}
                                placeholder="Name of Consumer"
                                className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Consumer Complete Address</label>
                            <textarea
                                rows={2}
                                value={fields.consumerAddress}
                                onChange={(e) => handleFieldChange('consumerAddress', e.target.value)}
                                placeholder="Complete residential address with PIN code"
                                className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Section 3: Second Party (Vendor / Contractor) */}
                    <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D2E]">
                            <Building2 size={14} />
                            <span>Second Party (Vendor / System Integrator)</span>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Company / Vendor Name</label>
                            <input
                                type="text"
                                value={fields.secondPartyName}
                                onChange={(e) => handleFieldChange('secondPartyName', e.target.value)}
                                placeholder="SOLAREDGE INNOVATIONS"
                                className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Registered Office Address</label>
                            <textarea
                                rows={2}
                                value={fields.secondPartyAddress}
                                onChange={(e) => handleFieldChange('secondPartyAddress', e.target.value)}
                                placeholder="476/5, AYIROOR VARKALA ROAD, ELAKAMON, VARKALA 695310"
                                className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Section 4: Terms of Payment (Clause 19) */}
                    <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D2E]">
                            <CreditCard size={14} />
                            <span>Clause 19: Mutually Agreed Terms of Payment</span>
                        </div>
                        <textarea
                            rows={4}
                            value={fields.paymentTerms}
                            onChange={(e) => handleFieldChange('paymentTerms', e.target.value)}
                            placeholder="Enter payment milestones and schedule..."
                            className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none resize-none leading-relaxed font-sans"
                        />
                    </div>

                    {/* Section 5: Signatories & Signing Dates */}
                    <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D2E]">
                            <FileSignature size={14} />
                            <span>Signatories & Dates (Page 5)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2 p-3 bg-white border border-neutral-200 rounded-xl">
                                <p className="text-[11px] font-bold text-[#1A4D2E] uppercase">First Party (Consumer)</p>
                                <div>
                                    <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Signatory Name</label>
                                    <input
                                        type="text"
                                        value={fields.firstPartySignName}
                                        onChange={(e) => handleFieldChange('firstPartySignName', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:border-[#1A4D2E] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Sign Date</label>
                                    <input
                                        type="text"
                                        value={fields.firstPartySignDate}
                                        onChange={(e) => handleFieldChange('firstPartySignDate', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:border-[#1A4D2E] outline-none font-mono text-[11px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 p-3 bg-white border border-neutral-200 rounded-xl">
                                <p className="text-[11px] font-bold text-[#1A4D2E] uppercase">Second Party (Vendor)</p>
                                <div>
                                    <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Signatory Name</label>
                                    <input
                                        type="text"
                                        value={fields.secondPartySignName}
                                        onChange={(e) => handleFieldChange('secondPartySignName', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:border-[#1A4D2E] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Sign Date</label>
                                    <input
                                        type="text"
                                        value={fields.secondPartySignDate}
                                        onChange={(e) => handleFieldChange('secondPartySignDate', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:border-[#1A4D2E] outline-none font-mono text-[11px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Independently Scrollable Live Letterhead Preview */}
                <div
                    className={`agreement-preview-area flex-1 h-full bg-neutral-200/80 p-4 sm:p-8 overflow-y-auto flex flex-col items-center gap-8 z-10 ${
                        isMobile && mobileTab !== 'preview' ? 'hidden' : ''
                    } ${
                        showPreview
                            ? ''
                            : 'lg:flex-none lg:fixed lg:-left-[99999px] lg:top-0 lg:w-[210mm] lg:h-auto lg:p-0 lg:bg-transparent lg:opacity-0 lg:pointer-events-none lg:overflow-hidden'
                    }`}
                    data-lenis-prevent
                >
                    {/* Zoom / Scale bar */}
                    <div className="no-print sticky top-0 z-20 self-end flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-neutral-300 shadow-2xs text-xs font-semibold text-neutral-700">
                        <span className="text-neutral-500 font-medium">Zoom:</span>
                        <button
                            onClick={() => setPreviewScale((s) => Math.max(0.5, s - 0.1))}
                            className="p-1 hover:bg-neutral-100 rounded cursor-pointer"
                            title="Zoom Out"
                        >
                            <ZoomOut size={14} />
                        </button>
                        <span className="font-mono text-[11px] w-12 text-center font-bold">
                            {Math.round(previewScale * 100)}%
                        </span>
                        <button
                            onClick={() => setPreviewScale((s) => Math.min(1.3, s + 0.1))}
                            className="p-1 hover:bg-neutral-100 rounded cursor-pointer"
                            title="Zoom In"
                        >
                            <ZoomIn size={14} />
                        </button>
                        <button
                            onClick={() => setPreviewScale(0.85)}
                            className="ml-1 text-[10px] text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                        >
                            Fit
                        </button>
                    </div>

                    {/* Scale Wrapper with vertical page stack */}
                    <div
                        className="flex flex-col items-center gap-10"
                        style={{
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.15s ease-out'
                        }}
                    >
                        {/* ============================================================== */}
                        {/* PAGE 1: Letterhead Header + Annexure 2 Agreement Body + Footer */}
                        {/* ============================================================== */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="no-print self-start flex items-center gap-2 bg-white/95 px-3 py-1 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-700 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>PAGE 1 OF 5 • ANNEXURE 2</span>
                            </div>

                            <div
                                id="agreement-sheet-0"
                                className="agreement-printable-sheet letterhead-printable-sheet w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-2xl print:shadow-none flex flex-col justify-start relative overflow-hidden box-border font-sans"
                            >
                                {/* 1. Official Letterhead Top Header Banner - Fixed at top */}
                                <div className="w-full relative z-10 shrink-0 select-none pointer-events-none">
                                    <img
                                        src={headerImg}
                                        alt="Solaredge Innovations Letterhead Header"
                                        className="w-full h-auto object-contain block select-none pointer-events-none"
                                    />
                                </div>

                                {/* 2. Soft Background Watermark - Fixed in center */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none z-0">
                                    <img
                                        src={paleBlueSolarEcoEmblem}
                                        alt="Solar Edge Watermark"
                                        className="w-[460px] h-[460px] object-contain"
                                    />
                                </div>

                                {/* 3. Official Letterhead Bottom Footer Banner - FIXED AT BOTTOM */}
                                <div className="w-full absolute bottom-0 left-0 right-0 z-10 select-none pointer-events-none">
                                    <img
                                        src={footerImg}
                                        alt="Solaredge Innovations Letterhead Footer"
                                        className="w-full h-auto object-contain block"
                                    />
                                </div>

                                {/* 4. Page Number - Fixed above bottom footer banner on the right */}
                                <div className="absolute bottom-3 right-8 z-30 flex items-center justify-end text-[12px] font-semibold text-neutral-700 select-none pointer-events-none font-sans">
                                    <span>1</span>
                                </div>

                                {/* 5. Document Content Area - Overlays on top of fixed letterhead logo elements */}
                                <div className="px-14 pt-3 pb-20 relative z-20 text-neutral-900">
                                    <div
                                        className="w-full font-sans text-left text-neutral-900 space-y-2.5"
                                        style={{
                                            fontSize: `${baseFontSize}px`,
                                            lineHeight: '1.7',
                                        }}
                                    >
                                        {/* Annexure 2 (Centered) */}
                                        <div className="text-center font-bold text-[15px] text-neutral-950">
                                            Annexure 2
                                        </div>

                                        {/* Main Heading (Centered) */}
                                        <div className="text-center font-bold text-[13.5px] leading-snug px-3 text-neutral-950">
                                            Model Draft Agreement between Consumer & Vendor for installation of grid connected rooftop solar (RTS) project under PM – Surya Ghar: Muft Bijli Yojana
                                        </div>

                                        {/* Execution Clause (Left-aligned) */}
                                        <div className="text-left font-normal text-neutral-900">
                                            This agreement is executed on {fields.executionDay ? <strong className="font-semibold text-neutral-950">{fields.executionDay}</strong> : '-------'}(Day)------{fields.executionMonth ? <strong className="font-semibold text-neutral-950">{fields.executionMonth}</strong> : '------'}(Month) ------ {fields.executionYear ? <strong className="font-semibold text-neutral-950">{fields.executionYear}</strong> : '------'} (Year) for design, supply, installation, commissioning and 5-year comprehensive maintenance of RTS project/system along with warranty under PM Surya Ghar: Muft Bijli Yojana
                                        </div>

                                        {/* Between (Centered) */}
                                        <div className="text-center font-bold text-[13px] text-neutral-950 py-0.5">
                                            Between
                                        </div>

                                        {/* Consumer Details (Left-aligned) */}
                                        <div className="text-left font-normal text-neutral-900">
                                            <span className="underline decoration-dotted underline-offset-4 font-semibold text-neutral-950">
                                                {fields.consumerName || '.......................................................'}
                                            </span> (Name of Consumer) having address at{' '}
                                            <span className="underline decoration-dotted underline-offset-4 font-semibold text-neutral-950">
                                                {fields.consumerAddress || '.................................................................................................................................................'}
                                            </span> (hereinafter referred to as first Party i.e. /consumer/consumer/purchaser /owner of system).
                                        </div>

                                        {/* And (Centered) */}
                                        <div className="text-center font-bold text-[13px] text-neutral-950 py-0.5">
                                            And
                                        </div>

                                        {/* Vendor Details (Left-aligned) */}
                                        <div className="text-left font-normal text-neutral-900">
                                            <span className="uppercase font-semibold text-neutral-950">{fields.secondPartyName || 'SOLAREDGE INNOVATIONS'}</span> having registered office at{' '}
                                            <span className="font-semibold text-neutral-950">{fields.secondPartyAddress || '476/5, AYIROOR VARKALA ROAD, ELAKAMON, VARKALA 695310'}.</span> (here in after referred to as second Party i.e. Vendor/ contractor/ System Integrator).
                                        </div>

                                        {/* Whereas (Centered) */}
                                        <div className="text-center font-bold text-[13px] text-neutral-950 py-0.5">
                                            Whereas
                                        </div>

                                        {/* Recital 1 (Left-aligned) */}
                                        <div className="text-left font-normal text-neutral-900">
                                            First Party wishes to install a Grid Connected Rooftop Solar Plant on the rooftop of the residential building of the Consumer under PM Surya Ghar: Muft Bijli Yojana.
                                        </div>

                                        {/* And whereas (Left-aligned) */}
                                        <div className="text-left font-bold text-neutral-950">
                                            And whereas
                                        </div>

                                        {/* Recital 2 (Left-aligned) */}
                                        <div className="text-left font-normal text-neutral-900">
                                            Second Party has verified availability of appropriate roof and found it feasible to install a Grid Connected Roof Top Solar plant and that the second party is willing to design, supply, install, test, commission and carry out Operation & Maintenance of the Rooftop Solar plant for 5year period on this day, the First Party and Second Party agree to the following:
                                        </div>

                                        {/* Undertaking Heading (Left-aligned) */}
                                        <div className="text-left font-bold underline text-neutral-950 pt-0.5">
                                            The First Party hereby undertakes to perform the following activities:
                                        </div>

                                        {/* Point 1 Initial (Left-aligned) */}
                                        <div className="text-left font-normal text-neutral-900">
                                            Submission of online application at National Portal for installation of RTS project/system, Submission of application for net-metering and system inspection and upload of the relevant documents on the National Portal of the scheme.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================== */}
                        {/* PAGE 2: Letterhead Header + Points 1 to 4 + Footer */}
                        {/* ============================================================== */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="no-print self-start flex items-center gap-2 bg-white/95 px-3 py-1 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-700 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>PAGE 2 OF 5 • UNDERTAKINGS (POINTS 1–4)</span>
                            </div>

                            <div
                                id="agreement-sheet-1"
                                className="agreement-printable-sheet letterhead-printable-sheet w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-2xl print:shadow-none flex flex-col justify-start relative overflow-hidden box-border font-sans"
                            >
                                {/* 1. Official Letterhead Top Header Banner - Fixed at top */}
                                <div className="w-full relative z-10 shrink-0 select-none pointer-events-none">
                                    <img
                                        src={headerImg}
                                        alt="Solaredge Innovations Letterhead Header"
                                        className="w-full h-auto object-contain block select-none pointer-events-none"
                                    />
                                </div>

                                {/* 2. Soft Background Watermark - Fixed in center */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none z-0">
                                    <img
                                        src={paleBlueSolarEcoEmblem}
                                        alt="Solar Edge Watermark"
                                        className="w-[460px] h-[460px] object-contain"
                                    />
                                </div>

                                {/* 3. Official Letterhead Bottom Footer Banner - FIXED AT BOTTOM */}
                                <div className="w-full absolute bottom-0 left-0 right-0 z-10 select-none pointer-events-none">
                                    <img
                                        src={footerImg}
                                        alt="Solaredge Innovations Letterhead Footer"
                                        className="w-full h-auto object-contain block"
                                    />
                                </div>

                                {/* 4. Page Number - Fixed above bottom footer banner on the right */}
                                <div className="absolute bottom-3 right-8 z-30 flex items-center justify-end text-[12px] font-semibold text-neutral-700 select-none pointer-events-none font-sans">
                                    <span>2</span>
                                </div>

                                {/* 5. Document Content Area - Overlays on top of fixed letterhead logo elements */}
                                <div className="px-14 pt-3 pb-20 relative z-20 text-neutral-900">
                                    <div
                                        className="w-full font-sans text-left text-neutral-900 space-y-2.5"
                                        style={{
                                            fontSize: `${baseFontSize}px`,
                                            lineHeight: '1.7',
                                        }}
                                    >
                                        {/* First Party Points Continued (Left-aligned) */}
                                        <div className="text-left font-normal text-neutral-900">
                                            1. Provide electricity during plant installation and water for cleaning of the panels.
                                        </div>
                                        <div className="text-left font-normal text-neutral-900">
                                            2. Report any malfunctioning of the plant to the Vendor during the warranty period
                                        </div>
                                        <div className="text-left font-normal text-neutral-900">
                                            3. Pay the amount as per the payment schedule as mutually agreed with the vendor,including any additional amount to the second party for any additional work
                                        </div>
                                        <div className="text-left font-normal text-neutral-900">
                                            4. /customization required depending upon the building condition .
                                        </div>

                                        {/* Second Party Undertaking Heading (Left-aligned) */}
                                        <div className="text-left font-bold underline text-neutral-950 pt-1.5">
                                            The Second Party hereby undertakes to perform the following activities:
                                        </div>

                                        {/* Second Party Points 1 to 4 (Left-aligned) */}
                                        <div className="text-left font-normal text-neutral-900">
                                            1. The Vendor must follow all the standards and safety guidelines prescribed under state regulations and technical standards prescribed by MNRE for RTS projects, failing which the vendor is liable for blacklisting from participation in the govt. project/ scheme and other penal actions in accordance with the law. The responsibility of supply, installation and commissioning of the rooftop solar project/system in complete compliance with MNRE scheme guidelines lies with the Vendor.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            2. Site Survey: Site visit, survey and development of detailed project report for installation of RTS system. This also includes, feasibility study of roof, strength of roof and shadow free area. If any additional work or customization is involved for the plant installation asper site condition and requirement of the consumer building, the Vendor shall prepare an estimate and can raise separate invoice including GST in addition to the amount towards standard plant cost. The consumer shall pay the amount for such additional work directly to the Vendor.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            3. Design & Engineering: Design of plant along with drawings and selection of components as per standard provided by the DISCOM/SERC/MNRE for best performance and safety of the plant.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            4. Module and Inverter: The solar modules, including the solar cells, should be manufactured in India. Both the solar modules and inverters shall conform to the relevant standards and specifications prescribed by MNRE. Any other requirement, viz. star labelling (solar modules), quality control orders and standards & labelling (inverters)etc., shall also be complied.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================== */}
                        {/* PAGE 3: Letterhead Header + Points 5 to 11 Body + Footer */}
                        {/* ============================================================== */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="no-print self-start flex items-center gap-2 bg-white/95 px-3 py-1 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-700 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>PAGE 3 OF 5 • TECHNICAL STANDARDS & WARRANTIES (POINTS 5–13)</span>
                            </div>

                            <div
                                id="agreement-sheet-2"
                                className="agreement-printable-sheet letterhead-printable-sheet w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-2xl print:shadow-none flex flex-col justify-start relative overflow-hidden box-border font-sans"
                            >
                                {/* 1. Official Letterhead Top Header Banner - Fixed at top */}
                                <div className="w-full relative z-10 shrink-0 select-none pointer-events-none">
                                    <img
                                        src={headerImg}
                                        alt="Solaredge Innovations Letterhead Header"
                                        className="w-full h-auto object-contain block select-none pointer-events-none"
                                    />
                                </div>

                                {/* 2. Soft Background Watermark - Fixed in center */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none z-0">
                                    <img
                                        src={paleBlueSolarEcoEmblem}
                                        alt="Solar Edge Watermark"
                                        className="w-[460px] h-[460px] object-contain"
                                    />
                                </div>

                                {/* 3. Official Letterhead Bottom Footer Banner - FIXED AT BOTTOM */}
                                <div className="w-full absolute bottom-0 left-0 right-0 z-10 select-none pointer-events-none">
                                    <img
                                        src={footerImg}
                                        alt="Solaredge Innovations Letterhead Footer"
                                        className="w-full h-auto object-contain block"
                                    />
                                </div>

                                {/* 4. Page Number - Fixed above bottom footer banner on the right */}
                                <div className="absolute bottom-3 right-8 z-30 flex items-center justify-end text-[12px] font-semibold text-neutral-700 select-none pointer-events-none font-sans">
                                    <span>3</span>
                                </div>

                                {/* 5. Document Content Area - Overlays on top of fixed letterhead logo elements */}
                                <div className="px-14 pt-3 pb-20 relative z-20 text-neutral-900">
                                    <div
                                        className="w-full font-sans text-left text-neutral-900 space-y-2.5"
                                        style={{
                                            fontSize: `${baseFontSize}px`,
                                            lineHeight: '1.7',
                                        }}
                                    >
                                        <div className="text-left font-normal text-neutral-900">
                                            5. Procurement & Supply: Procurement of complete system as per BIS/IS/IEC standard (whatever applicable) & safety guidelines for installation of rooftop solar plants. The supplied materials should comply with all MNRE standards for release of subsidy.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            6. Installation & Civil work: Complete civil work, structure work and electrical work (including drawings) following all the safety and relevant BIS standards.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            7. Documentation (Technical Catalogues/Warranty Certificates/BIS certificates/other test reports etc ): All such documents shall be provided to the consumer for online uploading and submission of technical specifications,
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            8. IEC/BIS report, Sr. Nos, Warranty card of Solar Panel & Inverter, Layout & Electrical SLD, Structure Design and Drawing, Cable and other detailed documents.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            9. Project completion report (PCR): Assisting the consumer in filling and uploading of signed documents (Consumer & Vendor) on the national portal.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            10. Warranty: System warranty certificates should be provided to the consumer. The complete system should be warranted for 5 years from the date of commissioning by DISCOM. Individual component warranty documents provided by the manufacturer shall be provided to the consumer and all possible assistance should be extended to the consumer for claiming the warranty from the manufacturer.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            11. NET meter & Grid Connectivity: Net meter supply/procurement, testing and approvals shall be in the scope of vendor. Grid connection of the plant shall be in the scope of the vendor.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            12. Testing and Commissioning: The vendor shall be present at the time of testing and commissioning by the DISCOM.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            13. Operation & Maintenance: Five (5) years Comprehensive Operation and Maintenance including overhauling, wear and tear and regular checking of healthiness of system at proper interval shall be in the scope of vendor. The vendor shall also educate the consumer on best practices for cleaning of the modules and system maintenance, Insurance: Any insurance cost pertaining to material transfer/storage before commissioning of the system shall be in the scope of the vendor.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================== */}
                        {/* PAGE 4: Letterhead Header + Points 12 to 18 Body + Footer */}
                        {/* ============================================================== */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="no-print self-start flex items-center gap-2 bg-white/95 px-3 py-1 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-700 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>PAGE 4 OF 5 • STANDARDS, DISPUTES & PERFORMANCE (POINTS 14–18)</span>
                            </div>

                            <div
                                id="agreement-sheet-3"
                                className="agreement-printable-sheet letterhead-printable-sheet w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-2xl print:shadow-none flex flex-col justify-start relative overflow-hidden box-border font-sans"
                            >
                                {/* 1. Official Letterhead Top Header Banner - Fixed at top */}
                                <div className="w-full relative z-10 shrink-0 select-none pointer-events-none">
                                    <img
                                        src={headerImg}
                                        alt="Solaredge Innovations Letterhead Header"
                                        className="w-full h-auto object-contain block select-none pointer-events-none"
                                    />
                                </div>

                                {/* 2. Soft Background Watermark - Fixed in center */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none z-0">
                                    <img
                                        src={paleBlueSolarEcoEmblem}
                                        alt="Solar Edge Watermark"
                                        className="w-[460px] h-[460px] object-contain"
                                    />
                                </div>

                                {/* 3. Official Letterhead Bottom Footer Banner - FIXED AT BOTTOM */}
                                <div className="w-full absolute bottom-0 left-0 right-0 z-10 select-none pointer-events-none">
                                    <img
                                        src={footerImg}
                                        alt="Solaredge Innovations Letterhead Footer"
                                        className="w-full h-auto object-contain block"
                                    />
                                </div>

                                {/* 4. Page Number - Fixed above bottom footer banner on the right */}
                                <div className="absolute bottom-3 right-8 z-30 flex items-center justify-end text-[12px] font-semibold text-neutral-700 select-none pointer-events-none font-sans">
                                    <span>4</span>
                                </div>

                                {/* 5. Document Content Area - Overlays on top of fixed letterhead logo elements */}
                                <div className="px-14 pt-3 pb-20 relative z-20 text-neutral-900">
                                    <div
                                        className="w-full font-sans text-left text-neutral-900 space-y-2.5"
                                        style={{
                                            fontSize: `${baseFontSize}px`,
                                            lineHeight: '1.7',
                                        }}
                                    >
                                        <div className="text-left font-normal text-neutral-900">
                                            14. Applicable Standard: The system must meet the technical standards and specifications notified by MNRE. The vendor is solely responsible to supply component and service which meets the technical standards and specification prescribed by MNRE and State DISCOMs.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            15. Project/system cost & payment terms: The cost of the plant and payment schedule should be mutually discussed and decided between the vendor and consumer. The consumer may opt for milestone-based payment to the vendor and the same shall be included in the agreement.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            16. Dispute: In-case of any dispute between consumer and vendor (in supply/installation/maintenance of system or payment terms), both parties must settle the same mutually or as per law. MNRE/DISCOM shall not be liable for, and would not be a party to any dispute arising between vendor and consumer.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            17. Subsidy / Project Related Documents: Vendor must provide all the documents toconsumer and help in uploading the same to National Portal for smooth release of subsidy.
                                        </div>

                                        <div className="text-left font-normal text-neutral-900">
                                            18. Performance of Plant: The Performance Ratio (PR) of Plant must be 75% at the time of commissioning of the project by DISCOM or its authorised agency. Vendor must provide(returnable basis) radiation sensor with valid calibration certificate of any NABL / International laboratory at the time of commissioning / testing of the plant. Vendor mustmaintain the PR of the plant till warranty of project i.e. 5 years from the date of commissioning.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================== */}
                        {/* PAGE 5: Letterhead Header + Payment & Signatures Body + Footer */}
                        {/* ============================================================== */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="no-print self-start flex items-center gap-2 bg-white/95 px-3 py-1 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-700 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>PAGE 5 OF 5 • PAYMENT TERMS & SIGNATURES</span>
                            </div>

                            <div
                                id="agreement-sheet-4"
                                className="agreement-printable-sheet letterhead-printable-sheet w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-2xl print:shadow-none flex flex-col justify-start relative overflow-hidden box-border font-sans"
                            >
                                {/* 1. Official Letterhead Top Header Banner - Fixed at top */}
                                <div className="w-full relative z-10 shrink-0 select-none pointer-events-none">
                                    <img
                                        src={headerImg}
                                        alt="Solaredge Innovations Letterhead Header"
                                        className="w-full h-auto object-contain block select-none pointer-events-none"
                                    />
                                </div>

                                {/* 2. Soft Background Watermark - Fixed in center */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none z-0">
                                    <img
                                        src={paleBlueSolarEcoEmblem}
                                        alt="Solar Edge Watermark"
                                        className="w-[460px] h-[460px] object-contain"
                                    />
                                </div>

                                {/* 3. Official Letterhead Bottom Footer Banner - FIXED AT BOTTOM */}
                                <div className="w-full absolute bottom-0 left-0 right-0 z-10 select-none pointer-events-none">
                                    <img
                                        src={footerImg}
                                        alt="Solaredge Innovations Letterhead Footer"
                                        className="w-full h-auto object-contain block"
                                    />
                                </div>

                                {/* 4. Page Number - Fixed above bottom footer banner on the right */}
                                <div className="absolute bottom-3 right-8 z-30 flex items-center justify-end text-[12px] font-semibold text-neutral-700 select-none pointer-events-none font-sans">
                                    <span>5</span>
                                </div>

                                {/* 5. Document Content Area - Overlays on top of fixed letterhead logo elements */}
                                <div className="px-14 pt-3 pb-24 relative z-20 text-neutral-900">
                                    <div
                                        className="w-full font-sans text-left text-neutral-900 space-y-3.5"
                                        style={{
                                            fontSize: `${baseFontSize}px`,
                                            lineHeight: '1.7',
                                        }}
                                    >
                                        {/* Clause 19: Mutually Agreed Terms of Payment (Left-aligned) */}
                                        <div className="pt-1">
                                            <div className="text-left font-bold text-[15px] text-neutral-950 mb-1.5">
                                                19. Mutually Agreed Terms of Payment …
                                            </div>
                                            <div className="text-left font-normal text-neutral-800 whitespace-pre-line pl-3 leading-[1.7]">
                                                {fields.paymentTerms || DEFAULT_PAYMENT_TERMS}
                                            </div>
                                        </div>

                                        {/* Signatures Block (2 Columns) */}
                                        <div className="pt-6 pb-2">
                                            <div className="grid grid-cols-2 gap-8 text-[13.5px]">
                                                {/* First Party Column */}
                                                <div className="space-y-2.5">
                                                    <div className="font-bold text-neutral-950 text-[14px]">First Party</div>
                                                    <div className="min-h-[46px] leading-tight text-neutral-900">
                                                        <span>Name: </span>
                                                        <span className="font-semibold text-neutral-950">{fields.firstPartySignName || fields.consumerName || '…………………………………'}</span>
                                                    </div>
                                                    <div className="pt-4 font-normal text-neutral-900">
                                                        <span>Sign: _________________________</span>
                                                    </div>
                                                    <div className="font-normal text-neutral-900">
                                                        <span>Date: </span>
                                                        <span className="font-semibold text-neutral-950">{fields.firstPartySignDate || '…………………………'}</span>
                                                    </div>
                                                </div>

                                                {/* Second Party Column */}
                                                <div className="space-y-2.5">
                                                    <div className="font-bold text-neutral-950 text-[14px]">Second Party</div>
                                                    <div className="min-h-[46px] leading-tight text-neutral-900">
                                                        <div className="font-bold text-neutral-950">{fields.secondPartySignName || fields.secondPartyName || 'SOLAREDGE INNOVATIONS'}</div>
                                                        <div className="text-[12px] font-normal leading-snug text-neutral-600 mt-0.5">
                                                            {fields.secondPartyAddress || '476/5, AYIROOR VARKALA ROAD, ELAKAMON, VARKALA 695310'}
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 font-normal text-neutral-900">
                                                        <span>Sign: _________________________</span>
                                                    </div>
                                                    <div className="font-normal text-neutral-900">
                                                        <span>Date: </span>
                                                        <span className="font-semibold text-neutral-950">{fields.secondPartySignDate || '…………………………'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Disclaimer */}
                                        <div className="pt-4 text-[12px] font-normal italic text-neutral-600 text-left leading-normal border-t border-neutral-300">
                                            Disclaimer: This agreement is between vendor and consumer and any dispute related to the sameshall not involve any third party including MNRE and Distribution Utilities.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
