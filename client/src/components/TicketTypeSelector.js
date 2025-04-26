import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Grid,
} from '@mui/material';

const ticketTypes = [
  { value: 'order', label: 'Order Issue' },
  { value: 'profile', label: 'Profile Issue' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'billing', label: 'Billing Issue' },
];

const typeSpecificFields = {
  order: [
    { name: 'orderNumber', label: 'Order Number', type: 'text' },
    { name: 'orderDate', label: 'Order Date', type: 'date' },
    { name: 'orderStatus', label: 'Order Status', type: 'text' },
  ],
  profile: [
    { name: 'profileType', label: 'Profile Type', type: 'text' },
    { name: 'lastUpdated', label: 'Last Updated', type: 'date' },
  ],
  technical: [
    { name: 'system', label: 'System', type: 'text' },
    { name: 'version', label: 'Version', type: 'text' },
    { name: 'environment', label: 'Environment', type: 'text' },
  ],
  billing: [
    { name: 'invoiceNumber', label: 'Invoice Number', type: 'text' },
    { name: 'amount', label: 'Amount', type: 'number' },
    { name: 'currency', label: 'Currency', type: 'text' },
  ],
};

function TicketTypeSelector({ formData, setFormData }) {
  const handleTypeChange = (event) => {
    const newType = event.target.value;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      customFields: {}, // Reset custom fields when type changes
    }));
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldName]: value,
      },
    }));
  };

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Ticket Type</InputLabel>
        <Select
          value={formData.type || ''}
          onChange={handleTypeChange}
          label="Ticket Type"
        >
          {ticketTypes.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {formData.type && typeSpecificFields[formData.type] && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Additional Information
          </Typography>
          <Grid container spacing={2}>
            {typeSpecificFields[formData.type].map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                <TextField
                  fullWidth
                  label={field.label}
                  type={field.type}
                  value={formData.customFields[field.name] || ''}
                  onChange={(e) =>
                    handleCustomFieldChange(field.name, e.target.value)
                  }
                  required
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default TicketTypeSelector; 