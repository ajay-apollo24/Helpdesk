const mongoose = require('mongoose');
const { TICKET_STATUS, TICKET_PRIORITY } = require('../../../shared/constants');

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['order', 'profile', 'general', 'technical', 'billing'],
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.OPEN,
    },
    priority: {
      type: String,
      required: true,
      enum: Object.values(TICKET_PRIORITY),
      default: TICKET_PRIORITY.MEDIUM,
    },
    category: {
      type: String,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    // Type-specific fields
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      // Only required for order-type tickets
      required: function() {
        return this.type === 'order';
      },
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile',
      // Only required for profile-type tickets
      required: function() {
        return this.type === 'profile';
      },
    },
    // Custom fields for different ticket types
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Common fields for all tickets
    comments: [
      {
        content: String,
        type: {
          type: String,
          enum: ['agent', 'customer', 'system'],
          default: 'agent',
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        filename: String,
        path: String,
        type: String,
        size: Number,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    history: [
      {
        action: String,
        field: String,
        value: mongoose.Schema.Types.Mixed,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [String],
    dueDate: Date,
    resolutionTime: Date,
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ticketSchema.index({ customer: 1, status: 1 });
ticketSchema.index({ assignedAgent: 1, status: 1 });
ticketSchema.index({ department: 1, status: 1 });
ticketSchema.index({ type: 1, status: 1 });
ticketSchema.index({ orderId: 1 });
ticketSchema.index({ profileId: 1 });

// Virtual for ticket age
ticketSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
ticketSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return Date.now() > this.dueDate;
});

// Method to add a comment
ticketSchema.methods.addComment = async function(content, type, userId) {
  this.comments.push({
    content,
    type,
    user: userId,
    createdAt: new Date(),
  });
  return this.save();
};

// Method to update status
ticketSchema.methods.updateStatus = async function(newStatus, userId) {
  this.status = newStatus;
  this.history.push({
    action: 'status_update',
    field: 'status',
    value: newStatus,
    user: userId,
    timestamp: new Date(),
  });
  return this.save();
};

// Method to assign agent
ticketSchema.methods.assignAgent = async function(agentId, userId) {
  this.assignedAgent = agentId;
  this.history.push({
    action: 'agent_assignment',
    field: 'assignedAgent',
    value: agentId,
    user: userId,
    timestamp: new Date(),
  });
  return this.save();
};

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket; 