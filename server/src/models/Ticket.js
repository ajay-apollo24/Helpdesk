const mongoose = require('mongoose');
const { TICKET_STATUS, TICKET_PRIORITY } = require('../../../shared/constants');

const ticketSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TICKET_STATUS),
    default: TICKET_STATUS.OPEN,
    index: true
  },
  priority: {
    type: String,
    enum: Object.values(TICKET_PRIORITY),
    default: TICKET_PRIORITY.MEDIUM,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  department: {
    type: String,
    required: true,
    index: true
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    attachments: [{
      filename: String,
      path: String,
      size: Number,
      mimetype: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  history: [{
    action: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  escalationLevel: {
    type: Number,
    default: 0
  },
  lastEscalationTime: Date,
  dueDate: Date,
  resolutionTime: Number,
  satisfactionRating: {
    rating: Number,
    comment: String,
    submittedAt: Date
  },
  aiSuggestions: {
    category: String,
    priority: String,
    confidence: Number,
    generatedAt: Date
  },
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

// Virtual for ticket age
ticketSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for isOverdue
ticketSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return Date.now() > this.dueDate;
});

// Method to add comment
ticketSchema.methods.addComment = async function(userId, content, attachments = []) {
  this.comments.push({
    user: userId,
    content,
    attachments
  });
  await this.save();
};

// Method to update status
ticketSchema.methods.updateStatus = async function(newStatus, userId) {
  const oldStatus = this.status;
  this.status = newStatus;
  this.history.push({
    action: 'status_change',
    user: userId,
    details: {
      from: oldStatus,
      to: newStatus
    }
  });
  await this.save();
};

// Method to assign agent
ticketSchema.methods.assignAgent = async function(agentId, userId) {
  const oldAgent = this.assignedAgent;
  this.assignedAgent = agentId;
  this.history.push({
    action: 'agent_assignment',
    user: userId,
    details: {
      from: oldAgent,
      to: agentId
    }
  });
  await this.save();
};

// Indexes
ticketSchema.index({ customer: 1, status: 1 });
ticketSchema.index({ assignedAgent: 1, status: 1 });
ticketSchema.index({ department: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ dueDate: 1 });
ticketSchema.index({ 'tags': 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket; 