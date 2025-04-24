const config = {
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
  auth: {
    tokenKey: 'helpdesk_token',
    refreshTokenKey: 'helpdesk_refresh_token',
    tokenExpiryKey: 'helpdesk_token_expiry',
  },
  socket: {
    url: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
    options: {
      transports: ['websocket'],
      autoConnect: false,
    },
  },
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },
  notifications: {
    position: 'top-right',
    autoHideDuration: 5000,
  },
  theme: {
    mode: 'light',
    primaryColor: '#1976d2',
    secondaryColor: '#9c27b0',
  },
};

export default config; 