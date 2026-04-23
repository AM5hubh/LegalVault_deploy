const RoleRequest = require("../models/RoleRequest");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const { sendEmail } = require("../services/notificationService");

const parseJsonSafely = (value, fallback = {}) => {
  if (!value) return fallback;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch (_err) {
    return fallback;
  }
};

const uploadBufferToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        filename_override: file.originalname,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          filename: file.originalname,
        });
      },
    );

    stream.end(file.buffer);
  });

// Submit a new role request
exports.submitRoleRequest = async (req, res) => {
  try {
    const {
      email,
      fullName,
      phone,
      requestedRole,
      organizationName,
      designation,
      departmentId,
      officeAddress,
      purpose,
      caseDetails,
      technicalRequirements,
      acceptedTerms,
    } = req.body;

    const parsedOfficeAddress = parseJsonSafely(officeAddress, {});
    const parsedTechnicalRequirements = parseJsonSafely(
      technicalRequirements,
      {},
    );

    // Validate required fields
    if (
      !email ||
      !fullName ||
      !phone ||
      !requestedRole ||
      !organizationName ||
      !designation ||
      !purpose
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if terms are accepted
    if (!acceptedTerms) {
      return res.status(400).json({
        success: false,
        message: "You must accept the terms and conditions",
      });
    }

    // Check if there's already a pending request for this email
    const existingRequest = await RoleRequest.findOne({
      email: email.toLowerCase(),
      status: { $in: ["pending", "under_review"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a pending role request. Please wait for admin review.",
      });
    }

    // Handle document uploads from req.files
    const documents = {};

    if (req.files) {
      // Upload each document to Cloudinary
      const uploadPromises = [];
      const fileFields = [
        "idProof",
        "authorizationLetter",
        "registrationCertificate",
        "professionalLicense",
        "securityClearance",
      ];

      for (const field of fileFields) {
        if (req.files[field] && req.files[field][0]) {
          const file = req.files[field][0];
          uploadPromises.push(
            uploadBufferToCloudinary(file, `role-requests/${email}`).then(
              (result) => ({ field, ...result }),
            ),
          );
        }
      }

      // Handle multiple additional documents
      if (req.files.additionalDocuments) {
        documents.additionalDocuments = [];
        for (const file of req.files.additionalDocuments) {
          uploadPromises.push(
            uploadBufferToCloudinary(
              file,
              `role-requests/${email}/additional`,
            ).then((result) => ({ field: "additional", ...result })),
          );
        }
      }

      const uploadResults = await Promise.all(uploadPromises);

      for (const result of uploadResults) {
        if (result.field === "additional") {
          if (!documents.additionalDocuments)
            documents.additionalDocuments = [];
          documents.additionalDocuments.push({
            url: result.url,
            publicId: result.publicId,
            filename: result.filename,
          });
        } else {
          documents[result.field] = {
            url: result.url,
            publicId: result.publicId,
            filename: result.filename,
          };
        }
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    // Create role request
    const roleRequest = await RoleRequest.create({
      userId: existingUser ? existingUser._id : null,
      email: email.toLowerCase(),
      fullName,
      phone,
      requestedRole,
      organizationName,
      designation,
      departmentId,
      officeAddress,
      officeAddress: parsedOfficeAddress,
      purpose,
      caseDetails,
      documents,
      technicalRequirements: parsedTechnicalRequirements,
      acceptedTerms,
      acceptedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    });

    // Send confirmation email to user
    try {
      await sendEmail({
        to: email,
        subject: "Role Request Submitted - LEGALVAULT",
        html: `
          <h2>Role Request Submitted Successfully</h2>
          <p>Dear ${fullName},</p>
          <p>Your request for <strong>${requestedRole}</strong> role has been submitted successfully.</p>
          <p><strong>Request ID:</strong> ${roleRequest._id}</p>
          <p><strong>Status:</strong> Pending Review</p>
          <p>Our team will review your application within 3-5 business days. You will receive an email notification once your request is processed.</p>
          <br>
          <p>Best regards,<br>LEGALVAULT Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    // Notify admins about new request
    try {
      const admins = await User.find({ role: "admin" });
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: "New Role Request - LEGALVAULT Admin",
          html: `
            <h2>New Role Request Received</h2>
            <p><strong>Applicant:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Requested Role:</strong> ${requestedRole}</p>
            <p><strong>Organization:</strong> ${organizationName}</p>
            <p><strong>Request ID:</strong> ${roleRequest._id}</p>
            <p>Please review this request in the admin dashboard.</p>
          `,
        });
      }
    } catch (emailError) {
      console.error("Error notifying admins:", emailError);
    }

    res.status(201).json({
      success: true,
      message:
        "Role request submitted successfully. You will receive a confirmation email shortly.",
      data: {
        requestId: roleRequest._id,
        status: roleRequest.status,
      },
    });
  } catch (error) {
    console.error("Error submitting role request:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting role request",
      error: error.message,
    });
  }
};

// Get all role requests (Admin only)
exports.getAllRoleRequests = async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Admin can see all requests by default, or filter by specific status
    if (status && status !== "all") {
      filter.status = status;
    }
    // If status is 'all' or not provided, show all requests (no status filter)

    if (role && role !== "all") filter.requestedRole = role;

    const skip = (page - 1) * limit;

    const requests = await RoleRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "email fullName phone role agency kycStatus")
      .populate("verifiedBy", "fullName email phone role agency designation")
      .populate("reviewedBy", "fullName email phone role agency");

    const total = await RoleRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching role requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching role requests",
      error: error.message,
    });
  }
};

// Get single role request by ID
exports.getRoleRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await RoleRequest.findById(id)
      .populate("userId", "email fullName phone role agency kycStatus")
      .populate("verifiedBy", "fullName email phone role agency designation")
      .populate("reviewedBy", "fullName email phone role agency");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Role request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Error fetching role request:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching role request",
      error: error.message,
    });
  }
};

// Get user's own role requests
exports.getMyRoleRequests = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const requests = await RoleRequest.find({
      email: userEmail.toLowerCase(),
    })
      .sort({ createdAt: -1 })
      .populate("verifiedBy", "fullName")
      .populate("reviewedBy", "fullName");

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching user role requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your role requests",
      error: error.message,
    });
  }
};

// Update role request status (Admin only)
exports.updateRoleRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, adminNotes } = req.body;
    const adminId = req.user._id;

    const request = await RoleRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Role request not found",
      });
    }

    // Update status
    request.status = status;
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    if (status === "rejected" && rejectionReason) {
      request.rejectionReason = rejectionReason;
    }

    if (adminNotes) {
      request.adminNotes = adminNotes;
    }

    await request.save();

    // If approved, update user role
    if (status === "approved") {
      let user = await User.findOne({ email: request.email.toLowerCase() });

      if (user) {
        user.role = request.requestedRole;
        user.agency = request.organizationName;
        await user.save();
      } else {
        // Create a new user account (they'll need to set password)
        user = await User.create({
          email: request.email,
          fullName: request.fullName,
          phone: request.phone,
          role: request.requestedRole,
          agency: request.organizationName,
          password: Math.random().toString(36).slice(-8), // Temporary password
          kycStatus: "pending",
        });
      }

      // Send approval email
      try {
        await sendEmail({
          to: request.email,
          subject: "Role Request Approved - LEGALVAULT",
          html: `
            <h2>Your Role Request Has Been Approved!</h2>
            <p>Dear ${request.fullName},</p>
            <p>Congratulations! Your request for <strong>${request.requestedRole}</strong> role has been approved.</p>
            <p><strong>Request ID:</strong> ${request._id}</p>
            <p><strong>Organization:</strong> ${request.organizationName}</p>
            ${user.password ? `<p>A temporary password has been generated. Please log in and change it immediately.</p>` : ""}
            <p>You can now access the LEGALVAULT system with your approved role.</p>
            <br>
            <p>Best regards,<br>LEGALVAULT Team</p>
          `,
        });
      } catch (emailError) {
        console.error("Error sending approval email:", emailError);
      }
    } else if (status === "rejected") {
      // Send rejection email
      try {
        await sendEmail({
          to: request.email,
          subject: "Role Request Update - LEGALVAULT",
          html: `
            <h2>Role Request Status Update</h2>
            <p>Dear ${request.fullName},</p>
            <p>We regret to inform you that your request for <strong>${request.requestedRole}</strong> role has been rejected.</p>
            <p><strong>Request ID:</strong> ${request._id}</p>
            ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ""}
            <p>If you believe this is an error or have additional documentation, please contact our support team.</p>
            <br>
            <p>Best regards,<br>LEGALVAULT Team</p>
          `,
        });
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Role request ${status} successfully`,
      data: request,
    });
  } catch (error) {
    console.error("Error updating role request:", error);
    res.status(500).json({
      success: false,
      message: "Error updating role request status",
      error: error.message,
    });
  }
};

// Delete role request (Admin only)
exports.deleteRoleRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await RoleRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Role request not found",
      });
    }

    // Delete associated documents from Cloudinary
    const deletePromises = [];

    if (request.documents) {
      Object.values(request.documents).forEach((doc) => {
        if (doc && doc.publicId) {
          deletePromises.push(
            cloudinary.uploader.destroy(doc.publicId).catch((err) => {
              console.error("Error deleting document:", err);
            }),
          );
        }
      });

      if (request.documents.additionalDocuments) {
        request.documents.additionalDocuments.forEach((doc) => {
          if (doc && doc.publicId) {
            deletePromises.push(
              cloudinary.uploader.destroy(doc.publicId).catch((err) => {
                console.error("Error deleting document:", err);
              }),
            );
          }
        });
      }
    }

    await Promise.all(deletePromises);
    await RoleRequest.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Role request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting role request:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting role request",
      error: error.message,
    });
  }
};

// Get statistics (Admin only)
exports.getRoleRequestStats = async (req, res) => {
  try {
    const stats = await RoleRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const roleStats = await RoleRequest.aggregate([
      {
        $group: {
          _id: "$requestedRole",
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await RoleRequest.countDocuments();
    const pending = await RoleRequest.countDocuments({ status: "pending" });
    const verified = await RoleRequest.countDocuments({ status: "verified" });
    const approved = await RoleRequest.countDocuments({ status: "approved" });
    const rejected = await RoleRequest.countDocuments({ status: "rejected" });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        verified,
        approved,
        rejected,
        byStatus: stats,
        byRole: roleStats,
      },
    });
  } catch (error) {
    console.error("Error fetching role request stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};
