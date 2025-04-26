const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const logger = require('../utils/logger');

async function testOrderFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk');
    logger.info('Connected to MongoDB');

    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer',
    });
    logger.info('Created test user:', testUser._id);

    // Create a test product
    const testProduct = await Product.create({
      name: 'Test Product',
      sku: 'TEST-001',
      description: 'Test Description',
      price: 99.99,
      category: 'test',
      stock: 100,
    });
    logger.info('Created test product:', testProduct._id);

    // Calculate order totals
    const subtotal = testProduct.price * 2;
    const shippingCost = 10.00;
    const tax = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + shippingCost + tax;

    // Create a test order
    const testOrder = await Order.create({
      orderId: `ORD-${Date.now()}`,
      customer: testUser._id,
      items: [{
        productId: testProduct._id,
        name: testProduct.name,
        quantity: 2,
        price: testProduct.price,
      }],
      totalAmount,
      shippingCost,
      tax,
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        zipCode: '12345',
      },
      billingAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        zipCode: '12345',
      },
      paymentMethod: 'credit_card',
      shippingMethod: 'standard',
      status: 'pending',
      createdBy: testUser._id,
    });
    logger.info('Created test order:', testOrder._id);

    // Test order status update
    await testOrder.updateStatus('processing', testUser._id, 'Order is being processed');
    logger.info('Updated order status to processing');

    // Test adding tracking information
    await testOrder.addTracking('TRACK123', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    logger.info('Added tracking information');

    // Test marking as delivered
    await testOrder.markAsDelivered();
    logger.info('Marked order as delivered');

    // Test order metrics
    const metrics = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);
    logger.info('Order metrics:', metrics);

    // Clean up test data
    await Order.deleteOne({ _id: testOrder._id });
    await Product.deleteOne({ _id: testProduct._id });
    await User.deleteOne({ _id: testUser._id });
    logger.info('Cleaned up test data');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');

    return true;
  } catch (error) {
    logger.error('Test failed:', error);
    throw error;
  }
}

// Run the test
testOrderFlow()
  .then(() => {
    logger.info('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Test failed:', error);
    process.exit(1);
  }); 