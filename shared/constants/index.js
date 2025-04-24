// User Roles
const USER_ROLES = {
  CUSTOMER: 'customer',
  AGENT: 'agent',
  ADMIN: 'admin'
};

// User Status
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// Ticket Status
const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

// Ticket Priority
const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// File Types
const FILE_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  OTHER: 'other'
};

// Notification Types
const NOTIFICATION_TYPES = {
  TICKET_CREATED: 'ticket_created',
  TICKET_UPDATED: 'ticket_updated',
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_ESCALATED: 'ticket_escalated',
  COMMENT_ADDED: 'comment_added'
};

// API Endpoints
const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout'
  },
  TICKETS: {
    BASE: '/tickets',
    DETAIL: (id) => `/tickets/${id}`,
    COMMENTS: (id) => `/tickets/${id}/comments`,
    ASSIGN: (id) => `/tickets/${id}/assign`,
    STATUS: (id) => `/tickets/${id}/status`
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    AGENTS: '/users/agents',
    SHIFT: (id) => `/users/${id}/shift`
  }
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network error',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token expired'
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  TICKET_CREATED: 'Ticket created successfully',
  TICKET_UPDATED: 'Ticket updated successfully',
  TICKET_ASSIGNED: 'Ticket assigned successfully',
  COMMENT_ADDED: 'Comment added successfully'
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  TICKET_STATUS,
  TICKET_PRIORITY,
  FILE_TYPES,
  NOTIFICATION_TYPES,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
}; 