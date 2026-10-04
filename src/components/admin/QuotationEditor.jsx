import React, { useState, useEffect, useRef } from 'react';
import * as jspdfLib from 'jspdf';
import html2canvas from 'html2canvas-pro'; // npm i html2canvas-pro  (handles Tailwind v4 oklch colors)

// Resilient constructor resolution across ESM / Vite / CJS bundling
const jsPDF = jspdfLib.jsPDF || jspdfLib.default?.jsPDF || jspdfLib.default;
import { defaultQuotationData } from '../../data/defaultQuotationData';
import { QuotationFormControls } from './QuotationFormControls';
import { QuotationPreview6Pages } from './QuotationPreview6Pages';
import { QuotationEditorMobile } from './QuotationEditorMobile';
import toast from 'react-hot-toast';

export const QuotationEditor = ({ onLogout, onBack }) => {
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

    // Save quotation to local storage
    const handleSave = (showToastNotification = true) => {
        try {
            localStorage.setItem('solar_quotation_data', JSON.stringify(quotationData));
            const client = quotationData.clientInfo?.name?.trim() || 'Client';
            const date = quotationData.date?.trim() || '';
            if (showToastNotification) {
                toast.success(`Quotation saved for ${client}${date ? ` (${date})` : ''}!`);
            }
        } catch (e) {
            if (showToastNotification) {
                toast.error("Failed to save quotation data.");
            }
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

    // Generate & Download PDF matching exact live preview per page
    const handleGeneratePdf = async () => {
        if (isGeneratingPdfRef.current || isGeneratingPdf) return;

        // Save silently without popping up a toast that flickers
        handleSave(false);
        isGeneratingPdfRef.current = true;
        isProgrammaticScrollRef.current = true;
        setIsGeneratingPdf(true);
        setPdfProgress("Starting...");

        let exportContainer = null;

        try {
            const container = document.querySelector('.quotation-preview-container');
            if (!container) {
                window.print();
                return;
            }

            // Create an isolated, unscaled clone attached directly to document.body
            // This guarantees html2canvas always captures full-size 794x1123 desktop A4 pages
            // without being shrunk by mobile viewport, parent scale transforms, or flex wrappers.
            exportContainer = container.cloneNode(true);
            exportContainer.id = 'quotation-export-stage';
            exportContainer.style.position = 'fixed';
            exportContainer.style.left = '-9999px';
            exportContainer.style.top = '0px';
            exportContainer.style.width = '794px';
            exportContainer.style.minWidth = '794px';
            exportContainer.style.maxWidth = '794px';
            exportContainer.style.height = 'auto';
            exportContainer.style.zIndex = '-99999';
            exportContainer.style.opacity = '1';
            exportContainer.style.pointerEvents = 'none';
            exportContainer.style.transform = 'none';
            exportContainer.style.margin = '0';
            exportContainer.style.padding = '0';
            exportContainer.style.background = '#ffffff';

            document.body.appendChild(exportContainer);

            const pages = exportContainer.querySelectorAll('.quotation-page');
            if (!pages || pages.length === 0) {
                toast.error("No quotation pages found to export.");
                return;
            }

            // Make sure web fonts are loaded so text widths match the live preview
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }

            // Ensure all images inside exportContainer are loaded
            const imgs = exportContainer.querySelectorAll('img');
            await Promise.all(
                Array.from(imgs).map((img) => {
                    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                    return new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                        setTimeout(resolve, 300);
                    });
                })
            );

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = 210;
            const pdfHeight = 297;

            for (let i = 0; i < pages.length; i++) {
                setPdfProgress(`Page ${i + 1}/${pages.length}`);

                const pageEl = pages[i];
                pageEl.style.margin = '0px';
                pageEl.style.boxShadow = 'none';
                pageEl.style.transform = 'none';

                const canvas = await html2canvas(pageEl, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    width: 794,
                    height: 1123,
                    windowWidth: 1200,
                    windowHeight: 1600,
                    scrollX: 0,
                    scrollY: 0,
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

                const imgData = canvas.toDataURL('image/jpeg', 0.98);

                if (i > 0) {
                    pdf.addPage('a4', 'portrait');
                }

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
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

            toast.success(`Quotation PDF (${pages.length} pages) downloaded successfully!`);
        } catch (err) {
            console.error("PDF generation failed, falling back to window.print()", err);
            toast.error("Automatic PDF download failed. Opening print view...");
            window.print();
        } finally {
            if (exportContainer && document.body.contains(exportContainer)) {
                document.body.removeChild(exportContainer);
            }
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
                    onGeneratePdf={handleGeneratePdf}
                    isGeneratingPdf={isGeneratingPdf}
                    pdfProgress={pdfProgress}
                    onLogout={onLogout}
                    onBack={onBack}
                />
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col md:flex-row bg-neutral-100 overflow-hidden font-sans relative" data-lenis-prevent>
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

            {/* Left Column: Form Controls (Hidden during print) */}
            <div className="w-full md:w-[440px] lg:w-[480px] xl:w-[520px] h-[50vh] md:h-full shrink-0 quotation-editor-left-panel z-20 flex flex-col overflow-hidden" data-lenis-prevent>
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
                />
            </div>

            {/* Right Column: Live Preview */}
            <div
                ref={rightPanelRef}
                className="flex-1 h-[50vh] md:h-full overflow-y-auto quotation-preview-right-panel p-4 md:p-8 bg-neutral-200/80"
                data-lenis-prevent
            >
                <QuotationPreview6Pages data={quotationData} />
            </div>
        </div>
    );
};