const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Customer = require('../models/Customer');
const { USER_ROLES, TICKET_STATUS, TICKET_PRIORITY } = require('../../../shared/constants');

// Get all tickets with pagination and filters
exports.getTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    
    // If agent, only show assigned tickets
    if (req.user.role === USER_ROLES.AGENT) {
      query.assignedAgent = req.user._id;
    }
    
    const tickets = await Ticket.find(query)
      .populate('customer', 'name email phone')
      .populate('assignedAgent', 'name email department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Ticket.countDocuments(query);
    
    res.json({
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'name email phone customerType totalTickets')
      .populate('assignedAgent', 'name email department skills')
      .populate('comments.user', 'name role');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority, customerId } = req.body;
    
    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Find available agent based on skills and workload
    const availableAgent = await User.findOne({
      role: USER_ROLES.AGENT,
      status: 'active',
      'skills.name': { $in: req.body.requiredSkills || [] }
    }).sort({ 'performance.ticketsResolved': -1 });
    
    const ticket = new Ticket({
      subject,
      description,
      customer: customer._id,
      priority: priority || TICKET_PRIORITY.MEDIUM,
      status: TICKET_STATUS.OPEN,
      assignedAgent: availableAgent?._id
    });
    
    await ticket.save();
    
    // Update customer's ticket count
    customer.totalTickets += 1;
    await customer.save();
    
    // Populate response data
    await ticket.populate('customer', 'name email phone');
    if (availableAgent) {
      await ticket.populate('assignedAgent', 'name email department');
    }
    
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update ticket
exports.updateTicket = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['status', 'priority', 'assignedAgent', 'subject', 'description'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Add to history if status or agent changes
    if (updates.status && updates.status !== ticket.status) {
      ticket.history.push({
        field: 'status',
        oldValue: ticket.status,
        newValue: updates.status,
        updatedBy: req.user._id
      });
    }
    
    if (updates.assignedAgent && updates.assignedAgent !== ticket.assignedAgent?.toString()) {
      ticket.history.push({
        field: 'assignedAgent',
        oldValue: ticket.assignedAgent,
        newValue: updates.assignedAgent,
        updatedBy: req.user._id
      });
    }
    
    Object.assign(ticket, updates);
    await ticket.save();
    
    await ticket.populate('customer', 'name email phone');
    await ticket.populate('assignedAgent', 'name email department');
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Only admins can delete tickets
    if (req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({ error: 'Only admins can delete tickets' });
    }
    
    await ticket.remove();
    
    // Update customer's ticket count
    const customer = await Customer.findById(ticket.customer);
    if (customer) {
      customer.totalTickets -= 1;
      await customer.save();
    }
    
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add comment to ticket
exports.addComment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    ticket.comments.push({
      content: req.body.content,
      user: req.user._id,
      isInternal: req.body.isInternal || false
    });
    
    await ticket.save();
    await ticket.populate('comments.user', 'name role');
    
    res.json(ticket.comments[ticket.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ticket history
exports.getTicketHistory = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('history.updatedBy', 'name role');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket.history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ticket metrics
exports.getTicketMetrics = async (req, res) => {
  try {
    const metrics = await Ticket.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: {
            $sum: {
              $cond: [{ $eq: ['$status', TICKET_STATUS.OPEN] }, 1, 0]
            }
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ['$status', TICKET_STATUS.IN_PROGRESS] }, 1, 0]
            }
          },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', TICKET_STATUS.RESOLVED] }, 1, 0]
            }
          },
          avgResolutionTime: { $avg: '$resolutionTime' },
          highPriority: {
            $sum: {
              $cond: [{ $eq: ['$priority', TICKET_PRIORITY.HIGH] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    res.json(metrics[0] || {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      avgResolutionTime: 0,
      highPriority: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ticket attachments
exports.getTicketAttachments = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('attachments.uploadedBy', 'name');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket.attachments || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload attachment to ticket
exports.uploadAttachment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Note: This assumes you have multer or similar middleware configured
    // to handle the file upload and it's available in req.file
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const attachment = {
      filename: req.file.originalname,
      path: req.file.path,
      type: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };
    
    ticket.attachments.push(attachment);
    await ticket.save();
    
    // Populate the uploadedBy field before sending response
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('attachments.uploadedBy', 'name');
    const newAttachment = populatedTicket.attachments[populatedTicket.attachments.length - 1];
    
    res.status(201).json(newAttachment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 