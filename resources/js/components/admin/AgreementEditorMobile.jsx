import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronLeft,
    Layers,
    RotateCcw,
    Copy,
    Download,
    Check,
    User,
    Loader2,
    Eye,
    Edit3,
    Sparkles,
    Calendar,
    FileSignature,
    CreditCard,
    Building2
} from 'lucide-react';
import { assets } from '../../assets/assets';
import { AgreementPageContent } from './AgreementPageContent';
import toast from 'react-hot-toast';

export const AgreementEditorMobile = ({
    fields,
    handleFieldChange,
    baseFontSize = 14,
    setFontSizeOffset,
    onReset,
    onCopy,
    onDownloadPdf,
    isGeneratingPdf = false,
    onLogout,
    onBack,
}) => {
    const [mobileTab, setMobileTab] = useState('edit'); // 'edit' or 'preview'
    const [copied, setCopied] = useState(false);

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
        if (mobileTab !== 'preview') return;

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
    }, [mobileTab, fields, baseFontSize]);

    const currentScale = previewZoom === 'fit' ? fitScale : 1.0;

    const handleCopyText = () => {
        if (onCopy) {
            onCopy();
        } else {
            const fullText = `Annexure 2\nModel Draft Agreement between Consumer & Vendor for installation of grid connected rooftop solar (RTS) project under PM – Surya Ghar: Muft Bijli Yojana\n\nThis agreement is executed on ${fields.executionDay || '------'} (Day) ${fields.executionMonth || '------'} (Month) ${fields.executionYear || '------'} (Year) for design, supply, installation, commissioning and 5-year comprehensive maintenance of RTS project/system along with warranty under PM Surya Ghar: Muft Bijli Yojana\n\nBetween\n${fields.consumerName} having address at ${fields.consumerAddress}\n\nAnd\n${fields.secondPartyName} having registered office at ${fields.secondPartyAddress}`;
            navigator.clipboard.writeText(fullText);
            toast.success("Agreement text copied to clipboard!");
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const pages = [
        { idx: 0, label: 'PAGE 1 OF 5 • ANNEXURE 2' },
        { idx: 1, label: 'PAGE 2 OF 5 • UNDERTAKINGS (POINTS 1–4)' },
        { idx: 2, label: 'PAGE 3 OF 5 • TECHNICAL STANDARDS & WARRANTIES (POINTS 5–13)' },
        { idx: 3, label: 'PAGE 4 OF 5 • STANDARDS, DISPUTES & PERFORMANCE (POINTS 14–18)' },
        { idx: 4, label: 'PAGE 5 OF 5 • PAYMENT TERMS & SIGNATURES' },
    ];

    return (
        <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-6">
            {/* Top Bar (Mobile Admin Header) - Clean without 3-dots or hamburger */}
            <div className="no-print bg-white px-4 py-3 border-b border-neutral-200/90 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
                {/* Brand Logo */}
                <div className="flex items-center gap-2">
                    <img
                        src={assets.logo}
                        alt="Solaredge Innovations"
                        className="h-9 w-auto object-contain"
                    />
                    <div>
                        <div className="text-sm font-black text-neutral-900 leading-tight">
                            Solaredge
                        </div>
                        <div className="text-[11px] font-bold text-[#1A4D2E] leading-tight">
                            Innovations
                        </div>
                    </div>
                </div>

                {/* Right Profile */}
                <div className="flex items-center">
                    <button
                        onClick={onLogout}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer"
                        title="Admin Profile (Click to Logout)"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <User size={13} className="text-[#1A4D2E]" />
                        <span>admin</span>
                    </button>
                </div>
            </div>

            {/* Subheader: < Agreement Creator + Annexure 2 • 5 Pages Badge */}
            <div className="no-print px-4 pt-3.5 pb-2 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-sm font-black text-neutral-900 hover:text-[#1A4D2E] cursor-pointer"
                >
                    <ChevronLeft size={18} className="text-neutral-700" />
                    <span>Agreement Creator</span>
                </button>

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#1A4D2E] text-xs font-bold">
                    <Layers size={13} />
                    <span>Annexure 2 • 5 Pages</span>
                </div>
            </div>

            {/* Segmented Control: [ Edit Content ] | [ Preview ] */}
            <div className="no-print px-4 py-2">
                <div className="grid grid-cols-2 bg-neutral-200/70 p-1 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setMobileTab('edit')}
                        className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                            mobileTab === 'edit'
                                ? 'bg-[#1A4D2E] text-white shadow-xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        Edit Content
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileTab('preview')}
                        className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                            mobileTab === 'preview'
                                ? 'bg-[#1A4D2E] text-white shadow-xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        Preview
                    </button>
                </div>
            </div>

            {/* TAB 1: EDIT CONTENT */}
            {mobileTab === 'edit' && (
                <div className="px-4 py-2 space-y-4 flex-1 flex flex-col">
                    {/* Font Size Row */}
                    <div className="flex items-center justify-between bg-white border border-neutral-200/90 rounded-2xl p-3 shadow-2xs">
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-[#1A4D2E]" />
                            <span className="text-xs font-bold text-neutral-800">Body Font Size</span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-xl border border-neutral-200">
                            <button
                                type="button"
                                onClick={() => setFontSizeOffset(prev => Math.max(-2, prev - 0.5))}
                                className="px-2.5 py-1 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-lg cursor-pointer"
                                title="Decrease font size"
                            >
                                A-
                            </button>
                            <span className="text-xs font-mono font-bold px-1.5 text-neutral-800">
                                {baseFontSize}px
                            </span>
                            <button
                                type="button"
                                onClick={() => setFontSizeOffset(prev => Math.min(2, prev + 0.5))}
                                className="px-2.5 py-1 text-xs font-bold text-neutral-600 hover:text-neutral-900 rounded-lg cursor-pointer"
                                title="Increase font size"
                            >
                                A+
                            </button>
                        </div>
                    </div>

                    {/* Section 1: Agreement Execution Date */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D2E]">
                            <Calendar size={14} />
                            <span>Agreement Execution Date</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Day</label>
                                <input
                                    type="text"
                                    value={fields.executionDay || ''}
                                    onChange={(e) => handleFieldChange('executionDay', e.target.value)}
                                    placeholder="03"
                                    className="w-full px-2.5 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Month</label>
                                <input
                                    type="text"
                                    value={fields.executionMonth || ''}
                                    onChange={(e) => handleFieldChange('executionMonth', e.target.value)}
                                    placeholder="November"
                                    className="w-full px-2.5 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Year</label>
                                <input
                                    type="text"
                                    value={fields.executionYear || ''}
                                    onChange={(e) => handleFieldChange('executionYear', e.target.value)}
                                    placeholder="2026"
                                    className="w-full px-2.5 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: First Party (Consumer) */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D2E]">
                            <User size={14} />
                            <span>First Party (Consumer / Purchaser / Owner)</span>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Consumer Full Name</label>
                            <input
                                type="text"
                                value={fields.consumerName || ''}
                                onChange={(e) => handleFieldChange('consumerName', e.target.value)}
                                placeholder="SUNIL"
                                className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Consumer Complete Address</label>
                            <textarea
                                rows={2}
                                value={fields.consumerAddress || ''}
                                onChange={(e) => handleFieldChange('consumerAddress', e.target.value)}
                                placeholder="Complete residential address with PIN code"
                                className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Section 3: Second Party (Vendor) */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D2E]">
                            <Building2 size={14} />
                            <span>Second Party (Vendor / System Integrator)</span>
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Company / Vendor Name</label>
                            <input
                                type="text"
                                value={fields.secondPartyName || ''}
                                onChange={(e) => handleFieldChange('secondPartyName', e.target.value)}
                                placeholder="SOLAREDGE INNOVATIONS"
                                className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Registered Office Address</label>
                            <textarea
                                rows={2}
                                value={fields.secondPartyAddress || ''}
                                onChange={(e) => handleFieldChange('secondPartyAddress', e.target.value)}
                                placeholder="476/5, AYIROOR VARKALA ROAD, ELAKAMON, VARKALA 695310"
                                className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none resize-none leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Section 4: Clause 19 Terms of Payment */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D2E]">
                            <CreditCard size={14} />
                            <span>Clause 19: Mutually Agreed Terms of Payment</span>
                        </div>
                        <textarea
                            rows={4}
                            value={fields.paymentTerms || ''}
                            onChange={(e) => handleFieldChange('paymentTerms', e.target.value)}
                            placeholder="Enter payment milestones and schedule..."
                            className="w-full px-3 py-2 text-xs font-medium border border-neutral-300 rounded-xl bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E] outline-none resize-none leading-relaxed font-sans"
                        />
                    </div>

                    {/* Section 5: Signatories & Dates */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#1A4D2E]">
                            <FileSignature size={14} />
                            <span>Signatories & Dates (Page 5)</span>
                        </div>
                        <div className="space-y-3">
                            {/* First party signatory */}
                            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                                <p className="text-[11px] font-bold text-[#1A4D2E] uppercase">First Party (Consumer)</p>
                                <div>
                                    <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Signatory Name</label>
                                    <input
                                        type="text"
                                        value={fields.firstPartySignName || ''}
                                        onChange={(e) => handleFieldChange('firstPartySignName', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:border-[#1A4D2E] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Sign Date</label>
                                    <input
                                        type="text"
                                        value={fields.firstPartySignDate || ''}
                                        onChange={(e) => handleFieldChange('firstPartySignDate', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:border-[#1A4D2E] outline-none font-mono text-[11px]"
                                    />
                                </div>
                            </div>

                            {/* Second party signatory */}
                            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                                <p className="text-[11px] font-bold text-[#1A4D2E] uppercase">Second Party (Vendor)</p>
                                <div>
                                    <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Signatory Name</label>
                                    <input
                                        type="text"
                                        value={fields.secondPartySignName || ''}
                                        onChange={(e) => handleFieldChange('secondPartySignName', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:border-[#1A4D2E] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-neutral-500 mb-0.5">Sign Date</label>
                                    <input
                                        type="text"
                                        value={fields.secondPartySignDate || ''}
                                        onChange={(e) => handleFieldChange('secondPartySignDate', e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg focus:border-[#1A4D2E] outline-none font-mono text-[11px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar: Reset, Copy, Preview -> */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={onReset}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                            <RotateCcw size={14} />
                            <span>Reset</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCopyText}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-all cursor-pointer"
                        >
                            {copied ? <Check size={14} className="text-[#1A4D2E]" /> : <Copy size={14} />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMobileTab('preview')}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1A4D2E] text-white text-xs font-bold hover:bg-[#143c24] active:scale-98 transition-all cursor-pointer shadow-xs"
                        >
                            <Eye size={14} />
                            <span>Preview →</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════
                TAB 2: SCROLLABLE PREVIEW (Matches Quotation Builder UI)
                - Full 5-page continuous vertical scroll stack
                - Placed offscreen when editing for instant print/PDF export
            ════════════════════════════════════════════════════════════ */}
            <div
                id="agreement-mobile-preview-mount"
                className={
                    mobileTab === 'preview'
                        ? 'flex-1 flex flex-col bg-neutral-300/80 preview-screen-view'
                        : 'mobile-preview-hidden-container'
                }
                style={
                    mobileTab === 'preview'
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
                {mobileTab === 'preview' && (
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
                                        ? 'bg-[#1A4D2E] text-white shadow-xs'
                                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80'
                                }`}
                            >
                                {previewZoom === 'fit' ? `Fit (${Math.round(fitScale * 100)}%)` : '100%'}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setMobileTab('edit')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                        >
                            <Edit3 size={13} />
                            <span>Edit Form</span>
                        </button>
                    </div>
                )}

                {/* Scaled A4 Preview Container with continuous vertical scroll */}
                <div
                    ref={previewContainerRef}
                    className={
                        mobileTab === 'preview'
                            ? 'w-full flex-1 overflow-x-auto overflow-y-auto pt-4 pb-28 px-2 flex flex-col items-center'
                            : 'w-[794px]'
                    }
                >
                    <div
                        className="preview-scale-wrapper"
                        style={
                            mobileTab === 'preview'
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
                            className="preview-scaled-content flex flex-col items-center gap-8 shadow-xl print:shadow-none"
                            style={
                                mobileTab === 'preview'
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
                            {pages.map(({ idx, label }) => (
                                <div key={`mobile-agreement-page-${idx}`} className="flex flex-col items-center gap-2">
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

                {/* Bottom Preview Quick Action Bar */}
                {mobileTab === 'preview' && (
                    <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-3 z-30 shadow-lg flex items-center justify-between gap-3 max-w-md mx-auto mobile-action-bar no-print">
                        <button
                            type="button"
                            onClick={() => setMobileTab('edit')}
                            className="flex-1 py-3 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Edit3 size={15} />
                            <span>Edit Details</span>
                        </button>
                        <button
                            type="button"
                            onClick={onDownloadPdf}
                            disabled={isGeneratingPdf}
                            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs bg-[#1A4D2E] hover:bg-[#143c24] disabled:opacity-50"
                        >
                            {isGeneratingPdf ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={15} />
                                    <span>Download PDF (5p)</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
