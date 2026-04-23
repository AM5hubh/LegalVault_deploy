const RoleRequest = require("../models/RoleRequest");
const User = require("../models/User");
const { sendEmail } = require("../services/notificationService");

// Get all role requests for RoleAssigner to review
exports.getAllRequestsForReview = async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10 } = req.query;

    const filter = {};
    
    // RoleAssigner mainly sees pending and under_review requests
    // They can also see verified requests they've verified
    if (status) {
      filter.status = status;
    } else {
      // Default: show pending and under_review
      filter.status = { $in: ["pending", "under_review"] };
    }

    if (role) {
      filter.requestedRole = role;
    }

    const skip = (page - 1) * limit;

    const requests = await RoleRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "email fullName")
      .populate("verifiedBy", "fullName email");

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
    console.error("Error fetching role requests for review:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching role requests",
      error: error.message,
    });
  }
};

// Get single role request by ID for detailed review
exports.getRequestById = async (req, res) => {
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

// Verify a role request (adds watermark and moves to verified status)
exports.verifyRoleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationNotes } = req.body;
    const roleAssignerId = req.user._id;
    const roleAssignerName = req.user.fullName || req.user.email;

    const request = await RoleRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Role request not found",
      });
    }

    // Check if already verified or processed
    if (request.status === "verified") {
      return res.status(400).json({
        success: false,
        message: "This request has already been verified",
      });
    }

    if (request.status === "approved" || request.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed by admin",
      });
    }

    // Update request with verification details
    request.status = "verified";
    request.verifiedBy = roleAssignerId;
    request.verifiedAt = new Date();
    request.verificationNotes = verificationNotes || "";
    request.verificationWatermark = `Verified by ${roleAssignerName} on ${new Date().toLocaleString()}`;

    await request.save();

    // Send notification to user
    try {
      await sendEmail({
        to: request.email,
        subject: "Role Request Verified - LEGALVAULT",
        html: `
          <h2>Your Role Request Has Been Verified</h2>
          <p>Dear ${request.fullName},</p>
          <p>Your request for <strong>${request.requestedRole}</strong> role has been verified by our Role Assigner team.</p>
          <p><strong>Request ID:</strong> ${request._id}</p>
          <p><strong>Verified By:</strong> ${roleAssignerName}</p>
          <p><strong>Status:</strong> Awaiting Admin Approval</p>
          <p>Your request will now be reviewed by an administrator for final approval.</p>
          <br>
          <p>Best regards,<br>LEGALVAULT Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
    }

    // Notify admins about verified request
    try {
      const admins = await User.find({ role: "admin" });
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: "Verified Role Request - Action Required",
          html: `
            <h2>New Verified Role Request</h2>
            <p><strong>Applicant:</strong> ${request.fullName}</p>
            <p><strong>Email:</strong> ${request.email}</p>
            <p><strong>Requested Role:</strong> ${request.requestedRole}</p>
            <p><strong>Organization:</strong> ${request.organizationName}</p>
            <p><strong>Verified By:</strong> ${roleAssignerName}</p>
            <p><strong>Request ID:</strong> ${request._id}</p>
            <p><strong>Verification Date:</strong> ${new Date().toLocaleString()}</p>
            ${verificationNotes ? `<p><strong>Notes:</strong> ${verificationNotes}</p>` : ""}
            <p>Please review this verified request in the admin dashboard for final approval.</p>
          `,
        });
      }
    } catch (emailError) {
      console.error("Error notifying admins:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Role request verified successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error verifying role request:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying role request",
      error: error.message,
    });
  }
};

// Reject/return request for more information
exports.returnRequestForInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const roleAssignerId = req.user._id;
    const roleAssignerName = req.user.fullName || req.user.email;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide a reason for returning the request",
      });
    }

    const request = await RoleRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Role request not found",
      });
    }

    // Update status to under_review
    request.status = "under_review";
    request.verificationNotes = `Returned for more information by ${roleAssignerName}: ${reason}`;

    await request.save();

    // Send email to applicant
    try {
      await sendEmail({
        to: request.email,
        subject: "Additional Information Required - LEGALVAULT",
        html: `
          <h2>Additional Information Required</h2>
          <p>Dear ${request.fullName},</p>
          <p>Your role request (ID: ${request._id}) requires additional information or clarification.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Please contact our support team or resubmit your application with the required information.</p>
          <br>
          <p>Best regards,<br>LEGALVAULT Team</p>
        `,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Request returned for more information",
      data: request,
    });
  } catch (error) {
    console.error("Error returning request:", error);
    res.status(500).json({
      success: false,
      message: "Error processing request",
      error: error.message,
    });
  }
};

// Get statistics for RoleAssigner dashboard
exports.getStatistics = async (req, res) => {
  try {
    const total = await RoleRequest.countDocuments();
    const pending = await RoleRequest.countDocuments({ status: "pending" });
    const underReview = await RoleRequest.countDocuments({ status: "under_review" });
    const verified = await RoleRequest.countDocuments({ status: "verified" });
    const approved = await RoleRequest.countDocuments({ status: "approved" });
    const rejected = await RoleRequest.countDocuments({ status: "rejected" });

    // Get requests verified by this role assigner
    const myVerifications = await RoleRequest.countDocuments({
      verifiedBy: req.user._id,
    });

    // Get role-wise breakdown
    const roleBreakdown = await RoleRequest.aggregate([
      {
        $match: {
          status: { $in: ["pending", "under_review"] },
        },
      },
      {
        $group: {
          _id: "$requestedRole",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRequests = await RoleRequest.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        underReview,
        verified,
        approved,
        rejected,
        myVerifications,
        roleBreakdown,
        recentRequests,
        awaitingAction: pending + underReview, // Requests needing attention
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// Get my verification history
exports.getMyVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const verifications = await RoleRequest.find({
      verifiedBy: req.user._id,
    })
      .sort({ verifiedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "email fullName");

    const total = await RoleRequest.countDocuments({
      verifiedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: verifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching verification history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching verification history",
      error: error.message,
    });
  }
};

module.exports = exports;
