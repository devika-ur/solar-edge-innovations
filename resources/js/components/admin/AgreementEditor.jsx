import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    CreditCard,
    Save,
    CheckCircle2,
    ArrowRight,
    Loader2
} from 'lucide-react';
import headerImg from '../../assets/header.jpeg';
import footerImg from '../../assets/footer.jpeg';
import paleBlueSolarEcoEmblem from '../../assets/Pale Blue Solar Eco Emblem.png';
import { AgreementEditorMobile } from './AgreementEditorMobile';
import { AgreementPageContent, DEFAULT_PAYMENT_TERMS } from './AgreementPageContent';

const jsPDF = jspdfLib.jsPDF || jspdfLib.default?.jsPDF || jspdfLib.default;

export const AgreementEditor = ({ onLogout, onBack, onNavigate, quotation: propQuotation, quotationId: propQuotationId }) => {
    const [searchParams] = useSearchParams();
    const targetQuoteId = propQuotation?.id || propQuotationId || searchParams.get('quotation_id');
    const [associatedQuotation, setAssociatedQuotation] = useState(propQuotation || null);
    const [isSavingAgreement, setIsSavingAgreement] = useState(false);
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

    // Form fields state with automatic current date defaults
    const getCurrentAgreementDates = () => {
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
            firstPartySignDate: dateFormatted,
            secondPartySignDate: dateFormatted,
        };
    };

    const [fields, setFields] = useState(() => {
        const currentDates = getCurrentAgreementDates();
        try {
            const saved = localStorage.getItem('solaredge_agreement_fields_v5');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.consumerName === 'SUNIL') parsed.consumerName = '';
                if (parsed.firstPartySignName === 'SUNIL') parsed.firstPartySignName = '';
                if (parsed.consumerAddress === 'KATTAKKAL HOUSE, AYIROOR PO, VARKALA, KERALA 695310') parsed.consumerAddress = '';
                return {
                    ...parsed,
                    // Automatically show current date as default
                    executionDay: currentDates.executionDay,
                    executionMonth: currentDates.executionMonth,
                    executionYear: currentDates.executionYear,
                    firstPartySignDate: currentDates.firstPartySignDate,
                    secondPartySignDate: currentDates.secondPartySignDate,
                };
            }
        } catch {}

        return {
            ...currentDates,
            consumerName: '',
            consumerAddress: '',
            secondPartyName: 'SOLAREDGE INNOVATIONS',
            secondPartyAddress: '476/5, AYIROOR VARKALA ROAD, ELAKAMON, VARKALA 695310',
            paymentTerms: DEFAULT_PAYMENT_TERMS,
            firstPartySignName: '',
            secondPartySignName: 'SOLAREDGE INNOVATIONS',
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

    // Auto-populate agreement form from approved quotation
    useEffect(() => {
        const currentDates = getCurrentAgreementDates();
        if (propQuotation) {
            setAssociatedQuotation(propQuotation);
            setFields(prev => ({
                ...prev,
                ...currentDates,
                consumerName: propQuotation.client_name || prev.consumerName,
                consumerAddress: (propQuotation.client_address && propQuotation.client_address !== '-') ? propQuotation.client_address : prev.consumerAddress,
                firstPartySignName: propQuotation.client_name || prev.firstPartySignName,
                quotationId: propQuotation.id,
                quotationRef: propQuotation.ref_no,
            }));
            return;
        }

        if (targetQuoteId) {
            const fetchQuote = async () => {
                try {
                    const res = await fetch(`/api/admin/quotations/${targetQuoteId}`, {
                        credentials: 'include'
                    });
                    const json = await res.json();
                    if (res.ok && json.success && json.data) {
                        const quote = json.data;
                        setAssociatedQuotation(quote);
                        setFields(prev => ({
                            ...prev,
                            ...currentDates,
                            consumerName: quote.client_name || prev.consumerName,
                            consumerAddress: (quote.client_address && quote.client_address !== '-') ? quote.client_address : prev.consumerAddress,
                            firstPartySignName: quote.client_name || prev.firstPartySignName,
                            quotationId: quote.id,
                            quotationRef: quote.ref_no,
                        }));
                    }
                } catch (e) {
                    console.error('Failed to load quotation for agreement:', e);
                }
            };
            fetchQuote();
        }
    }, [targetQuoteId, propQuotation]);

    // Save agreement to backend and update application workflow status to 'agreement_created'
    const handleSaveAgreement = async () => {
        const quoteId = associatedQuotation?.id || targetQuoteId || fields.quotationId;
        if (!quoteId) {
            toast.error('An associated approved quotation is required to save an agreement. Please generate agreement from the Approved Quotations page.');
            return;
        }
        if (!fields.consumerName || !fields.consumerName.trim()) {
            toast.error('Please enter the Consumer Full Name before saving the agreement.');
            return;
        }

        setIsSavingAgreement(true);
        const toastId = toast.loading('Generating & saving official agreement...');

        const savedScale = previewScale;
        setPreviewScale(1);
        await new Promise((resolve) => setTimeout(resolve, 140));

        try {
            const pageElements = document.querySelectorAll('.agreement-printable-sheet');
            if (pageElements.length === 0) {
                toast.error('No agreement pages found to generate PDF.', { id: toastId });
                setPreviewScale(savedScale);
                setIsSavingAgreement(false);
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
                    scale: 2.0,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 794,
                    windowHeight: 1123,
                    onclone: (clonedDoc, clonedEl) => {
                        clonedEl.style.transform = 'none';
                        clonedEl.style.position = 'static';
                        clonedEl.style.opacity = '1';
                        clonedEl.style.left = '0';
                        clonedEl.style.top = '0';
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                if (i > 0) {
                    pdf.addPage('a4', 'portrait');
                }
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            }

            const pdfBlob = pdf.output('blob');
            const formData = new FormData();
            formData.append('quotation_id', String(quoteId));
            formData.append('consumer_name', fields.consumerName.trim());
            formData.append('consumer_address', fields.consumerAddress || '');
            formData.append('agreement_date', `${fields.executionDay}/${fields.executionMonth}/${fields.executionYear}`);
            formData.append('agreement_data', JSON.stringify(fields));
            formData.append('pdf_file', pdfBlob, `agreement_${quoteId}_${Date.now()}.pdf`);

            const res = await fetch('/api/admin-agreements.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const resData = await res.json();
            if (res.ok && resData.success) {
                toast.success((t) => (
                    <div className="flex flex-col gap-2">
                        <span className="font-bold text-xs">{resData.message}</span>
                        <div className="flex items-center gap-2 mt-1">
                            {onNavigate && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            toast.dismiss(t.id);
                                            onNavigate('payments');
                                        }}
                                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                                    >
                                        Go to Payments
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            toast.dismiss(t.id);
                                            onNavigate('application-tracking');
                                        }}
                                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                                    >
                                        Track Application
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ), { id: toastId, duration: 6000 });
            } else {
                toast.error(resData.message || 'Failed to save agreement.', { id: toastId });
            }
        } catch (err) {
            console.error('Save agreement error:', err);
            toast.error('Failed to save agreement to server.', { id: toastId });
        } finally {
            setPreviewScale(savedScale);
            setIsSavingAgreement(false);
        }
    };

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
        const currentDates = getCurrentAgreementDates();

        const defaultFields = {
            ...currentDates,
            consumerName: '',
            consumerAddress: '',
            secondPartyName: 'SOLAREDGE INNOVATIONS',
            secondPartyAddress: '476/5, AYIROOR VARKALA ROAD, ELAKAMON, VARKALA 695310',
            paymentTerms: DEFAULT_PAYMENT_TERMS,
            firstPartySignName: '',
            secondPartySignName: 'SOLAREDGE INNOVATIONS',
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
                    windowWidth: 794,
                    windowHeight: 1123,
                    onclone: (clonedDoc, clonedEl) => {
                        clonedEl.style.transform = 'none';
                        clonedEl.style.position = 'static';
                        clonedEl.style.opacity = '1';
                        clonedEl.style.left = '0';
                        clonedEl.style.top = '0';
                        let p = clonedEl.parentElement;
                        while (p && p !== clonedDoc.body) {
                            p.style.transform = 'none';
                            p.style.position = 'static';
                            p.style.opacity = '1';
                            p.style.left = '0';
                            p.style.top = '0';
                            p = p.parentElement;
                        }
                    }
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

    if (isMobile) {
        return (
            <AgreementEditorMobile
                fields={fields}
                setFields={setFields}
                handleFieldChange={handleFieldChange}
                baseFontSize={baseFontSize}
                setFontSizeOffset={setFontSizeOffset}
                fontSizeOffset={fontSizeOffset}
                onReset={handleReset}
                onCopy={handleCopyText}
                onDownloadPdf={handleDownloadPdf}
                isGeneratingPdf={isGeneratingPdf}
                onSaveAgreement={handleSaveAgreement}
                isSavingAgreement={isSavingAgreement}
                associatedQuotation={associatedQuotation}
                onLogout={onLogout}
                onBack={onBack}
                onNavigate={onNavigate}
            />
        );
    }

    return (
        <div
            className="w-full flex flex-col font-sans bg-[#F4F6F9] min-h-[calc(100vh-60px)] h-[calc(100vh-60px)] overflow-hidden relative"
            data-lenis-prevent
        >
            {/* Associated Approved Quotation Banner */}
            {associatedQuotation && (
                <div className="no-print bg-emerald-50 border-b border-emerald-200/80 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                        <span>
                            Auto-populated from Approved Quotation <strong>#{associatedQuotation.ref_no}</strong> for <strong>{associatedQuotation.client_name}</strong> ({associatedQuotation.capacity}, ₹{associatedQuotation.total_amount}).
                        </span>
                    </div>
                    {onNavigate && (
                        <button
                            type="button"
                            onClick={() => onNavigate('approved-quotations')}
                            className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer"
                        >
                            <span>Back to Approved Quotations</span>
                            <ArrowRight size={12} />
                        </button>
                    )}
                </div>
            )}

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

                    {/* Save Agreement Button */}
                    <button
                        type="button"
                        onClick={handleSaveAgreement}
                        disabled={isSavingAgreement || isGeneratingPdf}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        title="Save agreement to database and mark application as Agreement Created"
                    >
                        {isSavingAgreement ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <Save size={15} />
                        )}
                        <span>{isSavingAgreement ? 'Saving...' : 'Save Agreement'}</span>
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
                        {[
                            { idx: 0, label: 'PAGE 1 OF 5 • ANNEXURE 2' },
                            { idx: 1, label: 'PAGE 2 OF 5 • UNDERTAKINGS (POINTS 1–4)' },
                            { idx: 2, label: 'PAGE 3 OF 5 • TECHNICAL STANDARDS & WARRANTIES (POINTS 5–13)' },
                            { idx: 3, label: 'PAGE 4 OF 5 • STANDARDS, DISPUTES & PERFORMANCE (POINTS 14–18)' },
                            { idx: 4, label: 'PAGE 5 OF 5 • PAYMENT TERMS & SIGNATURES' },
                        ].map(({ idx, label }) => (
                            <div key={`desktop-agreement-page-${idx}`} className="flex flex-col items-center gap-2">
                                <div className="no-print self-start flex items-center gap-2 bg-white/95 px-3 py-1 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-700 shadow-2xs">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>{label}</span>
                                </div>
                                <AgreementPageContent
                                    pageIdx={idx}
                                    fields={fields}
                                    baseFontSize={baseFontSize}
                                    isPrintable={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
