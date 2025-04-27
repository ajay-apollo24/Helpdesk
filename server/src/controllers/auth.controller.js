const bcrypt = require('bcryptjs');
const User = require('../models/User');
const logger = require('../utils/logger');
const { USER_ROLES, USER_STATUS } = require('../../../shared/constants');
const mongoose = require('mongoose');

// Register a new user
const register = async (req, res) => {
  try {
    logger.info('Starting user registration process', { email: req.body.email });
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('Registration failed - Email already exists', { email });
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User(req.body);
    await user.save();
    
    // Start session
    req.session.userId = user._id;
    await req.session.save();
    logger.info('User registered successfully', { userId: user._id, email });

    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
      sessionId: req.sessionID
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error during registration' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    logger.info('Login attempt details', { 
      email: req.body.email,
      headers: req.headers,
      cookies: req.cookies
    });

    const { email, password } = req.body;

    // Find user with detailed logging
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.warn('Login failed - User not found', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    logger.info('User found during login', { 
      userId: user._id,
      email: user.email,
      role: user.role,
      status: user.status
    });

    // Check password with detailed logging
    const isMatch = await user.comparePassword(password);
    logger.info('Password comparison result', { 
      email,
      isMatch,
      passwordProvided: !!password
    });
    
    if (!isMatch) {
      logger.warn('Login failed - Invalid password', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set up session with detailed logging
    req.session.userId = user._id;
    await req.session.save();
    
    logger.info('Login successful - Full details', { 
      userId: user._id,
      email,
      sessionId: req.sessionID,
      sessionData: req.session,
      cookies: req.cookies,
      headers: {
        'set-cookie': res.getHeader('set-cookie')
      }
    });

    // Send response with session cookie
    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      sessionId: req.sessionID
    });
  } catch (error) {
    logger.error('Login error - Full details', { 
      error: error.message, 
      stack: error.stack,
      body: req.body,
      headers: req.headers
    });
    res.status(500).json({ message: 'Error during login' });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    logger.info('Logout attempt', { userId: req.session.userId });
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        logger.error('Session destruction error', { error: err.message });
        return res.status(500).json({ message: 'Error during logout' });
      }
      
      logger.info('Logout successful - Session destroyed');
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error during logout' });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    logger.debug('0. MongoDB connection check', {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });

    logger.debug('1. Starting getCurrentUser', { 
      sessionID: req.sessionID,
      cookies: req.cookies,
      headers: req.headers
    });

    logger.debug('2. Session details', {
      session: req.session ? JSON.stringify(req.session) : 'null',
      userId: req.session?.userId
    });

    if (!req.session?.userId) {
      logger.warn('3. No userId in session', {
        session: req.session ? JSON.stringify(req.session) : 'null',
        cookies: req.cookies
      });
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.session.userId)) {
      logger.warn('4a. Invalid ObjectId format', { 
        userId: req.session.userId 
      });
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    logger.debug('4b. About to query user', { 
      userId: req.session.userId
    });

    let user;
    try {
      user = await User.findById(req.session.userId)
        .populate('department')
        .select('-password');

      logger.debug('5. Database query completed', {
        userFound: !!user,
        userId: req.session.userId
      });

      if (!user) {
        logger.warn('6. User not found', { userId: req.session.userId });
        return res.status(404).json({ message: 'User not found' });
      }

      logger.debug('7. User details', {
        userId: user._id,
        email: user.email,
        role: user.role,
        hasDepartment: !!user.department,
        departmentId: user.department?._id,
        skillsCount: user.skills?.length
      });

      logger.debug('8. Preparing response');
      res.json(user.toJSON());
      logger.debug('9. Response sent successfully');
    } catch (dbError) {
      logger.error('Database operation failed', {
        error: dbError.message,
        stack: dbError.stack,
        code: dbError.code,
        name: dbError.name,
        operation: 'findById',
        userId: req.session.userId
      });
      throw dbError;
    }
  } catch (error) {
    logger.error('getCurrentUser error', { 
      error: error.message, 
      stack: error.stack,
      type: error.name,
      code: error.code,
      session: req.session ? JSON.stringify(req.session) : 'null',
      cookies: req.cookies
    });
    res.status(500).json({ 
      message: 'Error fetching current user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'preferences', 'skills', 'shift'];
    
    // Filter out non-allowed updates
    const filteredUpdates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.user._id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated successfully', user: user.getPublicProfile() });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword
}; 