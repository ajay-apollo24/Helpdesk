const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../../../shared/constants');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  channels: {
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    inApp: {
      sent: { type: Boolean, default: true },
      sentAt: Date
    }
  },
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for isExpired
notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return Date.now() > this.expiresAt;
});

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    await this.save();
  }
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = async function() {
  if (this.read) {
    this.read = false;
    this.readAt = undefined;
    await this.save();
  }
};

// Method to update delivery status
notificationSchema.methods.updateDeliveryStatus = async function(channel, status) {
  if (this.channels[channel]) {
    this.channels[channel] = {
      sent: status,
      sentAt: status ? new Date() : undefined
    };
    await this.save();
  }
};

// Indexes
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 