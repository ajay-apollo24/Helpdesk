require('dotenv').config();
const database = require('../config/database');
const migrator = require('../utils/migrate');
const logger = require('../utils/logger');

async function runMigrations() {
  try {
    await database.connect();
    
    const command = process.argv[2];
    if (command === 'rollback') {
      const version = process.argv[3];
      await migrator.rollback(version);
    } else {
      await migrator.runMigrations();
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('Migration script failed:', error);
    process.exit(1);
  }
}

runMigrations(); 