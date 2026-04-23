const express = require('express');
const router = express.Router();
const multer = require('multer');
const blogController = require('../controllers/BlogsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create roleMiddleware function if it doesn't exist
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied - insufficient permissions'
            });
        }
        
        next();
    };
};

// Multer config for memory storage (for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for legal documents/images
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// -------- PUBLIC ROUTES --------
router.get('/', blogController.getAllBlogs);
router.get('/sitemap.xml', (req, res) => {
    // Simple sitemap generation
    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://legalvault.com/blog</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>`);
});
router.get('/:slug', blogController.getBlogBySlug);

// -------- USER ROUTES (Authenticated users can create/manage blogs) --------
router.get('/user/my-blogs', authMiddleware, blogController.getUserBlogs);
router.get('/user/edit/:id', authMiddleware, blogController.getUserBlogForEdit);

router.post(
    '/user/create',
    authMiddleware,
    upload.fields([
        { name: 'featuredImage', maxCount: 1 },
        { name: 'images', maxCount: 10 }
    ]),
    blogController.createBlog
);

router.put(
    '/user/edit/:id',
    authMiddleware,
    upload.fields([
        { name: 'featuredImage', maxCount: 1 },
        { name: 'images', maxCount: 10 }
    ]),
    blogController.updateBlog
);

router.delete('/user/delete/:id', authMiddleware, blogController.deleteBlog);

// -------- ADMIN ROUTES --------
router.get('/admin/all', authMiddleware, roleMiddleware(['admin']), blogController.adminGetAllBlogs);
router.put('/admin/review/:id', authMiddleware, roleMiddleware(['admin']), blogController.adminReviewBlog);

module.exports = router;