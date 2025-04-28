import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import TicketTemplateSelector from '../components/TicketTemplateSelector';
import TicketTypeSelector from '../components/TicketTypeSelector';
import apiService from '../services/api';
import logger from '../services/logger';

function CreateTicket() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    type: '',
    priority: 'medium',
    category: '',
    department: '',
    template: null,
    customer: null,
    customFields: {},
  });
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
      setFormData((prev) => ({
        ...prev,
        customer: user._id,
      }));
    } catch (error) {
      logger.error('Failed to fetch current user', error);
      setError('Failed to load user information. Please try again.');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!formData.type) {
      errors.type = 'Ticket type is required';
    }
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    if (!formData.customer) {
      errors.customer = 'Customer information is required';
    }

    // Type-specific validation
    if (formData.type === 'order' && !formData.customFields.orderNumber) {
      errors.orderNumber = 'Order number is required';
    }
    if (formData.type === 'profile' && !formData.customFields.profileType) {
      errors.profileType = 'Profile type is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when field is modified
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleTemplateSelect = (template) => {
    logger.info('Template selected', { template });
    setFormData((prev) => ({
      ...prev,
      template: template._id,
      subject: template.subject,
      description: template.content,
      category: template.category,
      priority: template.priority,
      type: template.type,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    logger.debug('Files selected', { fileCount: files.length });
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    logger.debug('Removing file', { index });
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateForm()) {
        logger.warn('Form validation failed', { validationErrors });
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          if (key === 'customFields') {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      logger.info('Submitting ticket', {
        formData,
        attachmentCount: attachments.length,
      });

      const response = await apiService.createTicket(formDataToSend);
      logger.info('Ticket created successfully', { ticketId: response._id });
      navigate('/tickets');
    } catch (err) {
      logger.error('Failed to create ticket', err);
      setError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Ticket
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TicketTemplateSelector
                onSelect={handleTemplateSelect}
                department={formData.department}
              />
            </Grid>

            <Grid item xs={12}>
              <TicketTypeSelector
                formData={formData}
                setFormData={setFormData}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                error={!!validationErrors.subject}
                helperText={validationErrors.subject}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!validationErrors.description}
                helperText={validationErrors.description}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.priority}>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="hardware">Hardware</MenuItem>
                  <MenuItem value="software">Software</MenuItem>
                  <MenuItem value="network">Network</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AttachFileIcon />}
                  >
                    Attach Files
                  </Button>
                </label>
              </Box>

              {attachments.length > 0 && (
                <List>
                  {attachments.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tickets')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Creating...' : 'Create Ticket'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default CreateTicket; 