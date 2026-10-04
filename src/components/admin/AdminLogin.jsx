import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { Lock, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminLogin = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        const loginToast = toast.loading('Authenticating credentials...');

        try {
            const res = await fetch('/api/admin-login.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                sessionStorage.setItem('solar_admin_auth', 'true');
                if (data.admin) {
                    sessionStorage.setItem('solar_admin_user', JSON.stringify(data.admin));
                }
                toast.success('Welcome back! Logged in successfully.', { id: loginToast });
                onLoginSuccess();
            } else {
                // Server responded but login failed — show the real error
                const msg = data.message || 'Invalid username or password.';
                setErrorMessage(msg);
                toast.error(msg, { id: loginToast });
            }
        } catch {
            // Network failure only — API server unreachable (local dev offline mode)
            if (username.trim() === 'admin' && (password === 'SolarEdge@2026!' || password === 'batterymaman@varkala$#!')) {
                sessionStorage.setItem('solar_admin_auth', 'true');
                sessionStorage.setItem('solar_admin_user', JSON.stringify({ id: 1, username: 'admin', email: 'admin@solaredgeinnovation.in' }));
                toast.success('Logged in (offline dev mode).', { id: loginToast });
                onLoginSuccess();
            } else {
                const msg = 'Unable to connect to authentication server. Please try again.';
                setErrorMessage(msg);
                toast.error(msg, { id: loginToast });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#05180D] via-[#092B18] to-[#04120A] px-4 font-sans relative overflow-hidden">
            {/* Background Glow Accents */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative z-10">
                {/* Header Logo & Brand */}
                <div className="flex flex-col items-center text-center space-y-3 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-50 to-emerald-100 p-2.5 border border-green-200 shadow-inner flex items-center justify-center">
                        <img src={assets.logo} alt="Solar Edge Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mb-1">
                            <Sparkles size={10} />
                            Session Secured
                        </div>
                        <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                            Solar Edge Admin Portal
                        </h1>
                        <p className="text-xs text-neutral-500 font-medium mt-1">
                            Single sign-on for Gallery, Quotations, FAQs & System
                        </p>
                    </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs font-medium">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 focus:bg-white focus:border-green-800 focus:ring-2 focus:ring-green-800/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-medium text-neutral-900 focus:bg-white focus:border-green-800 focus:ring-2 focus:ring-green-800/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-6 bg-gradient-to-r from-green-900 via-emerald-800 to-green-950 hover:from-green-800 hover:to-green-900 text-white rounded-2xl font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                        {isLoading ? (
                            <span>Logging in...</span>
                        ) : (
                            <>
                                <span>Login to Editor</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

