const mongoose = require('mongoose');

const ticketTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  fields: [{
    name: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'multiselect']
    },
    required: Boolean,
    options: [String], // For select/multiselect fields
    defaultValue: mongoose.Schema.Types.Mixed
  }],
  sla: {
    responseTime: Number, // in hours
    resolutionTime: Number // in hours
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
ticketTemplateSchema.index({ name: 1 });
ticketTemplateSchema.index({ category: 1 });
ticketTemplateSchema.index({ department: 1 });
ticketTemplateSchema.index({ isActive: 1 });

const TicketTemplate = mongoose.model('TicketTemplate', ticketTemplateSchema);

module.exports = TicketTemplate; 