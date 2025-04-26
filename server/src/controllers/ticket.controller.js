const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const logger = require('../utils/logger');
const { TICKET_STATUS, TICKET_PRIORITY } = require('../../../shared/constants');

const ticketController = {
  async getTickets(req, res) {
    try {
      const { status, priority, type, department, assignedTo, customer } = req.query;
      const query = {};

      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (type) query.type = type;
      if (department) query.department = department;
      if (assignedTo) query.assignedAgent = assignedTo;
      if (customer) query.customer = customer;

      const tickets = await Ticket.find(query)
        .populate('customer', 'name email')
        .populate('assignedAgent', 'name email')
        .populate('department', 'name')
        .sort({ createdAt: -1 });

      res.json(tickets);
    } catch (error) {
      logger.error('Error fetching tickets:', error);
      res.status(500).json({ message: 'Error fetching tickets' });
    }
  },

  async getTicketById(req, res) {
    try {
      const ticket = await Ticket.findById(req.params.id)
        .populate('customer', 'name email phone orderCount createdAt')
        .populate('assignedAgent', 'name email')
        .populate('department', 'name')
        .populate('comments.user', 'name email');

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // If ticket is related to an order, fetch order details
      if (ticket.type === 'order' && ticket.orderId) {
        const order = await Order.findById(ticket.orderId);
        ticket.orderDetails = order;
      }

      res.json(ticket);
    } catch (error) {
      logger.error('Error fetching ticket:', error);
      res.status(500).json({ message: 'Error fetching ticket' });
    }
  },

  async createTicket(req, res) {
    try {
      const {
        subject,
        description,
        type,
        priority,
        category,
        customer,
        department,
        orderId,
        profileId,
        customFields,
      } = req.body;

      const ticket = new Ticket({
        subject,
        description,
        type,
        priority,
        category,
        customer,
        department,
        orderId,
        profileId,
        customFields,
        status: TICKET_STATUS.OPEN,
        createdBy: req.user._id,
      });

      await ticket.save();

      // If ticket is related to an order, update order status
      if (type === 'order' && orderId) {
        await Order.findByIdAndUpdate(orderId, {
          $push: { tickets: ticket._id },
        });
      }

      res.status(201).json(ticket);
    } catch (error) {
      logger.error('Error creating ticket:', error);
      res.status(500).json({ message: 'Error creating ticket' });
    }
  },

  async updateTicket(req, res) {
    try {
      const { status, priority, assignedAgent, department, customFields } = req.body;
      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Update ticket fields
      if (status) ticket.status = status;
      if (priority) ticket.priority = priority;
      if (assignedAgent) ticket.assignedAgent = assignedAgent;
      if (department) ticket.department = department;
      if (customFields) ticket.customFields = { ...ticket.customFields, ...customFields };

      // Add to history
      ticket.history.push({
        action: 'update',
        field: Object.keys(req.body).join(', '),
        value: req.body,
        user: req.user._id,
        timestamp: new Date(),
      });

      await ticket.save();
      res.json(ticket);
    } catch (error) {
      logger.error('Error updating ticket:', error);
      res.status(500).json({ message: 'Error updating ticket' });
    }
  },

  async deleteTicket(req, res) {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // If ticket is related to an order, remove reference
      if (ticket.type === 'order' && ticket.orderId) {
        await Order.findByIdAndUpdate(ticket.orderId, {
          $pull: { tickets: ticket._id },
        });
      }

      await ticket.remove();
      res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      logger.error('Error deleting ticket:', error);
      res.status(500).json({ message: 'Error deleting ticket' });
    }
  },

  async addComment(req, res) {
    try {
      const { content, type } = req.body;
      const ticket = await Ticket.findById(req.params.id);

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      const comment = {
        content,
        type,
        user: req.user._id,
        createdAt: new Date(),
      };

      ticket.comments.push(comment);
      await ticket.save();

      res.status(201).json(comment);
    } catch (error) {
      logger.error('Error adding comment:', error);
      res.status(500).json({ message: 'Error adding comment' });
    }
  },

  async getTicketHistory(req, res) {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      res.json(ticket.history);
    } catch (error) {
      logger.error('Error fetching ticket history:', error);
      res.status(500).json({ message: 'Error fetching ticket history' });
    }
  },

  async getTicketAttachments(req, res) {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      res.json(ticket.attachments);
    } catch (error) {
      logger.error('Error fetching ticket attachments:', error);
      res.status(500).json({ message: 'Error fetching ticket attachments' });
    }
  },

  async uploadAttachment(req, res) {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Handle file upload logic here
      // This would typically involve using multer or similar middleware
      // For now, we'll just add a placeholder
      const attachment = {
        filename: req.file.originalname,
        path: req.file.path,
        type: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
      };

      ticket.attachments.push(attachment);
      await ticket.save();

      res.status(201).json(attachment);
    } catch (error) {
      logger.error('Error uploading attachment:', error);
      res.status(500).json({ message: 'Error uploading attachment' });
    }
  },

  async getTicketMetrics(req, res) {
    try {
      const metrics = await Ticket.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      res.json(metrics);
    } catch (error) {
      logger.error('Error fetching ticket metrics:', error);
      res.status(500).json({ message: 'Error fetching ticket metrics' });
    }
  },
};

module.exports = ticketController; 