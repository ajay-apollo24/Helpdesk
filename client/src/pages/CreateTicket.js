import React, { useState } from 'react';
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
} from '@mui/material';

function CreateTicket() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // This will be replaced with actual API call
    console.log('Submitting ticket:', formData);
    // Redirect to tickets list after creation
    navigate('/tickets');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Ticket
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
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
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
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
              <FormControl fullWidth>
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
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tickets')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Create Ticket
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