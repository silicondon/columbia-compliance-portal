'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';

interface ComplianceBulkActionsProps {
  selectedVendorIds: string[];
  onSelectionChange: (vendorIds: string[]) => void;
  totalCount: number;
}

export default function ComplianceBulkActions({
  selectedVendorIds,
  onSelectionChange,
  totalCount,
}: ComplianceBulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const numSelected = selectedVendorIds.length;

  const handleSelectAll = () => {
    if (numSelected === totalCount) {
      onSelectionChange([]);
    } else {
      // This is simplified - in production, you'd need to pass all vendor IDs
      // For now, we'll just show the UI pattern
      setSnackbar({
        open: true,
        message: 'Select all functionality requires vendor IDs to be passed',
        severity: 'error',
      });
    }
  };

  const handleBulkRequestInsurance = async () => {
    if (numSelected === 0) return;

    setLoading(true);
    try {
      // Call API to bulk request insurance for selected vendors
      const response = await fetch('/api/vendors/bulk-request-insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorIds: selectedVendorIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to request insurance');
      }

      setSnackbar({
        open: true,
        message: `Successfully requested insurance for ${numSelected} vendor${numSelected !== 1 ? 's' : ''}`,
        severity: 'success',
      });

      onSelectionChange([]);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to request insurance',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportSelected = () => {
    if (numSelected === 0) {
      setSnackbar({
        open: true,
        message: 'Please select vendors to export',
        severity: 'error',
      });
      return;
    }

    // Export selected vendors as CSV
    const csvData = `Vendor IDs\n${selectedVendorIds.join('\n')}`;
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Exported ${numSelected} vendor${numSelected !== 1 ? 's' : ''}`,
      severity: 'success',
    });
  };

  if (numSelected === 0) {
    return null;
  }

  return (
    <>
      <Toolbar
        sx={{
          pl: 2,
          pr: 1,
          py: 1.5,
          bgcolor: 'rgba(115, 103, 240, 0.08)',
          borderRadius: 2,
          mb: 2,
          border: '1px solid rgba(115, 103, 240, 0.2)',
        }}
      >
        <Box sx={{ flex: '1 1 100%' }}>
          <Typography
            sx={{
              color: '#7367F0',
              fontWeight: 600,
              fontSize: '0.9375rem',
            }}
          >
            {numSelected} vendor{numSelected !== 1 ? 's' : ''} selected
          </Typography>
        </Box>
        <Tooltip title="Request Insurance">
          <Button
            size="small"
            startIcon={<RequestQuoteIcon />}
            onClick={handleBulkRequestInsurance}
            disabled={loading}
            sx={{
              bgcolor: '#7367F0',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              mr: 1,
              '&:hover': {
                bgcolor: '#5E51E5',
              },
              '&.Mui-disabled': {
                bgcolor: '#DBDADE',
                color: '#A8AAAE',
              },
            }}
          >
            Request Insurance
          </Button>
        </Tooltip>
        <Tooltip title="Export Selected">
          <IconButton size="small" onClick={handleExportSelected}>
            <DownloadIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear Selection">
          <IconButton size="small" onClick={() => onSelectionChange([])}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
