import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  CalendarToday as CalendarIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import apiService from '../services/api';
import logger from '../services/logger';

function AgentTicketView() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [order, setOrder] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTicketData();
  }, [ticketId]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      const ticketData = await apiService.getTicketById(ticketId);
      setTicket(ticketData);
      
      // Fetch customer data
      const customerData = await apiService.getCustomerById(ticketData.customer);
      setCustomer(customerData);
      
      // Fetch order data if ticket is related to an order
      if (ticketData.orderId) {
        const orderData = await apiService.getOrderById(ticketData.orderId);
        setOrder(orderData);
      }
    } catch (err) {
      logger.error('Failed to fetch ticket data', err);
      setError('Failed to load ticket information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedTicket = await apiService.updateTicket(ticketId, {
        status: newStatus,
      });
      setTicket(updatedTicket);
      logger.info('Ticket status updated', { ticketId, newStatus });
    } catch (err) {
      logger.error('Failed to update ticket status', err);
      setError('Failed to update ticket status. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      const updatedTicket = await apiService.addTicketComment(ticketId, {
        content: comment,
        type: 'agent',
      });
      setTicket(updatedTicket);
      setComment('');
      logger.info('Comment added to ticket', { ticketId });
    } catch (err) {
      logger.error('Failed to add comment', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Left Panel - Customer Information */}
      <Paper sx={{ width: '25%', p: 2, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Customer Information
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1">
              {customer?.name || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ShoppingCartIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              {customer?.orderCount || 0} Orders
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              Customer since {new Date(customer?.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>
          Contact Information
        </Typography>
        <Typography variant="body2">Email: {customer?.email}</Typography>
        <Typography variant="body2">Phone: {customer?.phone}</Typography>
      </Paper>

      {/* Middle Panel - Ticket Working Area */}
      <Paper sx={{ width: '50%', p: 2, overflow: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {ticket?.subject}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label={ticket?.status}
              color={
                ticket?.status === 'open'
                  ? 'error'
                  : ticket?.status === 'in_progress'
                  ? 'warning'
                  : 'success'
              }
            />
            <Chip
              label={ticket?.priority}
              color={
                ticket?.priority === 'urgent'
                  ? 'error'
                  : ticket?.priority === 'high'
                  ? 'warning'
                  : 'default'
              }
            />
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1">{ticket?.description}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Comments
          </Typography>
          {ticket?.comments?.map((comment, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2">
                {comment.type === 'agent' ? 'Agent' : 'Customer'} -{' '}
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body1">{comment.content}</Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={handleAddComment}
            disabled={!comment.trim()}
          >
            Add Comment
          </Button>
        </Box>
      </Paper>

      {/* Right Panel - Order Details */}
      <Paper sx={{ width: '25%', p: 2, overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Order Details
        </Typography>
        {order ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Order ID</Typography>
              <Typography variant="body2">{order.orderId}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Status</Typography>
              <Typography variant="body2">{order.status}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Total Amount</Typography>
              <Typography variant="body2">
                ${order.totalAmount.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Items</Typography>
              {order.items.map((item, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {item.name} x {item.quantity}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Shipping Address</Typography>
              <Typography variant="body2">{order.shippingAddress}</Typography>
            </Box>
          </>
        ) : (
          <Typography variant="body2">No order information available</Typography>
        )}
      </Paper>
    </Box>
  );
}

export default AgentTicketView; 