const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Department = require('../models/Department');
const { TICKET_STATUS, TICKET_PRIORITY } = require('../../../shared/constants');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk';

async function createTickets() {
  try {
    await mongoose.connect(MONGODB_URI);

    // Find pharmacy department and agent
    const department = await Department.findOne({ name: 'Pharmacy' });
    if (!department) {
      console.error('Pharmacy department not found. Please run createPharmacyAgent.js first.');
      process.exit(1);
    }

    const agent = await User.findOne({ 
      email: 'pharmacy.agent@helpdesk.com',
      role: 'agent'
    });
    if (!agent) {
      console.error('Pharmacy agent not found. Please run createPharmacyAgent.js first.');
      process.exit(1);
    }

    // Create sample customers
    const customers = await User.create([
      {
        name: 'John Smith',
        email: 'john.smith.' + Date.now() + '@example.com',
        password: 'password123',
        role: 'customer'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j.' + Date.now() + '@example.com',
        password: 'password123',
        role: 'customer'
      }
    ]);

    // Sample ticket data
    const tickets = [
      {
        subject: 'Prescription Refill Request',
        description: 'Need to refill my monthly prescription for blood pressure medication.',
        type: 'general',
        status: TICKET_STATUS.OPEN,
        priority: TICKET_PRIORITY.MEDIUM,
        category: 'Prescription',
        customer: customers[0]._id,
        assignedAgent: agent._id,
        department: department._id,
        createdBy: customers[0]._id
      },
      {
        subject: 'Medication Side Effects',
        description: 'Experiencing unusual side effects from new medication. Need advice.',
        type: 'general',
        status: TICKET_STATUS.IN_PROGRESS,
        priority: TICKET_PRIORITY.HIGH,
        category: 'Consultation',
        customer: customers[1]._id,
        assignedAgent: agent._id,
        department: department._id,
        createdBy: customers[1]._id
      },
      {
        subject: 'Insurance Coverage Question',
        description: 'Need to verify if my insurance covers a specific medication.',
        type: 'billing',
        status: TICKET_STATUS.OPEN,
        priority: TICKET_PRIORITY.LOW,
        category: 'Insurance',
        customer: customers[0]._id,
        assignedAgent: agent._id,
        department: department._id,
        createdBy: customers[0]._id
      }
    ];

    // Create tickets
    const createdTickets = await Ticket.create(tickets);
    console.log('Created tickets:', createdTickets.map(t => t.subject));

    process.exit(0);
  } catch (error) {
    console.error('Error creating tickets:', error);
    process.exit(1);
  }
}

createTickets(); 