'use client';

import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import { columbia } from '@/lib/colors';

interface CertificateData {
  vendor: {
    name: string;
  };
  coverageType: string;
  expirationDate: Date | null;
  complianceStatus: string;
}

interface ExportComplianceButtonProps {
  certificates: CertificateData[];
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(d: Date | null | undefined): number | null {
  if (!d) return null;
  const now = new Date();
  return Math.ceil((new Date(d).getTime() - now.getTime()) / 86400000);
}

export default function ExportComplianceButton({
  certificates,
}: ExportComplianceButtonProps) {
  const handleExport = () => {
    const csvData = [
      ['Vendor', 'Coverage Type', 'Expiration Date', 'Days Remaining', 'Status'],
      ...certificates.map((cert) => {
        const days = daysUntil(cert.expirationDate);
        return [
          cert.vendor.name,
          cert.coverageType,
          formatDate(cert.expirationDate),
          days !== null
            ? days < 0
              ? `${Math.abs(days)} days overdue`
              : `${days} days`
            : 'N/A',
          cert.complianceStatus,
        ];
      }),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outlined"
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      sx={{
        borderColor: columbia.navyBlue,
        color: columbia.navyBlue,
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.9375rem',
        borderRadius: '8px',
        px: 3,
        py: 1.5,
        '&:hover': {
          borderColor: columbia.mediumBlue,
          backgroundColor: 'rgba(0, 48, 135, 0.04)',
        },
      }}
    >
      Export Report
    </Button>
  );
}
