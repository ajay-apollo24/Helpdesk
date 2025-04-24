import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  Button,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

function TicketList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // This will be replaced with actual data from the API
  const tickets = [
    {
      id: '123',
      subject: 'Cannot access email',
      status: 'open',
      priority: 'high',
      customer: 'John Doe',
      createdAt: '2024-03-20',
      assignedTo: 'Jane Smith',
    },
    {
      id: '124',
      subject: 'Printer not working',
      status: 'in_progress',
      priority: 'medium',
      customer: 'Alice Johnson',
      createdAt: '2024-03-19',
      assignedTo: 'Bob Wilson',
    },
    // Add more sample tickets here
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'error',
      in_progress: 'warning',
      resolved: 'success',
      closed: 'default',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'success',
    };
    return colors[priority] || 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Tickets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tickets/new')}
        >
          Create Ticket
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Search tickets"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((ticket) => (
                <TableRow
                  key={ticket.id}
                  hover
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>#{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.priority}
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{ticket.customer}</TableCell>
                  <TableCell>{ticket.assignedTo}</TableCell>
                  <TableCell>{ticket.createdAt}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={tickets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}

export default TicketList; 