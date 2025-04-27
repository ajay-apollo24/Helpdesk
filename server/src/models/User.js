const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES, USER_STATUS } = require('../../../shared/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Don't include password by default in queries
  },
  role: {
    type: String,
    enum: [USER_ROLES.AGENT, USER_ROLES.ADMIN], // Only internal user roles
    required: true
  },
  status: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.ACTIVE
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function() {
      return this.role === USER_ROLES.AGENT;
    }
  },
  skills: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'beginner'
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  shift: {
    startTime: {
      type: String,
      required: function() {
        return this.role === USER_ROLES.AGENT;
      }
    },
    endTime: {
      type: String,
      required: function() {
        return this.role === USER_ROLES.AGENT;
      }
    },
    timeZone: {
      type: String,
      default: 'UTC'
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      desktop: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'light' }
  },
  performance: {
    ticketsResolved: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }, // in minutes
    customerSatisfactionScore: { type: Number, default: 0 },
    lastUpdated: Date
  },
  lastLogin: Date,
  lastActive: Date,
  sessionToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ department: 1, role: 1 });
userSchema.index({ 'shift.days': 1 });
userSchema.index({ sessionToken: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.name}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('[DEBUG] candidatePassword:', candidatePassword);
    console.log('[DEBUG] storedHash:', this.password);
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.sessionToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.__v;
  return userObject;
};

// Method to check if user is available
userSchema.methods.isAvailable = function() {
  if (this.role !== USER_ROLES.AGENT) return false;
  
  const now = new Date();
  const currentDay = now.toLocaleLowerCase();
  const currentTime = now.toLocaleTimeString('en-US', { hour12: false });
  
  return this.shift.days.includes(currentDay) &&
         currentTime >= this.shift.startTime &&
         currentTime <= this.shift.endTime &&
         this.status === USER_STATUS.ACTIVE;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 