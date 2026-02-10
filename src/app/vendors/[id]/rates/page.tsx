import Link from "next/link";
import { notFound } from "next/navigation";
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
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VendorHeader from "@/components/VendorHeader";

export const dynamic = "force-dynamic";

function formatDate(d: Date | null | undefined): string {
  if (!d) return "N/A";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRate(value: unknown): string {
  if (value === null || value === undefined) return "-";
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

function formatPercent(value: unknown): string {
  if (value === null || value === undefined) return "-";
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return "-";
  return `${num.toFixed(1)}%`;
}

function statusChip(status: string) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    approved: { bg: "#E8FAF0", text: "#28C76F" },
    pending: { bg: "#FFF6E5", text: "#FDB528" },
    expired: { bg: "#FFF0F0", text: "#EA5455" },
    rejected: { bg: "#FFF0F0", text: "#EA5455" },
  };
  const colors = colorMap[status] || { bg: "#F4F5FA", text: "#A8AAAE" };
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontWeight: 600,
        fontSize: "0.75rem",
        textTransform: "capitalize",
        border: "none",
        height: 26,
        "& .MuiChip-label": {
          px: 1.5,
        },
      }}
    />
  );
}

export default async function VendorRatesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status: statusFilter } = await searchParams;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      vmsId: true,
      primaryTrade: true,
      rates: {
        where: statusFilter ? { status: statusFilter } : undefined,
        orderBy: [{ status: "asc" }, { rateCategory: "asc" }, { effectiveDate: "desc" }],
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

  // Count by status for filter badges (always from full set)
  const allRates = statusFilter
    ? await prisma.vendorRate.findMany({
        where: { vendorId: id },
        select: { status: true },
      })
    : vendor.rates;

  const statusCounts = allRates.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const filterStatuses = ["approved", "pending", "expired"];

  const headCellSx = {
    fontWeight: 600,
    fontSize: "0.75rem",
    color: "#A8AAAE",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
    py: 2.5,
    px: 3,
    backgroundColor: "#FAFBFC",
  };

  const bodyCellSx = {
    fontSize: "0.9375rem",
    py: 2.5,
    px: 3,
    borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
  };

  return (
    <Box sx={{ backgroundColor: "#F8F7FA", minHeight: "100vh", pb: 6 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: 4, pt: 3 }}>
        {/* Breadcrumb */}
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
          sx={{ mb: 4 }}
        >
          <Link href="/vendors" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography
              variant="body2"
              sx={{
                color: "#A8AAAE",
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
            Rates
          </Typography>
        </Breadcrumbs>

        {/* Vendor Header with Tabs */}
        <VendorHeader
          vendor={{
            id: vendor.id,
            name: vendor.name,
            status: vendor.status,
            vmsId: vendor.vmsId,
            primaryTrade: vendor.primaryTrade,
          }}
          activeTab="rates"
          counts={{
            certificates: vendor._count.certificates,
            contracts: vendor._count.contracts,
            rates: vendor._count.rates,
          }}
        />

        {/* Status Filter Pills */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 4 }}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#A8AAAE",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Filter:
          </Typography>
          <Link href={`/vendors/${vendor.id}/rates`} style={{ textDecoration: 'none' }}>
            <Chip
              label={`All (${allRates.length})`}
              clickable
              size="medium"
              sx={{
                fontWeight: 600,
                fontSize: "0.8125rem",
                backgroundColor: !statusFilter ? "#7367F0" : "#FFFFFF",
                color: !statusFilter ? "#FFFFFF" : "#A8AAAE",
                border: !statusFilter ? "none" : "1px solid rgba(0, 0, 0, 0.08)",
                px: 0.5,
                height: 36,
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: !statusFilter ? "#5E51E5" : "#FAFBFC",
                  borderColor: !statusFilter ? "transparent" : "rgba(0, 0, 0, 0.12)",
                  transform: "translateY(-1px)",
                  boxShadow: !statusFilter
                    ? "0 4px 8px 0 rgba(115, 103, 240, 0.4)"
                    : "0 2px 4px 0 rgba(0, 0, 0, 0.08)",
                },
              }}
            />
          </Link>
          {filterStatuses.map((s) => (
            <Link
              key={s}
              href={`/vendors/${vendor.id}/rates?status=${s}`}
              style={{ textDecoration: 'none' }}
            >
              <Chip
                label={`${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCounts[s] || 0})`}
                clickable
                size="medium"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  backgroundColor: statusFilter === s ? "#7367F0" : "#FFFFFF",
                  color: statusFilter === s ? "#FFFFFF" : "#A8AAAE",
                  border: statusFilter === s ? "none" : "1px solid rgba(0, 0, 0, 0.08)",
                  px: 0.5,
                  height: 36,
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: statusFilter === s ? "#5E51E5" : "#FAFBFC",
                    borderColor: statusFilter === s ? "transparent" : "rgba(0, 0, 0, 0.12)",
                    transform: "translateY(-1px)",
                    boxShadow: statusFilter === s
                      ? "0 4px 8px 0 rgba(115, 103, 240, 0.4)"
                      : "0 2px 4px 0 rgba(0, 0, 0, 0.08)",
                  },
                }}
              />
            </Link>
          ))}
        </Stack>

        {/* Rates Table */}
        <Card
          sx={{
            boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          {vendor.rates.length === 0 ? (
            <CardContent
              sx={{
                py: 12,
                px: 4,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  maxWidth: 400,
                  mx: "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    backgroundColor: "#F4F5FA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "2rem",
                      color: "#A8AAAE",
                    }}
                  >
                    💰
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color: "#4B465C",
                    fontSize: "1rem",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  {statusFilter ? "No matching rates" : "No rates found"}
                </Typography>
                <Typography
                  sx={{
                    color: "#A8AAAE",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                  }}
                >
                  {statusFilter
                    ? `No ${statusFilter} rates found for this vendor.`
                    : "This vendor has no rate information available."}
                </Typography>
              </Box>
            </CardContent>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={headCellSx}>Status</TableCell>
                  <TableCell sx={headCellSx}>Category</TableCell>
                  <TableCell sx={headCellSx}>Sub-Category</TableCell>
                  <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Regular</TableCell>
                  <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Premium</TableCell>
                  <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Double</TableCell>
                  <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Material</TableCell>
                  <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Sub</TableCell>
                  <TableCell sx={{ ...headCellSx, textAlign: "right" }}>Equip</TableCell>
                  <TableCell sx={headCellSx}>Effective</TableCell>
                  <TableCell sx={headCellSx}>Expires</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {vendor.rates.map((rate, index) => (
                    <TableRow
                      key={rate.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#FAFBFC",
                        },
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={bodyCellSx}>
                        {statusChip(rate.status)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...bodyCellSx,
                          fontWeight: 600,
                          color: "#7367F0",
                          fontSize: "0.9375rem",
                        }}
                      >
                        {rate.rateCategory}
                      </TableCell>
                      <TableCell sx={{ ...bodyCellSx, color: "#4B465C" }}>
                        {rate.rateSubCategory || (
                          <Box
                            component="span"
                            sx={{ color: "#DBDADE" }}
                          >
                            -
                          </Box>
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...bodyCellSx,
                          textAlign: "right",
                          fontFamily: "monospace",
                          color: "#28C76F",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatRate(rate.regularHourly)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...bodyCellSx,
                          textAlign: "right",
                          fontFamily: "monospace",
                          color: "#EA5455",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatRate(rate.premiumHourly)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...bodyCellSx,
                          textAlign: "right",
                          fontFamily: "monospace",
                          color: "#7367F0",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatRate(rate.doubleHourly)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...bodyCellSx,
                          textAlign: "right",
                          fontFamily: "monospace",
                          color: "#4B465C",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatPercent(rate.materialMarkup)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...bodyCellSx,
                          textAlign: "right",
                          fontFamily: "monospace",
                          color: "#4B465C",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatPercent(rate.subMarkup)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...bodyCellSx,
                          textAlign: "right",
                          fontFamily: "monospace",
                          color: "#4B465C",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatPercent(rate.equipmentMarkup)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...bodyCellSx,
                          color: "#A8AAAE",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(rate.effectiveDate)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...bodyCellSx,
                          color: "#A8AAAE",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(rate.expirationDate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>
    </Box>
  );
}
