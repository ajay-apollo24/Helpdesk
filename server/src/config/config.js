const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const config = {
  development: {
    port: process.env.PORT || 5000,
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        poolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    fileUpload: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },
  production: {
    port: process.env.PORT || 5000,
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        poolSize: 20,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        ssl: true,
        sslValidate: true
      }
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100
    },
    fileUpload: {
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
    },
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env]; 