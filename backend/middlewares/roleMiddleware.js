const logger = require('../utils/logger');

// Middleware to restrict access based on roles
const roleMiddleware = (roles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      if (!roles.includes(userRole)) {
        logger.warn('Access denied due to insufficient role', {
          userId: req.user.userId,
          userRole,
          requiredRoles: roles,
          path: req.path
        });
        return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
      }

      logger.info('Role check passed', { userId: req.user.userId, role: userRole, path: req.path });
      next();
    } catch (error) {
      logger.error('Role check failed', { error: error.message, path: req.path });
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

// Middleware for admin only routes
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    logger.warn('Admin access denied', {
      userId: req.user.userId,
      userRole: req.user.role,
      path: req.path
    });
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }
  next();
};

// Middleware for role assigner only routes
const roleAssignerOnly = (req, res, next) => {
  if (req.user.role !== 'role_assigner') {
    logger.warn('Role Assigner access denied', {
      userId: req.user.userId,
      userRole: req.user.role,
      path: req.path
    });
    return res.status(403).json({ message: 'Access denied: Role Assigner only' });
  }
  next();
};

// Middleware for routes accessible by both admin and role_assigner
const adminOrRoleAssigner = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'role_assigner') {
    logger.warn('Admin/Role Assigner access denied', {
      userId: req.user.userId,
      userRole: req.user.role,
      path: req.path
    });
    return res.status(403).json({ message: 'Access denied: Admin or Role Assigner only' });
  }
  next();
};

module.exports = roleMiddleware;
module.exports.adminOnly = adminOnly;
module.exports.roleAssignerOnly = roleAssignerOnly;
module.exports.adminOrRoleAssigner = adminOrRoleAssigner;
