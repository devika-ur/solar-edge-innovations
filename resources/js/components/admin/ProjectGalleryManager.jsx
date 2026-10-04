import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
    Upload, Plus, Trash2, Eye, EyeOff, RefreshCw, 
    Image as ImageIcon, CheckCircle, AlertCircle, 
    MapPin, X, Edit3, Sparkles,
    Sun, BatteryCharging, Camera
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const ProjectGalleryManager = ({ onUnauthorized }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Modal state for Create / Edit Project
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState(null);

    // Delete Confirmation Modal State
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isDeletingProject, setIsDeletingProject] = useState(false);

    // Form fields
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('solar');
    const [filterCategory, setFilterCategory] = useState('all');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('published');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const imageInputRef = useRef(null);

    // Fetch projects from backend
    const fetchProjects = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin-projects.php', {
                credentials: 'include'
            });

            if (res.status === 401) {
                if (onUnauthorized) {
                    onUnauthorized();
                    return;
                }
            }

            if (!res.ok) {
                // If unauthorized or endpoint issues, fallback to public api
                const publicRes = await fetch('/api/projects.php');
                const publicData = await publicRes.json();
                if (publicData.success && Array.isArray(publicData.projects)) {
                    setProjects(publicData.projects);
                    return;
                }
                throw new Error(`Error: ${res.statusText}`);
            }

            const data = await res.json();
            if (data.success && Array.isArray(data.projects)) {
                setProjects(data.projects);
            }
        } catch (err) {
            console.error('Failed to fetch admin projects:', err);
            setError('Could not load projects from server. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Handle Single Project Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    // Open Modal for New Project
    const openCreateModal = () => {
        setEditingProjectId(null);
        setTitle('');
        setLocation('');
        setDescription('');
        setCategory('solar');
        setStatus('published');
        setImageFile(null);
        setImagePreview(null);
        setIsModalOpen(true);
    };

    // Open Modal for Editing existing Project
    const openEditModal = (proj) => {
        setEditingProjectId(proj.id);
        setTitle(proj.title);
        setLocation(proj.location || '');
        setDescription(proj.description || '');
        setCategory((proj.category || 'solar').toLowerCase());
        setStatus(proj.status || 'published');
        setImageFile(null);
        setImagePreview(proj.cover_image || null);
        setIsModalOpen(true);
    };

    // Submit Project Form (Create / Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingProjectId && !imageFile && !imagePreview) {
            toast.error('Please select a photo to upload.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);
        const saveToast = toast.loading(editingProjectId ? 'Updating project...' : 'Creating project...');

        try {
            const formData = new FormData();
            const catLabel = category === 'battery' ? 'Battery System' : category === 'cctv' ? 'CCTV Surveillance' : 'Solar Installation';
            const finalTitle = title.trim() || `${catLabel}${location.trim() ? ' - ' + location.trim() : ''}`;

            formData.append('title', finalTitle);
            formData.append('location', location.trim());
            formData.append('category', category);
            formData.append('description', description.trim());
            formData.append('status', status);

            if (editingProjectId) {
                formData.append('project_id', editingProjectId);
            }

            if (imageFile) {
                formData.append('cover_image', imageFile);
            }

            const res = await fetch('/api/admin-projects.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(editingProjectId ? 'Project updated successfully!' : 'Project created successfully!', { id: saveToast });
                setIsModalOpen(false);
                fetchProjects();
            } else {
                const msg = data.message || 'Failed to save project.';
                setError(msg);
                toast.error(msg, { id: saveToast });
            }
        } catch (err) {
            console.error('Save project error:', err);
            setError('Network error while saving project.');
            toast.error('Network error while saving project.', { id: saveToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle Published / Draft Status
    const handleToggleStatus = async (projectId, currentStatus) => {
        const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
        try {
            const formData = new FormData();
            formData.append('action', 'toggle_status');
            formData.append('project_id', projectId);
            formData.append('status', nextStatus);

            const res = await fetch('/api/admin-projects.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: nextStatus } : p));
                toast.success(`Project marked as ${nextStatus === 'published' ? 'Published' : 'Draft'}.`);
            } else {
                toast.error('Failed to change project status.');
            }
        } catch (err) {
            console.error('Toggle status error:', err);
            toast.error('Error updating project status.');
        }
    };

    // Delete Entire Project Confirmation Handler
    const handleConfirmDeleteProject = async () => {
        if (!projectToDelete) return;

        setIsDeletingProject(true);
        const deleteToast = toast.loading(`Deleting "${projectToDelete.title}"...`);
        try {
            const formData = new FormData();
            formData.append('action', 'delete_project');
            formData.append('project_id', projectToDelete.id);

            const res = await fetch('/api/admin-projects.php', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (res.ok) {
                setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
                toast.success(`Project "${projectToDelete.title}" was permanently removed.`, { id: deleteToast });
                setProjectToDelete(null);
            } else {
                toast.error('Failed to delete project. Please try again.', { id: deleteToast });
            }
        } catch (err) {
            console.error('Delete project error:', err);
            toast.error('Network error during deletion.', { id: deleteToast });
        } finally {
            setIsDeletingProject(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-neutral-900">
                            Project Gallery Manager
                        </h1>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">
                        Upload solar installations & security system photos directly to your website.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button 
                        onClick={() => fetchProjects()}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="Reload projects"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>

                    <button 
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#1A4D2E] hover:bg-[#143e24] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Add New Project</span>
                    </button>
                </div>
            </div>

            {/* Flash Messages */}
            {successMessage && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-sm">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-emerald-600" />
                        <span>{successMessage}</span>
                    </div>
                    <button onClick={() => setSuccessMessage(null)} className="cursor-pointer text-emerald-600 hover:text-emerald-900">
                        <X size={16} />
                    </button>
                </div>
            )}

            {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-800 text-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={18} className="text-red-600" />
                        <span>{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="cursor-pointer text-red-600 hover:text-red-900">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Category Filter Tabs & Projects Count */}
            {projects.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                    <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200/80">
                        {[
                            { id: 'all', label: 'All Projects', count: projects.length },
                            { id: 'solar', label: '☀️ Solar', count: projects.filter(p => (p.category || 'solar').toLowerCase() === 'solar').length },
                            { id: 'battery', label: '🔋 Battery', count: projects.filter(p => (p.category || '').toLowerCase() === 'battery').length },
                            { id: 'cctv', label: '📹 CCTV', count: projects.filter(p => (p.category || '').toLowerCase() === 'cctv').length },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setFilterCategory(tab.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    filterCategory === tab.id
                                        ? 'bg-[#1A4D2E] text-white shadow-xs'
                                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                                }`}
                            >
                                {tab.label} <span className="opacity-75 font-normal">({tab.count})</span>
                            </button>
                        ))}
                    </div>

                    <span className="text-xs font-semibold text-neutral-400">
                        Showing {projects.filter(p => filterCategory === 'all' || (p.category || 'solar').toLowerCase() === filterCategory).length} of {projects.length}
                    </span>
                </div>
            )}

            {/* Projects List Grid */}
            <div className="mt-4 space-y-6">
                {isLoading && projects.length === 0 ? (
                    <div className="p-16 text-center text-neutral-400 font-medium">
                        <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-[#1A4D2E]" />
                        Loading project gallery...
                    </div>
                ) : projects.length === 0 ? (
                    <div className="p-16 text-center border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50">
                        <ImageIcon size={48} className="mx-auto text-neutral-300 mb-3" />
                        <h3 className="text-lg font-bold text-neutral-800">No Projects Found</h3>
                        <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
                            Get started by uploading your first project installation photos to showcase on the website.
                        </p>
                        <button 
                            onClick={openCreateModal}
                            className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A4D2E] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                        >
                            <Plus size={14} /> Add Project
                        </button>
                    </div>
                ) : (
                    projects
                        .filter(p => filterCategory === 'all' || (p.category || 'solar').toLowerCase() === filterCategory)
                        .map((proj) => {
                            const isPublished = proj.status === 'published';
                            const catLower = (proj.category || 'solar').toLowerCase();

                            return (
                                <div 
                                    key={proj.id}
                                    className="bg-white border border-neutral-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                                >
                                    <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start sm:items-center gap-4">
                                            {/* Cover Thumbnail */}
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                                                {proj.cover_image ? (
                                                    <img 
                                                        src={proj.cover_image} 
                                                        alt={proj.title} 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                        <ImageIcon size={24} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Project Info */}
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                    {/* Category Badge */}
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                                        catLower === 'battery'
                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                            : catLower === 'cctv'
                                                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                                                            : 'bg-amber-50 text-amber-800 border-amber-300'
                                                    }`}>
                                                        {catLower === 'battery' ? '🔋 Battery' : catLower === 'cctv' ? '📹 CCTV' : '☀️ Solar'}
                                                    </span>

                                                    {proj.location && (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-neutral-600 bg-neutral-50 border border-neutral-200 flex items-center gap-1">
                                                            <MapPin size={10} /> {proj.location}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleToggleStatus(proj.id, proj.status)}
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                                                            isPublished 
                                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                        }`}
                                                    >
                                                        {isPublished ? '● Live' : '○ Draft'}
                                                    </button>
                                                </div>

                                            <h3 className="text-lg font-bold text-neutral-900">{proj.title}</h3>
                                            {proj.description && (
                                                <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5 max-w-xl">
                                                    {proj.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                        <button 
                                            onClick={() => openEditModal(proj)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                        >
                                            <Edit3 size={13} /> Edit Project
                                        </button>
                                        <button 
                                            onClick={() => setProjectToDelete(proj)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                            title="Delete project"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                                </div>
                        );
                    })
                )}
            </div>

            {/* Modal: Create or Edit Project with Uploads */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div 
                        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold font-playfair text-neutral-900">
                                {editingProjectId ? 'Edit Project' : 'Add New Project'}
                            </h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Project Category - Solar, Battery, CCTV (All Green UI Border) */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                                    Project Category *
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'solar', label: 'Solar', desc: 'Panels & Rooftop', icon: Sun },
                                        { id: 'battery', label: 'Battery', desc: 'Storage & Inverter', icon: BatteryCharging },
                                        { id: 'cctv', label: 'CCTV', desc: 'Security Surveillance', icon: Camera },
                                    ].map((cat) => {
                                        const Icon = cat.icon;
                                        const isSelected = category === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategory(cat.id)}
                                                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                                                    isSelected 
                                                        ? 'border-[#1A4D2E] bg-emerald-50/80 text-[#1A4D2E] ring-2 ring-[#1A4D2E]/20 shadow-xs' 
                                                        : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/50 text-neutral-600'
                                                }`}
                                            >
                                                <Icon size={22} className={isSelected ? 'text-[#1A4D2E]' : 'text-neutral-400'} />
                                                <span className="text-xs font-extrabold">{cat.label}</span>
                                                <span className="text-[10px] text-neutral-400 font-normal">{cat.desc}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Single Project Photo Upload - Directly under category */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                                    Upload Photo *
                                </label>

                                {imagePreview ? (
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-[#1A4D2E]/30 bg-neutral-900/5 group shadow-xs">
                                        <div className="aspect-video w-full max-h-56 flex items-center justify-center overflow-hidden bg-neutral-100">
                                            <img 
                                                src={imagePreview} 
                                                alt="Project preview" 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div className="p-3 bg-white border-t border-neutral-100 flex items-center justify-between">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#1A4D2E] border border-emerald-200">
                                                <CheckCircle size={13} />
                                                {category === 'battery' ? 'Battery Photo' : category === 'cctv' ? 'CCTV Photo' : 'Solar Photo'}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => imageInputRef.current?.click()}
                                                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                                                >
                                                    Change Photo
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                                    title="Remove photo"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => imageInputRef.current?.click()}
                                        className="border-2 border-dashed border-neutral-300 hover:border-[#1A4D2E] rounded-2xl p-7 text-center bg-neutral-50/70 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 group-hover:bg-[#1A4D2E]/10 flex items-center justify-center mx-auto text-neutral-400 group-hover:text-[#1A4D2E] transition-colors mb-2">
                                            <Upload size={22} />
                                        </div>
                                        <p className="text-xs font-bold text-neutral-800">
                                            Click to upload {category === 'battery' ? 'Battery' : category === 'cctv' ? 'CCTV' : 'Solar'} photo
                                        </p>
                                        <p className="text-[11px] text-neutral-400 mt-1">
                                            JPG, PNG, or WebP up to 5MB
                                        </p>
                                    </div>
                                )}

                                <input 
                                    type="file" 
                                    ref={imageInputRef} 
                                    onChange={handleImageChange}
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                />
                            </div>

                            {/* Location / District */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                                    Location / District (Optional)
                                </label>
                                <input 
                                    type="text" 
                                    value={location} 
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Kollam, Trivandrum"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#1A4D2E] focus:bg-white transition-colors"
                                />
                            </div>

                            {/* Display Status */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                                    Display Status
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                        <input 
                                            type="radio" 
                                            name="status" 
                                            value="published" 
                                            checked={status === 'published'} 
                                            onChange={() => setStatus('published')}
                                            className="text-[#1A4D2E] focus:ring-[#1A4D2E]"
                                        />
                                        <span>Published (Live on Website)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                        <input 
                                            type="radio" 
                                            name="status" 
                                            value="draft" 
                                            checked={status === 'draft'} 
                                            onChange={() => setStatus('draft')}
                                            className="text-[#1A4D2E] focus:ring-[#1A4D2E]"
                                        />
                                        <span>Draft (Hidden)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Optional Details (Collapsible) */}
                            <details className="group pt-1">
                                <summary className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 cursor-pointer select-none list-none flex items-center gap-1.5">
                                    <span className="text-[10px] text-neutral-400 group-open:rotate-90 transition-transform">▶</span>
                                    <span>More Details (Custom Title & Description)</span>
                                </summary>
                                <div className="mt-3 space-y-4 pl-3 border-l-2 border-neutral-200">
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                                            Custom Title (Optional)
                                        </label>
                                        <input 
                                            type="text" 
                                            value={title} 
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={`Defaults to ${category.toUpperCase()} Installation`}
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-[#1A4D2E] focus:bg-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                                            Description (Optional)
                                        </label>
                                        <textarea 
                                            rows={2} 
                                            value={description} 
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Details on capacity, inverters, panels..."
                                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-[#1A4D2E] focus:bg-white transition-colors resize-none"
                                        />
                                    </div>
                                </div>
                            </details>

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A4D2E] hover:bg-[#143e24] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw size={14} className="animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={14} />
                                            <span>{editingProjectId ? 'Save Changes' : 'Create Project'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Professional Delete Confirmation Modal */}
            <ConfirmDeleteModal
                isOpen={Boolean(projectToDelete)}
                onClose={() => !isDeletingProject && setProjectToDelete(null)}
                onConfirm={handleConfirmDeleteProject}
                title="Delete Project Confirmation"
                itemType="Project"
                itemName={projectToDelete?.title}
                message="Are you sure you want to permanently remove this installation project? It will be removed immediately from your public website gallery."
                isDeleting={isDeletingProject}
                confirmText="Yes, Permanently Delete"
                cancelText="Cancel, Keep Project"
            />
        </div>
    );
};
