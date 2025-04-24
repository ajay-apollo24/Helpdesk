const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.connection = null;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
    this.eventsAttached = false;
  }

  async connect() {
    if (this.connection) return this.connection;

    mongoose.set('strictQuery', false);
    this.setupEvents();

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`Attempting MongoDB connection (attempt ${attempt}/${this.maxRetries})...`);

        // Sanitize config options
        const options = {
          ...config.mongodb.options,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          family: 4,
        };

        // Replace deprecated poolSize if present
        if ('poolSize' in options) {
          options.maxPoolSize = options.poolSize;
          delete options.poolSize;
        }

        this.connection = await mongoose.connect(config.mongodb.uri, options);

        logger.info('MongoDB connected successfully');
        return this.connection;
      } catch (error) {
        logger.error(`MongoDB connection error (attempt ${attempt}):`, error.message);

        if (attempt < this.maxRetries) {
          logger.info(`Retrying in ${this.retryDelay / 1000} seconds...`);
          await this.delay(this.retryDelay);
        } else {
          logger.error('Max retries reached. Could not connect to MongoDB.');
          process.exit(1);
        }
      }
    }
  }

  setupEvents() {
    if (this.eventsAttached) return;
    this.eventsAttached = true;

    mongoose.connection.on('connected', () => {
      logger.info('[Mongoose] Connected');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('[Mongoose] Disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('[Mongoose] Connection error:', err.message);
    });

    process.on('SIGINT', async () => {
      await this.close();
      process.exit(0);
    });
  }

  async close() {
    if (this.connection) {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new Database();