const Ticket = require('../models/Ticket');
const QueueManager = require('../queues/QueueManager');
const RedisManager = require('../config/redis');
const { OpenAI } = require('openai');
const config = require('../config/config');

class TicketService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey
    });
    this.initializeQueues();
  }

  async initializeQueues() {
    await QueueManager.initialize();

    // Create queues for different ticket processing tasks
    await QueueManager.createQueue('ticket-categorization', this.processTicketCategorization.bind(this), 5);
    await QueueManager.createQueue('ticket-escalation', this.processTicketEscalation.bind(this), 3);
    await QueueManager.createQueue('ticket-assignment', this.processTicketAssignment.bind(this), 2);
  }

  async createTicket(ticketData) {
    const ticket = new Ticket(ticketData);
    await ticket.save();

    // Add to categorization queue
    await QueueManager.addJob('ticket-categorization', {
      ticketId: ticket._id,
      subject: ticket.subject,
      description: ticket.description
    });

    // Cache the ticket
    await RedisManager.set(`ticket:${ticket._id}`, ticket.toJSON());

    return ticket;
  }

  async processTicketCategorization(jobData) {
    const { ticketId, subject, description } = jobData;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpdesk ticket categorization assistant. Analyze the ticket content and suggest a category and priority level."
          },
          {
            role: "user",
            content: `Subject: ${subject}\nDescription: ${description}\n\nPlease suggest a category and priority level (low, medium, high, urgent).`
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      const suggestions = response.choices[0].message.content;
      
      // Update ticket with AI suggestions
      await Ticket.findByIdAndUpdate(ticketId, {
        $set: { aiSuggestions: suggestions }
      });

      // Add to assignment queue
      await QueueManager.addJob('ticket-assignment', { ticketId });
    } catch (error) {
      console.error('Error in ticket categorization:', error);
      // Implement retry logic or error handling
    }
  }

  async processTicketEscalation(jobData) {
    const { ticketId } = jobData;
    
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) return;

      const now = new Date();
      const timeSinceLastEscalation = now - ticket.lastEscalationTime;
      
      // Implement escalation rules
      if (ticket.status === 'open' && timeSinceLastEscalation > 24 * 60 * 60 * 1000) {
        ticket.escalationLevel += 1;
        ticket.lastEscalationTime = now;
        await ticket.save();

        // Notify relevant parties
        await this.notifyEscalation(ticket);
      }
    } catch (error) {
      console.error('Error in ticket escalation:', error);
    }
  }

  async processTicketAssignment(jobData) {
    const { ticketId } = jobData;
    
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket || ticket.assignedAgent) return;

      // Implement assignment logic based on department, availability, etc.
      const availableAgent = await this.findAvailableAgent(ticket);
      
      if (availableAgent) {
        ticket.assignedAgent = availableAgent._id;
        ticket.status = 'in_progress';
        await ticket.save();

        // Notify agent
        await this.notifyAgentAssignment(ticket, availableAgent);
      }
    } catch (error) {
      console.error('Error in ticket assignment:', error);
    }
  }

  async findAvailableAgent(ticket) {
    // Implement agent selection logic
    // This could consider:
    // - Department matching
    // - Current workload
    // - Shift availability
    // - Skill matching
    return null; // Placeholder
  }

  async notifyEscalation(ticket) {
    // Implement notification logic
    // Could use email, push notifications, etc.
  }

  async notifyAgentAssignment(ticket, agent) {
    // Implement notification logic
  }

  async getTicketById(id) {
    // Try to get from cache first
    const cachedTicket = await RedisManager.get(`ticket:${id}`);
    if (cachedTicket) {
      return cachedTicket;
    }

    // If not in cache, get from database
    const ticket = await Ticket.findById(id)
      .populate('customer', 'name email')
      .populate('assignedAgent', 'name email')
      .populate('comments.user', 'name email');

    if (ticket) {
      // Cache the ticket
      await RedisManager.set(`ticket:${id}`, ticket.toJSON());
    }

    return ticket;
  }

  async updateTicketStatus(id, status) {
    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (ticket) {
      // Update cache
      await RedisManager.set(`ticket:${id}`, ticket.toJSON());
    }

    return ticket;
  }
}

module.exports = new TicketService(); 