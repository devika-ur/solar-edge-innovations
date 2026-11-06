import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
    HelpCircle, 
    Plus, 
    Edit2, 
    Trash2, 
    Search, 
    CheckCircle2, 
    XCircle, 
    ArrowUpDown, 
    RefreshCw,
    X,
    AlertCircle,
    Check,
    Filter,
    ChevronDown
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const FaqManager = ({ onUnauthorized }) => {
    const [faqs, setFaqs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'General',
        display_order: 0,
        is_active: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Delete confirmation modal
    const [faqToDelete, setFaqToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const categories = [
        'All', 
        'General', 
        'Solar', 
        'Battery', 
        'CCTV', 
        'Residential Solar', 
        'Commercial Solar', 
        'Inverters & Batteries', 
        'Technical Support'
    ];

    const loadFaqs = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const res = await fetch('/api/admin-faqs.php', {
                credentials: 'include'
            });

            if (res.status === 401) {
                if (onUnauthorized) {
                    onUnauthorized();
                    return;
                }
            }

            const data = await res.json();
            if (res.ok && data.success) {
                setFaqs(data.data || []);
            } else {
                setErrorMessage(data.message || 'Failed to load FAQs.');
            }
        } catch (err) {
            setErrorMessage('Unable to connect to FAQs server.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFaqs();
    }, []);

    const openCreateModal = () => {
        setEditingFaq(null);
        setFormData({
            question: '',
            answer: '',
            category: 'General',
            display_order: faqs.length + 1,
            is_active: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (faq) => {
        setEditingFaq(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category || 'General',
            display_order: faq.display_order || 0,
            is_active: faq.is_active
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const faqToast = toast.loading(editingFaq ? 'Updating FAQ...' : 'Creating FAQ...');

        try {
            const payload = {
                action: editingFaq ? 'update' : 'create',
                ...(editingFaq ? { id: editingFaq.id } : {}),
                question: formData.question.trim(),
                answer: formData.answer.trim(),
                category: formData.category,
                display_order: Number(formData.display_order) || 0,
                is_active: formData.is_active ? 1 : 0
            };

            const res = await fetch('/api/admin-faqs.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(editingFaq ? 'FAQ updated successfully!' : 'New FAQ added successfully!', { id: faqToast });
                setIsModalOpen(false);
                loadFaqs();
            } else {
                toast.error(data.message || 'Error saving FAQ.', { id: faqToast });
            }
        } catch (err) {
            toast.error('Failed to submit FAQ.', { id: faqToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (faq) => {
        const statusToast = toast.loading('Updating status...');
        try {
            const newStatus = faq.is_active ? 0 : 1;
            const res = await fetch('/api/admin-faqs.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'toggle_status',
                    id: faq.id,
                    is_active: newStatus
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setFaqs(faqs.map(f => f.id === faq.id ? { ...f, is_active: !f.is_active } : f));
                toast.success(`FAQ marked as ${newStatus ? 'Active' : 'Inactive'}.`, { id: statusToast });
            } else {
                toast.error('Could not update FAQ status.', { id: statusToast });
            }
        } catch (err) {
            toast.error('Could not update FAQ status.', { id: statusToast });
        }
    };

    const handleDelete = async () => {
        if (!faqToDelete) return;
        setIsDeleting(true);
        const delToast = toast.loading('Deleting FAQ...');

        try {
            const res = await fetch('/api/admin-faqs.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'delete',
                    id: faqToDelete.id
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setFaqs(faqs.filter(f => f.id !== faqToDelete.id));
                toast.success('FAQ deleted successfully.', { id: delToast });
                setFaqToDelete(null);
            } else {
                toast.error(data.message || 'Error deleting FAQ.', { id: delToast });
            }
        } catch (err) {
            toast.error('Failed to delete FAQ.', { id: delToast });
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter FAQs
    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'All' || 
            (faq.category || '').toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = 
            (faq.question || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (faq.answer || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="w-full px-4 sm:px-8 py-8 space-y-8 font-poppins">
            {/* Top Bar / Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
                        Website FAQ Manager
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Manage frequently asked questions displayed dynamically in the Contact & Support section.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center">
                    <button
                        onClick={loadFaqs}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium border border-neutral-200/90 shadow-2xs transition-all cursor-pointer"
                        title="Reload FAQs"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#1A4D2E]' : 'text-neutral-500'} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>Add New FAQ</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search questions or answers..."
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:bg-white focus:border-[#1A4D2E] focus:ring-1 focus:ring-[#1A4D2E]/20 outline-none transition-all font-medium"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 rounded-lg transition-colors cursor-pointer"
                            title="Clear search"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                    <div className="relative min-w-[210px] sm:min-w-[240px]">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 flex items-center">
                            <Filter size={14} className={selectedCategory !== 'All' ? 'text-[#1A4D2E]' : 'text-neutral-400'} />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={`w-full appearance-none pl-9 pr-9 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1A4D2E]/20 transition-all cursor-pointer ${
                                selectedCategory !== 'All'
                                    ? 'bg-emerald-50/60 border-emerald-300 text-[#1A4D2E]'
                                    : 'bg-neutral-50 hover:bg-neutral-100/80 border-neutral-200 text-neutral-700'
                            }`}
                        >
                            <option value="All">All Categories ({faqs.length})</option>
                            {categories.filter(c => c !== 'All').map((cat) => {
                                const count = faqs.filter(f => (f.category || '').toLowerCase() === cat.toLowerCase()).length;
                                return (
                                    <option key={cat} value={cat}>
                                        {cat} {count > 0 ? `(${count})` : ''}
                                    </option>
                                );
                            })}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                    </div>

                    {selectedCategory !== 'All' && (
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/70 rounded-xl transition-all cursor-pointer"
                            title="Reset to All Categories"
                        >
                            <X size={13} />
                            <span>Clear</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* FAQ List */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
                {isLoading ? (
                    <div className="py-16 text-center text-xs text-neutral-400">Loading FAQs...</div>
                ) : filteredFaqs.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                        <HelpCircle className="w-12 h-12 text-neutral-300 mx-auto" />
                        <h3 className="text-sm font-bold text-neutral-800">No FAQs found</h3>
                        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                            {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first question & answer above.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100">
                        {filteredFaqs.map((faq, idx) => (
                            <div key={faq.id} className="p-5 sm:p-6 hover:bg-neutral-50/60 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-semibold">
                                            #{faq.display_order || idx + 1}
                                        </span>
                                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                                            {faq.category || 'General'}
                                        </span>
                                        <button
                                            onClick={() => handleToggleStatus(faq)}
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                                                faq.is_active
                                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                            }`}
                                        >
                                            {faq.is_active ? '● Active (Visible)' : '○ Inactive (Hidden)'}
                                        </button>
                                    </div>

                                    <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                                        {faq.question}
                                    </h3>
                                    <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
                                        {faq.answer}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                                    <button
                                        onClick={() => openEditModal(faq)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-all cursor-pointer"
                                    >
                                        <Edit2 size={12} />
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        onClick={() => setFaqToDelete(faq)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-xs font-semibold text-neutral-700 hover:text-neutral-900 transition-all cursor-pointer"
                                    >
                                        <Trash2 size={12} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-6 relative max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                            <h2 className="text-base font-semibold text-neutral-900 tracking-tight font-poppins">
                                {editingFaq ? 'Edit FAQ Item' : 'Create New FAQ'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                                    Question *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    placeholder="e.g. How much can I save with rooftop solar?"
                                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#1A4D2E] outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                                    Answer *
                                </label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    placeholder="Enter detailed, informative answer for the customer..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#1A4D2E] outline-none resize-y"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                                        Category
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#1A4D2E] outline-none cursor-pointer"
                                    >
                                        <option value="General">General</option>
                                        <option value="Solar">Solar</option>
                                        <option value="Battery">Battery</option>
                                        <option value="CCTV">CCTV</option>
                                        <option value="Residential Solar">Residential Solar</option>
                                        <option value="Commercial Solar">Commercial Solar</option>
                                        <option value="Inverters & Batteries">Inverters & Batteries</option>
                                        <option value="Technical Support">Technical Support</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-900 focus:bg-white focus:border-[#1A4D2E] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="faq_is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded text-[#1A4D2E] focus:ring-[#1A4D2E] cursor-pointer"
                                />
                                <label htmlFor="faq_is_active" className="text-xs font-bold text-neutral-700 cursor-pointer">
                                    Display publicly on website (Active)
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs sm:text-sm font-semibold text-neutral-700 cursor-pointer transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : editingFaq ? 'Update FAQ' : 'Create FAQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Professional Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={Boolean(faqToDelete)}
                onClose={() => !isDeleting && setFaqToDelete(null)}
                onConfirm={handleDelete}
                title="Delete FAQ Confirmation"
                itemType="FAQ Question"
                itemName={faqToDelete?.question}
                message="Are you sure you want to permanently remove this FAQ entry? It will no longer be visible on your website's contact and help pages."
                isDeleting={isDeleting}
                confirmText="Yes, Permanently Delete"
                cancelText="Cancel, Keep FAQ"
            />
        </div>
    );
};
