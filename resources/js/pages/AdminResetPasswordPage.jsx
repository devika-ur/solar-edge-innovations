import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import {
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    RefreshCw,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const AdminResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token') || '';
    const emailParam = searchParams.get('email') || '';

    // States: 'verifying' | 'valid' | 'invalid' | 'success'
    const [viewState, setViewState] = useState('verifying');
    const [errorMessage, setErrorMessage] = useState('');
    const [accountInfo, setAccountInfo] = useState(null);

    // Form fields
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Verify token validity on mount
    useEffect(() => {
        let isMounted = true;

        if (!token || !emailParam) {
            setViewState('invalid');
            setErrorMessage('Invalid password reset link. Missing token or email parameter.');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch('/api/admin/password/verify-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, email: emailParam })
                });

                const data = await res.json();
                if (!isMounted) return;

                if (res.ok && data.success && data.valid) {
                    setAccountInfo({
                        username: data.username,
                        email: data.email,
                        role: data.role
                    });
                    setViewState('valid');
                } else {
                    setViewState('invalid');
                    setErrorMessage(data.message || 'This password reset link is invalid or has expired.');
                }
            } catch {
                if (isMounted) {
                    setViewState('invalid');
                    setErrorMessage('Failed to connect to verification server. Please check your network connection.');
                }
            }
        };

        verifyToken();
        return () => { isMounted = false; };
    }, [token, emailParam]);

    // 2. Submit new password
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters.');
            return;
        }

        if (password !== passwordConfirmation) {
            setErrorMessage('Passwords do not match. Please re-enter.');
            return;
        }

        setIsSubmitting(true);
        const resetToast = toast.loading('Updating password securely...');

        try {
            const res = await fetch('/api/admin/password/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    email: emailParam,
                    password,
                    password_confirmation: passwordConfirmation
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success('Password reset successfully!', { id: resetToast });
                setViewState('success');
            } else {
                const msg = data.message || 'Failed to reset password.';
                setErrorMessage(msg);
                toast.error(msg, { id: resetToast });
            }
        } catch {
            const msg = 'Network error resetting password. Please try again.';
            setErrorMessage(msg);
            toast.error(msg, { id: resetToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Logout and redirect cleanly to admin login screen
    const handleProceedToLogin = async () => {
        try {
            await fetch('/api/admin-logout.php', {
                method: 'POST',
                credentials: 'include'
            });
        } catch {
            // Ignore network errors during logout
        }
        sessionStorage.removeItem('solar_admin_auth');
        sessionStorage.removeItem('solar_admin_user');
        window.location.href = '/admin';
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#05180D] via-[#092B18] to-[#04120A] px-4 font-poppins relative overflow-hidden py-12">
            <Toaster position="top-right" />

            {/* Background Glow Accents */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl p-7 sm:p-8 shadow-2xl relative z-10">
                {/* Header Brand */}
                <div className="flex flex-col items-center text-center space-y-3 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-50 to-emerald-100 p-2.5 border border-green-200 shadow-inner flex items-center justify-center">
                        <img src={assets.logo} alt="Solar Edge Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                            <ShieldCheck size={11} />
                            Security Reset
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                            Reset Admin Password
                        </h1>
                        <p className="text-xs text-neutral-500 font-medium mt-1">
                            Set a new secure password for your Solar Edge portal account
                        </p>
                    </div>
                </div>

                {/* State: Verifying */}
                {viewState === 'verifying' && (
                    <div className="py-8 text-center space-y-3">
                        <RefreshCw size={28} className="animate-spin text-[#1A4D2E] mx-auto" />
                        <p className="text-xs font-semibold text-neutral-600">
                            Verifying secure reset token...
                        </p>
                    </div>
                )}

                {/* State: Invalid / Expired */}
                {viewState === 'invalid' && (
                    <div className="space-y-5 text-center py-2">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                            <AlertCircle size={28} />
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-base font-bold text-neutral-900">
                                Link Expired or Invalid
                            </h2>
                            <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">
                                {errorMessage}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer"
                        >
                            <span>Back to Admin Login</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>
                )}

                {/* State: Valid Token - Form */}
                {viewState === 'valid' && (
                    <div className="space-y-5">
                        {/* Target Account Pill */}
                        {accountInfo && (
                            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                                        Account
                                    </span>
                                    <span className="font-bold text-neutral-800">
                                        {accountInfo.username}
                                    </span>
                                    <span className="text-neutral-500 text-[11px] ml-1.5">
                                        ({accountInfo.email})
                                    </span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    accountInfo.role === 'super_admin' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                    {accountInfo.role === 'super_admin' ? 'SUPER ADMIN' : 'STAFF'}
                                </span>
                            </div>
                        )}

                        {/* Error Banner */}
                        {errorMessage && (
                            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-medium">
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Hidden dummy fields to block browser credential autofill */}
                            <input type="text" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />
                            <input type="password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" autoComplete="off" />

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="new_security_password"
                                        id="new_security_password"
                                        autoComplete="new-password"
                                        data-lpignore="true"
                                        data-1p-ignore="true"
                                        data-bwignore="true"
                                        data-form-type="other"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        required
                                        className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm font-medium text-neutral-900 focus:bg-white focus:border-green-800 focus:ring-2 focus:ring-green-800/20 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                        <KeyRound className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        name="confirm_security_password"
                                        id="confirm_security_password"
                                        autoComplete="new-password"
                                        data-lpignore="true"
                                        data-1p-ignore="true"
                                        data-bwignore="true"
                                        data-form-type="other"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        placeholder="Re-type new password"
                                        required
                                        className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm font-medium text-neutral-900 focus:bg-white focus:border-green-800 focus:ring-2 focus:ring-green-800/20 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#1A4D2E] hover:bg-[#143c24] disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer mt-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw size={15} className="animate-spin" />
                                        <span>Updating Password...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Update & Save Password</span>
                                        <ArrowRight size={15} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="text-xs text-neutral-500 hover:text-neutral-800 font-semibold transition"
                            >
                                Cancel & Back to Login
                            </button>
                        </div>
                    </div>
                )}

                {/* State: Success */}
                {viewState === 'success' && (
                    <div className="space-y-5 text-center py-3">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center mx-auto border border-emerald-100 shadow-sm animate-bounce">
                            <CheckCircle2 size={32} />
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-xl font-bold text-neutral-900">
                                Password Reset Successfully!
                            </h2>
                            <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">
                                Your account password has been updated securely. You can now log into the portal using your new credentials.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleProceedToLogin}
                            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer"
                        >
                            <span>Proceed to Admin Login</span>
                            <ArrowRight size={15} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

