const cron = require('node-cron');
const ticketService = require('../services/ticketService');
const logger = require('../utils/logger');

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    logger.info('Running SLA check...');
    await ticketService.checkSLABreaches();
    logger.info('SLA check completed');
  } catch (error) {
    logger.error('Error in SLA check:', error);
  }
}); 