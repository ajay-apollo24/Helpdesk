const Ticket = require('../models/Ticket');
const QueueManager = require('../queues/QueueManager');
const RedisManager = require('../config/redis');
const { OpenAI } = require('openai');
const config = require('../config/config');
const User = require('../models/User');
const Department = require('../models/Department');
const logger = require('../utils/logger');

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
    try {
      const ticket = new Ticket(ticketData);
      
      // Calculate initial priority score
      ticket.calculatePriorityScore();
      
      // Apply routing rules
      await this.applyRoutingRules(ticket);
      
      await ticket.save();
      return ticket;
    } catch (error) {
      logger.error('Error creating ticket:', error);
      throw error;
    }
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

  // Apply routing rules to a ticket
  async applyRoutingRules(ticket) {
    try {
      // Get department rules
      const department = await Department.findById(ticket.department);
      if (!department) return;

      // Check department routing rules
      if (department.settings.autoAssign) {
        if (department.settings.roundRobin) {
          // Round-robin assignment
          const agents = await User.find({
            department: department._id,
            role: 'agent',
            status: 'active'
          });

          if (agents.length > 0) {
            const lastAssignedAgent = await Ticket.findOne({
              department: department._id,
              assignedAgent: { $exists: true }
            }).sort({ createdAt: -1 });

            let nextAgentIndex = 0;
            if (lastAssignedAgent) {
              const currentIndex = agents.findIndex(
                agent => agent._id.toString() === lastAssignedAgent.assignedAgent.toString()
              );
              nextAgentIndex = (currentIndex + 1) % agents.length;
            }

            ticket.assignedAgent = agents[nextAgentIndex]._id;
          }
        } else {
          // Skill-based assignment
          const agents = await User.find({
            department: department._id,
            role: 'agent',
            status: 'active',
            skills: ticket.category
          });

          if (agents.length > 0) {
            // Find agent with least active tickets
            const agentWorkloads = await Promise.all(
              agents.map(async (agent) => {
                const activeTickets = await Ticket.countDocuments({
                  assignedAgent: agent._id,
                  status: { $in: ['open', 'in_progress'] }
                });
                return { agent, workload: activeTickets };
              })
            );

            const bestAgent = agentWorkloads.reduce(
              (prev, current) => (current.workload < prev.workload ? current : prev)
            ).agent;

            ticket.assignedAgent = bestAgent._id;
          }
        }
      }
    } catch (error) {
      logger.error('Error applying routing rules:', error);
      throw error;
    }
  }

  // Update ticket priority based on various factors
  async updateTicketPriority(ticketId) {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) throw new Error('Ticket not found');

      // Calculate new priority score
      ticket.calculatePriorityScore();

      // Update priority based on score
      if (ticket.priorityScore >= 8) {
        ticket.priority = 'urgent';
      } else if (ticket.priorityScore >= 6) {
        ticket.priority = 'high';
      } else if (ticket.priorityScore >= 4) {
        ticket.priority = 'medium';
      } else {
        ticket.priority = 'low';
      }

      await ticket.save();
      return ticket;
    } catch (error) {
      logger.error('Error updating ticket priority:', error);
      throw error;
    }
  }

  // Check and handle SLA breaches
  async checkSLABreaches() {
    try {
      const now = new Date();
      const openTickets = await Ticket.find({
        status: { $in: ['open', 'in_progress'] }
      });

      for (const ticket of openTickets) {
        // Check response time SLA
        if (!ticket.sla.firstResponseTime) {
          const responseTime = (now - ticket.createdAt) / (1000 * 60 * 60);
          if (responseTime > ticket.sla.responseTime.target) {
            ticket.sla.responseTime.breached = true;
            await this.handleSLABreach(ticket, 'response');
          }
        }

        // Check resolution time SLA
        const resolutionTime = (now - ticket.createdAt) / (1000 * 60 * 60);
        if (resolutionTime > ticket.sla.resolutionTime.target) {
          ticket.sla.resolutionTime.breached = true;
          await this.handleSLABreach(ticket, 'resolution');
        }

        await ticket.save();
      }
    } catch (error) {
      logger.error('Error checking SLA breaches:', error);
      throw error;
    }
  }

  // Handle SLA breach
  async handleSLABreach(ticket, breachType) {
    try {
      // Increment escalation level
      ticket.escalationLevel += 1;
      ticket.lastEscalationTime = new Date();

      // Notify relevant parties
      // This will be implemented with the notification system
      logger.warn(`SLA breach detected for ticket ${ticket._id}: ${breachType} time exceeded`);
    } catch (error) {
      logger.error('Error handling SLA breach:', error);
      throw error;
    }
  }

  // Bulk update tickets
  async bulkUpdateTickets(ticketIds, updateData) {
    try {
      const result = await Ticket.updateMany(
        { _id: { $in: ticketIds } },
        { $set: updateData }
      );
      return result;
    } catch (error) {
      logger.error('Error in bulk update:', error);
      throw error;
    }
  }
}

module.exports = new TicketService(); 