const User = require("../models/User");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../utils/validationUtils");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Enhanced activity logging helper function

// Enhanced activity logging helper function
const logUserActivity = async (
  userId,
  action,
  details = "",
  req = null,
  category = "system",
  severity = "low",
  metadata = {},
) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (!user.activityLog) {
      user.activityLog = [];
    }

    // Enhanced IP detection with multiple fallbacks
    const getClientIP = (req) => {
      if (!req) return "System";

      return (
        req.headers["cf-connecting-ip"] || // Cloudflare
        req.headers["x-real-ip"] || // Nginx
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || // Load balancer
        req.connection?.remoteAddress || // Direct connection
        req.socket?.remoteAddress || // Socket connection
        req.connection?.socket?.remoteAddress || // Nested socket
        req.ip || // Express default
        "127.0.0.1" // Fallback
      );
    };

    const clientIP = getClientIP(req);
    const userAgent = req ? req.get("User-Agent") || "Unknown" : "System";
    const method = req?.method || "UNKNOWN";
    const endpoint = req?.originalUrl || req?.url || "unknown";

    // Create enhanced activity entry with comprehensive metadata
    const activityEntry = {
      action,
      timestamp: new Date(),
      ipAddress: clientIP,
      userAgent,
      details,
      category,
      severity,
      metadata: {
        ...metadata,
        sessionId: req?.sessionID,
        referer: req?.get("Referer"),
        acceptLanguage: req?.get("Accept-Language"),
        method,
        endpoint,
        statusCode: req?.statusCode,
        responseTime: req?.responseTime,
        timestamp: new Date().toISOString(),
        userRole: user.role,
        userId: userId.toString(),
      },
    };

    user.activityLog.unshift(activityEntry);

    // Keep only last 500 activity entries per user (increased limit)
    if (user.activityLog.length > 500) {
      user.activityLog = user.activityLog.slice(0, 500);
    }

    await user.save();

    // Enhanced logging with more context
    logger.info("User activity logged", {
      userId: userId.toString(),
      action,
      category,
      severity,
      ipAddress: clientIP,
      method,
      endpoint,
      timestamp: activityEntry.timestamp,
      details: details.substring(0, 100), // Limit details in logs
    });
  } catch (error) {
    logger.error("Failed to log user activity", {
      error: error.message,
      userId: userId?.toString(),
      action,
      stack: error.stack.substring(0, 500), // Limit stack trace
    });
    // Don't throw error to prevent breaking the main flow
  }
};

// Activity tracking middleware for all requests
const activityTrackingMiddleware = async (req, res, next) => {
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override res.end to capture response data
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;
    req.responseTime = responseTime;
    req.statusCode = res.statusCode;

    // Log API request activity if user is authenticated
    if (req.user && req.user.userId) {
      const activity = determineActivityFromRequest(req);
      if (activity.shouldLog) {
        setImmediate(() => {
          logUserActivity(
            req.user.userId,
            activity.action,
            activity.details,
            req,
            activity.category,
            activity.severity,
            {
              responseTime,
              statusCode: res.statusCode,
              method: req.method,
              endpoint: req.originalUrl,
            },
          );
        });
      }
    }

    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Determine activity type based on request
const determineActivityFromRequest = (req) => {
  const method = req.method;
  const path = req.originalUrl || req.url;
  const baseActivity = {
    shouldLog: true,
    action: "api_request",
    category: "api",
    severity: "low",
    details: `${method} ${path}`,
  };

  // Authentication endpoints
  if (path.includes("/auth/login")) {
    return {
      ...baseActivity,
      action: "login",
      category: "authentication",
      details: "User login attempt",
    };
  }
  if (path.includes("/auth/logout")) {
    return {
      ...baseActivity,
      action: "logout",
      category: "authentication",
      details: "User logout",
    };
  }
  if (path.includes("/auth/register")) {
    return {
      ...baseActivity,
      action: "register",
      category: "authentication",
      details: "User registration attempt",
    };
  }

  // Profile endpoints
  if (path.includes("/auth/profile")) {
    if (method === "GET") {
      return {
        ...baseActivity,
        action: "profile_view",
        category: "profile",
        details: "User viewed profile",
      };
    }
    if (method === "PUT" || method === "PATCH") {
      return {
        ...baseActivity,
        action: "profile_update",
        category: "profile",
        details: "User updated profile",
      };
    }
  }

  // Admin endpoints
  if (path.includes("/auth/users")) {
    if (method === "GET" && path.match(/\/users\/[^/]+$/)) {
      return {
        ...baseActivity,
        action: "view_user_details",
        category: "admin",
        details: "Admin viewed user details",
      };
    }
    if (method === "GET" && path === "/api/auth/users") {
      return {
        ...baseActivity,
        action: "users_list_view",
        category: "admin",
        details: "Admin viewed users list",
      };
    }
    if (path.includes("/role")) {
      return {
        ...baseActivity,
        action: "update_user_role",
        category: "admin",
        details: "Admin updated user role",
      };
    }
    if (path.includes("/status")) {
      return {
        ...baseActivity,
        action: "update_user_status",
        category: "admin",
        details: "Admin updated user status",
      };
    }
    if (path.includes("/ban")) {
      return {
        ...baseActivity,
        action: "ban_user",
        category: "admin",
        details: "Admin updated user ban status",
      };
    }
    if (path.includes("/notes")) {
      return {
        ...baseActivity,
        action: "add_admin_note",
        category: "admin",
        details: "Admin added note to user",
      };
    }
    if (path.includes("/activity/export")) {
      return {
        ...baseActivity,
        action: "export_activity_log",
        category: "admin",
        details: "Admin exported activity log",
      };
    }
    if (path.includes("/activity/stats")) {
      return {
        ...baseActivity,
        action: "view_activity_stats",
        category: "admin",
        details: "Admin viewed activity statistics",
      };
    }
  }

  // Health check - don't log
  if (path.includes("/health")) {
    return { ...baseActivity, shouldLog: false };
  }

  // Default API request logging
  return baseActivity;
};

// Register new user (CRUD: Create)
const registerUser = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      console.log("Validation error:", error.details[0].message);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, phone, role = "user", agency, fullName } = value;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user with proper initialization
    user = new User({
      email,
      password,
      phone,
      role,
      agency,
      fullName,
      kycStatus: "verified", // Auto-verify for development
      loginCount: 0,
      ipAddresses: [],
      activityLog: [],
    });
    await user.save();

    // Log registration activity
    await logUserActivity(
      user._id,
      "register",
      "User account created successfully",
      req,
      "authentication",
      "low",
      {
        initialRole: role,
        agency,
      },
    );

    // Log user creation
    console.log("User registered successfully:", {
      userId: user._id,
      email,
      role,
    });
    logger.info("User registered successfully", {
      userId: user._id,
      email,
      role,
    });

    res.status(201).json({
      message: "User registered successfully!",
      userId: user._id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    logger.error("User registration failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Login user (CRUD: Read)
const loginUser = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Log failed login attempt
      logger.error("Login failed - user not found", { email });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is banned
    if (user.banned) {
      logger.warn("Banned user attempted login", { userId: user._id, email });
      await logUserActivity(
        user._id,
        "login",
        "Banned user attempted login",
        req,
        "security",
        "high",
      );
      return res
        .status(403)
        .json({ message: "Account is banned. Please contact administrator." });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.error("Login failed - invalid password", { email });
      await logUserActivity(
        user._id,
        "login",
        "Failed login attempt - invalid password",
        req,
        "security",
        "medium",
      );
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Enhanced IP detection
    const clientIP =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
      req.ip ||
      "127.0.0.1";

    const cleanIP = clientIP.split(",")[0].trim();

    // Determine if this is a new IP
    const isNewIP = !user.ipAddresses || !user.ipAddresses.includes(cleanIP);

    // Update login tracking
    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;

    // Track IP addresses (keep last 15 unique)
    if (!user.ipAddresses) {
      user.ipAddresses = [];
    }

    if (!user.ipAddresses.includes(cleanIP)) {
      user.ipAddresses.unshift(cleanIP);
      if (user.ipAddresses.length > 15) {
        user.ipAddresses = user.ipAddresses.slice(0, 15);
      }
    } else {
      // Move existing IP to front (most recent)
      user.ipAddresses = user.ipAddresses.filter((ip) => ip !== cleanIP);
      user.ipAddresses.unshift(cleanIP);
    }

    // Save user first
    await user.save();

    // Enhanced login activity logging
    const loginDetails = `Successful login from ${cleanIP}${isNewIP ? " (New IP)" : ""}`;
    const loginSeverity = isNewIP ? "medium" : "low";

    await logUserActivity(
      user._id,
      "login",
      loginDetails,
      req,
      "authentication",
      loginSeverity,
      {
        loginCount: user.loginCount,
        isNewIP,
        userAgent: req.get("User-Agent"),
      },
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    logger.info("User logged in successfully", {
      userId: user._id,
      email: user.email,
      ipAddress: cleanIP,
      loginCount: user.loginCount,
      isNewIP,
    });

    // Return user data without password
    const userResponse = {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      kycStatus: user.kycStatus,
      agency: user.agency,
      loginCount: user.loginCount,
      lastLoginAt: user.lastLoginAt,
    };

    res.json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    logger.error("User login failed", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Server error during login" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email } = value;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For development, just return success
    res.json({ message: "Password reset functionality will be implemented" });
  } catch (error) {
    logger.error("Forgot password failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    res.json({ message: "Password reset functionality will be implemented" });
  } catch (error) {
    logger.error("Reset password failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -resetPasswordToken -resetPasswordExpires",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    logger.error("Get profile failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ["fullName", "agency", "phone"];

    // Filter updates
    const updateFields = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updateFields[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.userId, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log activity
    await logUserActivity(
      req.user.userId,
      "profile_updated",
      "Profile information updated",
      req,
    );

    logger.info("User profile updated", { userId: user._id });

    res.json({ message: "Profile updated", user });
  } catch (error) {
    logger.error("Update profile failed", { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log activity
    await logUserActivity(
      req.user.userId,
      "delete_user",
      `Deleted user: ${user.email}`,
      req,
    );

    logger.info("User deleted by admin", {
      userId: req.params.id,
      adminId: req.user.userId,
    });

    res.json({ message: "User deleted" });
  } catch (error) {
    logger.error("Delete user failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { page = 1, limit = 10, kycStatus } = req.query;
    const filter = kycStatus ? { kycStatus } : {};
    const users = await User.find(filter)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    logger.info("Admin fetched all users", { page, limit, total });

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    logger.error("Get all users failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { userId } = req.params;
    const { role, reason } = req.body;

    // Validate role
    const validRoles = [
      "admin",
      "role_assigner",
      "police",
      "lawyer",
      "judge",
      "forensic_expert",
      "user",
    ];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Find user to update
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from changing their own role
    if (userId === req.user.userId) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    // Store old role for logging
    const oldRole = user.role;

    // Update user role
    user.role = role;
    user.roleUpdatedAt = new Date();
    user.roleUpdatedBy = req.user.userId;

    // Add to role history if it doesn't exist
    if (!user.roleHistory) {
      user.roleHistory = [];
    }

    user.roleHistory.push({
      oldRole,
      newRole: role,
      updatedBy: req.user.userId,
      updatedAt: new Date(),
      reason: reason || "Role updated by admin",
    });

    await user.save();

    // Log activity for both admin and target user
    await logUserActivity(
      req.user.userId,
      "update_user_role",
      `Updated role for ${user.email} from ${oldRole} to ${role}`,
      req,
    );
    await logUserActivity(
      userId,
      "role_updated",
      `Role updated from ${oldRole} to ${role} by admin`,
      req,
    );

    // Log the role change
    logger.info("User role updated by admin", {
      userId,
      oldRole,
      newRole: role,
      adminId: req.user.userId,
      reason,
    });

    // Return updated user without sensitive fields
    const updatedUser = await User.findById(userId).select(
      "-password -resetPasswordToken -resetPasswordExpires",
    );

    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Update user role failed", { error: error.message });
    res.status(500).json({ message: "Server error while updating user role" });
  }
};

// Update user status (admin only)
const updateUserStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { userId } = req.params;
    const { kycStatus, reason } = req.body;

    // Validate status
    const validStatuses = ["verified", "pending", "rejected", "expired"];
    if (!validStatuses.includes(kycStatus)) {
      return res.status(400).json({ message: "Invalid status specified" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const oldStatus = user.kycStatus;
    user.kycStatus = kycStatus;
    user.kycUpdatedAt = new Date();
    user.kycUpdatedBy = req.user.userId;

    // Add to status history
    if (!user.statusHistory) {
      user.statusHistory = [];
    }

    user.statusHistory.push({
      oldStatus,
      newStatus: kycStatus,
      updatedBy: req.user.userId,
      updatedAt: new Date(),
      reason: reason || "Status updated by admin",
    });

    await user.save();

    // Log activity
    await logUserActivity(
      req.user.userId,
      "update_user_status",
      `Updated status for ${user.email} from ${oldStatus} to ${kycStatus}`,
      req,
    );
    await logUserActivity(
      userId,
      "kyc_updated",
      `KYC status updated from ${oldStatus} to ${kycStatus} by admin`,
      req,
    );

    logger.info("User status updated by admin", {
      userId,
      oldStatus,
      newStatus: kycStatus,
      adminId: req.user.userId,
      reason,
    });

    const updatedUser = await User.findById(userId).select(
      "-password -resetPasswordToken -resetPasswordExpires",
    );

    res.json({
      message: "User status updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Update user status failed", { error: error.message });
    res
      .status(500)
      .json({ message: "Server error while updating user status" });
  }
};

// Ban/Unban user (admin only)
const banUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { userId } = req.params;
    const { banned, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from banning themselves
    if (userId === req.user.userId) {
      return res.status(400).json({ message: "Cannot ban yourself" });
    }

    const oldBanStatus = user.banned || false;
    user.banned = banned;
    user.banUpdatedAt = new Date();
    user.banUpdatedBy = req.user.userId;

    // Add to ban history
    if (!user.banHistory) {
      user.banHistory = [];
    }

    user.banHistory.push({
      oldStatus: oldBanStatus,
      newStatus: banned,
      updatedBy: req.user.userId,
      updatedAt: new Date(),
      reason:
        reason || (banned ? "User banned by admin" : "User unbanned by admin"),
    });

    await user.save();

    // Log activity
    await logUserActivity(
      req.user.userId,
      "ban_user",
      `${banned ? "Banned" : "Unbanned"} user: ${user.email}`,
      req,
    );
    await logUserActivity(
      userId,
      banned ? "account_banned" : "account_unbanned",
      `Account ${banned ? "banned" : "unbanned"} by admin`,
      req,
    );

    logger.info("User ban status updated by admin", {
      userId,
      oldStatus: oldBanStatus,
      newStatus: banned,
      adminId: req.user.userId,
      reason,
    });

    const updatedUser = await User.findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("roleHistory.updatedBy", "fullName email")
      .populate("statusHistory.updatedBy", "fullName email")
      .populate("banHistory.updatedBy", "fullName email");

    res.json({
      message: `User ${banned ? "banned" : "unbanned"} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Ban user failed", { error: error.message });
    res.status(500).json({ message: "Server error while updating ban status" });
  }
};

// Add admin notes to user
const addAdminNote = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { userId } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ message: "Note content is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.adminNotes) {
      user.adminNotes = [];
    }

    user.adminNotes.push({
      note: note.trim(),
      addedBy: req.user.userId,
      addedAt: new Date(),
    });

    await user.save();

    // Log activity
    await logUserActivity(
      req.user.userId,
      "add_admin_note",
      `Added note to user: ${user.email}`,
      req,
    );
    await logUserActivity(
      userId,
      "admin_note_added",
      "Admin note added to account",
      req,
    );

    logger.info("Admin note added to user", {
      userId,
      adminId: req.user.userId,
      noteLength: note.length,
    });

    const updatedUser = await User.findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("adminNotes.addedBy", "fullName email");

    res.json({
      message: "Admin note added successfully",
      user: updatedUser,
    });
  } catch (error) {
    logger.error("Add admin note failed", { error: error.message });
    res.status(500).json({ message: "Server error while adding admin note" });
  }
};

// Get user details by ID (admin only)
const getUserById = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const user = await User.findById(req.params.userId)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("roleHistory.updatedBy", "fullName email")
      .populate("statusHistory.updatedBy", "fullName email")
      .populate("banHistory.updatedBy", "fullName email")
      .populate("adminNotes.addedBy", "fullName email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Log admin activity
    await logUserActivity(
      req.user.userId,
      "view_user_details",
      `Viewed details for user: ${user.email}`,
      req,
    );

    res.json(user);
  } catch (error) {
    logger.error("Get user by ID failed", { error: error.message });
    res.status(500).json({ message: "Server error" });
  }
};

// Export activity log to CSV (admin only)
const exportActivityLog = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { userId } = req.params;

    // Find user with activity log
    const user = await User.findById(userId).select(
      "activityLog email fullName",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has activity log
    if (!user.activityLog || user.activityLog.length === 0) {
      return res
        .status(200)
        .json({ message: "No activity data available for export" });
    }

    // Convert to CSV format with enhanced data and proper escaping
    const csvData = user.activityLog.map((activity) => ({
      timestamp: new Date(activity.timestamp).toISOString(),
      action: activity.action || "unknown",
      category: activity.category || "system",
      severity: activity.severity || "low",
      details: (activity.details || "").replace(/"/g, '""'), // Escape quotes for CSV
      ipAddress: activity.ipAddress || "unknown",
      userAgent: (activity.userAgent || "unknown").replace(/"/g, '""'), // Escape quotes
      sessionId: activity.metadata?.sessionId || "",
      referer: activity.metadata?.referer || "",
      acceptLanguage: activity.metadata?.acceptLanguage || "",
    }));

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${user.email.replace(/[@.]/g, "_")}_activity_log_${timestamp}.csv`;

    // Set response headers for CSV download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Enhanced CSV generation with proper headers
    const csvHeaders = [
      "Timestamp",
      "Action",
      "Category",
      "Severity",
      "Details",
      "IP Address",
      "User Agent",
      "Session ID",
      "Referer",
      "Accept Language",
    ];

    const csvContent = [
      csvHeaders.join(","),
      ...csvData.map(
        (row) =>
          `"${row.timestamp}","${row.action}","${row.category}","${row.severity}","${row.details}","${row.ipAddress}","${row.userAgent}","${row.sessionId}","${row.referer}","${row.acceptLanguage}"`,
      ),
    ].join("\n");

    // Add BOM for UTF-8 encoding (helps with Excel compatibility)
    const BOM = "\uFEFF";
    res.send(BOM + csvContent);

    // Log the export activity for both admin and target user
    try {
      await logUserActivity(
        req.user.userId,
        "export_activity_log",
        `Exported activity log for user: ${user.email} (${csvData.length} entries)`,
        req,
        "admin",
        "low",
        {
          targetUserId: userId,
          targetUserEmail: user.email,
          exportedEntries: csvData.length,
          exportFormat: "CSV",
        },
      );

      await logUserActivity(
        userId,
        "activity_log_exported",
        `Activity log exported by admin (${csvData.length} entries)`,
        req,
        "admin",
        "low",
        {
          exportedBy: req.user.userId,
          exportedEntries: csvData.length,
          exportFormat: "CSV",
        },
      );
    } catch (logError) {
      console.error("Failed to log export activity:", logError);
      // Don't fail the export if logging fails
    }

    console.log(
      `Activity log exported for user ${user.email} by admin ${req.user.userId}`,
    );
  } catch (error) {
    console.error("Export activity error:", error);

    // Log the error
    try {
      await logUserActivity(
        req.user.userId,
        "export_activity_log_failed",
        `Failed to export activity log: ${error.message}`,
        req,
        "admin",
        "medium",
        {
          targetUserId: req.params.userId,
          errorMessage: error.message,
        },
      );
    } catch (logError) {
      console.error("Failed to log export error:", logError);
    }

    res.status(500).json({
      message: "Failed to export activity log",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get activity statistics (admin only)
const getActivityStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "activityLog email fullName loginCount ipAddresses lastLoginAt",
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activities = user.activityLog || [];
    const now = new Date();

    // Calculate statistics
    const stats = {
      totalActivities: activities.length,
      loginCount: user.loginCount || 0,
      uniqueIPs: user.ipAddresses?.length || 0,
      lastLoginAt: user.lastLoginAt,
      lastActivity: activities.length > 0 ? activities[0].timestamp : null,

      // Time-based activity counts
      last24Hours: activities.filter(
        (a) => (now - new Date(a.timestamp)) / (1000 * 60 * 60) <= 24,
      ).length,
      last7Days: activities.filter(
        (a) => (now - new Date(a.timestamp)) / (1000 * 60 * 60 * 24) <= 7,
      ).length,
      last30Days: activities.filter(
        (a) => (now - new Date(a.timestamp)) / (1000 * 60 * 60 * 24) <= 30,
      ).length,

      // Category breakdown
      byCategory: activities.reduce((acc, activity) => {
        const category = activity.category || "unknown";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}),

      // Severity breakdown
      bySeverity: activities.reduce((acc, activity) => {
        const severity = activity.severity || "low";
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {}),

      // Action breakdown (top 10)
      byAction: Object.entries(
        activities.reduce((acc, activity) => {
          const action = activity.action || "unknown";
          acc[action] = (acc[action] || 0) + 1;
          return acc;
        }, {}),
      )
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .reduce((acc, [action, count]) => {
          acc[action] = count;
          return acc;
        }, {}),

      // Recent activity summary (last 10 activities)
      recentActivities: activities.slice(0, 10).map((activity) => ({
        action: activity.action,
        timestamp: activity.timestamp,
        category: activity.category,
        severity: activity.severity,
        ipAddress: activity.ipAddress,
      })),
    };

    // Log statistics access
    await logUserActivity(
      req.user.userId,
      "view_activity_stats",
      `Viewed activity statistics for user: ${user.email}`,
      req,
      "admin",
      "low",
      {
        targetUserId: userId,
        targetUserEmail: user.email,
        totalActivities: stats.totalActivities,
      },
    );

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
      statistics: stats,
    });
  } catch (error) {
    console.error("Get activity stats error:", error);
    res.status(500).json({
      message: "Failed to get activity statistics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

/**
 * Wallet Endpoints - Phase 1: Wallet Linking
 */

/**
 * Generate wallet verification message for user to sign
 * POST /api/auth/wallet/generate-verification
 */
const generateWalletVerificationMessage = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const userId = req.user.userId;

    // Validate wallet address format
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address format",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const walletService = require("../services/walletService");
    const verificationData = walletService.generateVerificationMessage(
      user.email,
      walletAddress,
    );

    res.json({
      success: true,
      message: "Verification message generated successfully",
      data: verificationData,
    });
  } catch (error) {
    logger.error("Error generating wallet verification message", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      message: "Failed to generate verification message",
      error: error.message,
    });
  }
};

/**
 * Link wallet to user account
 * POST /api/auth/wallet/link
 */
const linkUserWallet = async (req, res) => {
  try {
    const { walletAddress, signature, message, label } = req.body;
    const userId = req.user.userId;

    console.log("linkUserWallet called with:", {
      walletAddress,
      signature: signature ? signature.slice(0, 20) + "..." : "missing",
      message: message ? message.slice(0, 50) + "..." : "missing",
      label,
      userId,
    });

    // Validation
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required",
      });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: `Invalid wallet address format. Got: ${walletAddress}`,
      });
    }

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "Signature is required",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const walletService = require("../services/walletService");
    const result = await walletService.linkWallet(
      userId,
      walletAddress,
      signature,
      message,
      label,
      req,
    );

    console.log("Wallet linked successfully:", result);

    res.json({
      success: true,
      message: "Wallet linked successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error linking wallet:", {
      message: error.message,
      stack: error.stack,
      userId: req.user.userId,
    });
    logger.error("Error linking wallet", {
      error: error.message,
      stack: error.stack,
    });
    res.status(400).json({
      success: false,
      message: error.message || "Failed to link wallet",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * Unlink wallet from user account
 * DELETE /api/auth/wallet/unlink/:walletAddress
 */
const unlinkUserWallet = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const userId = req.user.userId;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address format",
      });
    }

    const walletService = require("../services/walletService");
    const result = await walletService.unlinkWallet(userId, walletAddress, req);

    res.json({
      success: true,
      message: "Wallet unlinked successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error unlinking wallet", {
      error: error.message,
    });
    res.status(400).json({
      success: false,
      message: error.message || "Failed to unlink wallet",
    });
  }
};

/**
 * Get all linked wallets for user
 * GET /api/auth/wallet/linked-wallets
 */
const getLinkedWallets = async (req, res) => {
  try {
    const userId = req.user.userId;

    const walletService = require("../services/walletService");
    const result = await walletService.getLinkedWallets(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Error retrieving linked wallets", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      message: "Failed to retrieve linked wallets",
      error: error.message,
    });
  }
};

/**
 * Set primary wallet for user
 * PUT /api/auth/wallet/set-primary
 */
const setPrimaryWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const userId = req.user.userId;

    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address format",
      });
    }

    const walletService = require("../services/walletService");
    const result = await walletService.setPrimaryWallet(userId, walletAddress);

    // Log activity
    await logUserActivity(
      userId,
      "wallet_primary_updated",
      `Primary wallet updated to: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`,
      req,
      "security",
      "medium",
    );

    res.json({
      success: true,
      message: "Primary wallet updated successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error setting primary wallet", {
      error: error.message,
    });
    res.status(400).json({
      success: false,
      message: error.message || "Failed to set primary wallet",
    });
  }
};

/**
 * Verify wallet ownership (for Auth flow)
 * This endpoint is called by thirdweb ConnectButton auth flow
 * POST /api/auth/wallet/verify-ownership
 */
const verifyWalletOwnership = async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: "Address, signature, and message are required",
      });
    }

    // Verify signature
    const walletService = require("../services/walletService");
    const isValid = await walletService.verifySignature(
      address,
      signature,
      message,
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid signature - ownership verification failed",
      });
    }

    // Check if user exists with this wallet
    let user = await User.findOne({
      "linkedWallets.address": address.toLowerCase(),
    });

    if (!user) {
      // User doesn't have this wallet linked - they may need to link it
      return res.status(404).json({
        success: false,
        message: "Wallet not linked to any account",
        code: "WALLET_NOT_LINKED",
      });
    }

    // Generate auth token
    const token = walletService.generateWalletAuthToken(user._id, address);

    // Update last used timestamp
    const linkedWallet = user.linkedWallets.find(
      (w) => w.address.toLowerCase() === address.toLowerCase(),
    );
    if (linkedWallet) {
      linkedWallet.lastUsedAt = new Date();
      await user.save();
    }

    // Log activity
    await logUserActivity(
      user._id,
      "wallet_login",
      `Login with wallet: ${address.substring(0, 6)}...${address.substring(38)}`,
      req,
      "authentication",
      "low",
    );

    res.json({
      success: true,
      message: "Wallet verified successfully",
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        walletAddress: address,
      },
    });
  } catch (error) {
    logger.error("Error verifying wallet ownership", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      message: "Wallet verification failed",
      error: error.message,
    });
  }
};

// Export all functions
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  deleteUser,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  banUser,
  addAdminNote,
  getUserById,
  exportActivityLog,
  getActivityStats,
  logUserActivity,
  activityTrackingMiddleware,
  determineActivityFromRequest,
  generateWalletVerificationMessage,
  linkUserWallet,
  unlinkUserWallet,
  getLinkedWallets,
  setPrimaryWallet,
  verifyWalletOwnership,
};
