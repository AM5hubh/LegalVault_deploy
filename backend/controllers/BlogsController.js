const Blog = require('../models/BlogsModel');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// Utility: Extract legal keywords from content
const extractKeywords = (content) => {
    const legalTerms = [
        'section', 'act', 'law', 'court', 'judgment', 'case', 'legal', 'procedure', 
        'evidence', 'witness', 'trial', 'appeal', 'petition', 'jurisdiction', 
        'constitution', 'statute', 'regulation', 'ordinance', 'amendment', 'bail',
        'custody', 'sentence', 'fine', 'penalty', 'criminal', 'civil', 'contract',
        'property', 'family', 'marriage', 'divorce', 'inheritance', 'succession',
        'company', 'corporate', 'tax', 'labour', 'employment', 'consumer', 'cyber'
    ];
    
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    
    const words = content.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word));
    
    const frequency = {};
    words.forEach(word => {
        // Give higher weight to legal terms
        const weight = legalTerms.includes(word) ? 3 : 1;
        frequency[word] = (frequency[word] || 0) + weight;
    });
    
    return Object.keys(frequency)
        .sort((a, b) => frequency[b] - frequency[a])
        .slice(0, 15);
};

// Utility: Calculate SEO score for legal content
const calculateSEOScore = (blog) => {
    let score = 0;
    
    // Title optimization
    if (blog.title && blog.title.length >= 30 && blog.title.length <= 60) score += 20;
    else if (blog.title && blog.title.length >= 20) score += 10;
    
    // Meta description
    if (blog.metaDescription && blog.metaDescription.length >= 120 && blog.metaDescription.length <= 160) score += 15;
    else if (blog.metaDescription && blog.metaDescription.length >= 100) score += 10;
    
    // Content length
    if (blog.content) {
        const wordCount = blog.content.split(' ').length;
        if (wordCount >= 1000) score += 20;
        else if (wordCount >= 500) score += 15;
        else if (wordCount >= 300) score += 10;
    }
    
    // Featured image
    if (blog.featuredImage && blog.featuredImage.url) score += 10;
    
    // Tags
    if (blog.tags && blog.tags.length >= 3) score += 10;
    else if (blog.tags && blog.tags.length >= 1) score += 5;
    
    // Keywords
    if (blog.keywords && blog.keywords.length >= 5) score += 15;
    else if (blog.keywords && blog.keywords.length >= 3) score += 10;
    
    // Excerpt
    if (blog.excerpt && blog.excerpt.length >= 100) score += 10;
    else if (blog.excerpt && blog.excerpt.length >= 50) score += 5;
    
    // Legal-specific scoring
    if (blog.legalTopics && blog.legalTopics.length > 0) score += 10;
    if (blog.citedCases && blog.citedCases.length > 0) score += 10;
    if (blog.relatedActs && blog.relatedActs.length > 0) score += 10;
    
    return Math.min(score, 100); // Cap at 100
};

// Utility: Upload image to Cloudinary
const uploadImageToCloudinary = async (file, folder = 'legalvault-blog-images') => {
    try {
        const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(base64String, {
            folder,
            resource_type: 'image',
            transformation: [
                { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
                { fetch_format: 'auto' }
            ]
        });
        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        throw new Error('Image upload failed: ' + error.message);
    }
};

// Utility: Delete image from Cloudinary
const deleteImageFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error.message);
    }
};

// Utility: Log user activity
const logUserActivity = async (userId, action, details = '') => {
    try {
        await User.findByIdAndUpdate(userId, {
            $push: {
                activityLog: {
                    action,
                    details,
                    category: 'blog',
                    timestamp: new Date()
                }
            }
        });
    } catch (error) {
        console.error('Failed to log user activity:', error.message);
    }
};

// Utility: Parse JSON arrays safely
const parseJSONArray = (str) => {
    try {
        if (typeof str === 'string') {
            return JSON.parse(str);
        }
        return Array.isArray(str) ? str : [];
    } catch (error) {
        return [];
    }
};

module.exports = {
    // Public: Get all published blogs
    getAllBlogs: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const category = req.query.category;
            const legalTopic = req.query.legalTopic;
            const search = req.query.search;
            
            let query = { 
                isPublished: true,
                status: 'published'
            };
            
            if (category) query.category = category;
            if (legalTopic) query.legalTopics = { $in: [legalTopic] };
            
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } },
                    { legalTopics: { $in: [new RegExp(search, 'i')] } }
                ];
            }
            
            const total = await Blog.countDocuments(query);
            const blogs = await Blog.find(query)
                .populate('author', 'fullName role')
                .sort({ publishedAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .select('-editHistory -reviewComments')
                .lean();
            
            res.json({
                success: true,
                blogs: blogs || [],
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total,
                filters: {
                    category: category || null,
                    legalTopic: legalTopic || null,
                    search: search || null
                }
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: 'Error loading blogs: ' + error.message 
            });
        }
    },

    // Public: Get single blog by slug
    getBlogBySlug: async (req, res) => {
        try {
            const blog = await Blog.findOne({
                slug: req.params.slug,
                isPublished: true,
                status: 'published'
            })
            .populate('author', 'fullName role')
            .populate('comments.user', 'fullName')
            .populate('reviewedBy', 'fullName');
            
            if (!blog) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Blog not found' 
                });
            }
            
            // Increment view count
            blog.views += 1;
            await blog.save();
            
            // Get related blogs
            const relatedBlogs = await Blog.find({
                _id: { $ne: blog._id },
                $or: [
                    { category: blog.category },
                    { legalTopics: { $in: blog.legalTopics } }
                ],
                isPublished: true,
                status: 'published'
            })
            .limit(3)
            .populate('author', 'fullName')
            .select('title slug excerpt featuredImage readTime publishedAt');
            
            res.json({
                success: true,
                blog,
                relatedBlogs,
                structuredData: blog.generateStructuredData()
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: 'Error loading blog: ' + error.message 
            });
        }
    },

    // User: Get user's blogs
    getUserBlogs: async (req, res) => {
        try {
            const userId = req.user?.userId || req.user?.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            
            let query = { author: userId };
            if (status) query.status = status;
            
            const total = await Blog.countDocuments(query);
            const blogs = await Blog.find(query)
                .populate('reviewedBy', 'fullName')
                .sort({ updatedAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit)
                .select('-content -editHistory');
            
            res.json({
                success: true,
                blogs,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total,
                statusFilter: status || null
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: 'Error loading user blogs: ' + error.message 
            });
        }
    },

    // User: Get single blog for editing
    getUserBlogForEdit: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId || req.user?.id;
            
            const blog = await Blog.findOne({
                _id: id,
                author: userId
            }).populate('author', 'fullName role');
            
            if (!blog) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Blog not found or access denied' 
                });
            }
            
            res.json({
                success: true,
                blog
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: 'Error loading blog: ' + error.message 
            });
        }
    },

    // User: Create blog - FIXED USER ID ISSUE AND META TITLE LENGTH
    createBlog: async (req, res) => {
        try {
            // Debug logging
            console.log('User from middleware:', req.user);
            console.log('Request body keys:', Object.keys(req.body));
            
            // Fix: Check for both userId and id
            const userId = req.user?.userId || req.user?.id;
            
            if (!req.user || !userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User authentication required. req.user not found.'
                });
            }

            const {
                title,
                content,
                excerpt,
                category,
                tags,
                legalTopics,
                targetAudience,
                citedCases,
                relatedActs,
                metaTitle,
                metaDescription,
                canonicalUrl,
                status
            } = req.body;

            console.log('Creating blog with author ID:', userId);

            // Validate required fields
            if (!title || !content || !excerpt || !category) {
                return res.status(400).json({
                    success: false,
                    error: 'Title, content, excerpt, and category are required fields'
                });
            }

            // Handle image uploads
            let featuredImage = null;
            if (req.files && req.files.featuredImage && req.files.featuredImage[0]) {
                try {
                    featuredImage = await uploadImageToCloudinary(
                        req.files.featuredImage[0], 
                        'legalvault-blog-featured'
                    );
                } catch (uploadError) {
                    return res.status(500).json({
                        success: false,
                        error: 'Featured image upload failed: ' + uploadError.message
                    });
                }
            }

            let images = [];
            if (req.files && req.files.images) {
                try {
                    for (const file of req.files.images) {
                        const uploadedImage = await uploadImageToCloudinary(
                            file, 
                            'legalvault-blog-content'
                        );
                        images.push({
                            ...uploadedImage,
                            alt: file.originalname.split('.')[0]
                        });
                    }
                } catch (uploadError) {
                    return res.status(500).json({
                        success: false,
                        error: 'Content images upload failed: ' + uploadError.message
                    });
                }
            }

            // Parse arrays safely
            const parsedTags = tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : [];
            const parsedLegalTopics = parseJSONArray(legalTopics);
            const parsedTargetAudience = parseJSONArray(targetAudience);
            const parsedCitedCases = parseJSONArray(citedCases);
            const parsedRelatedActs = parseJSONArray(relatedActs);

            const keywords = extractKeywords(content + ' ' + title);

            // Fix meta fields to ensure proper length limits
            let finalMetaTitle = metaTitle || title;
            if (finalMetaTitle.length > 60) {
                finalMetaTitle = finalMetaTitle.substring(0, 57) + '...';
            }

            let finalMetaDescription = metaDescription || excerpt;
            if (finalMetaDescription.length > 160) {
                finalMetaDescription = finalMetaDescription.substring(0, 157) + '...';
            }

            const blogData = {
                title,
                content,
                excerpt,
                featuredImage,
                images,
                author: userId, // Use the extracted userId
                category,
                tags: parsedTags,
                legalTopics: parsedLegalTopics,
                targetAudience: parsedTargetAudience,
                citedCases: parsedCitedCases,
                relatedActs: parsedRelatedActs,
                keywords,
                metaTitle: finalMetaTitle,
                metaDescription: finalMetaDescription,
                canonicalUrl,
                status: status || 'draft',
                isPublished: status === 'published',
                publishedAt: status === 'published' ? new Date() : null
            };

            console.log('Blog data to save:', {
                title: blogData.title,
                author: blogData.author,
                category: blogData.category,
                status: blogData.status,
                metaTitle: blogData.metaTitle,
                metaTitleLength: blogData.metaTitle.length
            });

            const blog = new Blog(blogData);
            blog.seoScore = calculateSEOScore(blog);

            await blog.save();
            console.log('Blog saved successfully with ID:', blog._id);

            // Log activity - only if user activity logging is set up
            try {
                await logUserActivity(
                    userId,
                    'blog_created',
                    `Created blog: ${title}`
                );
            } catch (activityError) {
                console.log('Activity logging failed (non-critical):', activityError.message);
            }

            res.json({ 
                success: true, 
                blog,
                message: 'Blog created successfully'
            });
        } catch (error) {
            console.error('Create blog error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Failed to create blog: ' + error.message 
            });
        }
    },

    // User: Update blog - FIXED USER ID AND META FIELD LENGTHS
    updateBlog: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId || req.user?.id;
            
            const blog = await Blog.findOne({
                _id: id,
                author: userId
            });
            
            if (!blog) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Blog not found or access denied' 
                });
            }
            
            const {
                title,
                content,
                excerpt,
                category,
                tags,
                legalTopics,
                targetAudience,
                citedCases,
                relatedActs,
                metaTitle,
                metaDescription,
                canonicalUrl,
                status
            } = req.body;

            const originalTitle = blog.title;
            const changes = [];

            if (title && title !== blog.title) {
                changes.push(`Title changed from "${originalTitle}" to "${title}"`);
                blog.title = title;
            }
            if (content && content !== blog.content) {
                changes.push('Content updated');
                blog.content = content;
            }
            if (excerpt) blog.excerpt = excerpt;
            if (category) blog.category = category;
            
            // Parse arrays safely for updates
            if (tags) blog.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
            if (legalTopics) blog.legalTopics = parseJSONArray(legalTopics);
            if (targetAudience) blog.targetAudience = parseJSONArray(targetAudience);
            if (citedCases) blog.citedCases = parseJSONArray(citedCases);
            if (relatedActs) blog.relatedActs = parseJSONArray(relatedActs);
            
            // Fix meta fields length limits
            if (metaTitle) {
                blog.metaTitle = metaTitle.length > 60 ? metaTitle.substring(0, 57) + '...' : metaTitle;
            }
            if (metaDescription) {
                blog.metaDescription = metaDescription.length > 160 ? metaDescription.substring(0, 157) + '...' : metaDescription;
            }
            if (canonicalUrl) blog.canonicalUrl = canonicalUrl;

            if (status && status !== blog.status) {
                changes.push(`Status changed from "${blog.status}" to "${status}"`);
                const wasPublished = blog.isPublished;
                blog.status = status;
                blog.isPublished = status === 'published';
                
                if (!wasPublished && blog.isPublished) {
                    blog.publishedAt = new Date();
                    changes.push('Blog published');
                }
            }

            // Handle featured image update
            if (req.files && req.files.featuredImage && req.files.featuredImage[0]) {
                if (blog.featuredImage?.publicId) {
                    await deleteImageFromCloudinary(blog.featuredImage.publicId);
                }
                blog.featuredImage = await uploadImageToCloudinary(
                    req.files.featuredImage[0], 
                    'legalvault-blog-featured'
                );
                changes.push('Featured image updated');
            }

            if (content || title) {
                blog.keywords = extractKeywords(
                    (content || blog.content) + ' ' + (title || blog.title)
                );
            }

            blog.lastEditedBy = userId;
            blog.lastEditedAt = new Date();
            
            if (changes.length > 0) {
                blog.editHistory.push({
                    editedBy: userId,
                    changes: changes.join('; '),
                    version: blog.editHistory.length + 1
                });
            }

            blog.seoScore = calculateSEOScore(blog);

            await blog.save();

            // Log activity
            await logUserActivity(
                userId,
                'blog_updated',
                `Updated blog: ${blog.title}`
            );

            res.json({ 
                success: true, 
                blog,
                message: 'Blog updated successfully'
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: 'Failed to update blog: ' + error.message 
            });
        }
    },

    // User: Delete blog - FIXED USER ID
    deleteBlog: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId || req.user?.id;
            
            const blog = await Blog.findOne({
                _id: id,
                author: userId
            });
            
            if (!blog) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Blog not found or access denied' 
                });
            }
            
            // Delete images from Cloudinary
            if (blog.featuredImage?.publicId) {
                await deleteImageFromCloudinary(blog.featuredImage.publicId);
            }
            
            if (blog.images?.length > 0) {
                for (const image of blog.images) {
                    if (image.publicId) {
                        await deleteImageFromCloudinary(image.publicId);
                    }
                }
            }
            
            await Blog.findByIdAndDelete(id);

            // Log activity
            await logUserActivity(
                userId,
                'blog_deleted',
                `Deleted blog: ${blog.title}`
            );
            
            res.json({ 
                success: true,
                message: 'Blog deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: 'Failed to delete blog: ' + error.message 
            });
        }
    },

    // Admin: Get all blogs
    adminGetAllBlogs: async (req, res) => {
        try {
            const userId = req.user?.userId || req.user?.id;
            
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ 
                    success: false,
                    error: 'Access denied' 
                });
            }
            
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const status = req.query.status;
            
            let query = {};
            if (status) query.status = status;
            
            const total = await Blog.countDocuments(query);
            const blogs = await Blog.find(query)
                .populate('author', 'fullName email role')
                .populate('reviewedBy', 'fullName')
                .sort({ updatedAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit);
            
            res.json({
                success: true,
                blogs,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total,
                statusFilter: status || null
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                error: 'Error loading blogs: ' + error.message 
            });
        }
    },

    // Admin: Review and approve/reject blog
    adminReviewBlog: async (req, res) => {
        try {
            const userId = req.user?.userId || req.user?.id;
            
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ 
                    success: false,
                    error: 'Access denied' 
                });
            }
            
            const { id } = req.params;
            const { status, reviewComments } = req.body;
            
            const blog = await Blog.findById(id);
            if (!blog) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Blog not found' 
                });
            }
            
            blog.status = status;
            blog.reviewedBy = userId;
            blog.reviewedAt = new Date();
            blog.reviewComments = reviewComments;
            
            if (status === 'published') {
                blog.isPublished = true;
                if (!blog.publishedAt) {
                    blog.publishedAt = new Date();
                }
            } else {
                blog.isPublished = false;
            }
            
            await blog.save();
            
            // Log activity
            await logUserActivity(
                userId,
                'blog_reviewed',
                `Reviewed blog: ${blog.title} - Status: ${status}`
            );
            
            res.json({ 
                success: true,
                blog,
                message: `Blog ${status} successfully`
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: 'Failed to review blog: ' + error.message 
            });
        }
    }
};