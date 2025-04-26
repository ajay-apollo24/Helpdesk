const { TICKET_STATUS, TICKET_PRIORITY } = require('../../../shared/constants');
const logger = require('../utils/logger');

const validateTicket = (req, res, next) => {
  try {
    const {
      subject,
      description,
      type,
      priority,
      category,
      customer,
      department,
      orderId,
      profileId,
      customFields,
    } = req.body;

    // Basic validation for all ticket types
    if (!subject || !description || !type || !priority || !category || !customer) {
      return res.status(400).json({
        message: 'Missing required fields: subject, description, type, priority, category, customer',
      });
    }

    // Validate ticket type
    const validTypes = ['order', 'profile', 'general', 'technical', 'billing'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid ticket type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Validate priority
    if (!Object.values(TICKET_PRIORITY).includes(priority)) {
      return res.status(400).json({
        message: `Invalid priority. Must be one of: ${Object.values(TICKET_PRIORITY).join(', ')}`,
      });
    }

    // Type-specific validation
    switch (type) {
      case 'order':
        if (!orderId) {
          return res.status(400).json({
            message: 'Order ID is required for order-type tickets',
          });
        }
        // Validate order-specific custom fields
        if (customFields) {
          const requiredOrderFields = ['orderNumber', 'orderDate', 'orderStatus'];
          const missingFields = requiredOrderFields.filter(
            (field) => !customFields.has(field)
          );
          if (missingFields.length > 0) {
            return res.status(400).json({
              message: `Missing required order fields: ${missingFields.join(', ')}`,
            });
          }
        }
        break;

      case 'profile':
        if (!profileId) {
          return res.status(400).json({
            message: 'Profile ID is required for profile-type tickets',
          });
        }
        // Validate profile-specific custom fields
        if (customFields) {
          const requiredProfileFields = ['profileType', 'lastUpdated'];
          const missingFields = requiredProfileFields.filter(
            (field) => !customFields.has(field)
          );
          if (missingFields.length > 0) {
            return res.status(400).json({
              message: `Missing required profile fields: ${missingFields.join(', ')}`,
            });
          }
        }
        break;

      case 'technical':
        // Validate technical-specific custom fields
        if (customFields) {
          const requiredTechnicalFields = ['system', 'version', 'environment'];
          const missingFields = requiredTechnicalFields.filter(
            (field) => !customFields.has(field)
          );
          if (missingFields.length > 0) {
            return res.status(400).json({
              message: `Missing required technical fields: ${missingFields.join(', ')}`,
            });
          }
        }
        break;

      case 'billing':
        // Validate billing-specific custom fields
        if (customFields) {
          const requiredBillingFields = ['invoiceNumber', 'amount', 'currency'];
          const missingFields = requiredBillingFields.filter(
            (field) => !customFields.has(field)
          );
          if (missingFields.length > 0) {
            return res.status(400).json({
              message: `Missing required billing fields: ${missingFields.join(', ')}`,
            });
          }
        }
        break;
    }

    // If all validations pass, proceed to the next middleware
    next();
  } catch (error) {
    logger.error('Validation error:', error);
    res.status(500).json({ message: 'Error validating ticket data' });
  }
};

const validateOrder = (req, res, next) => {
  try {
    const {
      customer,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod,
    } = req.body;

    // Basic validation
    if (!customer || !items || !shippingAddress || !billingAddress || !paymentMethod || !shippingMethod) {
      return res.status(400).json({
        message: 'Missing required fields: customer, items, shippingAddress, billingAddress, paymentMethod, shippingMethod',
      });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Items must be a non-empty array',
      });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          message: 'Each item must have a productId and a quantity greater than 0',
        });
      }
    }

    // Validate addresses
    const requiredAddressFields = ['street', 'city', 'state', 'country', 'zipCode'];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field] || !billingAddress[field]) {
        return res.status(400).json({
          message: `Missing required address field: ${field}`,
        });
      }
    }

    // If all validations pass, proceed to the next middleware
    next();
  } catch (error) {
    logger.error('Validation error:', error);
    res.status(500).json({ message: 'Error validating order data' });
  }
};

module.exports = {
  validateTicket,
  validateOrder,
}; 