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
    minlength: 8
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.CUSTOMER
  },
  status: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.ACTIVE
  },
  department: {
    type: String,
    required: function() {
      return this.role === USER_ROLES.AGENT;
    }
  },
  skills: [{
    type: String,
    trim: true
  }],
  shift: {
    startTime: String,
    endTime: String,
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
    timezone: { type: String, default: 'UTC' }
  },
  lastLogin: Date,
  lastActive: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

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
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'shift.days': 1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 