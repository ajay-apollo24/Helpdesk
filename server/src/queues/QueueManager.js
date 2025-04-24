const RedisManager = require('../config/redis');

class QueueManager {
  constructor() {
    this.queues = new Map();
    this.processing = new Map();
  }

  async initialize() {
    await RedisManager.connect();
  }

  async createQueue(name, processor, concurrency = 1) {
    if (this.queues.has(name)) {
      return this.queues.get(name);
    }

    const queue = {
      name,
      processor,
      concurrency,
      isProcessing: false
    };

    this.queues.set(name, queue);
    this.processing.set(name, 0);

    // Start processing if not already running
    if (!queue.isProcessing) {
      this.processQueue(name);
    }

    return queue;
  }

  async addJob(queueName, data, priority = 'normal') {
    const job = {
      id: Date.now().toString(),
      data,
      priority,
      timestamp: Date.now()
    };

    await RedisManager.publish(`queue:${queueName}`, job);
    return job.id;
  }

  async processQueue(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue || queue.isProcessing) return;

    queue.isProcessing = true;

    await RedisManager.subscribe(`queue:${queueName}`, async (job) => {
      if (this.processing.get(queueName) >= queue.concurrency) {
        return;
      }

      this.processing.set(queueName, this.processing.get(queueName) + 1);

      try {
        await queue.processor(job.data);
        console.log(`Job ${job.id} processed successfully`);
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        // Implement retry logic here if needed
      } finally {
        this.processing.set(queueName, this.processing.get(queueName) - 1);
      }
    });
  }

  async getQueueStatus(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue) return null;

    return {
      name: queue.name,
      isProcessing: queue.isProcessing,
      currentJobs: this.processing.get(queueName),
      concurrency: queue.concurrency
    };
  }
}

module.exports = new QueueManager(); 