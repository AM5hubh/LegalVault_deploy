import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, Eye, User, BookOpen, Scale, Gavel, FileText, Clock, ArrowRight, Tag } from 'lucide-react';
import axios from 'axios';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLegalTopic, setSelectedLegalTopic] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const API_BASE_URL = 'http://localhost:5000/api';

    const legalCategories = [
        'Legal Updates',
        'Case Studies',
        'Legal Research',
        'Court Judgments',
        'Legal Procedures',
        'Law Explanations',
        'Legal Technology',
        'Legal News',
        'Educational Content',
        'Legal Opinion',
        'Practice Guides',
        'Legal Analysis',
        'Industry Insights',
        'Legal Resources'
    ];

    const legalTopics = [
        'IPC', 'CrPC', 'CPC', 'Evidence Act', 'Constitution',
        'Company Law', 'Contract Law', 'Property Law', 'Family Law',
        'Tax Law', 'Labour Law', 'Environmental Law', 'Cyber Law',
        'Intellectual Property', 'Banking Law', 'Insurance Law',
        'Real Estate Law', 'Consumer Protection'
    ];

    useEffect(() => {
        fetchBlogs();
    }, [currentPage, selectedCategory, selectedLegalTopic, searchTerm]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                limit: 12
            });

            if (selectedCategory) params.append('category', selectedCategory);
            if (selectedLegalTopic) params.append('legalTopic', selectedLegalTopic);
            if (searchTerm) params.append('search', searchTerm);

            const response = await axios.get(`${API_BASE_URL}/blogs?${params}`);
            
            if (response.data.success) {
                setPosts(response.data.blogs);
                setTotalPages(response.data.totalPages);
            } else {
                setError('Failed to load blog posts');
            }
        } catch (err) {
            console.error('Error fetching blogs:', err);
            setError('Error loading blog posts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchBlogs();
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedLegalTopic('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Legal Updates': return <Scale className="w-4 h-4" />;
            case 'Case Studies': return <FileText className="w-4 h-4" />;
            case 'Court Judgments': return <Gavel className="w-4 h-4" />;
            default: return <BookOpen className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="h-48 bg-gray-200"></div>
                                    <div className="p-6">
                                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">LEGALVAULT Blog</h1>
                        <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
                            Stay updated with the latest legal insights, case studies, and analysis from India's leading legal experts
                        </p>
                        
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search legal topics, cases, articles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm mb-8">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Filter Articles</h2>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden flex items-center gap-2 text-orange-600 hover:text-orange-700"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                            </button>
                        </div>

                        <div className={`${showFilters ? 'block' : 'hidden md:block'} space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4`}>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">All Categories</option>
                                {legalCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <select
                                value={selectedLegalTopic}
                                onChange={(e) => setSelectedLegalTopic(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">All Legal Topics</option>
                                {legalTopics.map(topic => (
                                    <option key={topic} value={topic}>{topic}</option>
                                ))}
                            </select>

                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>

                        {(selectedCategory || selectedLegalTopic || searchTerm) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {selectedCategory && (
                                    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                                        {selectedCategory}
                                        <button onClick={() => setSelectedCategory('')} className="ml-1">×</button>
                                    </span>
                                )}
                                {selectedLegalTopic && (
                                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                        {selectedLegalTopic}
                                        <button onClick={() => setSelectedLegalTopic('')} className="ml-1">×</button>
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                        "{searchTerm}"
                                        <button onClick={() => setSearchTerm('')} className="ml-1">×</button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
                        {error}
                    </div>
                )}

                {/* Blog Posts */}
                {posts.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || selectedCategory || selectedLegalTopic
                                ? 'Try adjusting your filters or search terms.'
                                : 'Be the first to publish a legal article on LEGALVAULT.'}
                        </p>
                        {!searchTerm && !selectedCategory && !selectedLegalTopic && (
                            <Link
                                to="/blog/create"
                                className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                <BookOpen className="w-5 h-5" />
                                Write First Article
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Legal Articles & Insights
                                </h2>
                                <p className="text-gray-600">
                                    {posts.length} article{posts.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                            
                            <Link
                                to="/blog/create"
                                className="hidden sm:inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                <BookOpen className="w-5 h-5" />
                                Write Article
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {posts.map((post) => (
                                <article key={post._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                                    {post.featuredImage?.url && (
                                        <div className="aspect-w-16 aspect-h-9">
                                            <img
                                                src={post.featuredImage.url}
                                                alt={post.title}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="p-6">
                                        {/* Category */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                                                {getCategoryIcon(post.category)}
                                                {post.category}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                            <Link to={`/blog/${post.slug}`}>
                                                {post.title}
                                            </Link>
                                        </h3>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        {/* Legal Topics Tags */}
                                        {post.legalTopics && post.legalTopics.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {post.legalTopics.slice(0, 3).map((topic) => (
                                                    <span
                                                        key={topic}
                                                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                                                    >
                                                        <Tag className="w-3 h-3" />
                                                        {topic}
                                                    </span>
                                                ))}
                                                {post.legalTopics.length > 3 && (
                                                    <span className="text-xs text-gray-500 px-2 py-1">
                                                        +{post.legalTopics.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex items-center justify-between text-sm text-gray-500">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {post.author?.fullName || 'Anonymous'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    {post.views || 0}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {post.readTime || 5} min
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                                            </div>
                                            
                                            <Link
                                                to={`/blog/${post.slug}`}
                                                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm group"
                                            >
                                                Read More
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center">
                                <nav className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-4 py-2 text-sm font-medium rounded-md ${
                                                currentPage === i + 1
                                                    ? 'bg-orange-600 text-white'
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                )}

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg text-white p-8 text-center mt-12">
                    <h3 className="text-2xl font-bold mb-4">Share Your Legal Expertise</h3>
                    <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                        Join LEGALVAULT's community of legal experts. Share your knowledge, insights, and analysis with legal professionals across India.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/blog/create"
                            className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                        >
                            <BookOpen className="w-5 h-5" />
                            Write an Article
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-orange-600 transition-colors"
                        >
                            <User className="w-5 h-5" />
                            Join Community
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blog;