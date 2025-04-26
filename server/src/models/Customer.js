const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // External system ID
  externalId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Basic info we cache locally
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    trim: true
  },
  // Metadata about the customer
  customerType: {
    type: String,
    enum: ['individual', 'business'],
    default: 'individual'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  // Cache of important metrics
  totalOrders: {
    type: Number,
    default: 0
  },
  totalTickets: {
    type: Number,
    default: 0
  },
  lastPurchaseDate: Date,
  // When this cache was last synced with external system
  lastSyncedAt: {
    type: Date,
    default: Date.now
  },
  // External system metadata
  externalSystemData: {
    system: {
      type: String,
      required: true,
      default: 'CRM' // or whatever external system name
    },
    lastUpdated: Date,
    // Any other external system specific data
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }
}, {
  timestamps: true
});

// Indexes
customerSchema.index({ externalId: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ 'externalSystemData.system': 1, 'externalSystemData.lastUpdated': 1 });

// Methods to sync with external system
customerSchema.statics.syncWithExternalSystem = async function(externalId) {
  try {
    // This would be implemented to call the external API
    // const externalData = await ExternalAPI.getCustomer(externalId);
    // return this.findOneAndUpdate(
    //   { externalId },
    //   { $set: { ...externalData, lastSyncedAt: new Date() } },
    //   { new: true, upsert: true }
    // );
  } catch (error) {
    throw new Error(`Failed to sync customer with external system: ${error.message}`);
  }
};

// Method to get customer's cached data
customerSchema.methods.getCachedData = function() {
  return {
    id: this.externalId,
    name: this.name,
    email: this.email,
    phone: this.phone,
    metrics: {
      totalOrders: this.totalOrders,
      totalTickets: this.totalTickets,
      lastPurchase: this.lastPurchaseDate
    },
    lastSynced: this.lastSyncedAt
  };
};

// Middleware to check if cache is stale
customerSchema.pre('find', async function() {
  // You could implement logic here to auto-refresh stale cache
  // For example, if lastSyncedAt is more than 1 hour old
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer; 