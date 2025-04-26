const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const logger = require('../utils/logger');

async function setupTestData() {
  // Create test user
  const testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'customer',
  });

  // Create multiple test products
  const products = await Product.create([
    {
      name: 'Product 1',
      sku: 'TEST-001',
      description: 'Test Product 1',
      price: 99.99,
      category: 'test',
      stock: 100,
    },
    {
      name: 'Product 2',
      sku: 'TEST-002',
      description: 'Test Product 2',
      price: 149.99,
      category: 'test',
      stock: 50,
    },
    {
      name: 'Product 3',
      sku: 'TEST-003',
      description: 'Test Product 3',
      price: 199.99,
      category: 'test',
      stock: 25,
    },
  ]);

  return { testUser, products };
}

async function cleanupTestData(testUser, products) {
  await User.deleteOne({ _id: testUser._id });
  await Product.deleteMany({ _id: { $in: products.map(p => p._id) } });
}

async function testMultipleItemsOrder() {
  const { testUser, products } = await setupTestData();
  try {
    // Calculate order totals
    const items = products.map(product => ({
      productId: product._id,
      name: product.name,
      quantity: 1,
      price: product.price,
    }));

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = 15.00;
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + shippingCost + tax;

    const order = await Order.create({
      orderId: `ORD-${Date.now()}`,
      customer: testUser._id,
      items,
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

    logger.info('Created multi-item order:', order._id);
    return order;
  } finally {
    await cleanupTestData(testUser, products);
  }
}

async function testOrderCancellation() {
  const { testUser, products } = await setupTestData();
  try {
    const order = await Order.create({
      orderId: `ORD-${Date.now()}`,
      customer: testUser._id,
      items: [{
        productId: products[0]._id,
        name: products[0].name,
        quantity: 1,
        price: products[0].price,
      }],
      totalAmount: products[0].price + 10 + (products[0].price * 0.1),
      shippingCost: 10.00,
      tax: products[0].price * 0.1,
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

    await order.updateStatus('cancelled', testUser._id, 'Customer requested cancellation');
    logger.info('Order cancelled:', order._id);
    return order;
  } finally {
    await cleanupTestData(testUser, products);
  }
}

async function testOrderRefund() {
  const { testUser, products } = await setupTestData();
  try {
    const order = await Order.create({
      orderId: `ORD-${Date.now()}`,
      customer: testUser._id,
      items: [{
        productId: products[0]._id,
        name: products[0].name,
        quantity: 1,
        price: products[0].price,
      }],
      totalAmount: products[0].price + 10 + (products[0].price * 0.1),
      shippingCost: 10.00,
      tax: products[0].price * 0.1,
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
      status: 'delivered',
      createdBy: testUser._id,
    });

    await order.updateStatus('refunded', testUser._id, 'Customer requested refund');
    logger.info('Order refunded:', order._id);
    return order;
  } finally {
    await cleanupTestData(testUser, products);
  }
}

async function testOrderHold() {
  const { testUser, products } = await setupTestData();
  try {
    const order = await Order.create({
      orderId: `ORD-${Date.now()}`,
      customer: testUser._id,
      items: [{
        productId: products[0]._id,
        name: products[0].name,
        quantity: 1,
        price: products[0].price,
      }],
      totalAmount: products[0].price + 10 + (products[0].price * 0.1),
      shippingCost: 10.00,
      tax: products[0].price * 0.1,
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

    await order.updateStatus('on_hold', testUser._id, 'Payment verification required');
    logger.info('Order put on hold:', order._id);
    return order;
  } finally {
    await cleanupTestData(testUser, products);
  }
}

async function runAllTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk');
    logger.info('Connected to MongoDB');

    // Run all test scenarios
    await testMultipleItemsOrder();
    await testOrderCancellation();
    await testOrderRefund();
    await testOrderHold();

    logger.info('All test scenarios completed successfully');
  } catch (error) {
    logger.error('Test scenarios failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run all tests
runAllTests()
  .then(() => {
    logger.info('All tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Tests failed:', error);
    process.exit(1);
  }); 