const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Department = require('../models/Department');
const { TICKET_STATUS, TICKET_PRIORITY } = require('../../../shared/constants');
const logger = require('../utils/logger');
const { OpenAI } = require('openai');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Initialize OpenAI client only if API key is available
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
} catch (error) {
  logger.warn('OpenAI client initialization failed:', error.message);
}

// Helper function to categorize ticket
async function categorizeTicket(subject, description) {
  if (!openai) {
    return {
      category: 'General',
      priority: TICKET_PRIORITY.MEDIUM
    };
  }

  try {
    const prompt = `Categorize this helpdesk ticket and suggest priority:
    Subject: ${subject}
    Description: ${description}
    
    Please respond in JSON format with:
    {
      "category": "one of: Hardware, Software, Network, General",
      "priority": "one of: low, medium, high, urgent"
    }`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return {
      category: response.category,
      priority: response.priority
    };
  } catch (error) {
    logger.error('AI categorization failed:', error);
    return {
      category: 'General',
      priority: TICKET_PRIORITY.MEDIUM
    };
  }
}

// Create a new ticket
router.post('/', upload.array('attachments', 5), async (req, res) => {
  try {
    const { subject, description, customerId } = req.body;

    // Get AI suggestions if available
    const aiSuggestions = await categorizeTicket(subject, description);

    const ticket = new Ticket({
      subject,
      description,
      customer: customerId,
      category: aiSuggestions.category,
      priority: aiSuggestions.priority,
      status: TICKET_STATUS.OPEN,
      aiSuggestions
    });

    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    logger.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('customer', 'name email')
      .populate('assignedAgent', 'name email')
      .sort('-createdAt');
    res.json(tickets);
  } catch (error) {
    logger.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get ticket by ID
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('assignedAgent', 'name email')
      .populate('comments.user', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json(ticket);
  } catch (error) {
    logger.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Update ticket status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    ticket.status = status;
    await ticket.save();
    
    res.json(ticket);
  } catch (error) {
    logger.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// Assign ticket to agent
router.patch('/:id/assign', async (req, res) => {
  try {
    const { agentId } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    ticket.assignedAgent = agentId;
    ticket.status = TICKET_STATUS.IN_PROGRESS;
    await ticket.save();
    
    res.json(ticket);
  } catch (error) {
    logger.error('Error assigning ticket:', error);
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});

// Add comment to ticket
router.post('/:id/comments', async (req, res) => {
  try {
    const { content, userId } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    ticket.comments.push({
      content,
      user: userId,
      timestamp: new Date()
    });
    
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    logger.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router; 