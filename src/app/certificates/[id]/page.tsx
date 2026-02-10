import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import DescriptionIcon from "@mui/icons-material/Description";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ShieldIcon from "@mui/icons-material/Shield";
import { columbia } from "@/lib/colors";

export const dynamic = "force-dynamic";

function formatCurrency(value: Decimal | null | undefined): string {
  if (value === null || value === undefined) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "--";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function daysUntilExpiration(expirationDate: Date | null | undefined): number | null {
  if (!expirationDate) return null;
  const now = new Date();
  const expiry = new Date(expirationDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const COVERAGE_TYPE_LABELS: Record<string, string> = {
  GL: "General Liability",
  "Workers Comp": "Workers Compensation",
  Auto: "Commercial Automobile Liability",
  Excess: "Excess / Umbrella Liability",
  Professional: "Professional Liability",
  Environmental: "Environmental / Pollution Liability",
  general_liability: "General Liability",
  workers_compensation: "Workers Compensation",
  commercial_auto: "Commercial Automobile Liability",
  umbrella: "Umbrella Liability",
  professional_liability: "Professional Liability",
  cyber_liability: "Cyber Liability",
};

export default async function CertificateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          vmsId: true,
          primaryTrade: true,
          insuranceRequirement: true,
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  const days = daysUntilExpiration(certificate.expirationDate);
  const isExpired = days !== null && days < 0;
  const isExpiringSoon = days !== null && days > 0 && days <= 30;

  const coverageLabel =
    COVERAGE_TYPE_LABELS[certificate.coverageType] || certificate.coverageType;

  // Get compliance result if available from certificate request
  const certificateRequest = await prisma.certificateRequest.findFirst({
    where: {
      vendorId: certificate.vendorId,
      status: { in: ["compliant", "non_compliant"] },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Box sx={{ bgcolor: "#F8F7FA", minHeight: "100vh", pb: 6 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: 4, pt: 3 }}>
        {/* Breadcrumb */}
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
          sx={{ mb: 4 }}
        >
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Typography
              variant="body2"
              sx={{
                color: "#A8AAAE",
                "&:hover": { color: "#7367F0" },
                transition: "color 0.2s ease",
                fontSize: "0.9375rem",
              }}
            >
              Dashboard
            </Typography>
          </Link>
          <Link
            href={`/vendors/${certificate.vendor.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#A8AAAE",
                "&:hover": { color: "#7367F0" },
                transition: "color 0.2s ease",
                fontSize: "0.9375rem",
              }}
            >
              {certificate.vendor.name}
            </Typography>
          </Link>
          <Link
            href={`/vendors/${certificate.vendor.id}/insurance`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#A8AAAE",
                "&:hover": { color: "#7367F0" },
                transition: "color 0.2s ease",
                fontSize: "0.9375rem",
              }}
            >
              Insurance
            </Typography>
          </Link>
          <Typography
            variant="body2"
            sx={{
              color: "#4B465C",
              fontWeight: 600,
              fontSize: "0.9375rem",
            }}
          >
            Certificate Details
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.75rem",
                  color: "#4B465C",
                  mb: 1,
                }}
              >
                {coverageLabel}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography
                  variant="body2"
                  sx={{
                    color: "#6D6B77",
                    fontSize: "0.9375rem",
                  }}
                >
                  Policy #{certificate.policyNumber || "N/A"}
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#6D6B77",
                    fontSize: "0.9375rem",
                  }}
                >
                  {certificate.carrierName || "No carrier specified"}
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={2}>
              {certificate.documentPath && (
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  href={certificate.documentPath}
                  target="_blank"
                  sx={{
                    borderColor: "#7367F0",
                    color: "#7367F0",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    "&:hover": {
                      borderColor: "#5E51E5",
                      bgcolor: "rgba(115, 103, 240, 0.08)",
                    },
                  }}
                >
                  Download PDF
                </Button>
              )}
              {certificate.complianceStatus === "compliant" ? (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                  label="Compliant"
                  sx={{
                    bgcolor: "#E8FAF0",
                    color: "#28C76F",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    height: 36,
                    "& .MuiChip-icon": {
                      color: "#28C76F",
                    },
                  }}
                />
              ) : certificate.complianceStatus === "non_compliant" ? (
                <Chip
                  icon={<ErrorIcon sx={{ fontSize: 18 }} />}
                  label="Non-Compliant"
                  sx={{
                    bgcolor: "#FFF0F0",
                    color: "#EA5455",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    height: 36,
                    "& .MuiChip-icon": {
                      color: "#EA5455",
                    },
                  }}
                />
              ) : (
                <Chip
                  icon={<WarningIcon sx={{ fontSize: 18 }} />}
                  label="Pending"
                  sx={{
                    bgcolor: "#FFF6E5",
                    color: "#FF9F43",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    height: 36,
                    "& .MuiChip-icon": {
                      color: "#FF9F43",
                    },
                  }}
                />
              )}
            </Stack>
          </Stack>

          {/* Expiration Warning */}
          {isExpired && (
            <Card
              sx={{
                bgcolor: "#FFF0F0",
                border: "1px solid rgba(234, 84, 85, 0.2)",
                boxShadow: "none",
                mb: 3,
              }}
            >
              <CardContent sx={{ py: 2, px: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ErrorIcon sx={{ color: "#EA5455", fontSize: 24 }} />
                  <Box>
                    <Typography
                      sx={{
                        color: "#EA5455",
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        mb: 0.5,
                      }}
                    >
                      Certificate Expired
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#6D6B77", fontSize: "0.875rem" }}
                    >
                      This certificate expired {Math.abs(days!)} days ago on{" "}
                      {formatDate(certificate.expirationDate)}. A new certificate
                      is required.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          {isExpiringSoon && (
            <Card
              sx={{
                bgcolor: "#FFF6E5",
                border: "1px solid rgba(255, 159, 67, 0.2)",
                boxShadow: "none",
                mb: 3,
              }}
            >
              <CardContent sx={{ py: 2, px: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <WarningIcon sx={{ color: "#FF9F43", fontSize: 24 }} />
                  <Box>
                    <Typography
                      sx={{
                        color: "#FF9F43",
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        mb: 0.5,
                      }}
                    >
                      Expiring Soon
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#6D6B77", fontSize: "0.875rem" }}
                    >
                      This certificate will expire in {days} days on{" "}
                      {formatDate(certificate.expirationDate)}. Request renewal.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Coverage Information */}
            <Card
              sx={{
                mb: 4,
                boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}
            >
              <Box
                sx={{
                  px: 4,
                  py: 3,
                  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <ShieldIcon sx={{ color: "#7367F0", fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1.125rem",
                      color: "#4B465C",
                    }}
                  >
                    Coverage Information
                  </Typography>
                </Stack>
              </Box>
              <CardContent sx={{ px: 4, py: 3 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#A8AAAE",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Coverage Type
                    </Typography>
                    <Typography
                      sx={{
                        color: "#4B465C",
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                      }}
                    >
                      {coverageLabel}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#A8AAAE",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Policy Number
                    </Typography>
                    <Typography
                      sx={{
                        color: "#4B465C",
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                        fontFamily: "monospace",
                      }}
                    >
                      {certificate.policyNumber || "Not specified"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#A8AAAE",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Insurance Carrier
                    </Typography>
                    <Typography
                      sx={{
                        color: "#4B465C",
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                      }}
                    >
                      {certificate.carrierName || "Not specified"}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#A8AAAE",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Compliance Status
                    </Typography>
                    <Typography
                      sx={{
                        color:
                          certificate.complianceStatus === "compliant"
                            ? "#28C76F"
                            : certificate.complianceStatus === "non_compliant"
                              ? "#EA5455"
                              : "#FF9F43",
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                      }}
                    >
                      {certificate.complianceStatus
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Coverage Limits */}
            <Card
              sx={{
                mb: 4,
                boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}
            >
              <Box
                sx={{
                  px: 4,
                  py: 3,
                  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.125rem",
                    color: "#4B465C",
                  }}
                >
                  Coverage Limits
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#FAFBFC" }}>
                      <TableCell
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#A8AAAE",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Limit Type
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#A8AAAE",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Amount
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {certificate.eachOccurrenceAmount && (
                      <TableRow>
                        <TableCell sx={{ color: "#4B465C", fontSize: "0.9375rem" }}>
                          Each Occurrence
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: "#4B465C",
                            fontSize: "0.9375rem",
                            fontFamily: "monospace",
                            fontWeight: 500,
                          }}
                        >
                          {formatCurrency(certificate.eachOccurrenceAmount)}
                        </TableCell>
                      </TableRow>
                    )}
                    {certificate.aggregateAmount && (
                      <TableRow>
                        <TableCell sx={{ color: "#4B465C", fontSize: "0.9375rem" }}>
                          General Aggregate
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: "#4B465C",
                            fontSize: "0.9375rem",
                            fontFamily: "monospace",
                            fontWeight: 500,
                          }}
                        >
                          {formatCurrency(certificate.aggregateAmount)}
                        </TableCell>
                      </TableRow>
                    )}
                    {certificate.requiredAmount && (
                      <TableRow>
                        <TableCell sx={{ color: "#4B465C", fontSize: "0.9375rem" }}>
                          Required Amount
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: "#4B465C",
                            fontSize: "0.9375rem",
                            fontFamily: "monospace",
                            fontWeight: 500,
                          }}
                        >
                          {formatCurrency(certificate.requiredAmount)}
                        </TableCell>
                      </TableRow>
                    )}
                    {!certificate.eachOccurrenceAmount &&
                      !certificate.aggregateAmount &&
                      !certificate.requiredAmount && (
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            sx={{
                              color: "#A8AAAE",
                              fontSize: "0.875rem",
                              textAlign: "center",
                              py: 4,
                            }}
                          >
                            No limit information available
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            {/* Compliance Result */}
            {certificateRequest?.complianceResult && (
              <Card
                sx={{
                  mb: 4,
                  boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
                  border: "1px solid rgba(0, 0, 0, 0.04)",
                }}
              >
                <Box
                  sx={{
                    px: 4,
                    py: 3,
                    borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1.125rem",
                      color: "#4B465C",
                    }}
                  >
                    Compliance Validation
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#A8AAAE",
                      fontSize: "0.875rem",
                      mt: 0.5,
                    }}
                  >
                    Validated on {formatDate(certificateRequest.validatedAt)}
                  </Typography>
                </Box>
                <CardContent sx={{ px: 4, py: 3 }}>
                  <pre
                    style={{
                      backgroundColor: "#F8F7FA",
                      padding: "16px",
                      borderRadius: "8px",
                      overflow: "auto",
                      fontSize: "0.8125rem",
                      color: "#4B465C",
                      fontFamily: "monospace",
                    }}
                  >
                    {JSON.stringify(certificateRequest.complianceResult, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Vendor Information */}
            <Card
              sx={{
                mb: 4,
                boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}
            >
              <Box
                sx={{
                  px: 4,
                  py: 3,
                  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <BusinessIcon sx={{ color: "#7367F0", fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1.125rem",
                      color: "#4B465C",
                    }}
                  >
                    Vendor
                  </Typography>
                </Stack>
              </Box>
              <CardContent sx={{ px: 4, py: 3 }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#A8AAAE",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Vendor Name
                    </Typography>
                    <Link
                      href={`/vendors/${certificate.vendor.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography
                        sx={{
                          color: "#7367F0",
                          fontSize: "0.9375rem",
                          fontWeight: 600,
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {certificate.vendor.name}
                      </Typography>
                    </Link>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#A8AAAE",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      VMS ID
                    </Typography>
                    <Typography
                      sx={{
                        color: "#4B465C",
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                        fontFamily: "monospace",
                      }}
                    >
                      {certificate.vendor.vmsId}
                    </Typography>
                  </Box>
                  {certificate.vendor.primaryTrade && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A8AAAE",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        Primary Trade
                      </Typography>
                      <Typography
                        sx={{
                          color: "#4B465C",
                          fontSize: "0.9375rem",
                          fontWeight: 500,
                        }}
                      >
                        {certificate.vendor.primaryTrade}
                      </Typography>
                    </Box>
                  )}
                  <Divider />
                  <Link
                    href={`/vendors/${certificate.vendor.id}/insurance`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        borderColor: "#7367F0",
                        color: "#7367F0",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        "&:hover": {
                          borderColor: "#5E51E5",
                          bgcolor: "rgba(115, 103, 240, 0.08)",
                        },
                      }}
                    >
                      View All Certificates
                    </Button>
                  </Link>
                </Stack>
              </CardContent>
            </Card>

            {/* Policy Dates */}
            <Card
              sx={{
                mb: 4,
                boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}
            >
              <Box
                sx={{
                  px: 4,
                  py: 3,
                  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <CalendarTodayIcon sx={{ color: "#7367F0", fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1.125rem",
                      color: "#4B465C",
                    }}
                  >
                    Policy Period
                  </Typography>
                </Stack>
              </Box>
              <CardContent sx={{ px: 4, py: 3 }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#A8AAAE",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Effective Date
                    </Typography>
                    <Typography
                      sx={{
                        color: "#4B465C",
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                      }}
                    >
                      {formatDate(certificate.effectiveDate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#A8AAAE",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                        mb: 1,
                      }}
                    >
                      Expiration Date
                    </Typography>
                    <Typography
                      sx={{
                        color: isExpired
                          ? "#EA5455"
                          : isExpiringSoon
                            ? "#FF9F43"
                            : "#4B465C",
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                      }}
                    >
                      {formatDate(certificate.expirationDate)}
                    </Typography>
                  </Box>
                  {days !== null && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A8AAAE",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          display: "block",
                          mb: 1,
                        }}
                      >
                        Days {days < 0 ? "Overdue" : "Remaining"}
                      </Typography>
                      <Typography
                        sx={{
                          color: isExpired
                            ? "#EA5455"
                            : isExpiringSoon
                              ? "#FF9F43"
                              : "#28C76F",
                          fontSize: "1.5rem",
                          fontWeight: 600,
                        }}
                      >
                        {Math.abs(days)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Audit Information */}
            <Card
              sx={{
                boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}
            >
              <Box
                sx={{
                  px: 4,
                  py: 3,
                  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <DescriptionIcon sx={{ color: "#7367F0", fontSize: 24 }} />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1.125rem",
                      color: "#4B465C",
                    }}
                  >
                    Audit Information
                  </Typography>
                </Stack>
              </Box>
              <CardContent sx={{ px: 4, py: 3 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#A8AAAE",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Created
                    </Typography>
                    <Typography
                      sx={{
                        color: "#4B465C",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {formatDate(certificate.createdAt)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#A8AAAE",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                        mb: 0.5,
                      }}
                    >
                      Last Updated
                    </Typography>
                    <Typography
                      sx={{
                        color: "#4B465C",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {formatDate(certificate.updatedAt)}
                    </Typography>
                  </Box>
                  {certificate.lastCheckedAt && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A8AAAE",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Last Checked
                      </Typography>
                      <Typography
                        sx={{
                          color: "#4B465C",
                          fontSize: "0.8125rem",
                        }}
                      >
                        {formatDate(certificate.lastCheckedAt)}
                      </Typography>
                    </Box>
                  )}
                  {certificate.documentFilename && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#A8AAAE",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Document
                      </Typography>
                      <Typography
                        sx={{
                          color: "#4B465C",
                          fontSize: "0.8125rem",
                          fontFamily: "monospace",
                        }}
                      >
                        {certificate.documentFilename}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
