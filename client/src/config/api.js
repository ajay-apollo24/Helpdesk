const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:6060/api';

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
    STATUS: (id) => `${API_BASE_URL}/tickets/${id}/status`
  },
  
  // User endpoints
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    PROFILE: `${API_BASE_URL}/users/profile`,
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

export default API_ENDPOINTS; 