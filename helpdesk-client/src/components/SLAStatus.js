import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

function SLAStatus({ responseTime, resolutionTime }) {
  const getResponseStatus = () => {
    if (!responseTime) return { icon: <CheckCircleIcon color="success" />, text: 'No response yet' };
    if (responseTime.breached) return { icon: <ErrorIcon color="error" />, text: 'Response SLA breached' };
    return { icon: <CheckCircleIcon color="success" />, text: 'Response SLA met' };
  };

  const getResolutionStatus = () => {
    if (!resolutionTime) return { icon: <CheckCircleIcon color="success" />, text: 'No resolution yet' };
    if (resolutionTime.breached) return { icon: <ErrorIcon color="error" />, text: 'Resolution SLA breached' };
    return { icon: <CheckCircleIcon color="success" />, text: 'Resolution SLA met' };
  };

  const responseStatus = getResponseStatus();
  const resolutionStatus = getResolutionStatus();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title={responseStatus.text}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {responseStatus.icon}
        </Box>
      </Tooltip>
      <Tooltip title={resolutionStatus.text}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {resolutionStatus.icon}
        </Box>
      </Tooltip>
    </Box>
  );
}

export default SLAStatus; 