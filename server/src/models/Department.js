const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  categories: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    sla: {
      responseTime: Number, // in hours
      resolutionTime: Number // in hours
    }
  }],
  settings: {
    autoAssign: {
      type: Boolean,
      default: true
    },
    roundRobin: {
      type: Boolean,
      default: false
    },
    maxTicketsPerAgent: {
      type: Number,
      default: 10
    },
    workingHours: {
      start: String,
      end: String,
      timezone: {
        type: String,
        default: 'UTC'
      }
    }
  },
  metrics: {
    averageResponseTime: Number,
    averageResolutionTime: Number,
    satisfactionScore: Number,
    totalTickets: Number,
    openTickets: Number,
    lastUpdated: Date
  },
  isActive: {
    type: Boolean,
    default: true
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

// Virtual for active agents count
departmentSchema.virtual('activeAgentsCount').get(function() {
  return this.agents.length;
});

// Method to add agent
departmentSchema.methods.addAgent = async function(agentId) {
  if (!this.agents.includes(agentId)) {
    this.agents.push(agentId);
    await this.save();
  }
};

// Method to remove agent
departmentSchema.methods.removeAgent = async function(agentId) {
  this.agents = this.agents.filter(id => id.toString() !== agentId.toString());
  await this.save();
};

// Method to update metrics
departmentSchema.methods.updateMetrics = async function(metrics) {
  this.metrics = {
    ...this.metrics,
    ...metrics,
    lastUpdated: new Date()
  };
  await this.save();
};

// Indexes
departmentSchema.index({ name: 1 });
departmentSchema.index({ manager: 1 });
departmentSchema.index({ 'categories.name': 1 });
departmentSchema.index({ isActive: 1 });

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department; 