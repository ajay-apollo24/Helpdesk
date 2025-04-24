const Redis = require('ioredis');
const config = require('./config');

class RedisManager {
  constructor() {
    this.client = null;
    this.subscriber = null;
    this.publisher = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000;
  }

  async connect() {
    try {
      if (this.client) {
        return this.client;
      }

      const options = {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryStrategy: (times) => {
          if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            return this.retryDelay;
          }
          return null;
        }
      };

      this.client = new Redis(options);
      this.subscriber = new Redis(options);
      this.publisher = new Redis(options);

      this.client.on('connect', () => {
        console.log('Redis connected successfully');
        this.retryCount = 0;
      });

      this.client.on('error', (err) => {
        console.error('Redis connection error:', err);
        this.handleConnectionError();
      });

      return this.client;
    } catch (error) {
      console.error('Initial Redis connection error:', error);
      this.handleConnectionError();
    }
  }

  handleConnectionError() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Retrying Redis connection (${this.retryCount}/${this.maxRetries})...`);
      setTimeout(() => this.connect(), this.retryDelay);
    } else {
      console.error('Max retries reached. Could not connect to Redis.');
      process.exit(1);
    }
  }

  async close() {
    if (this.client) {
      await this.client.quit();
      await this.subscriber.quit();
      await this.publisher.quit();
      console.log('Redis connections closed');
    }
  }

  // Cache methods
  async set(key, value, ttl = 3600) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async get(key) {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key) {
    await this.client.del(key);
  }

  // Pub/Sub methods
  async publish(channel, message) {
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel, callback) {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(JSON.parse(message));
      }
    });
  }
}

module.exports = new RedisManager(); 