const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');
const { validateOrder } = require('../middleware/validation');

// Get all orders with filters
router.get('/', isAuthenticated, orderController.getOrders);

// Get order by ID
router.get('/:id', isAuthenticated, orderController.getOrderById);

// Create new order
router.post('/', isAuthenticated, validateOrder, orderController.createOrder);

// Update order
router.patch('/:id', isAuthenticated, orderController.updateOrder);

// Delete order
router.delete('/:id', isAuthenticated, orderController.deleteOrder);

// Get order history
router.get('/:id/history', isAuthenticated, orderController.getOrderHistory);

// Add tracking information
router.post('/:id/tracking', isAuthenticated, orderController.addTracking);

// Mark order as delivered
router.post('/:id/deliver', isAuthenticated, orderController.markAsDelivered);

// Get order metrics
router.get('/metrics', isAuthenticated, orderController.getOrderMetrics);

module.exports = router; 