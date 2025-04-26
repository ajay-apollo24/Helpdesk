const User = require('../models/User');
const logger = require('../utils/logger');
const { USER_STATUS, USER_ROLES } = require('../../../shared/constants');

// Middleware to check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Middleware to check user roles
exports.hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

// Middleware to check if user belongs to department
exports.inDepartment = (departmentId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.department || req.user.department.toString() !== departmentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

// Middleware to check if user has required skills
exports.hasSkills = (...requiredSkills) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasAllSkills = requiredSkills.every(skill => 
      req.user.skills && req.user.skills.includes(skill)
    );

    if (!hasAllSkills) {
      return res.status(403).json({ message: 'Required skills not found' });
    }

    next();
  };
};

// Middleware to check if user is within their shift hours
exports.isWithinShift = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.shift) {
      return next(); // No shift restrictions
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    const isWithinHours = currentHour >= req.user.shift.startHour && 
                         currentHour < req.user.shift.endHour;
    const isWorkingDay = req.user.shift.workDays.includes(currentDay);

    if (!isWithinHours || !isWorkingDay) {
      return res.status(403).json({ message: 'Outside of shift hours' });
    }

    next();
  } catch (error) {
    logger.error('Shift check middleware error:', error);
    res.status(500).json({ message: 'Error checking shift hours' });
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
}; 