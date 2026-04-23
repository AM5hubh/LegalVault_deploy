const Contact = require('../models/contactModel');
const logger = require('../utils/logger');
const Joi = require('joi');

// Validation schema for contact form
const contactSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\d{10}$/).required(),
  subject: Joi.string().trim().min(5).max(200).required(),
  category: Joi.string().valid(
    'technical_support',
    'legal_inquiry', 
    'evidence_submission',
    'account_issues',
    'kyc_verification',
    'general_inquiry',
    'feedback',
    'complaint',
    'partnership',
    'other'
  ).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  message: Joi.string().trim().min(10).max(2000).required()
});

// Create new contact message (Public endpoint)
exports.createContact = async (req, res) => {
  try {
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: error.details[0].message 
      });
    }

    const contactData = {
      ...value,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    const contact = new Contact(contactData);
    await contact.save();

    logger.info('New contact message created', { 
      contactId: contact._id, 
      email: contact.email,
      category: contact.category 
    });

    res.status(201).json({
      message: 'Your message has been sent successfully! We will get back to you soon.',
      contactId: contact._id
    });
  } catch (error) {
    logger.error('Create contact failed', { error: error.message });
    res.status(500).json({ 
      message: 'Failed to send message. Please try again.' 
    });
  }
};

// Get all contact messages (Admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      category, 
      priority,
      search 
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(filter)
      .populate('assignedTo', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(filter);

    // Get summary statistics
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    logger.info('Admin fetched contacts', { 
      page, 
      limit, 
      total,
      adminId: req.user.userId 
    });

    res.json({
      contacts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    logger.error('Get contacts failed', { error: error.message });
    res.status(500).json({ 
      message: 'Failed to fetch contacts' 
    });
  }
};

// Get single contact message (Admin only)
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('assignedTo', 'fullName email');

    if (!contact) {
      return res.status(404).json({ 
        message: 'Contact message not found' 
      });
    }

    // Mark as read
    if (!contact.isRead) {
      contact.isRead = true;
      await contact.save();
    }

    res.json(contact);
  } catch (error) {
    logger.error('Get contact by ID failed', { error: error.message });
    res.status(500).json({ 
      message: 'Failed to fetch contact' 
    });
  }
};

// Update contact status and response (Admin only)
exports.updateContact = async (req, res) => {
  try {
    const { status, adminResponse, priority, assignedTo, tags } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (adminResponse) {
      updateData.adminResponse = adminResponse;
      updateData.responseDate = new Date();
    }
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (tags) updateData.tags = tags;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'fullName email');

    if (!contact) {
      return res.status(404).json({ 
        message: 'Contact message not found' 
      });
    }

    logger.info('Contact updated by admin', { 
      contactId: contact._id,
      adminId: req.user.userId,
      status: contact.status 
    });

    res.json({
      message: 'Contact updated successfully',
      contact
    });
  } catch (error) {
    logger.error('Update contact failed', { error: error.message });
    res.status(500).json({ 
      message: 'Failed to update contact' 
    });
  }
};

// Delete contact message (Admin only)
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ 
        message: 'Contact message not found' 
      });
    }

    logger.info('Contact deleted by admin', { 
      contactId: req.params.id,
      adminId: req.user.userId 
    });

    res.json({ 
      message: 'Contact message deleted successfully' 
    });
  } catch (error) {
    logger.error('Delete contact failed', { error: error.message });
    res.status(500).json({ 
      message: 'Failed to delete contact' 
    });
  }
};

// Get contact statistics (Admin only)
exports.getContactStats = async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          newMessages: { 
            $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } 
          },
          inProgress: { 
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } 
          },
          resolved: { 
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } 
          },
          urgent: { 
            $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } 
          },
          unread: { 
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } 
          }
        }
      }
    ]);

    const categoryStats = await Contact.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      summary: stats[0] || {
        total: 0,
        newMessages: 0,
        inProgress: 0,
        resolved: 0,
        urgent: 0,
        unread: 0
      },
      byCategory: categoryStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    logger.error('Get contact stats failed', { error: error.message });
    res.status(500).json({ 
      message: 'Failed to fetch contact statistics' 
    });
  }
};