import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Calendar, 
    Eye, 
    User, 
    Clock, 
    ArrowRight, 
    Tag, 
    Scale,
    FileText,
    Gavel,
    BookOpen
} from 'lucide-react';

const BlogCard = ({ post, className = "" }) => {
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Legal Updates': return <Scale className="w-4 h-4" />;
            case 'Case Studies': return <FileText className="w-4 h-4" />;
            case 'Court Judgments': return <Gavel className="w-4 h-4" />;
            default: return <BookOpen className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <article className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group ${className}`}>
            {post.featuredImage?.url && (
                <div className="aspect-w-16 aspect-h-9">
                    <img
                        src={post.featuredImage.url}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                </div>
            )}
            
            {!post.featuredImage?.url && (
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <Scale className="w-8 h-8 text-orange-600" />
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
                            <span className="truncate max-w-20">
                                {post.author?.fullName || 'LEGALVAULT Team'}
                            </span>
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
                        {formatDate(post.publishedAt || post.createdAt)}
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
    );
};

// Blog Grid Component for multiple cards
const BlogGrid = ({ posts, loading = false, className = "" }) => {
    if (loading) {
        return (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                        <div className="h-48 bg-gray-200"></div>
                        <div className="p-6">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles available</h3>
                <p className="text-gray-600 mb-6">
                    Be the first to publish a legal article on LEGALVAULT.
                </p>
                <Link
                    to="/blog/create"
                    className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                >
                    <BookOpen className="w-5 h-5" />
                    Write First Article
                </Link>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
            {posts.map((post) => (
                <BlogCard key={post._id || post.slug} post={post} />
            ))}
        </div>
    );
};

export { BlogCard, BlogGrid };
export default BlogCard;