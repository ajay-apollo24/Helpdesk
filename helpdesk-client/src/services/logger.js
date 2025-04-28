const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs
  }

  log(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    // Add to logs array
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output
    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.debug(message, data);
        break;
      case LOG_LEVELS.INFO:
        console.info(message, data);
        break;
      case LOG_LEVELS.WARN:
        console.warn(message, data);
        break;
      case LOG_LEVELS.ERROR:
        console.error(message, data);
        break;
    }

    // Send to backend in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToBackend(logEntry);
    }
  }

  async sendToBackend(logEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.error('Failed to send log to backend:', error);
    }
  }

  debug(message, data = null) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  error(message, error = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : null;
    this.log(LOG_LEVELS.ERROR, message, errorData);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
export default logger; 