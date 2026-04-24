import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Calendar, User, Clock, Eye, Share2, ArrowLeft, Tag, 
    Scale, BookOpen, ThumbsUp, MessageCircle, ExternalLink,
    Copy, Facebook, Twitter, Linkedin, Send, AlertCircle
} from 'lucide-react';

// Utility function to preprocess content and ensure paragraphs
const formatContent = (content) => {
    // If content is empty or null, return a default message
    if (!content) return '<p>No content available.</p>';

    // Check if content is already HTML (contains tags)
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);

    if (!hasHtmlTags) {
        // If plain text, split by double newlines and wrap in <p> tags
        const paragraphs = content
            .split(/\n\s*\n/)
            .map(para => para.trim())
            .filter(para => para.length > 0)
            .map(para => `<p>${para}</p>`);
        return paragraphs.join('');
    }

    // If already HTML, return as-is (assuming it’s sanitized elsewhere)
    return content;
};

const Blogdetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [likeCount, setLikeCount] = useState(0);
    const [shareCount, setShareCount] = useState(0);
    const [showShareMenu, setShowShareMenu] = useState(false);

    const API_BASE_URL = 'http://localhost:5000/api';

    useEffect(() => {
        fetchBlogDetails();
        // eslint-disable-next-line
    }, [slug]);

    const fetchBlogDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/blogs/${slug}`);
            
            if (response.data.success) {
                const fetchedBlog = response.data.blog;
                // Preprocess the content before setting it
                fetchedBlog.content = formatContent(fetchedBlog.content);
                setBlog(fetchedBlog);
                setRelatedBlogs(response.data.relatedBlogs || []);
                setLikeCount(fetchedBlog.likeCount || 0);
                setShareCount(fetchedBlog.shares || 0);
                
                // Update page meta data
                if (fetchedBlog.metaTitle) {
                    document.title = fetchedBlog.metaTitle + ' - LEGALVAULT';
                }
                if (fetchedBlog.metaDescription) {
                    const metaDesc = document.querySelector('meta[name="description"]');
                    if (metaDesc) metaDesc.content = fetchedBlog.metaDescription;
                }
            }
        } catch (err) {
            setError('Failed to load blog post. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = (platform) => {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(blog.title);
        const text = encodeURIComponent(blog.excerpt);

        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
                return;
            default:
                return;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
            setShareCount(prev => prev + 1);
        }
    };

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading article...</p>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Scale className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || 'This article could not be found.'}</p>
                    <Link 
                        to="/blog"
                        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Section */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-6">
                        <Link 
                            to="/blog"
                            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Articles
                        </Link>
                    </div>

                    {/* Category */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {blog.category}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {blog.title}
                    </h1>

                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        {blog.excerpt}
                    </p>

                    {/* Author and Meta Info */}
                    <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-8">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <span className="font-medium">{blog.author?.fullName || 'LEGALVAULT Team'}</span>
                            {blog.author?.role && (
                                <span className="text-sm">({blog.author.role})</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span>{blog.readTime || 5} min read</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            <span>{blog.views || 0} views</span>
                        </div>
                    </div>

                    {/* Engagement Buttons */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                            <span>{shareCount} Shares</span>
                        </button>
                    </div>

                    {showShareMenu && (
                        <div className="mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Share this article</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <button
                                    onClick={() => handleShare('facebook')}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm w-full text-left"
                                >
                                    <Facebook className="w-4 h-4" />
                                    Facebook
                                </button>
                                <button
                                    onClick={() => handleShare('twitter')}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm w-full text-left"
                                >
                                    <Twitter className="w-4 h-4" />
                                    Twitter
                                </button>
                                <button
                                    onClick={() => handleShare('linkedin')}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm w-full text-left"
                                >
                                    <Linkedin className="w-4 h-4" />
                                    LinkedIn
                                </button>
                                <button
                                    onClick={() => handleShare('copy')}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded text-sm w-full text-left"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Featured Image */}
            {blog.featuredImage?.url && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <img
                        src={blog.featuredImage.url}
                        alt={blog.title}
                        className="w-full h-auto max-h-[500px] object-cover rounded-xl shadow-lg"
                    />
                </div>
            )}

            {/* Main Content with Sidebar */}
            <div className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Article */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-8">
                            <style>
                                {`
                                    .article-content h1,
                                    .article-content h2,
                                    .article-content h3,
                                    .article-content h4,
                                    .article-content h5,
                                    .article-content h6 {
                                        margin-top: 2.5rem;
                                        margin-bottom: 1rem;
                                        font-weight: 700;
                                        line-height: 1.3;
                                        color: #1F2937;
                                    }
                                    .article-content h1 { font-size: 2rem; }
                                    .article-content h2 { font-size: 1.75rem; }
                                    .article-content h3 { font-size: 1.5rem; }
                                    .article-content h4 { font-size: 1.25rem; }
                                    .article-content p {
                                        margin-bottom: 1.75rem;
                                        line-height: 1.9;
                                        color: #374151;
                                        font-size: 1.125rem;
                                    }
                                    .article-content ul,
                                    .article-content ol {
                                        margin-bottom: 1.75rem;
                                        padding-left: 2.5rem;
                                        line-height: 1.9;
                                        color: #374151;
                                    }
                                    .article-content li {
                                        margin-bottom: 0.75rem;
                                        font-size: 1.125rem;
                                    }
                                    .article-content blockquote {
                                        border-left: 6px solid #F97316;
                                        padding-left: 1.5rem;
                                        margin: 2rem 0;
                                        color: #4B5563;
                                        font-style: italic;
                                        background-color: #F9FAFB;
                                        padding: 1rem 1.5rem;
                                        border-radius: 0.5rem;
                                    }
                                    .article-content img {
                                        max-width: 100%;
                                        height: auto;
                                        margin: 2rem auto;
                                        border-radius: 0.5rem;
                                        display: block;
                                    }
                                    .article-content a {
                                        color: #F97316;
                                        text-decoration: underline;
                                        transition: color 0.2s;
                                    }
                                    .article-content a:hover {
                                        color: #EA580C;
                                    }
                                    .article-content code {
                                        background-color: #F3F4F6;
                                        padding: 0.2rem 0.4rem;
                                        border-radius: 0.25rem;
                                        font-family: monospace;
                                        font-size: 0.95rem;
                                    }
                                    .article-content pre {
                                        background-color: #F3F4F6;
                                        padding: 1.25rem;
                                        border-radius: 0.5rem;
                                        overflow-x: auto;
                                        margin-bottom: 1.75rem;
                                        font-size: 0.95rem;
                                    }
                                    .article-content * + * {
                                        margin-top: 1rem;
                                    }
                                `}
                            </style>
                            <div 
                                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-orange-600 prose-blockquote:border-orange-600 prose-code:bg-gray-100 article-content"
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />

                            {/* Cited Cases */}
                            {blog.citedCases && blog.citedCases.length > 0 && (
                                <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                        <Scale className="w-5 h-5" />
                                        Cited Cases
                                    </h3>
                                    <div className="space-y-3">
                                        {blog.citedCases.map((caseItem, index) => (
                                            <div key={index} className="bg-white p-4 rounded-lg border border-blue-100">
                                                <h4 className="font-medium text-gray-900">{caseItem.caseName}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {caseItem.citation} ({caseItem.year}) - {caseItem.court}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Related Acts */}
                            {blog.relatedActs && blog.relatedActs.length > 0 && (
                                <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                                    <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5" />
                                        Related Acts & Sections
                                    </h3>
                                    <div className="space-y-3">
                                        {blog.relatedActs.map((act, index) => (
                                            <div key={index} className="bg-white p-4 rounded-lg border border-green-100">
                                                <h4 className="font-medium text-gray-900">{act.actName}</h4>
                                                {act.sections && act.sections.length > 0 && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Sections: {act.sections.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {blog.tags && blog.tags.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Tags:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {blog.tags.map((tag, index) => (
                                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-8">
                                {/* Author Bio */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{blog.author?.fullName || 'LEGALVAULT Team'}</h4>
                                            <p className="text-sm text-gray-600">{blog.author?.role || 'Legal Expert'}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Experienced legal professional sharing insights on current legal matters.
                                    </p>
                                </div>

                                {/* Related Topics */}
                                {blog.legalTopics && blog.legalTopics.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Topics</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {blog.legalTopics.map((topic, index) => (
                                                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <button 
                                            onClick={() => setShowShareMenu(true)}
                                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded text-left"
                                        >
                                            <Share2 className="w-5 h-5" />
                                            Share
                                        </button>
                                        <button 
                                            onClick={() => window.print()}
                                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded text-left"
                                        >
                                            <ExternalLink className="w-5 h-5" />
                                            Print
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Related Articles */}
            {relatedBlogs.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedBlogs.map((relatedBlog, index) => (
                            <Link
                                key={index}
                                to={`/blog/${relatedBlog.slug}`}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                            >
                                {relatedBlog.featuredImage?.url ? (
                                    <img
                                        src={relatedBlog.featuredImage.url}
                                        alt={relatedBlog.title}
                                        className="w-full h-32 object-cover"
                                    />
                                ) : (
                                    <div className="h-32 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                                        <Scale className="w-8 h-8 text-orange-600" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {relatedBlog.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                        {relatedBlog.excerpt}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span>{relatedBlog.readTime || 5} min read</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"></div>
        </div>
    );
};

export default Blogdetails;