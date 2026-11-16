import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';

export const ConfirmDeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Item Confirmation",
    itemName = "",
    itemType = "item",
    message = "Are you sure you want to permanently delete this item? This action will remove it and cannot be undone.",
    isDeleting = false,
    confirmText = "Yes, Permanently Delete",
    cancelText = "Cancel, Keep It"
}) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Reset fields on open/close
    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setShowPassword(false);
            setError('');
        }
    }, [isOpen]);

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

    const handleConfirmSubmit = (e) => {
        if (e) e.preventDefault();
        if (!password.trim()) {
            setError('Please enter your admin password to confirm deletion.');
            return;
        }
        setError('');
        onConfirm(password);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isDeleting) onClose();
            }}
        >
            <div 
                className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-100 space-y-4 animate-in zoom-in-95 duration-200 font-poppins"
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
                    <h3 className="text-lg font-semibold text-neutral-900 tracking-tight font-poppins">
                        {title}
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed mt-1.5 font-poppins">
                        {message}
                    </p>

                    {itemName && (
                        <div className="mt-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-start gap-2.5">
                            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 block mb-0.5 font-poppins">
                                    Target {itemType}
                                </span>
                                <p className="text-xs font-semibold text-neutral-800 break-words line-clamp-2 font-poppins">
                                    "{itemName}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Verification Field */}
                <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-neutral-700 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                            <Lock size={12} className="text-rose-600" />
                            Admin Password Required
                        </span>
                        <span className="text-[10px] text-neutral-400">Security Check</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="confirm_delete_pin"
                            id="confirm_delete_pin"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            data-lpignore="true"
                            data-1p-ignore="true"
                            data-bwignore="true"
                            data-form-type="other"
                            style={{
                                WebkitTextSecurity: showPassword ? "none" : "disc"
                            }}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleConfirmSubmit();
                                }
                            }}
                            placeholder="Enter admin password to delete..."
                            disabled={isDeleting}
                            className={`w-full px-3 py-2 bg-neutral-50 hover:bg-white focus:bg-white border rounded-xl text-xs font-medium text-neutral-800 outline-none transition-all pr-8 ${
                                error ? 'border-rose-500 focus:border-rose-600' : 'border-neutral-300 focus:border-[#1A4D2E]'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                    {error && (
                        <p className="text-[11px] font-medium text-rose-600 mt-1">
                            {error}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs sm:text-sm font-semibold text-neutral-700 transition-all cursor-pointer disabled:opacity-40"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmSubmit}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
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

export default ConfirmDeleteModal;
