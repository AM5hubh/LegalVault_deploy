import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
    Save, Eye, Upload, X, Plus, ArrowLeft, Scale, 
    BookOpen, AlertCircle, CheckCircle2, Bold, Italic, 
    List, Link2, Type
} from 'lucide-react';

const BlogForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form data state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        excerpt: '',
        category: '',
        tags: '',
        legalTopics: [],
        targetAudience: [],
        metaTitle: '',
        metaDescription: '',
        canonicalUrl: '',
        status: 'draft'
    });

    // File uploads
    const [featuredImage, setFeaturedImage] = useState(null);
    const [featuredImagePreview, setFeaturedImagePreview] = useState(null);

    // Dynamic fields
    const [citedCases, setCitedCases] = useState([
        { caseName: '', citation: '', year: '', court: '' }
    ]);
    const [relatedActs, setRelatedActs] = useState([
        { actName: '', sections: [] }
    ]);

    const API_BASE_URL = 'http://localhost:5000/api';

    // LEGALVAULT specific options
    const categories = [
        'Legal Updates', 'Case Studies', 'Legal Research', 'Court Judgments',
        'Legal Procedures', 'Law Explanations', 'Legal Technology', 'Legal News',
        'Educational Content', 'Legal Opinion', 'Practice Guides', 'Legal Analysis',
        'Industry Insights', 'Legal Resources'
    ];

    const legalTopics = [
        'IPC', 'CrPC', 'CPC', 'Evidence Act', 'Constitution',
        'Company Law', 'Contract Law', 'Property Law', 'Family Law',
        'Tax Law', 'Labour Law', 'Environmental Law', 'Cyber Law',
        'Intellectual Property', 'Banking Law', 'Insurance Law',
        'Real Estate Law', 'Consumer Protection'
    ];

    const targetAudienceOptions = [
        'Lawyers', 'Law Students', 'Judges', 'Legal Researchers', 'General Public', 'Police Officers'
    ];

    useEffect(() => {
        if (isEditing) {
            fetchBlogForEdit();
        }
        // eslint-disable-next-line
    }, [id]);

    const fetchBlogForEdit = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/blogs/user/edit/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const blog = response.data.blog;
                setFormData({
                    title: blog.title || '',
                    content: blog.content || '',
                    excerpt: blog.excerpt || '',
                    category: blog.category || '',
                    tags: blog.tags?.join(', ') || '',
                    legalTopics: blog.legalTopics || [],
                    targetAudience: blog.targetAudience || [],
                    metaTitle: blog.metaTitle || '',
                    metaDescription: blog.metaDescription || '',
                    canonicalUrl: blog.canonicalUrl || '',
                    status: blog.status || 'draft'
                });

                if (blog.featuredImage?.url) {
                    setFeaturedImagePreview(blog.featuredImage.url);
                }

                if (blog.citedCases?.length > 0) {
                    setCitedCases(blog.citedCases);
                } else {
                    setCitedCases([{ caseName: '', citation: '', year: '', court: '' }]);
                }

                if (blog.relatedActs?.length > 0) {
                    setRelatedActs(blog.relatedActs.map(act => ({
                        actName: act.actName || '',
                        sections: act.sections || []
                    })));
                } else {
                    setRelatedActs([{ actName: '', sections: [] }]);
                }
            }
        } catch (err) {
            setError('Failed to load blog for editing');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const handleFeaturedImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFeaturedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFeaturedImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeFeaturedImage = () => {
        setFeaturedImage(null);
        setFeaturedImagePreview(null);
    };

    // Simple text formatting functions
    const insertFormatting = (before, after = '') => {
        const textarea = document.getElementById('content-textarea');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const replacement = before + selectedText + after;
        
        const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
        setFormData(prev => ({ ...prev, content: newValue }));
        
        // Reset cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
        }, 0);
    };

    const addCitedCase = () => {
        setCitedCases(prev => [...prev, { caseName: '', citation: '', year: '', court: '' }]);
    };

    const removeCitedCase = (index) => {
        setCitedCases(prev => prev.filter((_, i) => i !== index));
    };

    const updateCitedCase = (index, field, value) => {
        setCitedCases(prev => prev.map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const addRelatedAct = () => {
        setRelatedActs(prev => [...prev, { actName: '', sections: [] }]);
    };

    const removeRelatedAct = (index) => {
        setRelatedActs(prev => prev.filter((_, i) => i !== index));
    };

    const updateRelatedAct = (index, field, value) => {
        setRelatedActs(prev => prev.map((item, i) => 
            i === index ? { 
                ...item, 
                [field]: field === 'sections' ? value.split(',').map(s => s.trim()) : value 
            } : item
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.content || !formData.excerpt || !formData.category) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const submitFormData = new FormData();
            
            // Add text fields
            Object.keys(formData).forEach(key => {
                if (Array.isArray(formData[key])) {
                    submitFormData.append(key, JSON.stringify(formData[key]));
                } else {
                    submitFormData.append(key, formData[key]);
                }
            });

            // Add files
            if (featuredImage) {
                submitFormData.append('featuredImage', featuredImage);
            }

            // Add cited cases and related acts
            submitFormData.append('citedCases', JSON.stringify(
                citedCases.filter(c => c.caseName.trim() !== '')
            ));
            submitFormData.append('relatedActs', JSON.stringify(
                relatedActs.filter(a => a.actName.trim() !== '')
            ));

            const url = isEditing 
                ? `${API_BASE_URL}/blogs/user/edit/${id}`
                : `${API_BASE_URL}/blogs/user/create`;
                
            const method = isEditing ? 'put' : 'post';

            const response = await axios[method](url, submitFormData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setSuccess(isEditing ? 'Blog updated successfully!' : 'Blog created successfully!');
                setTimeout(() => {
                    navigate('/profile?tab=blogs');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save blog');
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = () => {
        const previewData = {
            ...formData,
            featuredImage: featuredImagePreview ? { url: featuredImagePreview } : null,
            citedCases: citedCases.filter(c => c.caseName.trim() !== ''),
            relatedActs: relatedActs.filter(a => a.actName.trim() !== ''),
            author: { fullName: 'Preview User', role: 'admin' },
            publishedAt: new Date().toISOString(),
            views: 0,
            readTime: Math.ceil(formData.content.split(' ').length / 200)
        };
        
        sessionStorage.setItem('blogPreview', JSON.stringify(previewData));
        window.open(`/blog/preview`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading blog editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4">
                        <Scale className="w-8 h-8 text-orange-600" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditing ? 'Edit Article' : 'Create New Article'}
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Share your legal expertise with the LEGALVAULT community
                    </p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-green-700">{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Article Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter a compelling title for your article"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Excerpt *
                            </label>
                            <textarea
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleInputChange}
                                placeholder="Brief summary of your article (150-300 characters)"
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                maxLength={300}
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {formData.excerpt.length}/300 characters
                            </p>
                        </div>

                        {/* Content with Simple Text Editor */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Article Content *
                            </label>
                            
                            {/* Simple Formatting Toolbar */}
                            <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('**', '**')}
                                    className="p-2 hover:bg-gray-200 rounded"
                                    title="Bold"
                                >
                                    <Bold className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('*', '*')}
                                    className="p-2 hover:bg-gray-200 rounded"
                                    title="Italic"
                                >
                                    <Italic className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('\n## ', '')}
                                    className="p-2 hover:bg-gray-200 rounded"
                                    title="Heading"
                                >
                                    <Type className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('\n- ', '')}
                                    className="p-2 hover:bg-gray-200 rounded"
                                    title="List"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertFormatting('[', '](url)')}
                                    className="p-2 hover:bg-gray-200 rounded"
                                    title="Link"
                                >
                                    <Link2 className="w-4 h-4" />
                                </button>
                            </div>

                            <textarea
                                id="content-textarea"
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                placeholder="Write your comprehensive legal article here using markdown formatting..."
                                rows={20}
                                className="w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-sm"
                                style={{ borderTop: 'none' }}
                                required
                            />
                            <div className="text-sm text-gray-500 mt-2">
                                <p>Formatting guide:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li><code>**bold text**</code> for <strong>bold</strong></li>
                                    <li><code>*italic text*</code> for <em>italic</em></li>
                                    <li><code>## Heading</code> for headings</li>
                                    <li><code>- List item</code> for bullet points</li>
                                    <li><code>[Link text](url)</code> for links</li>
                                </ul>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Featured Image
                            </label>
                            {featuredImagePreview ? (
                                <div className="relative">
                                    <img
                                        src={featuredImagePreview}
                                        alt="Featured"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeFeaturedImage}
                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <label className="cursor-pointer">
                                        <span className="text-orange-600 hover:text-orange-700 font-medium">
                                            Click to upload
                                        </span>
                                        <span className="text-gray-500"> or drag and drop</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFeaturedImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-gray-500 text-sm mt-1">
                                        PNG, JPG, GIF up to 10MB
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="Enter tags separated by commas (e.g., law, legal, court)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    {/* Legal Topics */}
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-orange-600" />
                            Legal Topics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {legalTopics.map(topic => (
                                <label key={topic} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.legalTopics.includes(topic)}
                                        onChange={() => handleMultiSelectChange('legalTopics', topic)}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{topic}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-orange-600" />
                            Target Audience
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {targetAudienceOptions.map(audience => (
                                <label key={audience} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.targetAudience.includes(audience)}
                                        onChange={() => handleMultiSelectChange('targetAudience', audience)}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{audience}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Cited Cases */}
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-orange-600" />
                            Cited Cases
                        </h3>
                        <div className="space-y-4">
                            {citedCases.map((citedCase, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Case Name
                                        </label>
                                        <input
                                            type="text"
                                            value={citedCase.caseName}
                                            onChange={e => updateCitedCase(index, 'caseName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="Enter case name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Citation
                                        </label>
                                        <input
                                            type="text"
                                            value={citedCase.citation}
                                            onChange={e => updateCitedCase(index, 'citation', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="AIR 2023 SC 123"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Year
                                        </label>
                                        <input
                                            type="text"
                                            value={citedCase.year}
                                            onChange={e => updateCitedCase(index, 'year', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="2023"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Court
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={citedCase.court}
                                                onChange={e => updateCitedCase(index, 'court', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="Supreme Court"
                                            />
                                            {citedCases.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeCitedCase(index)}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addCitedCase}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Another Cited Case
                            </button>
                        </div>
                    </div>

                    {/* Related Acts */}
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-orange-600" />
                            Related Acts
                        </h3>
                        <div className="space-y-4">
                            {relatedActs.map((act, index) => (
                                <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Act Name
                                        </label>
                                        <input
                                            type="text"
                                            value={act.actName}
                                            onChange={e => updateRelatedAct(index, 'actName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="Indian Penal Code, 1860"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sections
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={act.sections.join(', ')}
                                                onChange={e => updateRelatedAct(index, 'sections', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                placeholder="300, 302, 304"
                                            />
                                            {relatedActs.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeRelatedAct(index)}
                                                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addRelatedAct}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Another Related Act
                            </button>
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-orange-600" />
                            SEO Settings
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Meta Title <span className="text-xs text-gray-500">({formData.metaTitle.length}/60)</span>
                                </label>
                                <input
                                    type="text"
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleInputChange}
                                    maxLength={60}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="SEO title (max 60 characters)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Meta Description <span className="text-xs text-gray-500">({formData.metaDescription.length}/160)</span>
                                </label>
                                <textarea
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleInputChange}
                                    maxLength={160}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="SEO description (max 160 characters)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Canonical URL
                                </label>
                                <input
                                    type="url"
                                    name="canonicalUrl"
                                    value={formData.canonicalUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="https://legalvault.com/blog/your-post"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Publish Settings */}
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-orange-600" />
                            Publish Settings
                        </h3>
                        
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="status"
                                checked={formData.status === 'published'}
                                onChange={e => setFormData(prev => ({ ...prev, status: e.target.checked ? 'published' : 'draft' }))}
                                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                Publish immediately
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            If unchecked, the article will be saved as a draft
                        </p>
                    </div>

                    {/* Form Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                type="button"
                                onClick={handlePreview}
                                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                                Preview
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : (isEditing ? 'Update Article' : 'Create Article')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogForm;