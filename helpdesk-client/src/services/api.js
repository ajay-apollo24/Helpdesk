import logger from './logger';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:6060/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      logger.debug(`Making API request to ${url}`, { options: finalOptions });
      
      // First check if the server is reachable
      const response = await fetch(url, finalOptions);
      
      // Log the response headers for debugging
      logger.debug('Response headers:', {
        headers: Object.fromEntries(response.headers.entries()),
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        // Try to parse error response as JSON
        const contentType = response.headers.get('content-type');
        let errorData;
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json().catch(() => ({}));
        } else {
          // If not JSON, get text content for debugging
          const textContent = await response.text();
          logger.error('Non-JSON response received:', { content: textContent });
          errorData = { message: 'Invalid server response' };
        }

        throw new ApiError(
          errorData.message || 'API request failed',
          response.status,
          errorData
        );
      }

      const data = await response.json();
      logger.debug(`API response from ${url}`, { data });
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error(`API request failed: ${url}`, {
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        }
      });
      throw new ApiError('Failed to connect to server', 503, {
        originalError: error.message
      });
    }
  }

  async getCurrentUser() {
    try {
      logger.debug('Fetching current user');
      return await this.request('/users/me');
    } catch (error) {
      logger.error('Failed to fetch current user', error);
      throw error;
    }
  }

  async createTicket(formData) {
    try {
      logger.info('Creating new ticket', { formData });
      const response = await fetch(`${this.baseUrl}/tickets`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Ticket creation failed', {
          status: response.status,
          error: errorData,
        });
        throw new ApiError(
          errorData.message || 'Failed to create ticket',
          response.status,
          errorData
        );
      }

      const data = await response.json();
      logger.info('Ticket created successfully', { ticketId: data._id });
      return data;
    } catch (error) {
      logger.error('Ticket creation failed', error);
      throw error;
    }
  }

  async getTickets(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/tickets${queryString ? `?${queryString}` : ''}`;
      logger.debug('Fetching tickets', { params });
      return await this.request(url);
    } catch (error) {
      logger.error('Failed to fetch tickets', error);
      throw error;
    }
  }

  async getTicketById(id) {
    try {
      logger.debug('Fetching ticket details', { ticketId: id });
      return await this.request(`/tickets/${id}`);
    } catch (error) {
      logger.error('Failed to fetch ticket details', error);
      throw error;
    }
  }

  async updateTicket(id, data) {
    try {
      logger.info('Updating ticket', { ticketId: id, data });
      return await this.request(`/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      logger.error('Failed to update ticket', error);
      throw error;
    }
  }

  async deleteTicket(id) {
    try {
      logger.info('Deleting ticket', { ticketId: id });
      return await this.request(`/tickets/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logger.error('Failed to delete ticket', error);
      throw error;
    }
  }

  async getTicketTemplates(department) {
    try {
      logger.debug('Fetching ticket templates', { department });
      return await this.request(`/ticket-templates?department=${department}`);
    } catch (error) {
      logger.error('Failed to fetch ticket templates', error);
      throw error;
    }
  }

  async getCustomerById(id) {
    try {
      logger.debug('Fetching customer details', { customerId: id });
      return await this.request(`/customers/${id}`);
    } catch (error) {
      logger.error('Failed to fetch customer details', error);
      throw error;
    }
  }

  async getOrderById(id) {
    try {
      logger.debug('Fetching order details', { orderId: id });
      return await this.request(`/orders/${id}`);
    } catch (error) {
      logger.error('Failed to fetch order details', error);
      throw error;
    }
  }

  async addTicketComment(ticketId, comment) {
    try {
      logger.info('Adding comment to ticket', { ticketId, comment });
      return await this.request(`/tickets/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify(comment),
      });
    } catch (error) {
      logger.error('Failed to add comment to ticket', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService; 