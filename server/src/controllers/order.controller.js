const Order = require('../models/Order');
const Product = require('../models/Product');
const Ticket = require('../models/Ticket');
const logger = require('../utils/logger');

const orderController = {
  async getOrders(req, res) {
    try {
      const { status, customer, startDate, endDate } = req.query;
      const query = {};

      if (status) query.status = status;
      if (customer) query.customer = customer;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const orders = await Order.find(query)
        .populate('customer', 'name email')
        .populate('items.productId', 'name sku price')
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (error) {
      logger.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Error fetching orders' });
    }
  },

  async getOrderById(req, res) {
    try {
      const order = await Order.findById(req.params.id)
        .populate('customer', 'name email phone')
        .populate('items.productId', 'name sku price images')
        .populate('tickets');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      logger.error('Error fetching order:', error);
      res.status(500).json({ message: 'Error fetching order' });
    }
  },

  async createOrder(req, res) {
    try {
      const {
        customer,
        items,
        shippingAddress,
        billingAddress,
        paymentMethod,
        shippingMethod,
      } = req.body;

      // Validate products and calculate total
      let totalAmount = 0;
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(400).json({
            message: `Product not found: ${item.productId}`,
          });
        }
        if (!product.isInStock(item.variantSku)) {
          return res.status(400).json({
            message: `Product out of stock: ${product.name}`,
          });
        }
        totalAmount += product.price * item.quantity;
      }

      const order = new Order({
        orderId: `ORD-${Date.now()}`,
        customer,
        items,
        totalAmount,
        shippingAddress,
        billingAddress,
        paymentMethod,
        shippingMethod,
        status: 'pending',
        createdBy: req.user._id,
      });

      await order.save();

      // Update product stock
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      res.status(201).json(order);
    } catch (error) {
      logger.error('Error creating order:', error);
      res.status(500).json({ message: 'Error creating order' });
    }
  },

  async updateOrder(req, res) {
    try {
      const { status, shippingAddress, billingAddress, notes } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (status) {
        await order.updateStatus(status, req.user._id, notes);
      }
      if (shippingAddress) order.shippingAddress = shippingAddress;
      if (billingAddress) order.billingAddress = billingAddress;
      if (notes) order.notes = notes;

      await order.save();
      res.json(order);
    } catch (error) {
      logger.error('Error updating order:', error);
      res.status(500).json({ message: 'Error updating order' });
    }
  },

  async deleteOrder(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }

      await order.remove();
      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      logger.error('Error deleting order:', error);
      res.status(500).json({ message: 'Error deleting order' });
    }
  },

  async getOrderHistory(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json(order.history);
    } catch (error) {
      logger.error('Error fetching order history:', error);
      res.status(500).json({ message: 'Error fetching order history' });
    }
  },

  async addTracking(req, res) {
    try {
      const { trackingNumber, estimatedDeliveryDate } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      await order.addTracking(trackingNumber, estimatedDeliveryDate);
      res.json(order);
    } catch (error) {
      logger.error('Error adding tracking:', error);
      res.status(500).json({ message: 'Error adding tracking' });
    }
  },

  async markAsDelivered(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      await order.markAsDelivered();
      res.json(order);
    } catch (error) {
      logger.error('Error marking order as delivered:', error);
      res.status(500).json({ message: 'Error marking order as delivered' });
    }
  },

  async getOrderMetrics(req, res) {
    try {
      const metrics = await Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]);

      res.json(metrics);
    } catch (error) {
      logger.error('Error fetching order metrics:', error);
      res.status(500).json({ message: 'Error fetching order metrics' });
    }
  },
};

module.exports = orderController; 