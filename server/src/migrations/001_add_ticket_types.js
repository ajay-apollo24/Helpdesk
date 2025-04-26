const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function up() {
  try {
    // Check if orders collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const ordersCollectionExists = collections.some(
      (collection) => collection.name === 'orders'
    );

    if (!ordersCollectionExists) {
      // Create orders collection only if it doesn't exist
      await mongoose.connection.createCollection('orders');
      logger.info('Created orders collection');
    } else {
      logger.info('Orders collection already exists, skipping creation');
    }

    // Add new fields to tickets collection
    await mongoose.connection.collection('tickets').updateMany(
      {},
      {
        $set: {
          type: 'general',
          customFields: {},
        },
      }
    );
    logger.info('Added type and customFields to tickets');

    // Drop existing indexes first
    try {
      await mongoose.connection.collection('tickets').dropIndexes();
      logger.info('Dropped existing ticket indexes');
    } catch (error) {
      logger.warn('No existing indexes to drop or error dropping indexes:', error);
    }

    // Create new indexes for tickets
    await mongoose.connection.collection('tickets').createIndexes([
      { key: { customer: 1, status: 1 }, name: 'customer_status_idx' },
      { key: { assignedAgent: 1, status: 1 }, name: 'agent_status_idx' },
      { key: { department: 1, status: 1 }, name: 'department_status_idx' },
      { key: { type: 1, status: 1 }, name: 'type_status_idx' },
      { key: { orderId: 1 }, name: 'order_idx' },
      { key: { profileId: 1 }, name: 'profile_idx' },
    ]);
    logger.info('Created new indexes for tickets');

    // Create indexes for orders
    await mongoose.connection.collection('orders').createIndexes([
      { key: { customer: 1, createdAt: -1 }, name: 'customer_created_idx' },
      { key: { status: 1 }, name: 'status_idx' },
      { key: { orderId: 1 }, name: 'order_id_idx' },
      { key: { trackingNumber: 1 }, name: 'tracking_idx' },
    ]);
    logger.info('Created indexes for orders');

    return true;
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    // Remove new fields from tickets
    await mongoose.connection.collection('tickets').updateMany(
      {},
      {
        $unset: {
          type: '',
          customFields: '',
          orderId: '',
          profileId: '',
        },
      }
    );
    logger.info('Removed new fields from tickets');

    // Check if orders collection exists before dropping
    const collections = await mongoose.connection.db.listCollections().toArray();
    const ordersCollectionExists = collections.some(
      (collection) => collection.name === 'orders'
    );

    if (ordersCollectionExists) {
      await mongoose.connection.collection('orders').drop();
      logger.info('Dropped orders collection');
    } else {
      logger.info('Orders collection does not exist, skipping drop');
    }

    // Drop new indexes
    try {
      await mongoose.connection.collection('tickets').dropIndexes();
      logger.info('Dropped ticket indexes');
    } catch (error) {
      logger.warn('Error dropping indexes:', error);
    }

    return true;
  } catch (error) {
    logger.error('Rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down }; 