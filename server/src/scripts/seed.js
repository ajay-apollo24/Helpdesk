require('dotenv').config();
const database = require('../config/database');
const seeder = require('../utils/seed');
const logger = require('../utils/logger');

async function runSeeder() {
  try {
    await database.connect();
    
    const command = process.argv[2];
    if (command === 'clear') {
      await seeder.clear();
    } else {
      await seeder.seed();
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('Seed script failed:', error);
    process.exit(1);
  }
}

runSeeder(); 