const User = require('../models/User');
const { USER_ROLES } = require('../../../shared/constants');
const logger = require('../utils/logger');

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    logger.debug('getCurrentUser - starting', {
      userId: req.user?._id,
      hasUser: !!req.user
    });

    // req.user is already populated by isAuthenticated middleware
    const user = await User.findById(req.user._id)
      .populate({
        path: 'department',
        select: 'name description isActive',
        options: { lean: true }
      })
      .select('-password -sessionToken -passwordResetToken -passwordResetExpires');
    
    logger.debug('getCurrentUser - after database query', {
      userFound: !!user,
      hasDepartment: !!user?.department,
      userId: req.user._id
    });

    if (!user) {
      logger.warn('getCurrentUser - user not found', { userId: req.user._id });
      return res.status(404).json({ error: 'User not found' });
    }

    logger.debug('getCurrentUser - preparing response', {
      userId: user._id,
      email: user.email,
      role: user.role,
      departmentId: user.department?._id
    });
    
    const publicProfile = user.getPublicProfile();
    res.json(publicProfile);
  } catch (error) {
    logger.error('getCurrentUser error', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id
    });
    res.status(500).json({ error: error.message });
  }
};

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('department', 'name')
      .select('-password -sessionToken -passwordResetToken -passwordResetExpires');
    
    res.json(users.map(user => user.getPublicProfile()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department', 'name')
      .select('-password -sessionToken -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.getPublicProfile());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update current user
exports.updateCurrentUser = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['name', 'preferences', 'shift'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).populate('department', 'name')
     .select('-password -sessionToken -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.getPublicProfile());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user by ID (admin only)
exports.updateUser = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['name', 'email', 'role', 'status', 'department', 'skills', 'shift', 'preferences'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('department', 'name')
     .select('-password -sessionToken -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user.getPublicProfile());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't allow deleting the last admin
    if (user.role === USER_ROLES.ADMIN) {
      const adminCount = await User.countDocuments({ role: USER_ROLES.ADMIN });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }
    
    await user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 