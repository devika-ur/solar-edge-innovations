import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';

export const ConfirmDeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Item Confirmation",
    itemName = "",
    itemType = "item",
    message = "Are you sure you want to permanently delete this item? This action will remove it from your website and cannot be undone.",
    isDeleting = false,
    confirmText = "Yes, Permanently Delete",
    cancelText = "Cancel, Keep It"
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isDeleting) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isDeleting, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isDeleting) onClose();
            }}
        >
            <div 
                className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-100 space-y-5 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Icon & Close Button */}
                <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shadow-2xs">
                        <Trash2 size={22} className="stroke-[2.2]" />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer disabled:opacity-40"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Content */}
                <div>
                    <h3 className="text-lg font-bold font-playfair text-neutral-900">
                        {title}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed mt-1.5">
                        {message}
                    </p>

                    {itemName && (
                        <div className="mt-3.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-start gap-2.5">
                            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 block mb-0.5">
                                    Target {itemType}
                                </span>
                                <p className="text-xs font-bold text-neutral-800 break-words line-clamp-2">
                                    "{itemName}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-40"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <RefreshCw size={13} className="animate-spin" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 size={13} />
                                <span>{confirmText}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
