const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 6060,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk',
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:3000'
  },
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

module.exports = config; 