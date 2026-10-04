import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronLeft,
    Layers,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Undo2,
    Redo2,
    Plus,
    RotateCcw,
    Trash2,
    Copy,
    Printer,
    Eye,
    ZoomIn,
    ZoomOut,
    Download,
    Check,
    User,
    Menu,
    X,
    Loader2
} from 'lucide-react';
import { assets } from '../../assets/assets';
import headerImg from '../../assets/header.jpeg';
import footerImg from '../../assets/footer.jpeg';
import paleBlueSolarEcoEmblem from '../../assets/Pale Blue Solar Eco Emblem.png';
import toast from 'react-hot-toast';

export const LetterheadEditorMobile = ({
    content,
    setContent,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    fontFamily,
    setFontFamily,
    textAlign,
    setTextAlign,
    pages,
    onInsertPageBreak,
    onReset,
    onClear,
    onCopy,
    onDownloadPdf,
    isGeneratingPdf,
    onLogout,
    onBack
}) => {
    const [mobileTab, setMobileTab] = useState('edit'); // 'edit' or 'preview'
    const [selectedPageIdx, setSelectedPageIdx] = useState(0);
    const [mobileZoom, setMobileZoom] = useState(1);
    const [copied, setCopied] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Simple undo/redo history stacks
    const [history, setHistory] = useState([content]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const isHistoryUpdatingRef = useRef(false);

    const handleContentChange = (newVal) => {
        setContent(newVal);
        if (!isHistoryUpdatingRef.current) {
            setHistory((prev) => {
                const nextHistory = prev.slice(0, historyIndex + 1);
                return [...nextHistory, newVal];
            });
            setHistoryIndex((prev) => prev + 1);
        }
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            isHistoryUpdatingRef.current = true;
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setContent(history[newIndex]);
            setTimeout(() => {
                isHistoryUpdatingRef.current = false;
            }, 50);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            isHistoryUpdatingRef.current = true;
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setContent(history[newIndex]);
            setTimeout(() => {
                isHistoryUpdatingRef.current = false;
            }, 50);
        }
    };

    // Keep selected page index valid if pages count changes
    useEffect(() => {
        if (selectedPageIdx >= pages.length) {
            setSelectedPageIdx(Math.max(0, pages.length - 1));
        }
    }, [pages.length, selectedPageIdx]);

    const handleCopyText = () => {
        if (onCopy) {
            onCopy();
        } else {
            navigator.clipboard.writeText(content);
            toast.success("Text copied to clipboard!");
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    // Live counts
    const charCount = content.length;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lineCount = content.split('\n').length;

    // Calculate preview scale to fit mobile screen nicely
    // Standard A4 width is 794px. Mobile width is typically ~360px - 400px.
    // Base scale ~ 0.44 to 0.48 so the A4 sheet fits horizontally.
    const basePreviewScale = typeof window !== 'undefined'
        ? Math.min(0.55, Math.max(0.38, (window.innerWidth - 32) / 794))
        : 0.45;
    const effectiveScale = basePreviewScale * mobileZoom;

    return (
        <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-6">
            {/* Top Bar (Mobile Admin Header) */}
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

                {/* Right Profile & Menu */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onLogout}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer"
                        title="Admin Profile (Click to Logout)"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <User size={13} className="text-[#1A4D2E]" />
                        <span>admin</span>
                    </button>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                        title="Toggle Navigation Menu"
                    >
                        {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Dropdown if toggled (Floating on top with z-50, does NOT push content) */}
            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 top-[57px] bg-black/25 z-40 backdrop-blur-2xs"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="no-print fixed top-[57px] left-0 right-0 bg-white border-b border-neutral-200 shadow-2xl p-4 space-y-2 text-xs font-bold z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                if (onBack) onBack();
                            }}
                            className="w-full text-left py-2 px-3 rounded-lg hover:bg-neutral-100 text-neutral-700 cursor-pointer"
                        >
                            ← Back to Dashboard
                        </button>
                        <a
                            href="/admin/quotation"
                            className="block py-2 px-3 rounded-lg hover:bg-neutral-100 text-neutral-700"
                        >
                            Quotation Builder
                        </a>
                        <a
                            href="/admin/quotation-history"
                            className="block py-2 px-3 rounded-lg hover:bg-neutral-100 text-neutral-700"
                        >
                            Quotation History
                        </a>
                        <a
                            href="/admin/inquiries"
                            className="block py-2 px-3 rounded-lg hover:bg-neutral-100 text-neutral-700"
                        >
                            Enquiries
                        </a>
                        {onLogout && (
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onLogout();
                                }}
                                className="w-full text-left py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </>
            )}

            {/* Subheader: < Letterhead Creator + Page Count Badge */}
            <div className="no-print px-4 pt-3.5 pb-2 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1 text-sm font-black text-neutral-900 hover:text-[#1A4D2E] cursor-pointer"
                >
                    <ChevronLeft size={18} className="text-neutral-700" />
                    <span>Letterhead Creator</span>
                </button>

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#1A4D2E] text-xs font-bold">
                    <Layers size={13} />
                    <span>{pages.length} {pages.length === 1 ? 'Page' : 'Pages'}</span>
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
                    {/* Typography Dropdowns Row */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        {/* Font Size */}
                        <div>
                            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                                Font Size
                            </label>
                            <select
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-800 outline-none focus:border-[#1A4D2E] shadow-2xs"
                            >
                                <option value={13}>13</option>
                                <option value={14}>14</option>
                                <option value={15}>15</option>
                                <option value={16}>16</option>
                            </select>
                        </div>

                        {/* Line Spacing */}
                        <div>
                            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                                Line Spacing
                            </label>
                            <select
                                value={lineHeight}
                                onChange={(e) => setLineHeight(e.target.value)}
                                className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-800 outline-none focus:border-[#1A4D2E] shadow-2xs"
                            >
                                <option value="1.6">Normal</option>
                                <option value="1.75">Relaxed</option>
                                <option value="2.0">Spacious</option>
                            </select>
                        </div>

                        {/* Font Family */}
                        <div>
                            <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                                Font Family
                            </label>
                            <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="w-full bg-white border border-neutral-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-800 outline-none focus:border-[#1A4D2E] shadow-2xs"
                            >
                                <option value="font-sans">Roboto (Sans)</option>
                                <option value="font-serif">Serif</option>
                            </select>
                        </div>
                    </div>

                    {/* Alignment & Undo/Redo Toolbar */}
                    <div>
                        <label className="block text-[11px] font-bold text-neutral-600 mb-1.5">
                            Alignment
                        </label>
                        <div className="flex items-center justify-between gap-2">
                            {/* Alignment Button Group */}
                            <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-xl p-1 shadow-2xs">
                                <button
                                    type="button"
                                    onClick={() => setTextAlign('left')}
                                    className={`p-1.5 rounded-lg transition-all ${
                                        textAlign === 'left'
                                            ? 'bg-[#1A4D2E] text-white shadow-2xs'
                                            : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                    title="Align Left"
                                >
                                    <AlignLeft size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTextAlign('center')}
                                    className={`p-1.5 rounded-lg transition-all ${
                                        textAlign === 'center'
                                            ? 'bg-[#1A4D2E] text-white shadow-2xs'
                                            : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                    title="Align Center"
                                >
                                    <AlignCenter size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTextAlign('right')}
                                    className={`p-1.5 rounded-lg transition-all ${
                                        textAlign === 'right'
                                            ? 'bg-[#1A4D2E] text-white shadow-2xs'
                                            : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                    title="Align Right"
                                >
                                    <AlignRight size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTextAlign('justify')}
                                    className={`p-1.5 rounded-lg transition-all ${
                                        textAlign === 'justify'
                                            ? 'bg-[#1A4D2E] text-white shadow-2xs'
                                            : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                    title="Justify"
                                >
                                    <AlignJustify size={16} />
                                </button>
                            </div>

                            {/* Undo / Redo */}
                            <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-xl p-1 shadow-2xs">
                                <button
                                    type="button"
                                    onClick={handleUndo}
                                    disabled={historyIndex <= 0}
                                    className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                                    title="Undo"
                                >
                                    <Undo2 size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRedo}
                                    disabled={historyIndex >= history.length - 1}
                                    className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                                    title="Redo"
                                >
                                    <Redo2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Textarea Editor Box */}
                    <div className="flex-1 flex flex-col space-y-1">
                        <textarea
                            value={content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Type your letter content here..."
                            rows={14}
                            className="w-full flex-1 min-h-[300px] p-3.5 bg-white border border-neutral-300 rounded-2xl font-mono text-xs text-neutral-800 leading-relaxed outline-none focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20 shadow-inner resize-none"
                            spellCheck={false}
                        />

                        {/* Word / Char Counters */}
                        <div className="text-[11px] text-neutral-400 font-mono pt-1">
                            {charCount} characters • {wordCount} words • {lineCount} lines
                        </div>
                    </div>

                    {/* Middle Action Buttons (Insert Page Break, Sample, Clear) */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onInsertPageBreak}
                            className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-all cursor-pointer"
                        >
                            <Plus size={13} />
                            <span>Insert Page Break</span>
                        </button>

                        <button
                            type="button"
                            onClick={onReset}
                            className="inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                            <RotateCcw size={13} />
                            <span>Sample</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClear}
                            className="inline-flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                            <Trash2 size={13} />
                            <span>Clear</span>
                        </button>
                    </div>

                    {/* Bottom Action Bar: Copy, Print, Preview -> */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={handleCopyText}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-semibold transition-all cursor-pointer"
                        >
                            {copied ? <Check size={14} className="text-[#1A4D2E]" /> : <Copy size={14} />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-all cursor-pointer"
                        >
                            <Printer size={14} className="text-[#1A4D2E]" />
                            <span>Print</span>
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

            {/* TAB 2: PREVIEW */}
            {mobileTab === 'preview' && (
                <div className="px-4 py-2 space-y-4 flex-1 flex flex-col items-center">
                    {/* Page Selector & Zoom Controls Row */}
                    <div className="w-full flex items-center justify-between gap-2">
                        {/* Page selector dropdown */}
                        <div className="flex items-center gap-1.5 bg-white border border-neutral-300 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs font-bold text-neutral-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <select
                                value={selectedPageIdx}
                                onChange={(e) => setSelectedPageIdx(Number(e.target.value))}
                                className="bg-transparent outline-none cursor-pointer pr-1"
                            >
                                {pages.map((_, idx) => (
                                    <option key={idx} value={idx}>
                                        Page {idx + 1} of {pages.length}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-xl px-2 py-1 shadow-2xs text-xs font-semibold text-neutral-700">
                            <button
                                type="button"
                                onClick={() => setMobileZoom((z) => Math.max(0.7, z - 0.1))}
                                className="p-1 hover:bg-neutral-100 rounded cursor-pointer"
                                title="Zoom Out"
                            >
                                <ZoomOut size={14} />
                            </button>
                            <span className="font-mono text-[11px] w-10 text-center font-bold">
                                {Math.round(mobileZoom * 100)}%
                            </span>
                            <button
                                type="button"
                                onClick={() => setMobileZoom((z) => Math.min(1.5, z + 0.1))}
                                className="p-1 hover:bg-neutral-100 rounded cursor-pointer"
                                title="Zoom In"
                            >
                                <ZoomIn size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Scaled Letterhead Sheet Container */}
                    <div
                        className="w-full overflow-hidden flex flex-col items-center py-2 bg-neutral-200/60 rounded-3xl border border-neutral-300/80 shadow-inner"
                        style={{
                            minHeight: `${Math.round(1123 * effectiveScale + 30)}px`
                        }}
                    >
                        {/* Scale Wrapper */}
                        <div
                            style={{
                                width: '794px',
                                height: '1123px',
                                transform: `scale(${effectiveScale})`,
                                transformOrigin: 'top center',
                                marginBottom: `-${1123 * (1 - effectiveScale)}px`,
                                transition: 'transform 0.15s ease-out'
                            }}
                        >
                            {/* The Exact Printable Sheet corresponding to selectedPageIdx */}
                            <div
                                className="letterhead-printable-sheet w-[794px] h-[1123px] bg-white shadow-2xl flex flex-col justify-between relative overflow-hidden box-border"
                            >
                                {/* 1. Header Banner */}
                                <div className="w-full relative z-10 shrink-0">
                                    <img
                                        src={headerImg}
                                        alt="Solaredge Innovations Letterhead Header"
                                        className="w-full h-auto object-contain block select-none pointer-events-none"
                                    />
                                </div>

                                {/* 2. Soft Background Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none select-none z-0">
                                    <img
                                        src={paleBlueSolarEcoEmblem}
                                        alt="Solar Edge Watermark"
                                        className="w-[460px] h-[460px] object-contain"
                                    />
                                </div>

                                {/* 3. Live Letter Content Area */}
                                <div className="px-14 py-6 flex-1 flex flex-col relative z-10 text-neutral-900 justify-start">
                                    <div
                                        className={`w-full whitespace-pre-wrap ${fontFamily}`}
                                        style={{
                                            fontSize: `${fontSize}px`,
                                            lineHeight: lineHeight,
                                            textAlign: textAlign,
                                            fontFamily: fontFamily === 'font-serif' ? 'Georgia, Cambria, serif' : 'system-ui, -apple-system, sans-serif'
                                        }}
                                    >
                                        {pages[selectedPageIdx] || (
                                            <span className="text-neutral-300 italic select-none">
                                                (Page {selectedPageIdx + 1} content...)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* 4. Footer Banner */}
                                <div className="w-full relative z-10 shrink-0 mt-auto select-none pointer-events-none">
                                    <img
                                        src={footerImg}
                                        alt="Solaredge Innovations Letterhead Footer"
                                        className="w-full h-auto object-contain block"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar: <- Back to Edit | Download PDF */}
                    <div className="w-full grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={() => setMobileTab('edit')}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-all cursor-pointer"
                        >
                            <span>← Back to Edit</span>
                        </button>

                        <button
                            type="button"
                            onClick={onDownloadPdf}
                            disabled={isGeneratingPdf}
                            className="inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1A4D2E] text-white text-xs font-bold hover:bg-[#143c24] active:scale-98 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                            {isGeneratingPdf ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={15} />
                                    <span>Download PDF ({pages.length}p)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
