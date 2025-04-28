// Always use relative paths for API calls
const API_BASE_URL = '/api';

const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`
  },
  
  // Ticket endpoints
  TICKETS: {
    BASE: `${API_BASE_URL}/tickets`,
    DETAIL: (id) => `${API_BASE_URL}/tickets/${id}`,
    COMMENTS: (id) => `${API_BASE_URL}/tickets/${id}/comments`,
    ASSIGN: (id) => `${API_BASE_URL}/tickets/${id}/assign`,
    STATUS: (id) => `${API_BASE_URL}/tickets/${id}/status`,
    ASSIGNED: `${API_BASE_URL}/tickets/assigned`
  },
  
  // User endpoints
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    PROFILE: `${API_BASE_URL}/users/me`,
    AGENTS: `${API_BASE_URL}/users/agents`,
    SHIFT: (id) => `${API_BASE_URL}/users/${id}/shift`
  },
  
  // Department endpoints
  DEPARTMENTS: {
    BASE: `${API_BASE_URL}/departments`,
    DETAIL: (id) => `${API_BASE_URL}/departments/${id}`,
    AGENTS: (id) => `${API_BASE_URL}/departments/${id}/agents`
  }
};

export { API_BASE_URL, API_ENDPOINTS }; 