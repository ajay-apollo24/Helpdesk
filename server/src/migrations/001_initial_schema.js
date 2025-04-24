const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = {
  version: 1,
  name: 'initial_schema',

  async up() {
    try {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: 5,
        });
      }

      logger.info('Creating indexes for Users...');
      await mongoose.connection.db.collection('users').createIndexes([
        { key: { email: 1 }, unique: true, name: 'unique_email_idx' },
        { key: { role: 1, status: 1 }, name: 'role_status_idx' },
        { key: { 'shift.days': 1 }, name: 'shift_days_idx' },
      ]);

      logger.info('Creating indexes for Tickets...');
      await mongoose.connection.db.collection('tickets').createIndexes([
        { key: { customer: 1, status: 1 }, name: 'customer_status_idx' },
        { key: { assignedAgent: 1, status: 1 }, name: 'agent_status_idx' },
        { key: { department: 1, status: 1 }, name: 'department_status_idx' },
        { key: { createdAt: -1 }, name: 'createdAt_desc_idx' },
        { key: { dueDate: 1 }, name: 'dueDate_idx' },
        { key: { tags: 1 }, name: 'tags_idx' },
      ]);

      logger.info('Creating indexes for Departments...');
      await mongoose.connection.db.collection('departments').createIndexes([
        { key: { name: 1 }, unique: true, name: 'unique_department_name_idx' },
        { key: { manager: 1 }, name: 'manager_idx' },
        { key: { 'categories.name': 1 }, name: 'category_name_idx' },
        { key: { isActive: 1 }, name: 'isActive_idx' },
      ]);

      logger.info('Creating indexes for Notifications...');
      await mongoose.connection.db.collection('notifications').createIndexes([
        { key: { user: 1, read: 1, createdAt: -1 }, name: 'user_read_createdAt_idx' },
        { key: { type: 1, createdAt: -1 }, name: 'type_createdAt_idx' },
        { key: { expiresAt: 1 }, expireAfterSeconds: 0, name: 'expiresAt_ttl_idx' },
      ]);

      logger.info('Initial schema migration completed');
    } catch (error) {
      logger.error('Initial schema migration failed:', error);
      throw error;
    }
  },

  async down() {
    try {
      logger.info('Rolling back indexes...');

      const dropIndex = async (collection, indexName) => {
        try {
          await mongoose.connection.db.collection(collection).dropIndex(indexName);
          logger.info(`Dropped index '${indexName}' from '${collection}'`);
        } catch (e) {
          logger.warn(`Index '${indexName}' might not exist on '${collection}':`, e.message);
        }
      };

      await dropIndex('users', 'unique_email_idx');
      await dropIndex('users', 'role_status_idx');
      await dropIndex('users', 'shift_days_idx');

      await dropIndex('tickets', 'customer_status_idx');
      await dropIndex('tickets', 'agent_status_idx');
      await dropIndex('tickets', 'department_status_idx');
      await dropIndex('tickets', 'createdAt_desc_idx');
      await dropIndex('tickets', 'dueDate_idx');
      await dropIndex('tickets', 'tags_idx');

      await dropIndex('departments', 'unique_department_name_idx');
      await dropIndex('departments', 'manager_idx');
      await dropIndex('departments', 'category_name_idx');
      await dropIndex('departments', 'isActive_idx');

      await dropIndex('notifications', 'user_read_createdAt_idx');
      await dropIndex('notifications', 'type_createdAt_idx');
      await dropIndex('notifications', 'expiresAt_ttl_idx');

      logger.info('Initial schema rollback completed');
    } catch (error) {
      logger.error('Initial schema rollback failed:', error);
      throw error;
    }
  },
};