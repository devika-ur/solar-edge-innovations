import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as jspdfLib from 'jspdf';
import html2canvas from 'html2canvas-pro'; // npm i html2canvas-pro  (handles Tailwind v4 oklch colors)

// Resilient constructor resolution across ESM / Vite / CJS bundling
const jsPDF = jspdfLib.jsPDF || jspdfLib.default?.jsPDF || jspdfLib.default;
import { defaultQuotationData, getTodayFormatted } from '../../data/defaultQuotationData';
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
    Battery,
    Shield,
    Trash2,
    Check,
    Eye,
    EyeOff,
    ZoomIn,
    ZoomOut,
    Lock,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export const QuotationEditor = ({ onLogout, onBack, onNavigate, editId: propEditId }) => {
    const [searchParams] = useSearchParams();
    const activeEditId = propEditId || searchParams.get('edit') || null;
    const [editingQuotationMeta, setEditingQuotationMeta] = useState(null);
    const [isEditLocked, setIsEditLocked] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false);
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
        const todayFormatted = getTodayFormatted();
        const saved = localStorage.getItem('solar_quotation_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.clientInfo?.name === 'SUNIL') {
                    parsed.clientInfo.name = '';
                }
                if (!parsed.batteryDetails || parsed.batteryDetails.length === 0) {
                    parsed.batteryDetails = [
                        {
                            id: 1,
                            batteryDetails: "",
                            quantity: "",
                            price: ""
                        }
                    ];
                }
                // Automatically default date to current date for new drafts
                if (!parsed.id) {
                    parsed.date = todayFormatted;
                }
                return parsed;
            } catch (e) {
                console.error("Failed to parse saved quotation data", e);
            }
        }
        return {
            ...defaultQuotationData,
            date: todayFormatted,
        };
    });

    // Active tab state & bidirectional scroll synchronization
    const [activeTab, setActiveTab] = useState('client');
    const activeTabRef = useRef('client');
    const isProgrammaticScrollRef = useRef(false);
    const scrollTimeoutRef = useRef(null);
    const rightPanelRef = useRef(null);
    const [previewScale, setPreviewScale] = useState(0.85);
    const [showPreview, setShowPreview] = useState(true); // Desktop-only preview toggle (default: visible)

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

    // Load quotation details when activeEditId is set
    useEffect(() => {
        if (!activeEditId) {
            setEditingQuotationMeta(null);
            setIsEditLocked(false);
            return;
        }

        const fetchQuotationForEdit = async () => {
            setIsLoadingEdit(true);
            try {
                const res = await fetch(`/api/admin/quotations/${activeEditId}`, {
                    credentials: 'include'
                });
                const data = await res.json();
                if (res.ok && data.success && data.data) {
                    const quote = data.data;
                    setEditingQuotationMeta(quote);
                    const isEditable = quote.workflow_status === 'approval_pending' || !quote.workflow_status;
                    setIsEditLocked(!isEditable);

                    if (quote.quotation_data && typeof quote.quotation_data === 'object' && Object.keys(quote.quotation_data).length > 0) {
                        setQuotationData(quote.quotation_data);
                    } else {
                        setQuotationData(prev => ({
                            ...prev,
                            refNo: quote.ref_no || prev.refNo,
                            date: quote.quotation_date || prev.date,
                            clientInfo: {
                                ...prev.clientInfo,
                                name: quote.client_name || '',
                                contactNo: quote.client_phone || '',
                                address: quote.client_address !== '-' ? quote.client_address : '',
                                capacity: quote.capacity || '',
                                type: quote.system_type || 'ON GRID'
                            },
                            pricing: {
                                ...prev.pricing,
                                totalPayable: quote.total_amount || ''
                            }
                        }));
                    }
                    toast.success(`Loaded Quotation #${quote.ref_no} for editing`);
                } else {
                    toast.error(data.message || 'Failed to load quotation details');
                }
            } catch (err) {
                console.error('Error fetching quote for edit:', err);
                toast.error('Network error loading quotation');
            } finally {
                setIsLoadingEdit(false);
            }
        };

        fetchQuotationForEdit();
    }, [activeEditId]);

    // Fetch next auto-generated quotation reference number from backend (Format: DCR:MM-YY-XX)
    const fetchNextRefNo = async (overrideDate = null) => {
        try {
            const dateToUse = overrideDate || quotationData.date || '';
            const query = dateToUse ? `?date=${encodeURIComponent(dateToUse)}` : '';
            const res = await fetch(`/api/admin-quotations-next-ref.php${query}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const json = await res.json();
                if (json.success && json.ref_no) {
                    setQuotationData((prev) => ({
                        ...prev,
                        refNo: json.ref_no
                    }));
                    return json.ref_no;
                }
            }
        } catch (err) {
            console.error('Failed to auto-generate quotation ref_no from backend', err);
        }
        return null;
    };

    // Auto-populate next ref number on mount if empty or holding legacy placeholder
    useEffect(() => {
        if (!quotationData.refNo || quotationData.refNo === 'DCR:09-26-13') {
            fetchNextRefNo();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle clicking a tab on the left: switch tab and smoothly scroll right preview to that section
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        activeTabRef.current = tabId;

        const panel = rightPanelRef.current;
        // Both Pricing (Table 1, Table 2) and Battery Details (Table 3) live on Page 5.
        // Always scroll to the top of Page 5 (preview-page-pricing) so the user sees all tables intact.
        const targetId = (tabId === 'battery' || tabId === 'pricing') ? 'preview-page-pricing' : `preview-page-${tabId}`;
        const targetEl = document.getElementById(targetId);
        if (targetEl && panel && showPreview) {
            isProgrammaticScrollRef.current = true;
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            const panelRect = panel.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();
            // In a CSS-scaled container (transform: scale(s)), targetRect and panelRect
            // are in scaled viewport pixels. Divide by previewScale to get true unscaled scroll distance.
            const scale = previewScale || 1;
            const targetScrollTop = panel.scrollTop + (targetRect.top - panelRect.top) / scale - 16;

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
                    // Both pricing & battery sections reside on Page 5 (data-section="pricing").
                    // If the user actively selected either tab, don't overwrite it while viewing Page 5.
                    if (currentSection === 'pricing' && (activeTabRef.current === 'pricing' || activeTabRef.current === 'battery')) {
                        return;
                    }
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
        if (isEditLocked) {
            toast.error(`Editing is disabled because this quotation is ${editingQuotationMeta?.workflow_status_label || 'processed'}.`);
            return;
        }
        setIsSaveModalOpen(true);
    };

    // Helper: capture 6-page A4 preview and render jsPDF document
    const generatePdfDocument = async (onProgress) => {
        const savedScale = previewScale;
        setPreviewScale(1);
        await new Promise((resolve) => setTimeout(resolve, 80));

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
                        clonedEl.style.position = 'static';
                        clonedEl.style.opacity = '1';
                        let p = clonedEl.parentElement;
                        while (p && p !== clonedDoc.body) {
                            p.style.transform = 'none';
                            p.style.position = 'static';
                            p.style.opacity = '1';
                            p.style.left = '0';
                            p.style.top = '0';
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
        } finally {
            setPreviewScale(savedScale);
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
            if (activeEditId) {
                formData.append('id', String(activeEditId));
            }
            formData.append('quotation_data', JSON.stringify(quotationData));

            const res = await fetch('/api/admin-quotations.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.removeItem('solar_quotation_data');
                setIsSaveModalOpen(false);

                toast.success(
                    activeEditId
                        ? `Quotation #${quotationData.refNo} updated successfully!`
                        : "Quotation saved successfully! Navigating to Quotation History..."
                );

                if (onNavigate) {
                    onNavigate('quotation-history');
                }
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
                },
                batteryDetails: [
                    {
                        id: 1,
                        batteryDetails: "",
                        quantity: "",
                        price: ""
                    }
                ]
            };

            setQuotationData(clearedData);
            localStorage.removeItem('solar_quotation_data');
            fetchNextRefNo(formattedDate);
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
            const todayFormatted = getTodayFormatted();
            setQuotationData({
                ...defaultQuotationData,
                date: todayFormatted,
            });
            localStorage.removeItem('solar_quotation_data');
            fetchNextRefNo(todayFormatted);
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
                    onRefreshRefNo={fetchNextRefNo}
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
        <div className="w-full flex flex-col font-sans bg-neutral-100 min-h-[calc(100vh-60px)] h-[calc(100vh-60px)] overflow-hidden relative" data-lenis-prevent>
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

                    .preview-scale-wrapper {
                        transform: none !important;
                        width: 210mm !important;
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

            {/* Edit Mode Notice Banner */}
            {activeEditId && (
                <div className={`no-print px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs border-b ${
                    isEditLocked
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                    <div className="flex items-center gap-2">
                        {isEditLocked ? <Lock size={15} className="text-amber-600 shrink-0" /> : <FileText size={15} className="text-emerald-700 shrink-0" />}
                        <span>
                            {isEditLocked ? (
                                <>
                                    <strong>Editing Locked:</strong> Quotation #{editingQuotationMeta?.ref_no || quotationData.refNo} ({editingQuotationMeta?.client_name || quotationData.clientInfo?.name}) is currently marked as <strong>{editingQuotationMeta?.workflow_status_label}</strong>. Modifications are disabled unless reopened.
                                </>
                            ) : (
                                <>
                                    <strong>Editing Quotation:</strong> #{editingQuotationMeta?.ref_no || quotationData.refNo} ({editingQuotationMeta?.client_name || quotationData.clientInfo?.name}). You can modify fields and click Save to update history.
                                </>
                            )}
                        </span>
                    </div>

                    {onNavigate && (
                        <button
                            type="button"
                            onClick={() => onNavigate('quotation-history')}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-neutral-50 rounded-lg text-xs font-semibold border border-neutral-200 transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={12} />
                            <span>Return to History</span>
                        </button>
                    )}
                </div>
            )}

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

                    {/* Desktop-Only Toggle: Hide / Show Live Quotation Preview */}
                    <button
                        onClick={() => setShowPreview((prev) => !prev)}
                        className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                            showPreview
                                ? 'text-neutral-700 hover:text-[#1A4D2E] bg-white hover:bg-neutral-50 border border-neutral-200'
                                : 'text-white bg-[#1A4D2E] hover:bg-[#143c24] shadow-xs'
                        }`}
                        title={showPreview ? 'Hide live 6-page preview to expand editor' : 'Show live 6-page preview side-by-side'}
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
                        { id: 'battery', label: '5. Battery Details', icon: Battery },
                        { id: 'terms', label: '6. Terms & Warranty', icon: Shield }
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
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                {/* Left Column: Form Controls */}
                <div
                    className={`quotation-editor-left-panel w-full h-full border-b lg:border-b-0 border-neutral-200/90 bg-white flex flex-col overflow-hidden z-20 ${
                        showPreview
                            ? 'lg:w-[460px] xl:w-[500px] 2xl:w-[540px] lg:border-r shrink-0'
                            : 'lg:w-full lg:flex-1 lg:border-r-0'
                    }`}
                    data-lenis-prevent
                >
                    <QuotationFormControls
                        data={quotationData}
                        onChange={setQuotationData}
                        onSave={handleSave}
                        onReset={handleReset}
                        onRefreshRefNo={fetchNextRefNo}
                        onGeneratePdf={handleGeneratePdf}
                        isGeneratingPdf={isGeneratingPdf}
                        pdfProgress={pdfProgress}
                        onLogout={onLogout}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        hideTopToolbar={true}
                        hideTabs={true}
                        isFullWidth={!showPreview}
                    />
                </div>

                {/* Right Column: Live Preview */}
                <div
                    ref={rightPanelRef}
                    className={`quotation-preview-right-panel flex-1 h-full bg-neutral-200/80 p-4 sm:p-8 overflow-y-auto flex flex-col items-center gap-8 z-10 ${
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
                        className="preview-scale-wrapper w-full flex flex-col items-center"
                        style={{
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'top center',
                            transition: 'transform 0.15s ease-out'
                        }}
                    >
                        <QuotationPreview6Pages data={quotationData} />
                    </div>
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