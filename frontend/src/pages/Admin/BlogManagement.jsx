import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Plus, Edit, Trash2, Eye, Calendar, User, BarChart3, 
    Scale, BookOpen, CheckCircle, Clock, AlertCircle,
    Search, Filter, Tag, FileText, Gavel
} from 'lucide-react';

const BlogManagement = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [reviewModal, setReviewModal] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        drafts: 0,
        pending: 0,
        totalViews: 0
    });

    const API_BASE_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchBlogs();
    }, [statusFilter]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);

            const response = await axios.get(`${API_BASE_URL}/blogs/admin/all?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                const blogData = response.data.blogs;
                setBlogs(blogData);
                
                // Calculate stats
                setStats({
                    total: blogData.length,
                    published: blogData.filter(blog => blog.status === 'published').length,
                    drafts: blogData.filter(blog => blog.status === 'draft').length,
                    pending: blogData.filter(blog => blog.status === 'review').length,
                    totalViews: blogData.reduce((total, blog) => total + (blog.views || 0), 0)
                });
            }
        } catch (err) {
            console.error('Error fetching blogs:', err);
            setError('Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            
            // Note: Admin should use user delete endpoint since there's no admin delete endpoint
            await axios.delete(`${API_BASE_URL}/blogs/user/delete/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setBlogs(blogs.filter(blog => blog._id !== id));
            setDeleteConfirm(null);
            
            // Update stats
            fetchBlogs();
        } catch (err) {
            console.error('Error deleting blog:', err);
            setError('Failed to delete blog');
        }
    };

    const handleReview = async (id, status, comments) => {
        try {
            const token = localStorage.getItem('token');
            
            await axios.put(`${API_BASE_URL}/blogs/admin/review/${id}`, {
                status,
                reviewComments: comments
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setReviewModal(null);
            fetchBlogs(); // Refresh the list
        } catch (err) {
            console.error('Error reviewing blog:', err);
            setError('Failed to review blog');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Published
                    </span>
                );
            case 'review':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Under Review
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Edit className="w-3 h-3 mr-1" />
                        Draft
                    </span>
                );
            case 'archived':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Archived
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Unknown
                    </span>
                );
        }
    };

    const getSEOScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Legal Updates': return <Scale className="w-4 h-4" />;
            case 'Case Studies': return <FileText className="w-4 h-4" />;
            case 'Court Judgments': return <Gavel className="w-4 h-4" />;
            default: return <BookOpen className="w-4 h-4" />;
        }
    };

    const filteredBlogs = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading blog management...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">LEGALVAULT Blog Management</h1>
                        <p className="text-gray-600">Manage legal articles, case studies, and educational content</p>
                    </div>
                    <Link
                        to="/blog/create"
                        className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Article
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <BarChart3 className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Articles</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Eye className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Published</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.published}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Edit className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Drafts</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.drafts}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Eye className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Views</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {stats.totalViews}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Articles
                            </label>
                            <div className="relative">
                                <Search className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 text-gray-900 placeholder-gray-500 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    placeholder="Search by title, author, or category"
                                />
                            </div>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status Filter
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="block w-full pr-10 py-2 text-gray-900 placeholder-gray-500 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            >
                                <option value="">All Statuses</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                                <option value="review">Under Review</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Blog Table */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {filteredBlogs.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
                            <Link
                                to="/blog/create"
                                className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Create New Article
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Article
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Views
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SEO Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBlogs.map((blog) => (
                                        <tr key={blog._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {blog.featuredImage?.url && (
                                                        <img
                                                            className="h-12 w-12 rounded-lg object-cover mr-4"
                                                            src={blog.featuredImage.url}
                                                            alt={blog.title}
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                                            {blog.title}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                                            <User className="w-3 h-3" />
                                                            {blog.author?.name || 'Unknown'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(blog.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {blog.category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    {blog.views || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-medium ${getSEOScoreColor(blog.seoScore || 0)}`}>
                                                    {blog.seoScore || 0}/100
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(blog.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center gap-2 justify-end">
                                                    {blog.status === 'published' && (
                                                        <Link
                                                            to={`/blog/${blog.slug}`}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    )}
                                                    <Link
                                                        to={`/admin/blogs/edit/${blog._id}`}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteConfirm(blog._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-2">Delete Blog Post</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete this blog post? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700 focus:outline-none"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg font-medium text-gray-900">Review Blog Post</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Review and provide feedback for the blog post.
                                </p>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={reviewModal.status}
                                    onChange={(e) => setReviewModal({ ...reviewModal, status: e.target.value })}
                                    className="block w-full pr-10 py-2 text-gray-900 placeholder-gray-500 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                >
                                    <option value="published">Publish</option>
                                    <option value="draft">Save as Draft</option>
                                    <option value="review">Send for Review</option>
                                    <option value="archived">Archive</option>
                                </select>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comments
                                </label>
                                <textarea
                                    value={reviewModal.comments}
                                    onChange={(e) => setReviewModal({ ...reviewModal, comments: e.target.value })}
                                    className="block w-full p-2 text-gray-900 placeholder-gray-500 border rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    rows="3"
                                    placeholder="Optional: Provide comments for the author"
                                ></textarea>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                                <button
                                    onClick={() => setReviewModal(null)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReview(reviewModal.id, reviewModal.status, reviewModal.comments)}
                                    className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md hover:bg-green-700 focus:outline-none"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogManagement;