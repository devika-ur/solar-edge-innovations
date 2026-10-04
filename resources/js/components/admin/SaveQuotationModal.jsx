import React, { useEffect } from 'react';
import { Save, X, Loader2, User, Phone, MapPin, Zap, Calendar, IndianRupee, ShieldCheck } from 'lucide-react';

export const SaveQuotationModal = ({
    isOpen,
    onClose,
    onConfirm,
    quotationData = {},
    isSaving = false,
    saveProgress = ""
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isSaving) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSaving, onClose]);

    if (!isOpen) return null;

    const client = quotationData?.clientInfo || {};
    const pricing = quotationData?.pricing || {};

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/65 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isSaving) onClose();
            }}
        >
            <div 
                className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-neutral-100 space-y-5 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Icon & Close Button */}
                <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#1A4D2E] flex items-center justify-center shadow-2xs">
                        <Save size={22} className="stroke-[2.2]" />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer disabled:opacity-40"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-neutral-900">
                        Save Quotation Confirmation
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                        Are you sure you want to save this quotation to history? The client details and generated PDF will be archived in the Quotation History dashboard for quick access and tracking.
                    </p>
                </div>

                {/* Summary Card */}
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2.5">
                        <div className="flex items-center gap-2">
                            <User size={15} className="text-emerald-700" />
                            <span className="text-xs font-bold text-neutral-900">
                                {client.name || 'Unnamed Client'}
                            </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100/70 text-[#1A4D2E]">
                            Ref: {quotationData.refNo || 'N/A'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="flex items-center gap-2 text-neutral-600">
                            <Phone size={13} className="text-neutral-400 shrink-0" />
                            <span className="truncate">{client.contactNo || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                            <MapPin size={13} className="text-neutral-400 shrink-0" />
                            <span className="truncate">{client.address || 'No location'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                            <Zap size={13} className="text-amber-500 shrink-0" />
                            <span className="truncate font-semibold">{client.capacity || '-'} ({client.type || 'On-Grid'})</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                            <Calendar size={13} className="text-neutral-400 shrink-0" />
                            <span className="truncate">{quotationData.date || new Date().toLocaleDateString('en-GB')}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-neutral-200/60 bg-emerald-50/50 -mx-4 -mb-4 px-4 py-3 rounded-b-2xl">
                        <span className="text-xs font-bold text-neutral-700">Total Project Cost</span>
                        <span className="text-sm font-black text-[#1A4D2E]">
                            ₹{pricing.totalPayable || '0'}
                        </span>
                    </div>
                </div>

                {/* Information hint */}
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>This will save to backend database and allow instant PDF preview in Quotation History.</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs sm:text-sm font-semibold text-neutral-700 transition-all cursor-pointer disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] active:scale-98 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>{saveProgress || "Saving to History..."}</span>
                            </>
                        ) : (
                            <>
                                <Save size={14} />
                                <span>Save Quotation</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
