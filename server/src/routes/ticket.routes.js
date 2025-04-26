const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const auth = require('../middleware/auth');
const { validateTicket } = require('../middleware/validation');

// Get all tickets with filters
router.get('/', auth, ticketController.getTickets);

// Get ticket by ID
router.get('/:id', auth, ticketController.getTicketById);

// Create new ticket
router.post('/', auth, validateTicket, ticketController.createTicket);

// Update ticket
router.patch('/:id', auth, ticketController.updateTicket);

// Delete ticket
router.delete('/:id', auth, ticketController.deleteTicket);

// Add comment to ticket
router.post('/:id/comments', auth, ticketController.addComment);

// Get ticket history
router.get('/:id/history', auth, ticketController.getTicketHistory);

// Get ticket attachments
router.get('/:id/attachments', auth, ticketController.getTicketAttachments);

// Upload attachment to ticket
router.post('/:id/attachments', auth, ticketController.uploadAttachment);

// Get ticket metrics
router.get('/metrics', auth, ticketController.getTicketMetrics);

module.exports = router; 