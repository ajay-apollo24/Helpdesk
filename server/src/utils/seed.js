const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const { USER_ROLES } = require('../../../shared/constants');
const logger = require('./logger');

class Seeder {
  constructor() {
    this.seedData = {
      users: [],
      departments: []
    };
  }

  async seed() {
    try {
      // Create admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@helpdesk.com',
        password: await bcrypt.hash('Admin123!', 10),
        role: USER_ROLES.ADMIN,
        department: 'IT',
        preferences: {
          notifications: {
            email: true,
            push: true,
            desktop: true
          }
        }
      });

      // Create IT department
      const itDepartment = await Department.create({
        name: 'IT Support',
        description: 'Information Technology Support Department',
        manager: adminUser._id,
        categories: [
          {
            name: 'Hardware',
            description: 'Hardware related issues',
            sla: {
              responseTime: 2,
              resolutionTime: 24
            }
          },
          {
            name: 'Software',
            description: 'Software related issues',
            sla: {
              responseTime: 2,
              resolutionTime: 48
            }
          },
          {
            name: 'Network',
            description: 'Network related issues',
            sla: {
              responseTime: 1,
              resolutionTime: 12
            }
          }
        ],
        settings: {
          autoAssign: true,
          roundRobin: true,
          maxTicketsPerAgent: 10,
          workingHours: {
            start: '09:00',
            end: '17:00',
            timezone: 'UTC'
          }
        }
      });

      // Create sample agents
      const agents = await User.create([
        {
          name: 'John Doe',
          email: 'john@helpdesk.com',
          password: await bcrypt.hash('Agent123!', 10),
          role: USER_ROLES.AGENT,
          department: 'IT Support',
          skills: ['Hardware', 'Software'],
          shift: {
            startTime: '09:00',
            endTime: '23:30',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          }
        },
        {
          name: 'Jane Smith',
          email: 'jane@helpdesk.com',
          password: await bcrypt.hash('Agent123!', 10),
          role: USER_ROLES.AGENT,
          department: 'IT Support',
          skills: ['Software', 'Network'],
          shift: {
            startTime: '13:00',
            endTime: '23:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          }
        }
      ]);

      // Add agents to department
      await itDepartment.addAgent(agents[0]._id);
      await itDepartment.addAgent(agents[1]._id);

      // Create sample customer
      const customer = await User.create({
        name: 'Customer User',
        email: 'customer@example.com',
        password: await bcrypt.hash('Customer123!', 10),
        role: USER_ROLES.CUSTOMER,
        preferences: {
          notifications: {
            email: true,
            push: true,
            desktop: true
          }
        }
      });

      logger.info('Database seeded successfully');
    } catch (error) {
      logger.error('Database seeding failed:', error);
      throw error;
    }
  }

  async clear() {
    try {
      await User.deleteMany({});
      await Department.deleteMany({});
      logger.info('Database cleared successfully');
    } catch (error) {
      logger.error('Database clearing failed:', error);
      throw error;
    }
  }
}

module.exports = new Seeder(); 