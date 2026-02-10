import Link from "next/link";
import { prisma } from "@/lib/db";
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
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import FilterableTableHeaderCell from "@/components/FilterableTableHeaderCell";
import { columbia } from "@/lib/colors";

export const dynamic = "force-dynamic";

function formatDate(d: Date | null | undefined): string {
  if (!d) return "N/A";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(d: Date | null | undefined): number | null {
  if (!d) return null;
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

function statusBadge(daysRemaining: number | null, complianceStatus: string) {
  if (complianceStatus === "compliant") {
    return (
      <Chip
        label="Compliant"
        size="small"
        sx={{
          backgroundColor: columbia.pastel.green,
          color: columbia.pastel.greenDark,
          fontWeight: 500,
          fontSize: "0.8125rem",
          borderRadius: "16px",
          height: "28px",
          border: "none",
        }}
      />
    );
  }
  if (daysRemaining !== null && daysRemaining < 0) {
    return (
      <Chip
        label="Expired"
        size="small"
        sx={{
          backgroundColor: columbia.pastel.coral,
          color: columbia.pastel.coralDark,
          fontWeight: 500,
          fontSize: "0.8125rem",
          borderRadius: "16px",
          height: "28px",
          border: "none",
        }}
      />
    );
  }
  if (daysRemaining !== null && daysRemaining <= 30) {
    return (
      <Chip
        label="Expiring Soon"
        size="small"
        sx={{
          backgroundColor: columbia.pastel.yellow,
          color: columbia.pastel.yellowDark,
          fontWeight: 500,
          fontSize: "0.8125rem",
          borderRadius: "16px",
          height: "28px",
          border: "none",
        }}
      />
    );
  }
  if (daysRemaining !== null && daysRemaining <= 60) {
    return (
      <Chip
        label="Expiring"
        size="small"
        sx={{
          backgroundColor: columbia.pastel.yellow,
          color: columbia.pastel.yellowDark,
          fontWeight: 500,
          fontSize: "0.8125rem",
          borderRadius: "16px",
          height: "28px",
          border: "none",
        }}
      />
    );
  }
  if (daysRemaining !== null && daysRemaining <= 90) {
    return (
      <Chip
        label="Watch"
        size="small"
        sx={{
          backgroundColor: columbia.pastel.blue,
          color: columbia.pastel.blueDark,
          fontWeight: 500,
          fontSize: "0.8125rem",
          borderRadius: "16px",
          height: "28px",
          border: "none",
        }}
      />
    );
  }
  if (complianceStatus === "non_compliant" || complianceStatus === "pending") {
    return (
      <Chip
        label="Non-Compliant"
        size="small"
        sx={{
          backgroundColor: columbia.pastel.coral,
          color: columbia.pastel.coralDark,
          fontWeight: 500,
          fontSize: "0.8125rem",
          borderRadius: "16px",
          height: "28px",
          border: "none",
        }}
      />
    );
  }
  return (
    <Chip
      label={complianceStatus}
      size="small"
      sx={{
        backgroundColor: "#F4F5FA",
        color: "#6B7280",
        fontWeight: 500,
        fontSize: "0.8125rem",
        borderRadius: "16px",
        height: "28px",
        border: "none",
      }}
    />
  );
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: columbia.pastel.purple, text: columbia.pastel.purpleDark },
    { bg: columbia.pastel.green, text: columbia.pastel.greenDark },
    { bg: columbia.pastel.blue, text: columbia.pastel.blueDark },
    { bg: columbia.pastel.pink, text: columbia.pastel.pinkDark },
    { bg: columbia.pastel.yellow, text: columbia.pastel.yellowDark },
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default async function ComplianceDashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const vendorSearch = typeof params.search === "string" ? params.search.trim() : "";
  const coverageTypeFilter = typeof params.coverageType === "string" ? params.coverageType.trim() : "";
  const complianceStatusFilter = typeof params.complianceStatus === "string" ? params.complianceStatus : "";
  const sort = typeof params.sort === "string" ? params.sort : "";
  const order = typeof params.order === "string" && (params.order === "asc" || params.order === "desc")
    ? params.order
    : "asc";

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 86400000);
  const in60 = new Date(now.getTime() + 60 * 86400000);
  const in90 = new Date(now.getTime() + 90 * 86400000);

  // Build where clause for flagged certificates
  const flaggedWhere: Record<string, unknown> = {
    OR: [
      { complianceStatus: { in: ["non_compliant", "pending"] } },
      { expirationDate: { lte: in90 } },
    ],
  };

  // Add filter conditions
  const filters: Record<string, unknown>[] = [];

  if (vendorSearch) {
    filters.push({ vendor: { name: { contains: vendorSearch, mode: "insensitive" } } });
  }

  if (coverageTypeFilter) {
    filters.push({ coverageType: { contains: coverageTypeFilter, mode: "insensitive" } });
  }

  if (complianceStatusFilter) {
    filters.push({ complianceStatus: complianceStatusFilter });
  }

  // Combine base flagged condition with filters
  if (filters.length > 0) {
    flaggedWhere.AND = [
      {
        OR: [
          { complianceStatus: { in: ["non_compliant", "pending"] } },
          { expirationDate: { lte: in90 } },
        ],
      },
      ...filters,
    ];
    delete flaggedWhere.OR;
  }

  // Build orderBy clause (vendor.name sorting requires client-side sort after fetch)
  type OrderByInput = { coverageType?: "asc" | "desc"; expirationDate?: "asc" | "desc"; complianceStatus?: "asc" | "desc" };
  const orderBy: OrderByInput = sort === "coverageType"
    ? { coverageType: order }
    : sort === "expirationDate"
    ? { expirationDate: order }
    : sort === "complianceStatus"
    ? { complianceStatus: order }
    : { expirationDate: "asc" };

  const [vendorsWithReqs, allCerts, flaggedCerts] = await Promise.all([
    prisma.vendor.count({
      where: { insuranceRequirement: { isNot: null } },
    }),
    prisma.certificate.findMany({
      select: { complianceStatus: true, expirationDate: true },
    }),
    prisma.certificate.findMany({
      where: flaggedWhere,
      include: {
        vendor: { select: { id: true, name: true } },
      },
      orderBy,
    }).then((certs) => {
      // Client-side sort for vendor.name since Prisma doesn't support nested orderBy on relations
      if (sort === "vendor.name") {
        return certs.sort((a, b) => {
          const nameA = a.vendor?.name || "";
          const nameB = b.vendor?.name || "";
          return order === "desc"
            ? nameB.localeCompare(nameA)
            : nameA.localeCompare(nameB);
        });
      }
      return certs;
    }),
  ]);

  const compliantCount = allCerts.filter((c) => c.complianceStatus === "compliant").length;
  const nonCompliantCount = allCerts.filter(
    (c) => c.complianceStatus === "non_compliant" || c.complianceStatus === "pending"
  ).length;
  const expiredCount = allCerts.filter((c) => c.expirationDate && c.expirationDate < now).length;
  const expiring30 = allCerts.filter(
    (c) => c.expirationDate && c.expirationDate >= now && c.expirationDate <= in30
  ).length;
  const expiring60 = allCerts.filter(
    (c) => c.expirationDate && c.expirationDate >= now && c.expirationDate <= in60
  ).length;
  const expiring90 = allCerts.filter(
    (c) => c.expirationDate && c.expirationDate >= now && c.expirationDate <= in90
  ).length;

  const summaryCards = [
    {
      label: "Vendors with Requirements",
      value: vendorsWithReqs,
      icon: "business",
      bgColor: columbia.pastel.purple,
      iconColor: columbia.pastel.purpleDark,
    },
    {
      label: "Compliant",
      value: compliantCount,
      icon: "check_circle",
      bgColor: columbia.pastel.green,
      iconColor: columbia.pastel.greenDark,
    },
    {
      label: "Non-Compliant",
      value: nonCompliantCount,
      icon: "cancel",
      bgColor: columbia.pastel.coral,
      iconColor: columbia.pastel.coralDark,
    },
    {
      label: "Expiring (30 days)",
      value: expiring30,
      icon: "warning",
      bgColor: columbia.pastel.yellow,
      iconColor: columbia.pastel.yellowDark,
    },
    {
      label: "Expiring (60 days)",
      value: expiring60,
      icon: "schedule",
      bgColor: columbia.pastel.yellow,
      iconColor: columbia.pastel.yellowDark,
    },
    {
      label: "Expiring (90 days)",
      value: expiring90,
      icon: "watch_later",
      bgColor: columbia.pastel.blue,
      iconColor: columbia.pastel.blueDark,
    },
    {
      label: "Expired",
      value: expiredCount,
      icon: "error",
      bgColor: columbia.pastel.coral,
      iconColor: columbia.pastel.coralDark,
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: "#F8F7FA",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          maxWidth: "1600px",
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 4, sm: 5 },
        }}
      >
        {/* Page Header */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mb: 5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: 500,
                color: "#4A5578",
                mb: 1,
              }}
            >
              Insurance Compliance
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#A8AAAE",
                fontWeight: 400,
              }}
            >
              Monitor vendor compliance and certificate status
            </Typography>
          </Box>
          <Link href="/compliance/expiring" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: columbia.navyBlue,
                color: "#fff",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.9375rem",
                borderRadius: "8px",
                px: 3,
                py: 1.5,
                boxShadow: "0 2px 6px 0 rgba(0, 48, 135, 0.3)",
                "&:hover": {
                  backgroundColor: columbia.mediumBlue,
                  boxShadow: "0 4px 8px 0 rgba(0, 48, 135, 0.4)",
                },
              }}
            >
              View Expiring Certificates
            </Button>
          </Link>
        </Stack>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {summaryCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 12 / 7 }} key={card.label}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 2px 6px 0 rgba(67, 89, 113, 0.12)",
                  transition: "all 0.2s ease-in-out",
                  backgroundColor: "#fff",
                  "&:hover": {
                    boxShadow: "0 4px 12px 0 rgba(67, 89, 113, 0.16)",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                  <Stack spacing={2.5}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        backgroundColor: card.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        component="span"
                        className="material-icons"
                        sx={{
                          fontSize: "22px",
                          color: card.iconColor,
                        }}
                      >
                        {card.icon}
                      </Box>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          color: "#A8AAAE",
                          mb: 0.5,
                        }}
                      >
                        {card.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "1.75rem",
                          fontWeight: 600,
                          color: "#4A5578",
                          lineHeight: 1.2,
                        }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Non-Compliant & Expiring Table */}
        <Card
          elevation={0}
          sx={{
            borderRadius: "10px",
            border: "none",
            boxShadow: "0 2px 6px 0 rgba(67, 89, 113, 0.12)",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              px: { xs: 3, md: 4 },
              py: 3.5,
              borderBottom: "1px solid #F0F0F0",
            }}
          >
            <Typography
              sx={{
                fontWeight: 500,
                color: "#4A5578",
                fontSize: "1.125rem",
                mb: 0.5,
              }}
            >
              Non-Compliant & Expiring Certificates
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#A8AAAE",
                fontWeight: 400,
              }}
            >
              Showing {flaggedCerts.length} certificate
              {flaggedCerts.length !== 1 ? "s" : ""} that need attention
            </Typography>
          </Box>

          {flaggedCerts.length === 0 ? (
            <Box
              sx={{
                px: { xs: 3, md: 4 },
                py: 8,
                textAlign: "center",
              }}
            >
              <Alert
                severity="success"
                sx={{
                  display: "inline-flex",
                  backgroundColor: columbia.pastel.green,
                  color: columbia.pastel.greenDark,
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  fontWeight: 500,
                  py: 2,
                  px: 3,
                  "& .MuiAlert-icon": {
                    color: columbia.pastel.greenDark,
                  },
                }}
              >
                {vendorSearch || coverageTypeFilter || complianceStatusFilter
                  ? "No certificates found matching your filter criteria."
                  : "All vendor certificates are compliant and current."}
              </Alert>
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#F8F7FA",
                      borderBottom: "1px solid #F0F0F0",
                    }}
                  >
                    <FilterableTableHeaderCell
                      label="Vendor"
                      sortKey="vendor.name"
                      filterKey="search"
                      filterType="text"
                      currentSort={sort}
                      currentOrder={order}
                    />
                    <FilterableTableHeaderCell
                      label="Coverage Type"
                      sortKey="coverageType"
                      filterKey="coverageType"
                      filterType="text"
                      currentSort={sort}
                      currentOrder={order}
                    />
                    <FilterableTableHeaderCell
                      label="Expiration Date"
                      sortKey="expirationDate"
                      currentSort={sort}
                      currentOrder={order}
                    />
                    <TableCell
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#A8AAAE",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        py: 2.5,
                      }}
                    >
                      Days Remaining
                    </TableCell>
                    <FilterableTableHeaderCell
                      label="Status"
                      sortKey="complianceStatus"
                      filterKey="complianceStatus"
                      filterType="select"
                      filterOptions={[
                        { label: "Compliant", value: "compliant" },
                        { label: "Non-Compliant", value: "non_compliant" },
                        { label: "Pending", value: "pending" },
                      ]}
                      currentSort={sort}
                      currentOrder={order}
                    />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flaggedCerts.map((cert) => {
                    const days = daysUntil(cert.expirationDate);
                    const avatarColors = getAvatarColor(cert.vendor.name);
                    return (
                      <TableRow
                        key={cert.id}
                        sx={{
                          transition: "background-color 0.15s ease",
                          "&:hover": {
                            backgroundColor: "#F8F7FA",
                          },
                          "&:last-child td": {
                            borderBottom: 0,
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            whiteSpace: "nowrap",
                            py: 3,
                            borderColor: "#F0F0F0",
                          }}
                        >
                          <Link
                            href={`/vendors/${cert.vendor.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                sx={{
                                  width: 38,
                                  height: 38,
                                  backgroundColor: avatarColors.bg,
                                  color: avatarColors.text,
                                  fontSize: "0.875rem",
                                  fontWeight: 600,
                                }}
                              >
                                {getInitials(cert.vendor.name)}
                              </Avatar>
                              <Typography
                                sx={{
                                  fontSize: "0.9375rem",
                                  fontWeight: 500,
                                  color: "#4A5578",
                                  textDecoration: "none",
                                  transition: "color 0.15s ease",
                                  "&:hover": {
                                    color: columbia.mediumBlue,
                                  },
                                }}
                              >
                                {cert.vendor.name}
                              </Typography>
                            </Stack>
                          </Link>
                        </TableCell>
                        <TableCell
                          sx={{
                            whiteSpace: "nowrap",
                            py: 3,
                            borderColor: "#F0F0F0",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              color: "#4A5578",
                              fontWeight: 400,
                            }}
                          >
                            {cert.coverageType}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            whiteSpace: "nowrap",
                            py: 3,
                            borderColor: "#F0F0F0",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              color: "#4A5578",
                              fontWeight: 400,
                            }}
                          >
                            {formatDate(cert.expirationDate)}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            whiteSpace: "nowrap",
                            py: 3,
                            borderColor: "#F0F0F0",
                          }}
                        >
                          {days !== null ? (
                            <Typography
                              sx={{
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                color:
                                  days < 0
                                    ? columbia.pastel.coralDark
                                    : days <= 30
                                      ? columbia.pastel.yellowDark
                                      : days <= 60
                                        ? columbia.pastel.yellowDark
                                        : "#4A5578",
                              }}
                            >
                              {days < 0
                                ? `${Math.abs(days)} days overdue`
                                : `${days} days`}
                            </Typography>
                          ) : (
                            <Typography
                              sx={{
                                fontSize: "0.875rem",
                                color: "#A8AAAE",
                                fontWeight: 400,
                              }}
                            >
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell
                          sx={{
                            whiteSpace: "nowrap",
                            py: 3,
                            borderColor: "#F0F0F0",
                          }}
                        >
                          {statusBadge(days, cert.complianceStatus)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>
    </Box>
  );
}
