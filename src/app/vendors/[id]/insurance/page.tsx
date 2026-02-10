import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Divider from "@mui/material/Divider";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import VendorHeader from "@/components/VendorHeader";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import RequestInsuranceButton from "@/components/RequestInsuranceButton";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */

function ComplianceBadge({ status }: { status: string }) {
  const colorMap: Record<string, { bg: string; color: string }> = {
    compliant: {
      bg: "#E8FAF0",
      color: "#28C76F",
    },
    "non-compliant": {
      bg: "#FFF0F0",
      color: "#EA5455",
    },
    pending: {
      bg: "#FFF6E5",
      color: "#FDB528",
    },
    expired: {
      bg: "#FFF0F0",
      color: "#EA5455",
    },
    expiring: {
      bg: "#FFF6E5",
      color: "#FF9F43",
    },
  };

  const scheme = colorMap[status] ?? {
    bg: "#F4F5FA",
    color: "#A8AAAE",
  };

  return (
    <Chip
      label={status
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")}
      size="small"
      sx={{
        bgcolor: scheme.bg,
        color: scheme.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        border: "none",
        height: 26,
        "& .MuiChip-label": {
          px: 1.5,
        },
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

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
    month: "short",
    day: "numeric",
  });
}

const COVERAGE_LABELS: Record<string, string> = {
  GL: "General Liability",
  Excess: "Excess / Umbrella",
  Auto: "Automobile Liability",
  Environmental: "Environmental / Pollution",
  Professional: "Professional Liability",
  "Workers Comp": "Workers Compensation",
};

/* ------------------------------------------------------------------ */
/*  Table header cell styling                                          */
/* ------------------------------------------------------------------ */

const thSx = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#A8AAAE",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
  px: 3,
  py: 2.5,
  bgcolor: "#FAFBFC",
};

const tdSx = {
  fontSize: "0.9375rem",
  color: "#4B465C",
  borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
  px: 3,
  py: 2.5,
};

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function VendorInsurancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      insuranceRequirement: true,
      certificates: {
        orderBy: [{ coverageType: "asc" }, { expirationDate: "desc" }],
      },
      certificateRequests: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          certificates: true,
          contracts: true,
          rates: true,
        },
      },
    },
  });

  if (!vendor) {
    notFound();
  }

  const req = vendor.insuranceRequirement;

  const requirementRows = [
    {
      type: "General Liability",
      required: req?.glRequired,
      aggregate: req?.glAggregate,
      eachOccurrence: req?.glEachOccurrence,
    },
    {
      type: "Excess / Umbrella",
      required: req?.excessRequired,
      aggregate: req?.excessAggregate,
      eachOccurrence: req?.excessEachOccurrence,
    },
    {
      type: "Automobile Liability",
      required: req?.autoRequired,
      aggregate: req?.autoAggregate,
      eachOccurrence: req?.autoEachOccurrence,
    },
    {
      type: "Environmental / Pollution",
      required: req?.envRequired,
      aggregate: req?.envAggregate,
      eachOccurrence: req?.envEachOccurrence,
    },
    {
      type: "Professional Liability",
      required: req?.profRequired,
      aggregate: req?.profAggregate,
      eachOccurrence: req?.profEachOccurrence,
    },
    {
      type: "Workers Compensation",
      required: null,
      aggregate: null,
      eachOccurrence: null,
      isWorkersComp: true,
      workersCompRequired: req?.workersCompRequired ?? false,
    },
  ];

  const tabs = [
    { label: "General Info", href: `/vendors/${id}`, active: false },
    {
      label: "Insurance",
      href: `/vendors/${id}/insurance`,
      active: true,
      count: vendor._count.certificates,
    },
    {
      label: "Contracts",
      href: `/vendors/${id}/contracts`,
      active: false,
      count: vendor._count.contracts,
    },
    {
      label: "Rates",
      href: `/vendors/${id}/rates`,
      active: false,
      count: vendor._count.rates,
    },
  ];

  return (
    <Box sx={{ bgcolor: "#F8F7FA", minHeight: "100vh", pb: 6 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: 4, pt: 3 }}>
        {/* ---- Breadcrumb ---- */}
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
          sx={{ mb: 4 }}
        >
          <Link href="/vendors" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography
              variant="body2"
              sx={{
                color: "#A8AAAE",
                textDecoration: "none",
                "&:hover": { color: "#7367F0" },
                transition: "color 0.2s ease",
                fontSize: "0.9375rem",
              }}
            >
              Vendors
            </Typography>
          </Link>
          <Link href={`/vendors/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography
              variant="body2"
              sx={{
                color: "#A8AAAE",
                textDecoration: "none",
                "&:hover": { color: "#7367F0" },
                transition: "color 0.2s ease",
                fontSize: "0.9375rem",
              }}
            >
              {vendor.name}
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
            Insurance
          </Typography>
        </Breadcrumbs>

        <VendorHeader
          vendor={{
            id: vendor.id,
            name: vendor.name,
            status: vendor.status,
            vmsId: vendor.vmsId,
            primaryTrade: vendor.primaryTrade,
          }}
          activeTab="insurance"
          counts={{
            certificates: vendor._count.certificates,
            contracts: vendor._count.contracts,
            rates: vendor._count.rates,
          }}
        />

        {/* ---- Exempt from Insurance Alert ---- */}
        {vendor.exemptFromInsurance && (
          <Alert
            severity="warning"
            icon={<WarningAmberIcon sx={{ color: "#FF9F43" }} />}
            sx={{
              mb: 4,
              bgcolor: "#FFF6E5",
              border: "1px solid rgba(255, 159, 67, 0.2)",
              borderRadius: 2,
              boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
              "& .MuiAlert-message": {
                color: "#4B465C",
              },
            }}
          >
            <Typography
              component="span"
              sx={{ fontWeight: 600, color: "#FF9F43", fontSize: "0.9375rem" }}
            >
              Exempt from Insurance
            </Typography>
            <Typography
              component="span"
              variant="body2"
              sx={{ ml: 1, color: "#6D6B77", fontSize: "0.9375rem" }}
            >
              This vendor has been marked as exempt from insurance requirements.
            </Typography>
          </Alert>
        )}

        {/* ---- Insurance Request Status ---- */}
        {!vendor.exemptFromInsurance && (
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
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.125rem",
                    color: "#4B465C",
                    mb: 0.5,
                  }}
                >
                  Insurance Request Status
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#A8AAAE",
                    fontSize: "0.9375rem",
                  }}
                >
                  Request and track insurance certificate submission
                </Typography>
              </Box>
              <RequestInsuranceButton
                vendorId={vendor.id}
                vendorName={vendor.name}
                vendorEmail={vendor.email}
                brokerEmail={vendor.brokerEmail}
                brokerName={vendor.brokerName}
                hasExistingRequest={vendor.certificateRequests.some(
                  (req) => req.status === "pending" || req.status === "fulfilled"
                )}
              />
            </Box>

            <CardContent sx={{ px: 4, py: 3 }}>
              {/* Current Status */}
              {vendor.insuranceStatus && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#A8AAAE",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      mb: 1.5,
                    }}
                  >
                    Current Status
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {vendor.insuranceStatus === "compliant" && (
                      <>
                        <CheckCircleIcon sx={{ color: "#28C76F", fontSize: 40 }} />
                        <Box>
                          <Typography
                            sx={{
                              color: "#28C76F",
                              fontWeight: 600,
                              fontSize: "1rem",
                              mb: 0.5,
                            }}
                          >
                            Certificate Compliant
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#6D6B77", fontSize: "0.875rem" }}
                          >
                            Insurance certificate meets all requirements
                            {vendor.insuranceComplianceAt &&
                              ` as of ${formatDate(vendor.insuranceComplianceAt)}`}
                          </Typography>
                        </Box>
                      </>
                    )}
                    {vendor.insuranceStatus === "requested" && (
                      <>
                        <HourglassEmptyIcon sx={{ color: "#FF9F43", fontSize: 40 }} />
                        <Box>
                          <Typography
                            sx={{
                              color: "#FF9F43",
                              fontWeight: 600,
                              fontSize: "1rem",
                              mb: 0.5,
                            }}
                          >
                            Certificate Requested
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#6D6B77", fontSize: "0.875rem" }}
                          >
                            Waiting for broker to upload certificate
                            {vendor.insuranceRequestedAt &&
                              ` (requested ${formatDate(vendor.insuranceRequestedAt)})`}
                          </Typography>
                        </Box>
                      </>
                    )}
                    {vendor.insuranceStatus === "non_compliant" && (
                      <>
                        <ErrorOutlineIcon sx={{ color: "#EA5455", fontSize: 40 }} />
                        <Box>
                          <Typography
                            sx={{
                              color: "#EA5455",
                              fontWeight: 600,
                              fontSize: "1rem",
                              mb: 0.5,
                            }}
                          >
                            Certificate Non-Compliant
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#6D6B77", fontSize: "0.875rem" }}
                          >
                            Certificate does not meet all requirements
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              )}

              {/* Compliance Gaps */}
              {vendor.insuranceStatus === "non_compliant" &&
                vendor.certificateRequests.length > 0 &&
                vendor.certificateRequests[0].complianceResult && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "#A8AAAE",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        mb: 1.5,
                      }}
                    >
                      Compliance Gaps
                    </Typography>
                    <Alert
                      severity="error"
                      sx={{
                        bgcolor: "#FFF0F0",
                        border: "1px solid rgba(234, 84, 85, 0.2)",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#EA5455",
                          mb: 1,
                          fontSize: "0.875rem",
                        }}
                      >
                        The following requirements are not met:
                      </Typography>
                      <Box
                        component="ul"
                        sx={{
                          m: 0,
                          pl: 2.5,
                          color: "#6D6B77",
                          fontSize: "0.875rem",
                          "& li": { mb: 0.5 },
                        }}
                      >
                        {(() => {
                          const result = vendor.certificateRequests[0]
                            .complianceResult as any;
                          const gaps: string[] = [];

                          if (
                            result.coverageResults &&
                            Array.isArray(result.coverageResults)
                          ) {
                            result.coverageResults.forEach((coverage: any) => {
                              if (!coverage.found) {
                                gaps.push(
                                  `Missing required coverage: ${coverage.coverageType.replace(/_/g, " ")}`
                                );
                              } else if (!coverage.limitsPass && coverage.limitsGaps) {
                                coverage.limitsGaps.forEach((gap: any) => {
                                  gaps.push(
                                    `${coverage.coverageType.replace(/_/g, " ")}: ${gap.limitName} is ${formatCurrency(gap.actual)} but requires ${formatCurrency(gap.required)}`
                                  );
                                });
                              }
                            });
                          }

                          return gaps.length > 0 ? (
                            gaps.map((gap, idx) => <li key={idx}>{gap}</li>)
                          ) : (
                            <li>Compliance gaps not specified</li>
                          );
                        })()}
                      </Box>
                    </Alert>
                  </Box>
                )}

              {/* Certificate Request Timeline */}
              {vendor.certificateRequests.length > 0 && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#A8AAAE",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      mb: 1.5,
                    }}
                  >
                    Request History
                  </Typography>
                  <Stack spacing={2}>
                    {vendor.certificateRequests.map((request) => (
                      <Box
                        key={request.id}
                        sx={{
                          p: 2.5,
                          bgcolor: "#FAFBFC",
                          borderRadius: 2,
                          border: "1px solid rgba(0, 0, 0, 0.06)",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 1.5,
                          }}
                        >
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.875rem",
                                color: "#7367F0",
                                fontWeight: 600,
                              }}
                            >
                              {request.brokermaticRequestId || request.externalId}
                            </Typography>
                            <ComplianceBadge status={request.status} />
                          </Box>
                          {request.certificateUrl && (
                            <Button
                              href={request.certificateUrl}
                              target="_blank"
                              size="small"
                              startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                color: "#7367F0",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                "&:hover": {
                                  bgcolor: "rgba(115, 103, 240, 0.08)",
                                },
                              }}
                            >
                              Download Certificate
                            </Button>
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ color: "#6D6B77", fontSize: "0.875rem", mb: 1 }}
                        >
                          {request.legalText}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            flexWrap: "wrap",
                            fontSize: "0.8125rem",
                            color: "#A8AAAE",
                          }}
                        >
                          <span>
                            <strong>Created:</strong>{" "}
                            {formatDate(request.createdAt)}
                          </span>
                          {request.uploadedAt && (
                            <span>
                              <strong>Uploaded:</strong>{" "}
                              {formatDate(request.uploadedAt)}
                            </span>
                          )}
                          {request.validatedAt && (
                            <span>
                              <strong>Validated:</strong>{" "}
                              {formatDate(request.validatedAt)}
                            </span>
                          )}
                        </Box>
                        {request.coverageTypes &&
                          Array.isArray(request.coverageTypes) && (
                            <Box sx={{ mt: 1.5 }}>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#A8AAAE",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  mb: 0.5,
                                  display: "block",
                                }}
                              >
                                Required Coverages
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {(request.coverageTypes as string[]).map(
                                  (coverage, idx) => (
                                    <Chip
                                      key={idx}
                                      label={coverage.replace(/_/g, " ")}
                                      size="small"
                                      sx={{
                                        bgcolor: "#E8E7FD",
                                        color: "#7367F0",
                                        fontSize: "0.75rem",
                                        fontWeight: 500,
                                        height: 24,
                                      }}
                                    />
                                  )
                                )}
                              </Box>
                            </Box>
                          )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* No Requests Yet */}
              {vendor.certificateRequests.length === 0 &&
                !vendor.insuranceStatus && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#A8AAAE", fontSize: "0.9375rem" }}
                    >
                      No insurance certificate requests have been submitted yet.
                      Click "Request Insurance" to begin.
                    </Typography>
                  </Box>
                )}
            </CardContent>
          </Card>
        )}

        {/* ---- Insurance Requirements ---- */}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.125rem",
                  color: "#4B465C",
                  mb: 0.5,
                }}
              >
                Insurance Requirements
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#A8AAAE",
                  fontSize: "0.9375rem",
                }}
              >
                {req
                  ? "Coverage amounts required for this vendor"
                  : "No requirements configured for this vendor"
                }
              </Typography>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...thSx, textAlign: "left" }}>
                    Coverage Type
                  </TableCell>
                  <TableCell sx={{ ...thSx, textAlign: "right" }}>
                    Required Amount
                  </TableCell>
                  <TableCell sx={{ ...thSx, textAlign: "right" }}>
                    Aggregate Limit
                  </TableCell>
                  <TableCell sx={{ ...thSx, textAlign: "right" }}>
                    Per Occurrence
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requirementRows.map((row, index) => (
                  <TableRow
                    key={row.type}
                    sx={{
                      "&:hover": { bgcolor: "#FAFBFC" },
                      transition: "background-color 0.2s",
                      "&:last-child td": { borderBottom: 0 },
                    }}
                  >
                    <TableCell
                      sx={{
                        ...tdSx,
                        fontWeight: 500,
                        color: "#4B465C",
                      }}
                    >
                      {row.type}
                    </TableCell>
                    {row.isWorkersComp ? (
                      <TableCell
                        colSpan={3}
                        sx={{
                          ...tdSx,
                          textAlign: "center",
                        }}
                      >
                        <Chip
                          label={
                            row.workersCompRequired
                              ? "Required"
                              : "Not Required"
                          }
                          size="small"
                          sx={{
                            bgcolor: row.workersCompRequired
                              ? "#E8FAF0"
                              : "#F4F5FA",
                            color: row.workersCompRequired
                              ? "#28C76F"
                              : "#A8AAAE",
                            border: "none",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            height: 26,
                            "& .MuiChip-label": {
                              px: 1.5,
                            },
                          }}
                        />
                      </TableCell>
                    ) : (
                      <>
                        <TableCell
                          sx={{
                            ...tdSx,
                            textAlign: "right",
                            fontFamily: "monospace",
                            fontWeight: 500,
                          }}
                        >
                          {formatCurrency(row.required)}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            textAlign: "right",
                            fontFamily: "monospace",
                            fontWeight: 500,
                          }}
                        >
                          {formatCurrency(row.aggregate)}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            textAlign: "right",
                            fontFamily: "monospace",
                            fontWeight: 500,
                          }}
                        >
                          {formatCurrency(row.eachOccurrence)}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* ---- Certificates ---- */}
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
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 600,
                fontSize: "1.125rem",
                color: "#4B465C",
                mb: 0.5,
              }}
            >
              Insurance Certificates
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#A8AAAE",
                fontSize: "0.9375rem",
              }}
            >
              {vendor.certificates.length === 0
                ? "Certificates will appear here once submitted and validated by Brokermatic"
                : `${vendor.certificates.length} certificate${vendor.certificates.length !== 1 ? "s" : ""} on file`
              }
            </Typography>
          </Box>

          {vendor.certificates.length === 0 ? (
            <Box
              sx={{
                py: 12,
                px: 4,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "#F4F5FA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <InsertDriveFileIcon
                  sx={{
                    fontSize: 36,
                    color: "#A8AAAE",
                  }}
                />
              </Box>
              <Typography
                variant="body1"
                sx={{
                  color: "#4B465C",
                  fontWeight: 600,
                  mb: 1,
                  fontSize: "1rem",
                }}
              >
                No certificates on file
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#A8AAAE",
                  fontSize: "0.9375rem",
                  maxWidth: 400,
                  mx: "auto",
                }}
              >
                Upload insurance certificates to track coverage and compliance
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...thSx, textAlign: "left" }}>
                      Coverage Type
                    </TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "left" }}>
                      Policy Number
                    </TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "left" }}>
                      Carrier
                    </TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>
                      Aggregate Limit
                    </TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "right" }}>
                      Per Occurrence
                    </TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "left" }}>
                      Expiration
                    </TableCell>
                    <TableCell sx={{ ...thSx, textAlign: "left" }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendor.certificates.map((cert, index) => {
                    const isExpired =
                      cert.expirationDate &&
                      new Date(cert.expirationDate) < new Date();
                    return (
                      <TableRow
                        key={cert.id}
                        sx={{
                          "&:hover": { bgcolor: "#FAFBFC" },
                          transition: "background-color 0.2s",
                          "&:last-child td": { borderBottom: 0 },
                        }}
                      >
                        <TableCell
                          sx={{
                            ...tdSx,
                            fontWeight: 500,
                            color: "#4B465C",
                          }}
                        >
                          {COVERAGE_LABELS[cert.coverageType] ??
                            cert.coverageType}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            fontFamily: "monospace",
                            color: cert.policyNumber
                              ? "#4B465C"
                              : "#DBDADE",
                            fontWeight: cert.policyNumber ? 500 : 400,
                          }}
                        >
                          {cert.policyNumber || "--"}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            color: cert.carrierName
                              ? "#4B465C"
                              : "#DBDADE",
                          }}
                        >
                          {cert.carrierName || "--"}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            textAlign: "right",
                            fontFamily: "monospace",
                            fontWeight: 500,
                          }}
                        >
                          {formatCurrency(cert.aggregateAmount)}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            textAlign: "right",
                            fontFamily: "monospace",
                            fontWeight: 500,
                          }}
                        >
                          {formatCurrency(cert.eachOccurrenceAmount)}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...tdSx,
                            color: isExpired
                              ? "#EA5455"
                              : "#4B465C",
                            fontWeight: isExpired ? 600 : 400,
                          }}
                        >
                          {formatDate(cert.expirationDate)}
                        </TableCell>
                        <TableCell sx={{ ...tdSx }}>
                          <ComplianceBadge status={cert.complianceStatus} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                  }
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>
    </Box>
  );
}
