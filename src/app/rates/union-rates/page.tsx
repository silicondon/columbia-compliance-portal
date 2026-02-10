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
import FilterableTableHeaderCell from "@/components/FilterableTableHeaderCell";

export const dynamic = "force-dynamic";

function formatRate(value: unknown): string {
  if (value === null || value === undefined) return "-";
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return "N/A";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function UnionRatesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string; order?: string }>;
}) {
  const params = await searchParams;
  const search = params.search;
  const sort = params.sort;
  const order = (params.order === "asc" || params.order === "desc") ? params.order : "asc";

  const orderByValue = order;
  const orderBy = sort
    ? { [sort]: orderByValue }
    : [{ trade: "asc" as const }, { effectiveDate: "desc" as const }];

  const rates = await prisma.unionRateSheet.findMany({
    where: search
      ? {
          trade: {
            contains: search,
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy,
  });

  const tradeSet = new Set(rates.map((r) => r.trade));

  const headCellSx = {
    fontWeight: 600,
    fontSize: "0.8125rem",
    color: "#6C7383",
    textTransform: "uppercase" as const,
    letterSpacing: "0.02em",
    borderBottom: "1px solid #F0F0F0",
    py: 2.5,
    px: 2.5,
    backgroundColor: "#FFFFFF",
  };

  const bodyCellSx = {
    fontSize: "0.9375rem",
    py: 2.5,
    px: 2.5,
    borderBottom: "1px solid #F0F0F0",
  };

  return (
    <Box sx={{ p: 5, backgroundColor: "#F8F7FA", minHeight: "100vh" }}>
      {/* Page Header */}
      <Box
        sx={{
          mb: 5,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "#5B5866",
            mb: 1,
            fontSize: "1.625rem",
          }}
        >
          Union Rate Sheets
        </Typography>
        <Typography
          sx={{
            fontSize: "0.9375rem",
            color: "#A8AAAE",
          }}
        >
          {rates.length} {rates.length === 1 ? "rate" : "rates"} across {tradeSet.size} {tradeSet.size === 1 ? "trade" : "trades"}
        </Typography>
      </Box>


      {/* Union Rate Sheets Table */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0px 2px 10px 0px rgba(76, 78, 100, 0.08)",
          border: "none",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        }}
      >
        {rates.length === 0 ? (
          <CardContent
            sx={{
              py: 15,
              px: 4,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                color: "#5B5866",
                fontSize: "1rem",
                fontWeight: 500,
                mb: 1,
              }}
            >
              {search ? "No matches found" : "No union rate sheets"}
            </Typography>
            <Typography
              sx={{
                color: "#A8AAAE",
                fontSize: "0.9375rem",
              }}
            >
              {search
                ? `No union rate sheets found matching "${search}".`
                : "There are currently no union rate sheets in the system."}
            </Typography>
          </CardContent>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <FilterableTableHeaderCell
                    label="Trade"
                    sortKey="trade"
                    filterKey="search"
                    filterType="text"
                    currentSort={sort}
                    currentOrder={order}
                    align="left"
                    sx={headCellSx}
                  />
                  <TableCell sx={{ ...headCellSx, textAlign: "left" }}>
                    Code
                  </TableCell>
                  <FilterableTableHeaderCell
                    label="Union Name"
                    sortKey="unionName"
                    currentSort={sort}
                    currentOrder={order}
                    align="left"
                    sx={headCellSx}
                  />
                  <FilterableTableHeaderCell
                    label="Regular Rate"
                    sortKey="regularRate"
                    currentSort={sort}
                    currentOrder={order}
                    align="right"
                    sx={headCellSx}
                  />
                  <FilterableTableHeaderCell
                    label="Premium Rate"
                    sortKey="premiumRate"
                    currentSort={sort}
                    currentOrder={order}
                    align="right"
                    sx={headCellSx}
                  />
                  <FilterableTableHeaderCell
                    label="Double Rate"
                    sortKey="doubleRate"
                    currentSort={sort}
                    currentOrder={order}
                    align="right"
                    sx={headCellSx}
                  />
                  <TableCell sx={{ ...headCellSx, textAlign: "right" }}>
                    Foreman Reg
                  </TableCell>
                  <TableCell sx={{ ...headCellSx, textAlign: "right" }}>
                    Foreman Prem
                  </TableCell>
                  <FilterableTableHeaderCell
                    label="Effective Date"
                    sortKey="effectiveDate"
                    currentSort={sort}
                    currentOrder={order}
                    align="left"
                    sx={headCellSx}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {rates.map((rate, index) => (
                  <TableRow
                    key={rate.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#F8F7FA",
                      },
                      "&:last-child td": { borderBottom: 0 },
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        fontWeight: 500,
                        color: "#5B5866",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rate.trade}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        color: "#A8AAAE",
                        fontFamily: "'SF Mono', 'Roboto Mono', monospace",
                        fontSize: "0.875rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rate.code || (
                        <Box component="span" sx={{ color: "#DBDADE" }}>
                          -
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ ...bodyCellSx, color: "#5B5866" }}>
                      {rate.unionName || (
                        <Box component="span" sx={{ color: "#DBDADE" }}>
                          -
                        </Box>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        textAlign: "right",
                        fontFamily: "'SF Mono', 'Roboto Mono', monospace",
                        color: "#56CA00",
                        fontWeight: 500,
                        fontSize: "0.9375rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatRate(rate.regularRate)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        textAlign: "right",
                        fontFamily: "'SF Mono', 'Roboto Mono', monospace",
                        color: "#FFB400",
                        fontWeight: 500,
                        fontSize: "0.9375rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatRate(rate.premiumRate)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        textAlign: "right",
                        fontFamily: "'SF Mono', 'Roboto Mono', monospace",
                        color: "#FF4C51",
                        fontWeight: 500,
                        fontSize: "0.9375rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatRate(rate.doubleRate)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        textAlign: "right",
                        fontFamily: "'SF Mono', 'Roboto Mono', monospace",
                        color: "#5B5866",
                        fontWeight: 500,
                        fontSize: "0.9375rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatRate(rate.foremanRegular)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        textAlign: "right",
                        fontFamily: "'SF Mono', 'Roboto Mono', monospace",
                        color: "#5B5866",
                        fontWeight: 500,
                        fontSize: "0.9375rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatRate(rate.foremanPremium)}
                    </TableCell>
                    <TableCell
                      sx={{
                        ...bodyCellSx,
                        color: "#A8AAAE",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(rate.effectiveDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
