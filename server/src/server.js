const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Import the Express app configuration
const app = require('./app');

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('Connected to MongoDB'))
.catch(err => logger.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 6060;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
}); 