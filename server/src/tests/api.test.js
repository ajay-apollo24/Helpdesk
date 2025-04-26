const axios = require('axios');
const logger = require('../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:6060/api';

async function testAPI() {
  try {
    // Login to get auth token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });
    const token = loginResponse.data.token;
    logger.info('Logged in successfully');

    // Set auth header
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Create a product
    const productResponse = await axios.post(
      `${API_URL}/products`,
      {
        name: 'API Test Product',
        sku: 'API-TEST-001',
        description: 'API Test Description',
        price: 149.99,
        category: 'test',
        stock: 50,
      },
      { headers }
    );
    const productId = productResponse.data._id;
    logger.info('Created product:', productId);

    // Create an order
    const orderResponse = await axios.post(
      `${API_URL}/orders`,
      {
        customer: loginResponse.data.user._id,
        items: [{
          productId,
          quantity: 1,
        }],
        shippingAddress: {
          street: '123 API Test St',
          city: 'API Test City',
          state: 'API Test State',
          country: 'API Test Country',
          zipCode: '12345',
        },
        billingAddress: {
          street: '123 API Test St',
          city: 'API Test City',
          state: 'API Test State',
          country: 'API Test Country',
          zipCode: '12345',
        },
        paymentMethod: 'credit_card',
        shippingMethod: 'standard',
      },
      { headers }
    );
    const orderId = orderResponse.data._id;
    logger.info('Created order:', orderId);

    // Get order details
    const orderDetails = await axios.get(`${API_URL}/orders/${orderId}`, { headers });
    logger.info('Order details:', orderDetails.data);

    // Update order status
    await axios.patch(
      `${API_URL}/orders/${orderId}`,
      {
        status: 'processing',
        notes: 'Order is being processed via API',
      },
      { headers }
    );
    logger.info('Updated order status');

    // Add tracking information
    await axios.post(
      `${API_URL}/orders/${orderId}/tracking`,
      {
        trackingNumber: 'API-TRACK-123',
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      { headers }
    );
    logger.info('Added tracking information');

    // Mark as delivered
    await axios.post(`${API_URL}/orders/${orderId}/deliver`, {}, { headers });
    logger.info('Marked order as delivered');

    // Get order metrics
    const metrics = await axios.get(`${API_URL}/orders/metrics`, { headers });
    logger.info('Order metrics:', metrics.data);

    // Clean up
    await axios.delete(`${API_URL}/orders/${orderId}`, { headers });
    await axios.delete(`${API_URL}/products/${productId}`, { headers });
    logger.info('Cleaned up test data');

    return true;
  } catch (error) {
    logger.error('API test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Run the test
testAPI()
  .then(() => {
    logger.info('API test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('API test failed:', error);
    process.exit(1);
  }); 