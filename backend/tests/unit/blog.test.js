const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Blog = require('../../models/BlogsModel');
const User = require('../../models/User');
const { createBlog } = require('../../controllers/BlogsController');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
});

describe('Blog Creation and Activity Logging', () => {
    test('should create blog and log activity without validation errors', async () => {
        // Create a test user
        const testUser = new User({
            fullName: 'Test User',
            email: 'test@example.com',
            password: 'hashedpassword',
            role: 'user'
        });
        await testUser.save();

        // Mock request object
        const mockReq = {
            user: { userId: testUser._id },
            body: {
                title: 'Test Blog Title',
                content: 'This is a test blog content for validation testing.',
                excerpt: 'Test excerpt',
                category: 'Legal Updates'
            }
        };

        // Mock response object
        const mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        // Call the createBlog function
        await createBlog(mockReq, mockRes);

        // Check if blog was created
        const blogs = await Blog.find({});
        expect(blogs).toHaveLength(1);
        expect(blogs[0].title).toBe('Test Blog Title');

        // Check if activity was logged without validation errors
        const updatedUser = await User.findById(testUser._id);
        expect(updatedUser.activityLog).toHaveLength(1);
        expect(updatedUser.activityLog[0].action).toBe('blog_created');
        expect(updatedUser.activityLog[0].category).toBe('blog');
        expect(updatedUser.activityLog[0].details).toBe('Created blog: Test Blog Title');
    });
});