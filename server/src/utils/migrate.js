const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

class Migrator {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
    this.migrations = [];
  }

  async loadMigrations() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      this.migrations = files
        .filter(file => file.endsWith('.js'))
        .map(file => require(path.join(this.migrationsPath, file)))
        .sort((a, b) => a.version - b.version);
    } catch (error) {
      logger.error('Error loading migrations:', error);
      throw error;
    }
  }

  async runMigrations() {
    try {
      await this.loadMigrations();
      
      // Create migrations collection if it doesn't exist
      const Migration = mongoose.model('Migration', new mongoose.Schema({
        version: Number,
        name: String,
        appliedAt: Date
      }));

      // Get applied migrations
      const appliedMigrations = await Migration.find().sort({ version: 1 });
      const appliedVersions = appliedMigrations.map(m => m.version);

      // Run pending migrations
      for (const migration of this.migrations) {
        if (!appliedVersions.includes(migration.version)) {
          logger.info(`Running migration: ${migration.name}`);
          
          try {
            await migration.up();
            await Migration.create({
              version: migration.version,
              name: migration.name,
              appliedAt: new Date()
            });
            logger.info(`Migration completed: ${migration.name}`);
          } catch (error) {
            logger.error(`Migration failed: ${migration.name}`, error);
            throw error;
          }
        }
      }

      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration process failed:', error);
      throw error;
    }
  }

  async rollback(version) {
    try {
      await this.loadMigrations();
      
      const Migration = mongoose.model('Migration');
      const appliedMigrations = await Migration.find()
        .sort({ version: -1 })
        .limit(version || 1);

      for (const appliedMigration of appliedMigrations) {
        const migration = this.migrations.find(m => m.version === appliedMigration.version);
        if (migration) {
          logger.info(`Rolling back migration: ${migration.name}`);
          
          try {
            await migration.down();
            await Migration.deleteOne({ version: migration.version });
            logger.info(`Rollback completed: ${migration.name}`);
          } catch (error) {
            logger.error(`Rollback failed: ${migration.name}`, error);
            throw error;
          }
        }
      }

      logger.info('Rollback completed successfully');
    } catch (error) {
      logger.error('Rollback process failed:', error);
      throw error;
    }
  }
}

module.exports = new Migrator(); 