import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import {
  ArrowUpward as HighPriorityIcon,
  ArrowDownward as LowPriorityIcon,
  PriorityHigh as UrgentIcon,
  FiberManualRecord as MediumPriorityIcon,
} from '@mui/icons-material';

function PriorityIndicator({ priority, score }) {
  const getPriorityInfo = () => {
    switch (priority) {
      case 'urgent':
        return {
          icon: <UrgentIcon color="error" />,
          color: 'error.main',
          text: 'Urgent Priority',
        };
      case 'high':
        return {
          icon: <HighPriorityIcon color="warning" />,
          color: 'warning.main',
          text: 'High Priority',
        };
      case 'medium':
        return {
          icon: <MediumPriorityIcon color="info" />,
          color: 'info.main',
          text: 'Medium Priority',
        };
      case 'low':
        return {
          icon: <LowPriorityIcon color="success" />,
          color: 'success.main',
          text: 'Low Priority',
        };
      default:
        return {
          icon: <MediumPriorityIcon color="info" />,
          color: 'info.main',
          text: 'Medium Priority',
        };
    }
  };

  const priorityInfo = getPriorityInfo();

  return (
    <Tooltip title={`${priorityInfo.text} (Score: ${score})`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {priorityInfo.icon}
        <Typography
          variant="body2"
          sx={{
            color: priorityInfo.color,
            fontWeight: 'medium',
          }}
        >
          {priority}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default PriorityIndicator; 