// Date formatting
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Error handling
export const handleError = (error) => {
  if (error.response) {
    // Server responded with error
    return {
      status: error.response.status,
      message: error.response.data.message || 'An error occurred',
    };
  } else if (error.request) {
    // Request made but no response
    return {
      status: 0,
      message: 'No response from server',
    };
  } else {
    // Error in request setup
    return {
      status: 0,
      message: error.message || 'An error occurred',
    };
  }
};

// Validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

// Pagination
export const getPaginationParams = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

// Sorting
export const getSortParams = (sortBy = 'createdAt', order = 'desc') => {
  return { [sortBy]: order === 'asc' ? 1 : -1 };
};

// Filtering
export const buildFilterQuery = (filters = []) => {
  const query = {};
  filters.forEach(({ field, operator, value }) => {
    switch (operator) {
      case 'equals':
        query[field] = value;
        break;
      case 'not_equals':
        query[field] = { $ne: value };
        break;
      case 'contains':
        query[field] = { $regex: value, $options: 'i' };
        break;
      case 'not_contains':
        query[field] = { $not: { $regex: value, $options: 'i' } };
        break;
      case 'greater_than':
        query[field] = { $gt: value };
        break;
      case 'less_than':
        query[field] = { $lt: value };
        break;
      case 'in':
        query[field] = { $in: value };
        break;
      case 'not_in':
        query[field] = { $nin: value };
        break;
    }
  });
  return query;
};

// Token handling
export const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

// File type checking
export const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('application/')) return 'document';
  return 'other';
}; 