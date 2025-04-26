const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');

// Get current user's profile
router.get('/me', isAuthenticated, userController.getCurrentUser);

// Update current user's profile
router.patch('/me', isAuthenticated, userController.updateCurrentUser);

// Get all users (admin only)
router.get('/', isAuthenticated, isAdmin, userController.getUsers);

// Get user by ID (admin only)
router.get('/:id', isAuthenticated, isAdmin, userController.getUserById);

// Update user (admin only)
router.patch('/:id', isAuthenticated, isAdmin, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', isAuthenticated, isAdmin, userController.deleteUser);

module.exports = router; 