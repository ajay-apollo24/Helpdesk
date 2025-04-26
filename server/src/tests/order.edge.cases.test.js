const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const logger = require('../utils/logger');

async function setupTestData() {
  const testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'customer',
  });

  const products = await Product.create([
    {
      name: 'Low Stock Product',
      sku: 'LOW-STOCK-001',
      description: 'Product with low stock',
      price: 99.99,
      category: 'test',
      stock: 1,
    },
    {
      name: 'Out of Stock Product',
      sku: 'OUT-OF-STOCK-001',
      description: 'Product with no stock',
      price: 149.99,
      category: 'test',
      stock: 0,
    },
  ]);

  return { testUser, products };
}

async function cleanupTestData(testUser, products) {
  await User.deleteOne({ _id: testUser._id });
  await Product.deleteMany({ _id: { $in: products.map(p => p._id) } });
}

async function testInsufficientStock() {
  const { testUser, products } = await setupTestData();
  try {
    const lowStockProduct = products[0];
    const outOfStockProduct = products[1];

    // Try to order more than available stock
    const order = await Order.create({
      orderId: `ORD-${Date.now()}`,
      customer: testUser._id,
      items: [{
        productId: lowStockProduct._id,
        name: lowStockProduct.name,
        quantity: 2, // More than available stock
        price: lowStockProduct.price,
      }],
      totalAmount: lowStockProduct.price * 2 + 10 + (lowStockProduct.price * 2 * 0.1),
      shippingCost: 10.00,
      tax: lowStockProduct.price * 2 * 0.1,
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

    // Verify product stock wasn't updated
    const updatedProduct = await Product.findById(lowStockProduct._id);
    if (updatedProduct.stock !== 1) {
      throw new Error('Stock was incorrectly updated');
    }

    logger.info('Tested insufficient stock scenario');
    return order;
  } finally {
    await cleanupTestData(testUser, products);
  }
}

async function testInvalidStatusTransition() {
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

    // Try invalid status transition (pending -> refunded)
    try {
      await order.updateStatus('refunded', testUser._id, 'Invalid status transition');
      throw new Error('Invalid status transition was allowed');
    } catch (error) {
      logger.info('Successfully caught invalid status transition');
    }

    return order;
  } finally {
    await cleanupTestData(testUser, products);
  }
}

async function testDuplicateOrderId() {
  const { testUser, products } = await setupTestData();
  try {
    const orderId = `ORD-${Date.now()}`;

    // Create first order
    await Order.create({
      orderId,
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

    // Try to create second order with same ID
    try {
      await Order.create({
        orderId,
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
      throw new Error('Duplicate order ID was allowed');
    } catch (error) {
      logger.info('Successfully caught duplicate order ID');
    }
  } finally {
    await cleanupTestData(testUser, products);
  }
}

async function testInvalidAmounts() {
  const { testUser, products } = await setupTestData();
  try {
    // Try to create order with negative amount
    try {
      await Order.create({
        orderId: `ORD-${Date.now()}`,
        customer: testUser._id,
        items: [{
          productId: products[0]._id,
          name: products[0].name,
          quantity: 1,
          price: products[0].price,
        }],
        totalAmount: -100,
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
      throw new Error('Negative amount was allowed');
    } catch (error) {
      logger.info('Successfully caught negative amount');
    }
  } finally {
    await cleanupTestData(testUser, products);
  }
}

async function runAllTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/helpdesk');
    logger.info('Connected to MongoDB');

    // Run all edge case tests
    await testInsufficientStock();
    await testInvalidStatusTransition();
    await testDuplicateOrderId();
    await testInvalidAmounts();

    logger.info('All edge case tests completed successfully');
  } catch (error) {
    logger.error('Edge case tests failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run all tests
runAllTests()
  .then(() => {
    logger.info('All edge case tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Edge case tests failed:', error);
    process.exit(1);
  }); 