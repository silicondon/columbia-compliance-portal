'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ClearIcon from '@mui/icons-material/Clear';

export default function ComplianceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const insuranceStatus = searchParams.get('insuranceStatus') || '';
  const complianceStatus = searchParams.get('complianceStatus') || '';
  const search = searchParams.get('search') || '';

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/compliance?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push('/compliance');
  };

  const hasFilters = insuranceStatus || complianceStatus || search;

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: '#FAFBFC',
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        mb: 4,
      }}
    >
      <Stack spacing={2.5}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#4A5578',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Filters
          </Typography>
          {hasFilters && (
            <Button
              size="small"
              startIcon={<ClearIcon sx={{ fontSize: 16 }} />}
              onClick={handleClearFilters}
              sx={{
                color: '#6B7280',
                textTransform: 'none',
                fontSize: '0.8125rem',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: '#F3F4F6',
                },
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Search Vendor"
            size="small"
            value={search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Enter vendor name..."
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FFFFFF',
                borderRadius: 1.5,
              },
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FFFFFF',
                borderRadius: 1.5,
              },
            }}
          >
            <InputLabel>Insurance Status</InputLabel>
            <Select
              value={insuranceStatus}
              label="Insurance Status"
              onChange={(e) => handleFilterChange('insuranceStatus', e.target.value)}
            >
              <MenuItem value="">
                <em>All Statuses</em>
              </MenuItem>
              <MenuItem value="compliant">Compliant</MenuItem>
              <MenuItem value="requested">Requested</MenuItem>
              <MenuItem value="non_compliant">Non-Compliant</MenuItem>
              <MenuItem value="expiring_soon">Expiring Soon</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#FFFFFF',
                borderRadius: 1.5,
              },
            }}
          >
            <InputLabel>Certificate Status</InputLabel>
            <Select
              value={complianceStatus}
              label="Certificate Status"
              onChange={(e) => handleFilterChange('complianceStatus', e.target.value)}
            >
              <MenuItem value="">
                <em>All Statuses</em>
              </MenuItem>
              <MenuItem value="compliant">Compliant</MenuItem>
              <MenuItem value="non_compliant">Non-Compliant</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Box>
  );
}
