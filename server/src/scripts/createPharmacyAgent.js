const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk';

async function createAgent() {
  await mongoose.connect(MONGODB_URI);

  // Find an admin to assign as manager
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('No admin user found. Please create an admin first.');
    process.exit(1);
  }

  // Find or create the Pharmacy department
  let department = await Department.findOne({ name: 'Pharmacy' });
  if (!department) {
    department = new Department({
      name: 'Pharmacy',
      description: 'Pharmacy support',
      manager: admin._id
    });
    await department.save();
    console.log('Created Pharmacy department:', department._id);
  }

  // Check if agent already exists
  const email = 'pharmacy.agent@helpdesk.com';
  let user = await User.findOne({ email });
  if (user) {
    console.log('Agent already exists:', user.email);
    process.exit(0);
  }

  // Create the agent
  const password = await bcrypt.hash('Pharmacy123!', 10);
  user = new User({
    name: 'Pharmacy Agent',
    email,
    password,
    role: 'agent',
    status: 'active',
    department: department._id,
    skills: [
      { name: 'Pharmacy Support', level: 'expert', verified: true }
    ],
    shift: {
      startTime: '09:00',
      endTime: '17:00',
      timeZone: 'UTC',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    preferences: {
      notifications: { email: true, push: true, desktop: true },
      language: 'en',
      theme: 'light'
    },
    performance: {
      ticketsResolved: 0,
      averageResponseTime: 0,
      customerSatisfactionScore: 0
    }
  });

  await user.save();
  console.log('Created agent:', user.email, 'Password: Pharmacy123!');
  process.exit(0);
}

createAgent().catch(err => {
  console.error(err);
  process.exit(1);
});