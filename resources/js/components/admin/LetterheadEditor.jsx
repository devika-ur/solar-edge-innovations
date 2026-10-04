import React, { useState, useEffect, useRef } from 'react';
import * as jspdfLib from 'jspdf';
import html2canvas from 'html2canvas-pro';
import toast from 'react-hot-toast';
import { 
    Download, 
    RotateCcw, 
    Trash2, 
    FileText, 
    Type, 
    AlignLeft, 
    AlignJustify, 
    Copy, 
    Sparkles, 
    Check,
    ZoomIn,
    ZoomOut,
    Scissors,
    Layers
} from 'lucide-react';
import { LetterheadEditorMobile } from './LetterheadEditorMobile';
import headerImg from '../../assets/header.jpeg';
import footerImg from '../../assets/footer.jpeg';
import paleBlueSolarEcoEmblem from '../../assets/Pale Blue Solar Eco Emblem.png';

const jsPDF = jspdfLib.jsPDF || jspdfLib.default?.jsPDF || jspdfLib.default;

const SAMPLE_LETTER_TEXT = `From
    Jose.s
    Solaredge Innovations
    Elakamon

To
    The executive engineer
    Electrical Division Attingal

Sub: Request letter for empanelment

Sir,

    Solaredge innovations Solar power system in elakamon has being, Solar power project for the part 2 year in various places of Kerala. We are very much interest to work with KSEB under solar subsidy scheme, launched by MNRE kindly verify the details attached and make process for registering National Roof Tope solar portal empanelment

5-10-2026                                                                    Thank and best request

Elakamon
                                                                                For Solaredge Innovations
                                                                                       Elakamon

                                                                                       Proprietor`;

export const LetterheadEditor = ({ onLogout, onBack, onNavigate }) => {
    // Screen responsiveness detection
    const [isMobile, setIsMobile] = useState(() => {
        return typeof window !== 'undefined' && window.innerWidth < 768;
    });

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Draft content state with localStorage backup
    const [content, setContent] = useState(() => {
        try {
            const saved = localStorage.getItem('solaredge_letterhead_draft');
            return saved !== null ? saved : SAMPLE_LETTER_TEXT;
        } catch {
            return SAMPLE_LETTER_TEXT;
        }
    });

    const [fontSize, setFontSize] = useState(14); // in px
    const [lineHeight, setLineHeight] = useState('1.75');
    const [fontFamily, setFontFamily] = useState('font-sans'); // 'font-sans' or 'font-serif'
    const [textAlign, setTextAlign] = useState('left'); // 'left' or 'justify'
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [copied, setCopied] = useState(false);
    const [previewScale, setPreviewScale] = useState(1);

    // Paginated content array
    const [pages, setPages] = useState([SAMPLE_LETTER_TEXT]);

    const measureContainerRef = useRef(null);
    const textareaRef = useRef(null);

    // Save draft to localStorage automatically
    useEffect(() => {
        try {
            localStorage.setItem('solaredge_letterhead_draft', content);
        } catch {
            // ignore localStorage quota errors
        }
    }, [content]);

    // Automatic Smart Pagination Engine
    // Measures text height and flows into Page 1, Page 2, Page 3 etc. without colliding with footer
    useEffect(() => {
        if (!measureContainerRef.current) {
            setPages([content]);
            return;
        }

        const measureEl = measureContainerRef.current;
        // 615px is the safe maximum vertical content height between header banner and footer banner
        const MAX_PAGE_HEIGHT_PX = 615;

        // Check for manual page break markers: "--- Page Break ---" or lines with "---"
        const manualSections = content.split(/\n\s*(?:---+|\*\*\*+|===+)\s*(?:page\s*break)?\s*(?:---+|\*\*\*+|===+)?\s*\n/i);

        const computedPages = [];

        manualSections.forEach((section) => {
            const rawLines = section.split('\n');
            let currentPageLines = [];

            const getTestHeight = (lines) => {
                measureEl.textContent = lines.join('\n') || ' ';
                return measureEl.offsetHeight;
            };

            for (let i = 0; i < rawLines.length; i++) {
                const line = rawLines[i];
                const testLines = [...currentPageLines, line];
                const h = getTestHeight(testLines);

                if (h <= MAX_PAGE_HEIGHT_PX) {
                    currentPageLines.push(line);
                } else {
                    // Line would cause page to overflow: push current page lines
                    if (currentPageLines.length > 0) {
                        computedPages.push(currentPageLines.join('\n'));
                        currentPageLines = [];
                    }

                    // Check if a single huge paragraph exceeds the page by itself
                    const singleLineHeight = getTestHeight([line]);
                    if (singleLineHeight > MAX_PAGE_HEIGHT_PX) {
                        const words = line.split(' ');
                        let currentChunkWords = [];
                        for (let w = 0; w < words.length; w++) {
                            const testChunk = [...currentChunkWords, words[w]];
                            if (getTestHeight([testChunk.join(' ')]) <= MAX_PAGE_HEIGHT_PX) {
                                currentChunkWords.push(words[w]);
                            } else {
                                if (currentChunkWords.length > 0) {
                                    computedPages.push(currentChunkWords.join(' '));
                                    currentChunkWords = [words[w]];
                                } else {
                                    currentChunkWords.push(words[w]);
                                }
                            }
                        }
                        if (currentChunkWords.length > 0) {
                            currentPageLines = [currentChunkWords.join(' ')];
                        }
                    } else {
                        currentPageLines.push(line);
                    }
                }
            }

            if (currentPageLines.length > 0) {
                computedPages.push(currentPageLines.join('\n'));
            }
        });

        setPages(computedPages.length > 0 ? computedPages : ['']);
    }, [content, fontSize, lineHeight, fontFamily]);

    // Handle Copy
    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success('Letter content copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Handle Reset to sample
    const handleReset = () => {
        setContent(SAMPLE_LETTER_TEXT);
        toast.success('Loaded sample empanelment letter!');
    };

    // Handle Clear
    const handleClear = () => {
        setContent('');
        toast.success('Editor cleared. Start typing your letter.');
    };

    // Insert Manual Page Break
    const handleInsertPageBreak = () => {
        if (!textareaRef.current) {
            setContent((prev) => prev + '\n\n--- Page Break ---\n\n');
            toast.success('Page break inserted!');
            return;
        }

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textBefore = content.substring(0, start);
        const textAfter = content.substring(end);
        const breakText = '\n\n--- Page Break ---\n\n';

        const newContent = textBefore + breakText + textAfter;
        setContent(newContent);
        toast.success('Page break inserted!');

        setTimeout(() => {
            textarea.focus();
            const newPos = start + breakText.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 50);
    };


    // Multi-page PDF Download Handler via html2canvas & jsPDF
    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);
        const totalPages = pages.length;
        const toastId = toast.loading(`Generating PDF (${totalPages} page${totalPages > 1 ? 's' : ''})...`);

        // Temporarily reset preview zoom scale to 1 for pixel-perfect PDF rendering
        const savedScale = previewScale;
        setPreviewScale(1);
        await new Promise((resolve) => setTimeout(resolve, 80));

        try {
            const pageElements = document.querySelectorAll('.letterhead-printable-sheet');
            if (pageElements.length === 0) {
                toast.error('No letterhead page found to generate PDF.', { id: toastId });
                return;
            }

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true,
            });

            for (let i = 0; i < pageElements.length; i++) {
                if (i > 0) {
                    pdf.addPage('a4', 'portrait');
                }

                const pageEl = pageElements[i];

                const canvas = await html2canvas(pageEl, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    onclone: (clonedDoc, clonedEl) => {
                        clonedEl.style.transform = 'none';
                        clonedEl.style.boxShadow = 'none';
                        clonedEl.style.margin = '0 auto';
                        let p = clonedEl.parentElement;
                        while (p && p !== clonedDoc.body) {
                            p.style.transform = 'none';
                            p = p.parentElement;
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            }
            
            const dateStr = new Date().toISOString().slice(0, 10);
            pdf.save(`SolarEdge_Letterhead_${dateStr}.pdf`);

            toast.success(`Letterhead PDF downloaded successfully!`, { id: toastId });
        } catch (err) {
            console.error('PDF generation error:', err);
            toast.error('Failed to generate PDF. Please try again.', { id: toastId });
        } finally {
            setPreviewScale(savedScale);
            setIsGeneratingPdf(false);
        }
    };

    // Word and character counts
    const charCount = content.length;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lineCount = content.split('\n').length;

    if (isMobile) {
        return (
            <LetterheadEditorMobile
                content={content}
                setContent={setContent}
                fontSize={fontSize}
                setFontSize={setFontSize}
                lineHeight={lineHeight}
                setLineHeight={setLineHeight}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                textAlign={textAlign}
                setTextAlign={setTextAlign}
                pages={pages}
                onInsertPageBreak={handleInsertPageBreak}
                onReset={handleReset}
                onClear={handleClear}
                onCopy={handleCopy}
                onDownloadPdf={handleDownloadPdf}
                isGeneratingPdf={isGeneratingPdf}
                onLogout={onLogout}
                onBack={onBack}
            />
        );
    }

    return (
        <div className="w-full flex flex-col font-sans bg-[#F4F6F9] min-h-[calc(100vh-135px)] h-[calc(100vh-135px)] overflow-hidden relative" data-lenis-prevent>
            {/* Invisible DOM measurement container */}
            <div
                ref={measureContainerRef}
                className="fixed -left-[9999px] top-0 pointer-events-none select-none invisible whitespace-pre-wrap break-words"
                style={{
                    width: '682px', // 210mm (~794px) minus px-14 padding (56px * 2 = 112px) = 682px
                    fontSize: `${fontSize}px`,
                    lineHeight: lineHeight,
                    fontFamily: fontFamily === 'font-serif' ? 'Georgia, Cambria, serif' : 'system-ui, -apple-system, sans-serif'
                }}
            />

            {/* Print Stylesheet */}
            <style>{`
                @media print {
                    *, *::before, *::after {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 0 !important;
                    }
                    header, footer, nav, .no-print, .letterhead-editor-controls, .page-header-badge {
                        display: none !important;
                    }
                    html, body, #root, #root > *, main, .w-full {
                        height: auto !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        background: white !important;
                    }
                    .letterhead-preview-area {
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        overflow: visible !important;
                        display: block !important;
                    }
                    .letterhead-printable-sheet {
                        width: 210mm !important;
                        height: 297mm !important;
                        min-height: 297mm !important;
                        max-height: 297mm !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        page-break-after: always !important;
                        break-after: page !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        overflow: hidden !important;
                        background: white !important;
                        transform: none !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                    }
                    .letterhead-printable-sheet:last-child,
                    .letterhead-printable-sheet:last-of-type {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }
                }
            `}</style>

            {/* Top Toolbar - Fixed header below admin tabs */}
            <div className="no-print shrink-0 bg-white border-b border-neutral-200/90 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xs z-30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                        <FileText size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base sm:text-lg font-black text-neutral-900 leading-tight">
                                Official Letterhead Creator
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-[#1A4D2E]">
                                <Layers size={12} />
                                {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 font-medium">
                            Type freely in the single text box. Overflowing lines automatically move to Page 2, Page 3, etc.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleInsertPageBreak}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-[#1A4D2E] bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl transition-all cursor-pointer"
                        title="Insert a page break at current cursor position"
                    >
                        <Scissors size={14} />
                        <span>Insert Page Break</span>
                    </button>

                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer"
                        title="Load official empanelment letter sample"
                    >
                        <RotateCcw size={14} />
                        <span>Sample</span>
                    </button>

                    <button
                        onClick={handleClear}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer"
                        title="Clear editor content"
                    >
                        <Trash2 size={14} />
                        <span>Clear</span>
                    </button>

                    <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer"
                        title="Copy text to clipboard"
                    >
                        {copied ? <Check size={14} className="text-[#1A4D2E]" /> : <Copy size={14} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#1A4D2E] hover:bg-[#143c24] active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        title="Download multi-page PDF"
                    >
                        <Download size={15} />
                        <span>{isGeneratingPdf ? 'Generating...' : `PDF (${pages.length}p)`}</span>
                    </button>
                </div>
            </div>

            {/* Split Screen Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                {/* Left Column: Editor Text Box & Typography Controls */}
                <div className="letterhead-editor-controls w-full lg:w-[480px] xl:w-[540px] 2xl:w-[600px] h-full border-b lg:border-b-0 lg:border-r border-neutral-200/90 bg-white flex flex-col shrink-0 p-4 sm:p-5 gap-3.5 overflow-hidden z-20">
                    {/* Formatting Controls Bar */}
                    <div className="shrink-0 bg-neutral-50 border border-neutral-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                        {/* Font Size */}
                        <div className="flex items-center gap-1.5">
                            <Type size={14} className="text-neutral-500" />
                            <span className="font-semibold text-neutral-600">Size:</span>
                            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5">
                                {[13, 14, 15, 16].map((sz) => (
                                    <button
                                        key={sz}
                                        onClick={() => setFontSize(sz)}
                                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                                            fontSize === sz
                                                ? 'bg-[#1A4D2E] text-white shadow-2xs'
                                                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                                        }`}
                                    >
                                        {sz}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Line Spacing */}
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-neutral-600">Spacing:</span>
                            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5">
                                {[
                                    { label: 'Normal', val: '1.6' },
                                    { label: 'Relaxed', val: '1.75' },
                                    { label: 'Spacious', val: '2.0' },
                                ].map((sp) => (
                                    <button
                                        key={sp.val}
                                        onClick={() => setLineHeight(sp.val)}
                                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                                            lineHeight === sp.val
                                                ? 'bg-[#1A4D2E] text-white shadow-2xs'
                                                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                                        }`}
                                    >
                                        {sp.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Font Family & Alignment */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5">
                                <button
                                    onClick={() => setFontFamily('font-sans')}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                        fontFamily === 'font-sans' ? 'bg-[#1A4D2E] text-white' : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                >
                                    Sans
                                </button>
                                <button
                                    onClick={() => setFontFamily('font-serif')}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold font-serif ${
                                        fontFamily === 'font-serif' ? 'bg-[#1A4D2E] text-white' : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                >
                                    Serif
                                </button>
                            </div>

                            <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-0.5">
                                <button
                                    onClick={() => setTextAlign('left')}
                                    className={`p-1 rounded ${
                                        textAlign === 'left' ? 'bg-[#1A4D2E] text-white' : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                    title="Align Left"
                                >
                                    <AlignLeft size={13} />
                                </button>
                                <button
                                    onClick={() => setTextAlign('justify')}
                                    className={`p-1 rounded ${
                                        textAlign === 'justify' ? 'bg-[#1A4D2E] text-white' : 'text-neutral-600 hover:bg-neutral-100'
                                    }`}
                                    title="Justify"
                                >
                                    <AlignJustify size={13} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* The Single Large Text Area */}
                    <div className="flex-1 min-h-0 flex flex-col gap-2">
                        <div className="shrink-0 flex items-center justify-between text-xs text-neutral-500">
                            <span className="font-semibold text-neutral-700 flex items-center gap-1">
                                <Sparkles size={13} className="text-emerald-600" />
                                Type your letter here:
                            </span>
                            <span className="font-mono text-[11px]">
                                {charCount} chars • {wordCount} words • {lineCount} lines • <strong className="text-[#1A4D2E]">{pages.length} {pages.length === 1 ? 'Page' : 'Pages'}</strong>
                            </span>
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type or paste your complete letter content here (From, To, Subject, Salutation, Body, and Signature)... When content exceeds one page, it will automatically move to Page 2, Page 3, etc. with official letterhead on every page!"
                            className="w-full flex-1 h-full min-h-0 p-4 sm:p-5 rounded-2xl border border-neutral-300 focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/20 bg-neutral-50/60 font-mono text-xs sm:text-sm text-neutral-800 leading-relaxed resize-none outline-none transition-all shadow-inner overflow-y-auto"
                            spellCheck={false}
                        />
                    </div>

                    <p className="shrink-0 text-[11px] text-neutral-400 leading-normal">
                        Tip: You can type freely — pages automatically break when full. To force a page break at a specific point, click <strong>Insert Page Break</strong>.
                    </p>
                </div>

                {/* Right Column: Live A4 Letterhead Preview (Multi-page stack) */}
                <div className="letterhead-preview-area flex-1 h-full bg-neutral-200/80 p-4 sm:p-8 overflow-y-auto flex flex-col items-center gap-8 z-10" data-lenis-prevent>
                    {/* Zoom / Scale bar */}
                    <div className="no-print sticky top-0 z-20 self-end flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-neutral-300 shadow-2xs text-xs font-semibold text-neutral-700">
                        <span className="text-neutral-500 font-medium">Zoom:</span>
                        <button
                            onClick={() => setPreviewScale((s) => Math.max(0.6, s - 0.1))}
                            className="p-1 hover:bg-neutral-100 rounded cursor-pointer"
                            title="Zoom Out"
                        >
                            <ZoomOut size={14} />
                        </button>
                        <span className="font-mono text-[11px] w-12 text-center font-bold">
                            {Math.round(previewScale * 100)}%
                        </span>
                        <button
                            onClick={() => setPreviewScale((s) => Math.min(1.4, s + 0.1))}
                            className="p-1 hover:bg-neutral-100 rounded cursor-pointer"
                            title="Zoom In"
                        >
                            <ZoomIn size={14} />
                        </button>
                        <button
                            onClick={() => setPreviewScale(1)}
                            className="ml-1 text-[10px] text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                        >
                            Reset
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
                        {pages.map((pageText, pageIdx) => (
                            <div key={`letterhead-page-${pageIdx}`} className="flex flex-col items-center gap-2">
                                {/* Page Indicator Badge */}
                                <div className="no-print page-header-badge self-start flex items-center gap-2 bg-white/95 px-3 py-1 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-700 shadow-2xs">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>PAGE {pageIdx + 1} OF {pages.length}</span>
                                </div>

                                {/* Printable A4 Sheet */}
                                <div
                                    id={`letterhead-sheet-${pageIdx}`}
                                    className="letterhead-printable-sheet w-[210mm] min-h-[297mm] h-[297mm] bg-white shadow-2xl print:shadow-none flex flex-col justify-between relative overflow-hidden box-border"
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
                                            {pageText || (
                                                <span className="text-neutral-300 italic select-none">
                                                    (Page {pageIdx + 1} content...)
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
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
