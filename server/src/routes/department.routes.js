const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');

// Get all departments
router.get('/', isAuthenticated, departmentController.getDepartments);

// Get department by ID
router.get('/:id', isAuthenticated, departmentController.getDepartmentById);

// Create new department (admin only)
router.post('/', isAuthenticated, isAdmin, departmentController.createDepartment);

// Update department (admin only)
router.patch('/:id', isAuthenticated, isAdmin, departmentController.updateDepartment);

// Delete/deactivate department (admin only)
router.delete('/:id', isAuthenticated, isAdmin, departmentController.deleteDepartment);

// Add agent to department (admin only)
router.post('/:id/agents', isAuthenticated, isAdmin, departmentController.addAgent);

// Remove agent from department (admin only)
router.delete('/:id/agents', isAuthenticated, isAdmin, departmentController.removeAgent);

// Get department metrics
router.get('/:id/metrics', isAuthenticated, departmentController.getDepartmentMetrics);

module.exports = router; 