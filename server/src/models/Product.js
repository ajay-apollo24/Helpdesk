const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    variants: [
      {
        name: String,
        sku: String,
        price: Number,
        stock: Number,
      },
    ],
    images: [String],
    status: {
      type: String,
      enum: ['active', 'inactive', 'out_of_stock'],
      default: 'active',
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'variants.sku': 1 });

// Method to update stock
productSchema.methods.updateStock = async function(quantity, variantSku = null) {
  if (variantSku) {
    const variant = this.variants.find((v) => v.sku === variantSku);
    if (!variant) {
      throw new Error('Variant not found');
    }
    variant.stock += quantity;
    if (variant.stock < 0) {
      throw new Error('Insufficient stock');
    }
  } else {
    this.stock += quantity;
    if (this.stock < 0) {
      throw new Error('Insufficient stock');
    }
  }
  return this.save();
};

// Method to check if product is in stock
productSchema.methods.isInStock = function(variantSku = null) {
  if (variantSku) {
    const variant = this.variants.find((v) => v.sku === variantSku);
    return variant ? variant.stock > 0 : false;
  }
  return this.stock > 0;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 