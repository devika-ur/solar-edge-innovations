import React, { useState, useEffect, useRef } from 'react';
import * as jspdfLib from 'jspdf';
import html2canvas from 'html2canvas-pro'; // npm i html2canvas-pro  (handles Tailwind v4 oklch colors)

// Resilient constructor resolution across ESM / Vite / CJS bundling
const jsPDF = jspdfLib.jsPDF || jspdfLib.default?.jsPDF || jspdfLib.default;
import { defaultQuotationData } from '../../data/defaultQuotationData';
import { QuotationFormControls } from './QuotationFormControls';
import { QuotationPreview6Pages } from './QuotationPreview6Pages';
import { QuotationEditorMobile } from './QuotationEditorMobile';
import { SaveQuotationModal } from './SaveQuotationModal';
import {
    FileText,
    Layers,
    RotateCcw,
    Save,
    Download,
    Loader2,
    User,
    Sliders,
    Wrench,
    DollarSign,
    Shield,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const QuotationEditor = ({ onLogout, onBack, onNavigate }) => {
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
    // Load initial quotation data from localStorage or default
    const [quotationData, setQuotationData] = useState(() => {
        const saved = localStorage.getItem('solar_quotation_data');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse saved quotation data", e);
            }
        }
        return defaultQuotationData;
    });

    // Active tab state & bidirectional scroll synchronization
    const [activeTab, setActiveTab] = useState('client');
    const activeTabRef = useRef('client');
    const isProgrammaticScrollRef = useRef(false);
    const scrollTimeoutRef = useRef(null);
    const rightPanelRef = useRef(null);

    // Synchronize document.title with Client Name and Date so browser "Save as PDF" / Print uses it automatically
    useEffect(() => {
        const originalTitle = document.title;
        const client = quotationData.clientInfo?.name ? quotationData.clientInfo.name.trim() : 'Client';
        const date = quotationData.date ? quotationData.date.trim().replace(/[/\\?%*:|"<>]/g, '-') : '';
        document.title = date ? `Quotation - ${client} - ${date}` : `Quotation - ${client}`;

        return () => {
            document.title = originalTitle;
        };
    }, [quotationData.clientInfo?.name, quotationData.date]);

    // Handle clicking a tab on the left: switch tab and smoothly scroll right preview to that section
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        activeTabRef.current = tabId;

        const panel = rightPanelRef.current;
        const targetEl = document.getElementById(`preview-page-${tabId}`);
        if (targetEl && panel) {
            isProgrammaticScrollRef.current = true;
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            const panelRect = panel.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();
            const targetScrollTop = panel.scrollTop + (targetRect.top - panelRect.top) - 16;

            panel.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: 'smooth'
            });

            // Unlock manual scroll detection after smooth scroll settles
            scrollTimeoutRef.current = setTimeout(() => {
                isProgrammaticScrollRef.current = false;
            }, 850);
        }
    };

    // Watch right preview manual scroll and automatically switch left tabs
    useEffect(() => {
        const panel = rightPanelRef.current;
        if (!panel) return;

        let rafId = null;

        const handleScroll = () => {
            if (isProgrammaticScrollRef.current) return;

            if (rafId) {
                cancelAnimationFrame(rafId);
            }

            rafId = requestAnimationFrame(() => {
                if (isProgrammaticScrollRef.current) return;

                const scrollTop = panel.scrollTop;
                const scrollHeight = panel.scrollHeight;
                const clientHeight = panel.clientHeight;

                // Scrolled to topmost area -> Client & Ref
                if (scrollTop <= 80) {
                    if (activeTabRef.current !== 'client') {
                        activeTabRef.current = 'client';
                        setActiveTab('client');
                    }
                    return;
                }

                // Scrolled to bottommost area -> Terms & Warranty
                if (scrollTop + clientHeight >= scrollHeight - 60) {
                    if (activeTabRef.current !== 'terms') {
                        activeTabRef.current = 'terms';
                        setActiveTab('terms');
                    }
                    return;
                }

                const pages = panel.querySelectorAll('.quotation-page[data-section]');
                if (!pages || pages.length === 0) return;

                const panelRect = panel.getBoundingClientRect();
                // Focal detection line at 35% from the top of visible viewport
                const focalLine = panelRect.top + panelRect.height * 0.35;

                let currentSection = null;

                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    const rect = page.getBoundingClientRect();

                    if (rect.top <= focalLine && rect.bottom > focalLine) {
                        currentSection = page.getAttribute('data-section');
                        break;
                    }
                }

                // If in-between page gap, find page whose top is closest to the focal line
                if (!currentSection) {
                    let minDiff = Infinity;
                    pages.forEach((page) => {
                        const rect = page.getBoundingClientRect();
                        const diff = Math.abs(rect.top - focalLine);
                        if (diff < minDiff) {
                            minDiff = diff;
                            currentSection = page.getAttribute('data-section');
                        }
                    });
                }

                if (currentSection && activeTabRef.current !== currentSection) {
                    activeTabRef.current = currentSection;
                    setActiveTab(currentSection);
                }
            });
        };

        // Cancel programmatic lock immediately if the user interacts manually with wheel or touch
        const cancelProgrammatic = () => {
            if (isGeneratingPdfRef.current) return;
            if (isProgrammaticScrollRef.current) {
                isProgrammaticScrollRef.current = false;
                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            }
        };

        panel.addEventListener('scroll', handleScroll, { passive: true });
        panel.addEventListener('wheel', cancelProgrammatic, { passive: true });
        panel.addEventListener('touchstart', cancelProgrammatic, { passive: true });

        return () => {
            panel.removeEventListener('scroll', handleScroll);
            panel.removeEventListener('wheel', cancelProgrammatic);
            panel.removeEventListener('touchstart', cancelProgrammatic);
            if (rafId) cancelAnimationFrame(rafId);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        };
    }, []);

    // Modal & saving states for database quotation history
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSavingToBackend, setIsSavingToBackend] = useState(false);
    const [saveProgress, setSaveProgress] = useState("");

    // Open save confirmation modal popup
    const handleSave = () => {
        setIsSaveModalOpen(true);
    };

    // Helper: capture 6-page A4 preview and render jsPDF document
    const generatePdfDocument = async (onProgress) => {
        try {
            const pages = document.querySelectorAll('.quotation-preview-container .quotation-page, .quotation-page');
            if (!pages || pages.length === 0) {
                return null;
            }

            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = 210;
            const pdfHeight = 297;

            for (let i = 0; i < pages.length; i++) {
                if (onProgress) onProgress(`Page ${i + 1}/${pages.length}`);

                const pageEl = pages[i];

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
                    },
                    ignoreElements: (el) => {
                        if (!el) return false;
                        if (el.classList?.contains('quotation-page')) return false;
                        return (
                            el.getAttribute?.('role') === 'status' ||
                            el.getAttribute?.('aria-live') === 'polite' ||
                            el.closest?.('[role="status"]') !== null ||
                            el.closest?.('[aria-live="polite"]') !== null ||
                            el.classList?.contains('toast-notification') ||
                            el.classList?.contains('no-print')
                        );
                    }
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                if (i > 0) {
                    pdf.addPage('a4', 'portrait');
                }
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            }

            return pdf;
        } catch (err) {
            console.error("Error in generatePdfDocument:", err);
            return null;
        }
    };

    // Confirm save from popup modal and post to backend database
    const handleConfirmSave = async () => {
        setIsSavingToBackend(true);
        setSaveProgress("Generating PDF...");

        try {
            let pdfBlob = null;
            let pdfBase64 = null;
            try {
                const pdf = await generatePdfDocument((p) => setSaveProgress(`Exporting ${p}...`));
                if (pdf) {
                    pdfBlob = pdf.output('blob');
                    pdfBase64 = pdf.output('datauristring');
                }
            } catch (pdfErr) {
                console.warn("Could not generate PDF blob during save:", pdfErr);
            }

            setSaveProgress("Saving to backend...");

            const formData = new FormData();
            const clientClean = (quotationData.clientInfo?.name || 'Client')
                .trim()
                .replace(/[/\\?%*:|"<>]/g, '')
                .replace(/\s+/g, '_');
            const dateClean = (quotationData.date || '')
                .trim()
                .replace(/[/\\?%*:|"<>]/g, '-')
                .replace(/\s+/g, '_');

            const fileName = `Quotation_${clientClean || 'client'}_${dateClean || Date.now()}.pdf`;
            if (pdfBlob) {
                formData.append('pdf_file', pdfBlob, fileName);
            }
            if (pdfBase64) {
                formData.append('pdf_base64', pdfBase64);
            }

            formData.append('client_name', quotationData.clientInfo?.name || 'Unnamed Client');
            formData.append('client_phone', quotationData.clientInfo?.contactNo || '');
            formData.append('client_address', quotationData.clientInfo?.address || '');
            formData.append('capacity', quotationData.clientInfo?.capacity || '');
            formData.append('system_type', quotationData.clientInfo?.type || '');
            formData.append('total_amount', quotationData.pricing?.totalPayable || '');
            formData.append('ref_no', quotationData.refNo || '');
            formData.append('quotation_date', quotationData.date || '');

            const res = await fetch('/api/admin-quotations.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await res.json();
            if (res.ok && data.success) {
                // Clear the form fields for the next quotation
                const today = new Date();
                const day = String(today.getDate()).padStart(2, '0');
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const year = today.getFullYear();
                const formattedDate = `${day}/${month}/${year}`;

                const clearedData = {
                    ...defaultQuotationData,
                    refNo: '',
                    date: formattedDate,
                    clientInfo: {
                        name: '',
                        address: '',
                        contactNo: '',
                        capacity: '',
                        type: 'ON GRID'
                    },
                    pricing: {
                        ...defaultQuotationData.pricing,
                        headerTitle: '',
                        totalPayable: '',
                        amountInWords: ''
                    }
                };

                setQuotationData(clearedData);
                localStorage.removeItem('solar_quotation_data');
                setActiveTab('client');
                activeTabRef.current = 'client';
                if (rightPanelRef.current) {
                    rightPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
                setIsSaveModalOpen(false);

                toast.success((t) => (
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs">Quotation saved & form cleared!</span>
                        {onNavigate && (
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    onNavigate('quotation-history');
                                }}
                                className="px-3 py-1 bg-[#1A4D2E] hover:bg-[#143c24] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                                View History
                            </button>
                        )}
                    </div>
                ), { duration: 5000 });
            } else {
                toast.error(data.message || "Failed to save quotation to history.");
            }
        } catch (err) {
            console.error("Save quotation error:", err);
            toast.error("Network error saving quotation to history.");
        } finally {
            setIsSavingToBackend(false);
            setSaveProgress("");
        }
    };

    // Clear form fields for entering a fresh quotation
    const handleClearForm = () => {
        if (window.confirm("Are you sure you want to clear all client and pricing fields for a new quotation?")) {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            const formattedDate = `${day}/${month}/${year}`;

            const clearedData = {
                ...defaultQuotationData,
                refNo: '',
                date: formattedDate,
                clientInfo: {
                    name: '',
                    address: '',
                    contactNo: '',
                    capacity: '',
                    type: 'ON GRID'
                },
                pricing: {
                    ...defaultQuotationData.pricing,
                    headerTitle: '',
                    totalPayable: '',
                    amountInWords: ''
                }
            };

            setQuotationData(clearedData);
            localStorage.removeItem('solar_quotation_data');
            setActiveTab('client');
            activeTabRef.current = 'client';
            if (rightPanelRef.current) {
                rightPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
            toast.success("Quotation form cleared.");
        }
    };

    // Reset to initial default template
    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all fields to the default 6-page template?")) {
            setQuotationData(defaultQuotationData);
            localStorage.removeItem('solar_quotation_data');
            toast.success("Reset to default template values.");
        }
    };

    const isGeneratingPdfRef = useRef(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfProgress, setPdfProgress] = useState("");

    // Generate & Download PDF directly to user's device
    const handleGeneratePdf = async () => {
        if (isGeneratingPdfRef.current || isGeneratingPdf) return;

        isGeneratingPdfRef.current = true;
        isProgrammaticScrollRef.current = true;
        setIsGeneratingPdf(true);
        setPdfProgress("Starting...");

        try {
            const pdf = await generatePdfDocument((p) => setPdfProgress(p));
            if (!pdf) {
                window.print();
                return;
            }

            setPdfProgress("Saving...");
            const clientClean = (quotationData.clientInfo?.name || 'Client')
                .trim()
                .replace(/[/\\?%*:|"<>]/g, '')
                .replace(/\s+/g, '_');

            const dateClean = (quotationData.date || '')
                .trim()
                .replace(/[/\\?%*:|"<>]/g, '-')
                .replace(/\s+/g, '_');

            const fileName = dateClean
                ? `Quotation_${clientClean}_${dateClean}.pdf`
                : `Quotation_${clientClean}.pdf`;

            pdf.save(fileName);
            toast.success("Quotation PDF downloaded successfully!");
        } catch (err) {
            console.error("PDF generation failed, falling back to window.print()", err);
            toast.error("Automatic PDF download failed. Opening print view...");
            window.print();
        } finally {
            isGeneratingPdfRef.current = false;
            isProgrammaticScrollRef.current = false;
            setIsGeneratingPdf(false);
            setPdfProgress("");
        }
    };

    if (isMobile) {
        return (
            <div className="w-full min-h-screen bg-[#F8FAFC] font-sans" data-lenis-prevent>
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

                        /* Hide non-printable UI elements */
                        header, footer, nav, button, .no-print,
                        .mobile-nav-bar, .mobile-action-bar, .mobile-details-form, .mobile-form-view, .preview-controls-bar,
                        .toast-notification, [role="status"], [aria-live="polite"] {
                            display: none !important;
                        }

                        html, body, #root, #root > *, main, .w-full, .h-screen, .min-h-screen {
                            height: auto !important;
                            min-height: 0 !important;
                            max-height: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: visible !important;
                            background: white !important;
                        }

                        #quotation-mobile-preview-mount,
                        .preview-screen-view,
                        .mobile-preview-hidden-container,
                        .quotation-mobile-preview-root,
                        .preview-scale-wrapper,
                        .preview-scaled-content,
                        .quotation-preview-container {
                            width: 210mm !important;
                            max-width: 210mm !important;
                            min-width: 210mm !important;
                            height: auto !important;
                            margin: 0 auto !important;
                            padding: 0 !important;
                            gap: 0 !important;
                            overflow: visible !important;
                            background: white !important;
                            display: block !important;
                            position: static !important;
                            transform: none !important;
                            opacity: 1 !important;
                            left: auto !important;
                            top: auto !important;
                            visibility: visible !important;
                        }

                        .quotation-page {
                            width: 210mm !important;
                            min-width: 210mm !important;
                            max-width: 210mm !important;
                            height: 296mm !important;
                            min-height: 296mm !important;
                            max-height: 296mm !important;
                            margin: 0 auto !important;
                            padding: 0 !important;
                            box-shadow: none !important;
                            border: none !important;
                            page-break-after: always !important;
                            break-after: page !important;
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                            overflow: hidden !important;
                            box-sizing: border-box !important;
                            background: white !important;
                            transform: none !important;
                            position: relative !important;
                            display: flex !important;
                            flex-direction: column !important;
                            justify-content: space-between !important;
                        }

                        .quotation-preview-container > .quotation-page:last-child,
                        .quotation-preview-container > .quotation-page:last-of-type,
                        .quotation-page:last-child,
                        .quotation-page:last-of-type,
                        .quotation-page.page-break-after-avoid,
                        .page-break-after-avoid {
                            page-break-after: avoid !important;
                            break-after: avoid !important;
                            margin-bottom: 0 !important;
                            padding-bottom: 0 !important;
                        }
                    }
                `}</style>
                <QuotationEditorMobile
                    data={quotationData}
                    onChange={setQuotationData}
                    onSave={handleSave}
                    onReset={handleReset}
                    onClear={handleClearForm}
                    onGeneratePdf={handleGeneratePdf}
                    isGeneratingPdf={isGeneratingPdf}
                    pdfProgress={pdfProgress}
                    onLogout={onLogout}
                    onBack={onBack}
                />
                <SaveQuotationModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onConfirm={handleConfirmSave}
                    quotationData={quotationData}
                    isSaving={isSavingToBackend}
                    saveProgress={saveProgress}
                />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col font-sans bg-neutral-100 min-h-[calc(100vh-135px)] h-[calc(100vh-135px)] overflow-hidden relative" data-lenis-prevent>
            {/* Print Stylesheet Injection */}
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

                    /* Hide non-printable UI elements */
                    header, footer, nav, .no-print, .quotation-editor-left-panel, button, .toast-notification, [role="status"] {
                        display: none !important;
                    }

                    html, body, #root, #root > *, main, .w-full, .h-screen {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        background: white !important;
                    }

                    .quotation-preview-right-panel {
                        width: 210mm !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        background: white !important;
                        display: block !important;
                    }

                    .quotation-preview-container {
                        width: 210mm !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        gap: 0 !important;
                        overflow: visible !important;
                        background: white !important;
                        display: block !important;
                    }

                    .quotation-page {
                        width: 210mm !important;
                        height: 296mm !important;
                        min-height: 296mm !important;
                        max-height: 296mm !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        page-break-after: always;
                        break-after: page;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                        background: white !important;
                    }

                    /* Last page never breaks after, preventing an extra blank page */
                    .quotation-preview-container > .quotation-page:last-child,
                    .quotation-preview-container > .quotation-page:last-of-type,
                    .quotation-page:last-child,
                    .quotation-page:last-of-type,
                    .quotation-page.page-break-after-avoid,
                    .page-break-after-avoid {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                        margin-bottom: 0 !important;
                        padding-bottom: 0 !important;
                    }
                }
            `}</style>

            {/* Top Toolbar (Matching Official Letterhead Creator Layout) */}
            <div className="no-print bg-white border-b border-neutral-200/90 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                        <FileText size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base sm:text-lg font-black text-neutral-900 leading-tight">
                                Quotation Builder
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-[#1A4D2E]">
                                <Layers size={12} />
                                6 Pages
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 font-medium">
                            Live 6-page solar powerplant quotation editor with instant A4 PDF export.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleClearForm}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer"
                        title="Clear all client and pricing fields for a new quotation"
                    >
                        <Trash2 size={14} />
                        <span>Clear Form</span>
                    </button>

                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer"
                        title="Reset all fields to default 6-page template values"
                    >
                        <RotateCcw size={14} />
                        <span>Reset Template</span>
                    </button>

                    <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1A4D2E] hover:bg-[#143c24] active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer"
                        title="Save quotation and PDF to history"
                    >
                        <Save size={14} />
                        <span>Save</span>
                    </button>

                    <button
                        onClick={handleGeneratePdf}
                        disabled={isGeneratingPdf}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#1A4D2E] hover:bg-[#143c24] active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        title="Download 6-page PDF document"
                    >
                        {isGeneratingPdf ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                <span>{pdfProgress || "Exporting..."}</span>
                            </>
                        ) : (
                            <>
                                <Download size={15} />
                                <span>Download PDF (6p)</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Section Tabs Sub-bar (Matching Letterhead secondary toolbar) */}
            <div className="no-print bg-neutral-50 border-b border-neutral-200/90 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                    {[
                        { id: 'client', label: '1. Client & Ref', icon: User },
                        { id: 'manufacturers', label: '2. Manufacturers', icon: Sliders },
                        { id: 'technical', label: '3. Technical Specs', icon: Wrench },
                        { id: 'pricing', label: '4. Pricing & Fees', icon: DollarSign },
                        { id: 'terms', label: '5. Terms & Warranty', icon: Shield }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? 'bg-[#1A4D2E] text-white shadow-2xs'
                                        : 'bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/80'
                                }`}
                            >
                                <Icon size={13} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-neutral-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live 6-Page A4 Preview</span>
                </div>
            </div>

            {/* Split Screen Workspace Area */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                {/* Left Column: Form Controls */}
                <div className="w-full md:w-[460px] lg:w-[500px] xl:w-[540px] h-full shrink-0 border-r border-neutral-200 bg-white flex flex-col overflow-hidden quotation-editor-left-panel z-20" data-lenis-prevent>
                    <QuotationFormControls
                        data={quotationData}
                        onChange={setQuotationData}
                        onSave={handleSave}
                        onReset={handleReset}
                        onGeneratePdf={handleGeneratePdf}
                        isGeneratingPdf={isGeneratingPdf}
                        pdfProgress={pdfProgress}
                        onLogout={onLogout}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        hideTopToolbar={true}
                        hideTabs={true}
                    />
                </div>

                {/* Right Column: Live Preview */}
                <div
                    ref={rightPanelRef}
                    className="flex-1 h-full overflow-y-auto quotation-preview-right-panel p-4 md:p-8 bg-neutral-200/80"
                    data-lenis-prevent
                >
                    <QuotationPreview6Pages data={quotationData} />
                </div>
            </div>

            <SaveQuotationModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onConfirm={handleConfirmSave}
                quotationData={quotationData}
                isSaving={isSavingToBackend}
                saveProgress={saveProgress}
            />
        </div>
    );
};