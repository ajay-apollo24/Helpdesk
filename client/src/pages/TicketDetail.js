import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';

function TicketDetail() {
  const { id } = useParams();
  const [comment, setComment] = useState('');

  // This will be replaced with actual API data
  const ticket = {
    id,
    subject: 'Cannot access email',
    description: 'Unable to log in to my email account since this morning. Getting "Invalid credentials" error.',
    status: 'open',
    priority: 'high',
    category: 'software',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    assignedTo: {
      name: 'Jane Smith',
      email: 'jane@helpdesk.com',
    },
    createdAt: '2024-03-20T10:30:00Z',
    updatedAt: '2024-03-20T14:15:00Z',
    comments: [
      {
        id: 1,
        user: {
          name: 'Jane Smith',
          email: 'jane@helpdesk.com',
        },
        content: 'I will look into this issue.',
        timestamp: '2024-03-20T11:00:00Z',
      },
      {
        id: 2,
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        content: 'Thank you. Please let me know if you need any additional information.',
        timestamp: '2024-03-20T11:05:00Z',
      },
    ],
  };

  const handleStatusChange = (event) => {
    // This will be replaced with actual API call
    console.log('Updating status:', event.target.value);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    // This will be replaced with actual API call
    console.log('Adding comment:', comment);
    setComment('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ticket #{id}
      </Typography>

      <Grid container spacing={3}>
        {/* Ticket Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {ticket.subject}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Chip
                label={ticket.status}
                color={ticket.status === 'open' ? 'error' : 'default'}
                sx={{ mr: 1 }}
              />
              <Chip
                label={ticket.priority}
                color={ticket.priority === 'high' ? 'error' : 'default'}
                sx={{ mr: 1 }}
              />
              <Chip label={ticket.category} />
            </Box>

            <Typography variant="body1" sx={{ mb: 3 }}>
              {ticket.description}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Comments Section */}
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            
            <List>
              {ticket.comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={comment.user.name}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {comment.content}
                        </Typography>
                        <br />
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {new Date(comment.timestamp).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {/* Add Comment Form */}
            <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<CommentIcon />}
                disabled={!comment.trim()}
              >
                Add Comment
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Ticket Information Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ticket Information
            </Typography>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={ticket.status}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Typography variant="subtitle2" color="text.secondary">
              Customer
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="action" />
              <Typography>
                {ticket.customer.name}
                <br />
                <Typography variant="caption" color="text.secondary">
                  {ticket.customer.email}
                </Typography>
              </Typography>
            </Box>

            <Typography variant="subtitle2" color="text.secondary">
              Assigned To
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="action" />
              <Typography>
                {ticket.assignedTo.name}
                <br />
                <Typography variant="caption" color="text.secondary">
                  {ticket.assignedTo.email}
                </Typography>
              </Typography>
            </Box>

            <Typography variant="subtitle2" color="text.secondary">
              Created
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="action" />
              <Typography>
                {new Date(ticket.createdAt).toLocaleString()}
              </Typography>
            </Box>

            <Typography variant="subtitle2" color="text.secondary">
              Last Updated
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="action" />
              <Typography>
                {new Date(ticket.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default TicketDetail; 