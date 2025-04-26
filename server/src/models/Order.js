const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
        'on_hold',
      ],
      default: 'pending',
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        sku: String,
        variant: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    shippingMethod: {
      type: String,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    trackingNumber: String,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    notes: String,
    tickets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
      },
    ],
    history: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ trackingNumber: 1 });

// Virtual for order age
orderSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to update order status
orderSchema.methods.updateStatus = async function(newStatus, userId, note) {
  this.status = newStatus;
  this.history.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    user: userId,
  });
  return this.save();
};

// Method to add tracking information
orderSchema.methods.addTracking = async function(trackingNumber, estimatedDeliveryDate) {
  this.trackingNumber = trackingNumber;
  this.estimatedDeliveryDate = estimatedDeliveryDate;
  this.status = 'shipped';
  this.history.push({
    status: 'shipped',
    timestamp: new Date(),
    note: `Order shipped with tracking number: ${trackingNumber}`,
  });
  return this.save();
};

// Method to mark as delivered
orderSchema.methods.markAsDelivered = async function() {
  this.status = 'delivered';
  this.actualDeliveryDate = new Date();
  this.history.push({
    status: 'delivered',
    timestamp: new Date(),
    note: 'Order delivered',
  });
  return this.save();
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 