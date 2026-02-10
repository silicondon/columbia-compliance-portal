'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface RequestInsuranceButtonProps {
  vendorId: string;
  vendorName: string;
  vendorEmail?: string | null;
  brokerEmail?: string | null;
  brokerName?: string | null;
  hasExistingRequest?: boolean;
}

export default function RequestInsuranceButton({
  vendorId,
  vendorName,
  vendorEmail,
  brokerEmail: initialBrokerEmail,
  brokerName: initialBrokerName,
  hasExistingRequest = false,
}: RequestInsuranceButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [brokerEmail, setBrokerEmail] = useState(initialBrokerEmail || '');
  const [brokerName, setBrokerName] = useState(initialBrokerName || '');
  const [projectDescription, setProjectDescription] = useState(`General work for Columbia University by ${vendorName}`);

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = async () => {
    if (!brokerEmail) {
      setError('Broker email is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call API to submit insurance request
      const response = await fetch(`/api/vendors/${vendorId}/request-insurance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brokerEmail,
          brokerName: brokerName || undefined,
          projectDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit request' }));
        throw new Error(errorData.message || 'Failed to submit insurance request');
      }

      const data = await response.json();
      console.log('Insurance request submitted:', data);

      setSuccess(true);

      // Close dialog after 2 seconds
      setTimeout(() => {
        handleClose();
        // Refresh the page to show updated status
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error('Error requesting insurance:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit insurance request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        size="small"
        startIcon={<RequestQuoteIcon sx={{ fontSize: 16 }} />}
        onClick={handleOpen}
        disabled={hasExistingRequest}
        sx={{
          bgcolor: '#7367F0',
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          px: 3,
          py: 1,
          boxShadow: '0 2px 4px 0 rgba(115, 103, 240, 0.24)',
          '&:hover': {
            bgcolor: '#5E51E5',
            boxShadow: '0 4px 8px 0 rgba(115, 103, 240, 0.4)',
          },
          '&.Mui-disabled': {
            bgcolor: '#F4F5FA',
            color: '#A8AAAE',
          },
        }}
      >
        {hasExistingRequest ? 'Request Pending' : 'Request Insurance'}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#4B465C' }}>
            Request Insurance Certificate
          </Typography>
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 3, color: '#6D6B77', fontSize: '0.9375rem' }}>
            Submit a certificate request to <strong>{vendorName}</strong>'s insurance broker.
            They will receive an email with Columbia's insurance requirements and can upload
            the certificate through Brokermatic.
          </DialogContentText>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Insurance request submitted successfully! The broker will receive an email with upload instructions.
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Broker Email"
              type="email"
              required
              fullWidth
              value={brokerEmail}
              onChange={(e) => setBrokerEmail(e.target.value)}
              disabled={loading || success}
              helperText="The insurance broker's email address"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="Broker Name (Optional)"
              fullWidth
              value={brokerName}
              onChange={(e) => setBrokerName(e.target.value)}
              disabled={loading || success}
              helperText="Contact person at the insurance agency"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              label="Project Description"
              multiline
              rows={3}
              fullWidth
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              disabled={loading || success}
              helperText="Brief description of the work this vendor will perform"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 0.5, fontWeight: 600 }}>
                What happens next:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6D6B77' }}>
                1. Broker receives email with Columbia's insurance requirements
                <br />
                2. Broker uploads certificate via secure Brokermatic portal
                <br />
                3. Certificate is automatically validated against requirements
                <br />
                4. You'll be notified when certificate is ready
              </Typography>
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: '#6D6B77',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || success || !brokerEmail}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{
              bgcolor: '#7367F0',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                bgcolor: '#5E51E5',
              },
            }}
          >
            {loading ? 'Submitting...' : success ? 'Submitted!' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
