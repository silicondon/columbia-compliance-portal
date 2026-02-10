import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */

const statusColorMap: Record<
  string,
  { bg: string; color: string }
> = {
  active: {
    bg: "#E8FAF0",
    color: "#28C76F",
  },
  suspended: {
    bg: "#FFF0F0",
    color: "#EA5455",
  },
  inactive: {
    bg: "#F4F5FA",
    color: "#A8AAAE",
  },
};

function StatusBadge({ status }: { status: string }) {
  const scheme = statusColorMap[status] ?? statusColorMap.inactive;
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
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

function FlagBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <Chip
      icon={
        active ? (
          <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
        ) : (
          <CancelOutlinedIcon sx={{ fontSize: 14 }} />
        )
      }
      label={label}
      size="small"
      sx={{
        bgcolor: active ? "#F4F5FA" : "#FAFBFC",
        color: active ? "#7367F0" : "#A8AAAE",
        border: "none",
        fontWeight: 500,
        fontSize: "0.75rem",
        height: 28,
        "& .MuiChip-icon": {
          color: active ? "#7367F0" : "#A8AAAE",
        },
        "& .MuiChip-label": {
          px: 1.5,
        },
      }}
    />
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <Box>
      <Typography
        variant="overline"
        sx={{
          display: "block",
          color: "#A8AAAE",
          mb: 0.5,
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: value ? "#4B465C" : "#DBDADE",
          fontSize: "0.9375rem",
          fontWeight: 500,
        }}
      >
        {value || "--"}
      </Typography>
    </Box>
  );
}

function SectionHeading({
  children,
  color,
  borderColor,
}: {
  children: React.ReactNode;
  color?: string;
  borderColor?: string;
}) {
  return (
    <Typography
      variant="overline"
      component="h2"
      sx={{
        display: "block",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: color ?? "#4B465C",
        letterSpacing: "0.06em",
        mb: 3,
        pb: 1.5,
        borderBottom: 1,
        borderColor: borderColor ?? "rgba(0, 0, 0, 0.06)",
      }}
    >
      {children}
    </Typography>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
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

  const tabs = [
    { label: "General Info", href: `/vendors/${id}`, active: true },
    { label: "Insurance", href: `/vendors/${id}/insurance`, active: false, count: vendor._count.certificates },
    { label: "Contracts", href: `/vendors/${id}/contracts`, active: false, count: vendor._count.contracts },
    { label: "Rates", href: `/vendors/${id}/rates`, active: false, count: vendor._count.rates },
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
          <Typography
            variant="body2"
            sx={{
              color: "#4B465C",
              fontWeight: 600,
              fontSize: "0.9375rem",
            }}
          >
            {vendor.name}
          </Typography>
        </Breadcrumbs>

        {/* ---- Vendor Header Card ---- */}
        <Card
          sx={{
            mb: 4,
            boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { md: "flex-start" },
              justifyContent: "space-between",
              gap: 2,
              px: 4,
              py: 3,
            }}
          >
            {/* Left: name + meta */}
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontSize: "1.75rem",
                    fontWeight: 600,
                    color: "#4B465C",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {vendor.name}
                </Typography>
                <StatusBadge status={vendor.status} />
              </Stack>

              {vendor.dba && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#A8AAAE",
                    mb: 1,
                    fontSize: "0.9375rem",
                  }}
                >
                  DBA: {vendor.dba}
                </Typography>
              )}

              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
                <Chip
                  label={`VMS ID: ${vendor.vmsId}`}
                  size="small"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    bgcolor: "#F4F5FA",
                    color: "#A8AAAE",
                    border: "none",
                    height: 26,
                    "& .MuiChip-label": {
                      px: 1.5,
                    },
                  }}
                />
                {vendor.primaryTrade && (
                  <Chip
                    label={vendor.primaryTrade}
                    size="small"
                    sx={{
                      bgcolor: "#E7F4FF",
                      color: "#00A3FF",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      border: "none",
                      height: 26,
                      "& .MuiChip-label": {
                        px: 1.5,
                      },
                    }}
                  />
                )}
                {vendor.unionStatus && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#A8AAAE",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {vendor.unionStatus}
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Right: action buttons */}
            <Box sx={{ flexShrink: 0 }}>
              {vendor.status === "suspended" ? (
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "#28C76F",
                    "&:hover": { bgcolor: "#24B263" },
                    boxShadow: "0 2px 4px 0 rgba(40, 199, 111, 0.24)",
                  }}
                >
                  Unsuspend Vendor
                </Button>
              ) : vendor.status === "active" ? (
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "#EA5455",
                    "&:hover": { bgcolor: "#E73D3E" },
                    boxShadow: "0 2px 4px 0 rgba(234, 84, 85, 0.24)",
                  }}
                >
                  Suspend Vendor
                </Button>
              ) : null}
            </Box>
          </CardContent>

          {/* ---- Tab Navigation ---- */}
          <Divider sx={{ borderColor: "rgba(0, 0, 0, 0.04)" }} />
          <Box
            component="nav"
            sx={{
              display: "flex",
              px: 4,
              gap: 0.5,
            }}
          >
            {tabs.map((tab) => (
              <Link key={tab.label} href={tab.href} style={{ textDecoration: "none", color: "inherit" }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    px: 2.5,
                    py: 2,
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    borderBottom: 3,
                    borderColor: tab.active ? "#7367F0" : "transparent",
                    color: tab.active ? "#7367F0" : "#A8AAAE",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: tab.active ? "#7367F0" : "#4B465C",
                      bgcolor: tab.active ? "transparent" : "rgba(115, 103, 240, 0.04)",
                    },
                  }}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <Chip
                      label={tab.count}
                      size="small"
                      sx={{
                        ml: 1.5,
                        height: 22,
                        minWidth: 22,
                        fontSize: "0.75rem",
                        bgcolor: tab.active ? "#7367F020" : "#F4F5FA",
                        color: tab.active ? "#7367F0" : "#A8AAAE",
                        border: "none",
                        fontWeight: 600,
                        "& .MuiChip-label": {
                          px: 1,
                        },
                      }}
                    />
                  )}
                </Box>
              </Link>
            ))}
          </Box>
        </Card>

        {/* ---- 3-column content grid ---- */}
        <Grid container spacing={4}>
          {/* ---------- Contact Information ---------- */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              sx={{
                height: "100%",
                boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <SectionHeading>Contact Information</SectionHeading>
                <Stack spacing={3}>
                  <InfoField label="Contact Person" value={vendor.contactPerson} />
                  <InfoField label="Phone" value={vendor.phone} />
                  <InfoField label="Fax" value={vendor.fax} />
                  <InfoField label="Email" value={vendor.email} />
                  <InfoField label="Email (Maximo)" value={vendor.emailMaximo} />
                  <InfoField label="Email (Unifier)" value={vendor.emailUnifier} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* ---------- Address & Identification ---------- */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              sx={{
                height: "100%",
                boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <SectionHeading>Address &amp; Identification</SectionHeading>
                <Stack spacing={3}>
                {/* Address block */}
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ display: "block", color: "text.secondary", mb: 0.25 }}
                  >
                    Address
                  </Typography>
                  {vendor.address1 ||
                  vendor.address2 ||
                  vendor.city ||
                  vendor.state ||
                  vendor.zip ? (
                    <Box>
                      {vendor.address1 && (
                        <Typography variant="body2" sx={{ color: "text.primary" }}>
                          {vendor.address1}
                        </Typography>
                      )}
                      {vendor.address2 && (
                        <Typography variant="body2" sx={{ color: "text.primary" }}>
                          {vendor.address2}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: "text.primary" }}>
                        {[vendor.city, vendor.state].filter(Boolean).join(", ")}
                        {vendor.zip ? ` ${vendor.zip}` : ""}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#DBDADE",
                        fontSize: "0.9375rem",
                      }}
                    >
                      --
                    </Typography>
                  )}
                </Box>

                <InfoField label="EIN" value={vendor.ein} />
                <InfoField label="VMS ID" value={vendor.vmsId} />
                <InfoField label="ARC Vendor ID" value={vendor.arcVendorId} />
                <InfoField
                  label="Brokermatic Insured ID"
                  value={vendor.brokermaticInsuredId}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

          {/* ---------- Classification & Flags ---------- */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card
              sx={{
                height: "100%",
                boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(0, 0, 0, 0.04)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Classification */}
                <SectionHeading>Classification</SectionHeading>
                <Stack spacing={3}>
                <InfoField label="Primary Trade" value={vendor.primaryTrade} />
                <InfoField label="Union Status" value={vendor.unionStatus} />
                <InfoField label="MWL Status" value={vendor.mwlStatus} />
              </Stack>

              {/* Flags */}
              <SectionHeading>Flags</SectionHeading>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                <FlagBadge active={vendor.maximoEnabled} label="Maximo" />
                <FlagBadge active={vendor.facilities} label="Facilities" />
                <FlagBadge active={vendor.construction} label="Construction" />
                <FlagBadge active={vendor.paymentLien} label="Payment Lien" />
                <FlagBadge
                  active={vendor.exemptFromInsurance}
                  label="Exempt from Insurance"
                />
              </Stack>

                {/* Suspension Details (conditional) */}
                {vendor.status === "suspended" && (
                  <Box sx={{ mt: 4 }}>
                    <SectionHeading color="#EA5455" borderColor="rgba(234, 84, 85, 0.12)">
                      Suspension Details
                    </SectionHeading>
                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="overline"
                          sx={{
                            display: "block",
                            color: "#A8AAAE",
                            mb: 0.5,
                            fontSize: "0.75rem",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Suspended Date
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#EA5455",
                            fontSize: "0.9375rem",
                            fontWeight: 500,
                          }}
                        >
                          {vendor.suspendedDate
                            ? new Date(vendor.suspendedDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "--"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="overline"
                          sx={{
                            display: "block",
                            color: "#A8AAAE",
                            mb: 0.5,
                            fontSize: "0.75rem",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Reason
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: vendor.suspendedReason ? "#EA5455" : "#DBDADE",
                            fontSize: "0.9375rem",
                            fontWeight: 500,
                          }}
                        >
                          {vendor.suspendedReason || "--"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Audit */}
                <Box sx={{ mt: 4 }}>
                  <SectionHeading>Audit</SectionHeading>
                  <Stack spacing={3}>
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          display: "block",
                          color: "#A8AAAE",
                          mb: 0.5,
                          fontSize: "0.75rem",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Created
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#A8AAAE",
                          fontSize: "0.9375rem",
                        }}
                      >
                        {new Date(vendor.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          display: "block",
                          color: "#A8AAAE",
                          mb: 0.5,
                          fontSize: "0.75rem",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Last Updated
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#A8AAAE",
                          fontSize: "0.9375rem",
                        }}
                      >
                        {new Date(vendor.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
