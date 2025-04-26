const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const auth = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

// Get all orders with filters
router.get('/', auth, orderController.getOrders);

// Get order by ID
router.get('/:id', auth, orderController.getOrderById);

// Create new order
router.post('/', auth, validateOrder, orderController.createOrder);

// Update order
router.patch('/:id', auth, orderController.updateOrder);

// Delete order
router.delete('/:id', auth, orderController.deleteOrder);

// Get order history
router.get('/:id/history', auth, orderController.getOrderHistory);

// Add tracking information
router.post('/:id/tracking', auth, orderController.addTracking);

// Mark order as delivered
router.post('/:id/deliver', auth, orderController.markAsDelivered);

// Get order metrics
router.get('/metrics', auth, orderController.getOrderMetrics);

module.exports = router; 