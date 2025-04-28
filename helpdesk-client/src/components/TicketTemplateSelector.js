import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Divider,
} from '@mui/material';

function TicketTemplateSelector({ onSelect, department }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [department]);

  const fetchTemplates = async () => {
    try {
      // This will be replaced with actual API call
      const response = await fetch(`/api/ticket-templates?department=${department}`);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateChange = (event) => {
    const templateId = event.target.value;
    setSelectedTemplate(templateId);
    
    const template = templates.find(t => t._id === templateId);
    if (template) {
      onSelect(template);
    }
  };

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>Select Template</InputLabel>
        <Select
          value={selectedTemplate}
          onChange={handleTemplateChange}
          label="Select Template"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {templates.map((template) => (
            <MenuItem key={template._id} value={template._id}>
              {template.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedTemplate && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Template Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {templates
            .find(t => t._id === selectedTemplate)
            ?.fields.map((field) => (
              <Box key={field.name} sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {field.name}
                </Typography>
                <Typography variant="body1">
                  {field.defaultValue || 'No default value'}
                </Typography>
              </Box>
            ))}
        </Paper>
      )}
    </Box>
  );
}

export default TicketTemplateSelector; 