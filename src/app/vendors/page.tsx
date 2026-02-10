import Link from "next/link";
import { prisma } from "@/lib/db";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import FilterableTableHeaderCell from "@/components/FilterableTableHeaderCell";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

// Columbia brand colors (mirrors @/lib/theme)
const colors = {
  navyBlue: "#003087",
  mediumBlue: "#0077C8",
  darkGray: "#53565A",
  mediumGray: "#75787B",
  lightGray: "#D0D0CE",
  green: "#76881D",
  magenta: "#AE2573",
  bgDefault: "#F8F7FA",
  white: "#FFFFFF",
};

// Pastel colors from theme for status badges
const pastel = {
  green: "#E8FAF0",
  greenDark: "#28C76F",
  coral: "#FFF0F0",
  coralDark: "#EA5455",
  yellow: "#FFF6E5",
  yellowDark: "#FDB528",
};

const statusChipProps: Record<
  string,
  { bgcolor: string; color: string }
> = {
  active: { bgcolor: pastel.green, color: pastel.greenDark },
  suspended: { bgcolor: pastel.coral, color: pastel.coralDark },
  inactive: { bgcolor: pastel.yellow, color: pastel.yellowDark },
};

function StatusChip({ status }: { status: string }) {
  const style = statusChipProps[status] ?? statusChipProps.inactive;
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      sx={{
        bgcolor: style.bgcolor,
        color: style.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        border: "none",
        borderRadius: "8px",
        px: 1.5,
        height: "28px",
        "& .MuiChip-label": {
          px: 2,
        },
      }}
    />
  );
}

// Helper function to generate avatar initials from vendor name
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Generate a consistent color for avatar based on name
function getAvatarColor(name: string): string {
  const colors = [
    { bg: "#F4F5FA", text: "#7367F0" },
    { bg: "#E8FAF0", text: "#28C76F" },
    { bg: "#FFF0F0", text: "#EA5455" },
    { bg: "#E7F4FF", text: "#00A3FF" },
    { bg: "#FFF6E5", text: "#FDB528" },
    { bg: "#FEF0F5", text: "#FF7FAA" },
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index].bg;
}

function getAvatarTextColor(name: string): string {
  const colors = [
    { bg: "#F4F5FA", text: "#7367F0" },
    { bg: "#E8FAF0", text: "#28C76F" },
    { bg: "#FFF0F0", text: "#EA5455" },
    { bg: "#E7F4FF", text: "#00A3FF" },
    { bg: "#FFF6E5", text: "#FDB528" },
    { bg: "#FEF0F5", text: "#FF7FAA" },
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index].text;
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const search =
    typeof params.search === "string" ? params.search.trim() : "";
  const status =
    typeof params.status === "string" ? params.status : "";
  const unionStatus =
    typeof params.unionStatus === "string" ? params.unionStatus : "";
  const trade =
    typeof params.trade === "string" ? params.trade : "";
  const mwlStatus =
    typeof params.mwlStatus === "string" ? params.mwlStatus : "";
  const sort =
    typeof params.sort === "string" ? params.sort : "";
  const order =
    typeof params.order === "string" && (params.order === "asc" || params.order === "desc")
      ? params.order
      : "asc";
  const page =
    typeof params.page === "string"
      ? Math.max(1, parseInt(params.page, 10) || 1)
      : 1;

  // Build where clause with comprehensive search
  const searchFilter = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { dba: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { contactPerson: { contains: search, mode: "insensitive" as const } },
          { primaryTrade: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const where: Record<string, unknown> = {
    ...searchFilter,
  };

  if (status) {
    where.status = status;
  }
  if (unionStatus) {
    where.unionStatus = unionStatus;
  }
  if (trade) {
    where.primaryTrade = trade;
  }
  if (mwlStatus) {
    where.mwlStatus = mwlStatus;
  }

  // Build orderBy clause
  const orderByValue: "asc" | "desc" = order || "asc";
  const orderBy = sort ? { [sort]: orderByValue } : { name: "asc" as const };

  const [vendors, totalCount, trades, unionStatuses, mwlStatuses] =
    await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          _count: {
            select: { certificates: true },
          },
        },
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.vendor.count({ where }),
      prisma.vendor.findMany({
        where: { primaryTrade: { not: null } },
        select: { primaryTrade: true },
        distinct: ["primaryTrade"],
        orderBy: { primaryTrade: "asc" },
      }),
      prisma.vendor.findMany({
        where: { unionStatus: { not: null } },
        select: { unionStatus: true },
        distinct: ["unionStatus"],
        orderBy: { unionStatus: "asc" },
      }),
      prisma.vendor.findMany({
        where: { mwlStatus: { not: null } },
        select: { mwlStatus: true },
        distinct: ["mwlStatus"],
        orderBy: { mwlStatus: "asc" },
      }),
    ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Build query string helper
  function buildQs(overrides: Record<string, string>) {
    const base: Record<string, string> = {};
    if (search) base.search = search;
    if (status) base.status = status;
    if (unionStatus) base.unionStatus = unionStatus;
    if (trade) base.trade = trade;
    if (mwlStatus) base.mwlStatus = mwlStatus;
    if (sort) base.sort = sort;
    if (order) base.order = order;
    const merged = { ...base, ...overrides };
    Object.keys(merged).forEach((k) => {
      if (!merged[k]) delete merged[k];
    });
    const qs = new URLSearchParams(merged).toString();
    return qs ? `?${qs}` : "";
  }

  return (
    <Box
      sx={{
        maxWidth: 1400,
        mx: "auto",
        px: { xs: 3, sm: 4, md: 5 },
        py: { xs: 4, md: 6 },
        bgcolor: colors.bgDefault,
        minHeight: "100vh",
      }}
    >
      {/* ---- Page Header ---- */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 6,
        }}
      >
        <Box>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "1.875rem", md: "2.5rem" },
              fontWeight: 600,
              mb: 1.5,
              color: colors.darkGray,
            }}
          >
            Vendors
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: "1rem",
              color: colors.mediumGray,
              fontWeight: 400,
            }}
          >
            {totalCount} vendor{totalCount !== 1 ? "s" : ""} found
          </Typography>
        </Box>
      </Box>

      {/* ---- Table ---- */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "16px",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
          border: "1px solid #F0F0F0",
          overflow: "hidden",
          bgcolor: colors.white,
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: "#FAFAFA",
              }}
            >
              <FilterableTableHeaderCell
                label="Vendor Name"
                sortKey="name"
                filterKey="search"
                filterType="text"
                currentSort={sort}
                currentOrder={order}
              />
              <FilterableTableHeaderCell
                label="Trade"
                sortKey="primaryTrade"
                filterKey="trade"
                filterType="select"
                filterOptions={trades.map((t) => ({
                  label: t.primaryTrade || "",
                  value: t.primaryTrade || "",
                }))}
                currentSort={sort}
                currentOrder={order}
              />
              <FilterableTableHeaderCell
                label="Union Status"
                sortKey="unionStatus"
                filterKey="unionStatus"
                filterType="select"
                filterOptions={unionStatuses.map((u) => ({
                  label: u.unionStatus || "",
                  value: u.unionStatus || "",
                }))}
                currentSort={sort}
                currentOrder={order}
              />
              <FilterableTableHeaderCell
                label="MWL"
                filterKey="mwlStatus"
                filterType="select"
                filterOptions={mwlStatuses.map((m) => ({
                  label: m.mwlStatus || "",
                  value: m.mwlStatus || "",
                }))}
              />
              <FilterableTableHeaderCell
                label="Status"
                sortKey="status"
                filterKey="status"
                filterType="select"
                filterOptions={[
                  { label: "Active", value: "active" },
                  { label: "Suspended", value: "suspended" },
                  { label: "Inactive", value: "inactive" },
                ]}
                currentSort={sort}
                currentOrder={order}
              />
              <TableCell align="right">Certificates</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  sx={{
                    textAlign: "center",
                    py: 12,
                    color: colors.mediumGray,
                    fontSize: "1rem",
                  }}
                >
                  No vendors found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow
                  key={vendor.id}
                  sx={{
                    bgcolor: colors.white,
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#FAFAFA",
                    },
                  }}
                >
                  <TableCell sx={{ whiteSpace: "nowrap", py: 3, px: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: getAvatarColor(vendor.name),
                          color: getAvatarTextColor(vendor.name),
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(vendor.name)}
                      </Avatar>
                      <Box>
                        <Box
                          sx={{
                            "& a": {
                              color: colors.darkGray,
                              fontWeight: 600,
                              fontSize: "0.9375rem",
                              textDecoration: "none",
                              transition: "color 0.2s",
                              "&:hover": {
                                color: colors.mediumBlue,
                              },
                            },
                          }}
                        >
                          <Link href={`/vendors/${vendor.id}`}>
                            {vendor.name}
                          </Link>
                        </Box>
                        {vendor.dba && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: colors.mediumGray,
                              mt: 0.5,
                              fontSize: "0.8125rem",
                            }}
                          >
                            DBA: {vendor.dba}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ whiteSpace: "nowrap", py: 3, px: 3 }}>
                    {vendor.primaryTrade ? (
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: colors.darkGray, fontSize: "0.9375rem" }}
                      >
                        {vendor.primaryTrade}
                      </Typography>
                    ) : (
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: colors.lightGray, fontSize: "0.9375rem" }}
                      >
                        --
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ whiteSpace: "nowrap", py: 3, px: 3 }}>
                    {vendor.unionStatus ? (
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: colors.darkGray, fontSize: "0.9375rem" }}
                      >
                        {vendor.unionStatus}
                      </Typography>
                    ) : (
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: colors.lightGray, fontSize: "0.9375rem" }}
                      >
                        --
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ whiteSpace: "nowrap", py: 3, px: 3 }}>
                    {vendor.mwlStatus ? (
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: colors.darkGray, fontSize: "0.9375rem" }}
                      >
                        {vendor.mwlStatus}
                      </Typography>
                    ) : (
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: colors.lightGray, fontSize: "0.9375rem" }}
                      >
                        --
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ whiteSpace: "nowrap", py: 3, px: 3 }}>
                    <StatusChip status={vendor.status} />
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      whiteSpace: "nowrap",
                      py: 3,
                      px: 3,
                      fontWeight: 600,
                      color: colors.darkGray,
                      fontSize: "0.9375rem",
                    }}
                  >
                    {vendor._count.certificates}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* ---- Pagination ---- */}
        {totalPages > 1 && (
          <Box
            sx={{
              borderTop: "1px solid #F0F0F0",
              px: 4,
              py: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#FAFAFA",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.9375rem",
                color: colors.mediumGray,
                fontWeight: 400,
              }}
            >
              Showing {(page - 1) * PAGE_SIZE + 1}
              {" - "}
              {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              {/* Previous */}
              {page > 1 ? (
                <Link
                  href={`/vendors${buildQs({ page: String(page - 1) })}`}
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      minWidth: "auto",
                      px: 2.5,
                      py: 1,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      borderColor: "#F0F0F0",
                      borderWidth: "1px",
                      color: colors.darkGray,
                      borderRadius: "8px",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderWidth: "1px",
                        borderColor: "#E0E0E0",
                        bgcolor: colors.white,
                      },
                    }}
                  >
                    Previous
                  </Button>
                </Link>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  disabled
                  sx={{
                    minWidth: "auto",
                    px: 2.5,
                    py: 1,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    borderRadius: "8px",
                  }}
                >
                  Previous
                </Button>
              )}

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 || p === totalPages || Math.abs(p - page) <= 2
                )
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  typeof p === "string" ? (
                    <Typography
                      key={`ellipsis-${idx}`}
                      variant="body2"
                      sx={{
                        px: 1.5,
                        color: colors.mediumGray,
                        fontWeight: 400,
                      }}
                    >
                      ...
                    </Typography>
                  ) : (
                    <Link
                      key={p}
                      href={`/vendors${buildQs({ page: String(p) })}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        size="small"
                        variant={p === page ? "contained" : "outlined"}
                        sx={{
                          minWidth: "40px",
                          px: 2,
                          py: 1,
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          borderRadius: "8px",
                          transition: "all 0.2s",
                          ...(p === page
                            ? {
                                bgcolor: colors.navyBlue,
                                color: colors.white,
                                border: "none",
                                boxShadow: "0 2px 4px 0 rgba(0, 48, 135, 0.15)",
                                "&:hover": {
                                  bgcolor: colors.navyBlue,
                                  boxShadow: "0 2px 4px 0 rgba(0, 48, 135, 0.2)",
                                },
                              }
                            : {
                                borderColor: "#F0F0F0",
                                borderWidth: "1px",
                                color: colors.darkGray,
                                bgcolor: colors.white,
                                "&:hover": {
                                  borderWidth: "1px",
                                  borderColor: "#E0E0E0",
                                  bgcolor: "#FAFAFA",
                                },
                              }),
                        }}
                      >
                        {p}
                      </Button>
                    </Link>
                  )
                )}

              {/* Next */}
              {page < totalPages ? (
                <Link
                  href={`/vendors${buildQs({ page: String(page + 1) })}`}
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      minWidth: "auto",
                      px: 2.5,
                      py: 1,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      borderColor: "#F0F0F0",
                      borderWidth: "1px",
                      color: colors.darkGray,
                      borderRadius: "8px",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderWidth: "1px",
                        borderColor: "#E0E0E0",
                        bgcolor: colors.white,
                      },
                    }}
                  >
                    Next
                  </Button>
                </Link>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  disabled
                  sx={{
                    minWidth: "auto",
                    px: 2.5,
                    py: 1,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    borderRadius: "8px",
                  }}
                >
                  Next
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </TableContainer>
    </Box>
  );
}
