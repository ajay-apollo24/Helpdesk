// User Types
export const UserRole = {
  CUSTOMER: 'customer',
  AGENT: 'agent',
  ADMIN: 'admin',
};

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

// Ticket Types
export const TicketStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const TicketPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// File Types
export const FileType = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  OTHER: 'other',
};

// Notification Types
export const NotificationType = {
  TICKET_CREATED: 'ticket_created',
  TICKET_UPDATED: 'ticket_updated',
  TICKET_ASSIGNED: 'ticket_assigned',
  TICKET_ESCALATED: 'ticket_escalated',
  COMMENT_ADDED: 'comment_added',
};

// API Response Types
export const ApiResponseStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
};

// Pagination Types
export const PaginationOrder = {
  ASC: 'asc',
  DESC: 'desc',
};

// Filter Types
export const FilterOperator = {
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  IN: 'in',
  NOT_IN: 'not_in',
}; 