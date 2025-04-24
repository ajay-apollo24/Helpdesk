import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import CreateTicket from './pages/CreateTicket';
import Login from './pages/Login';
import Register from './pages/Register';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tickets">
              <Route index element={<TicketList />} />
              <Route path="new" element={<CreateTicket />} />
              <Route path=":id" element={<TicketDetail />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App; 