const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');
const { validateTicket } = require('../middleware/validation');

// Get all tickets with filters
router.get('/', isAuthenticated, ticketController.getTickets);

// Get ticket metrics (must be before /:id routes)
router.get('/metrics', isAuthenticated, ticketController.getTicketMetrics);

// Get ticket by ID
router.get('/:id', isAuthenticated, ticketController.getTicketById);

// Create new ticket
router.post('/', isAuthenticated, validateTicket, ticketController.createTicket);

// Update ticket
router.patch('/:id', isAuthenticated, ticketController.updateTicket);

// Delete ticket
router.delete('/:id', isAuthenticated, ticketController.deleteTicket);

// Add comment to ticket
router.post('/:id/comments', isAuthenticated, ticketController.addComment);

// Get ticket history
router.get('/:id/history', isAuthenticated, ticketController.getTicketHistory);

// Get ticket attachments
router.get('/:id/attachments', isAuthenticated, ticketController.getTicketAttachments);

// Upload attachment to ticket
router.post('/:id/attachments', isAuthenticated, ticketController.uploadAttachment);

module.exports = router; 