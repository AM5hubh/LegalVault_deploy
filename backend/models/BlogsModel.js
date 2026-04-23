const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true,
        maxlength: 300
    },
    featuredImage: {
        url: String,
        publicId: String
    },
    images: [{
        url: String,
        publicId: String,
        alt: String
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
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
        ]
    },
    tags: [String],
    keywords: [String],
    metaTitle: {
        type: String,
        maxlength: 60
    },
    metaDescription: {
        type: String,
        maxlength: 160
    },
    canonicalUrl: String,
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: Date,
    readTime: {
        type: Number,
        default: 5
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        likedAt: {
            type: Date,
            default: Date.now
        }
    }],
    shares: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        comment: {
            type: String,
            required: true,
            maxlength: 500
        },
        commentedAt: {
            type: Date,
            default: Date.now
        },
        isApproved: {
            type: Boolean,
            default: false
        }
    }],
    seoScore: {
        type: Number,
        default: 0
    },
    structuredData: {
        type: Object
    },
    // Legal-specific fields
    legalTopics: [{
        type: String,
        enum: [
            'IPC', 'CrPC', 'CPC', 'Evidence Act', 'Constitution',
            'Company Law', 'Contract Law', 'Property Law', 'Family Law',
            'Tax Law', 'Labour Law', 'Environmental Law', 'Cyber Law',
            'Intellectual Property', 'Banking Law', 'Insurance Law',
            'Real Estate Law', 'Consumer Protection'
        ]
    }],
    targetAudience: [{
        type: String,
        enum: ['Lawyers', 'Law Students', 'Judges', 'Legal Researchers', 'General Public', 'Police Officers']
    }],
    citedCases: [{
        caseName: String,
        citation: String,
        year: String,
        court: String
    }],
    relatedActs: [{
        actName: String,
        sections: [String]
    }],
    // Author tracking
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastEditedAt: Date,
    editHistory: [{
        editedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        editedAt: {
            type: Date,
            default: Date.now
        },
        changes: {
            type: String
        },
        version: {
            type: Number,
            default: 1
        }
    }],
    status: {
        type: String,
        enum: ['draft', 'review', 'published', 'archived'],
        default: 'draft'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    reviewComments: String
}, {
    timestamps: true
});

// Auto-generate slug from title with uniqueness check
blogSchema.pre('save', async function(next) {
    if (this.isModified('title') || !this.slug) {
        let baseSlug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        // Ensure slug is unique
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existingBlog = await this.constructor.findOne({
                slug: slug,
                _id: { $ne: this._id }
            });

            if (!existingBlog) {
                this.slug = slug;
                break;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    // Calculate read time
    if (this.isModified('content')) {
        const wordsPerMinute = 200;
        const wordCount = this.content.split(' ').length;
        this.readTime = Math.ceil(wordCount / wordsPerMinute);
    }

    // Auto-generate meta fields if not provided
    if (!this.metaTitle) {
        this.metaTitle = this.title.length > 60 ? this.title.substring(0, 57) + '...' : this.title;
    }

    if (!this.metaDescription) {
        this.metaDescription = this.excerpt.length > 160 ? this.excerpt.substring(0, 157) + '...' : this.excerpt;
    }

    // Track edit history
    if (this.isModified() && !this.isNew) {
        this.lastEditedAt = new Date();
        // lastEditedBy should be set in the controller
    }

    next();
});

// Generate structured data for LEGALVAULT
blogSchema.methods.generateStructuredData = function() {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": this.title,
        "description": this.metaDescription,
        "image": this.featuredImage?.url,
        "author": {
            "@type": "Person",
            "name": this.author?.fullName || "LEGALVAULT Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": "LEGALVAULT",
            "logo": {
                "@type": "ImageObject",
                "url": "https://legalvault.com/assets/logo.png"
            }
        },
        "datePublished": this.publishedAt,
        "dateModified": this.updatedAt,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://legalvault.com/blog/${this.slug}`
        },
        "about": this.legalTopics?.map(topic => ({
            "@type": "Thing",
            "name": topic
        })),
        "keywords": this.keywords?.join(', ')
    };
};

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
    return this.likes?.length || 0;
});

// Virtual for comment count
blogSchema.virtual('commentCount').get(function() {
    return this.comments?.filter(comment => comment.isApproved)?.length || 0;
});

module.exports = mongoose.model('Blog', blogSchema);