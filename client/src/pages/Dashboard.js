import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material';

function Dashboard() {
  // This will be replaced with actual data from the API
  const stats = {
    totalTickets: 150,
    openTickets: 45,
    resolvedToday: 12,
    averageResponseTime: '2.5 hours',
  };

  const recentActivity = [
    { id: 1, action: 'Ticket #123 was created', time: '5 minutes ago' },
    { id: 2, action: 'Ticket #120 was resolved', time: '1 hour ago' },
    { id: 3, action: 'New comment on Ticket #118', time: '2 hours ago' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tickets
              </Typography>
              <Typography variant="h3">
                {stats.totalTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Open Tickets
              </Typography>
              <Typography variant="h3">
                {stats.openTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Resolved Today
              </Typography>
              <Typography variant="h3">
                {stats.resolvedToday}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. Response Time
              </Typography>
              <Typography variant="h5">
                {stats.averageResponseTime}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemText
                    primary={activity.action}
                    secondary={activity.time}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 