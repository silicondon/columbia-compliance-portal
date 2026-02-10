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
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VendorHeader from "@/components/VendorHeader";

export const dynamic = "force-dynamic";

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  task_order: "Task Order",
  term_consultant: "Term Consultant",
  renew_contract: "Renewal Contract",
};

function formatDate(d: Date | null | undefined): string {
  if (!d) return "N/A";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(value: unknown): string {
  if (value === null || value === undefined) return "N/A";
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
}

function contractTypeChip(type: string) {
  const label = CONTRACT_TYPE_LABELS[type] || type;
  const colorMap: Record<string, { bg: string; text: string }> = {
    task_order: { bg: "#E7F4FF", text: "#00A3FF" },
    term_consultant: { bg: "#F4F5FA", text: "#7367F0" },
    renew_contract: { bg: "#E8FAF0", text: "#28C76F" },
  };
  const colors = colorMap[type] || { bg: "#F4F5FA", text: "#A8AAAE" };
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: "none",
        fontWeight: 600,
        fontSize: "0.75rem",
        height: 28,
        borderRadius: 1.5,
        "& .MuiChip-label": {
          px: 1.5,
        },
      }}
    />
  );
}

export default async function VendorContractsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      vmsId: true,
      primaryTrade: true,
      contracts: {
        orderBy: { beginDate: "desc" },
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

  return (
    <Box sx={{ bgcolor: "#F8F7FA", minHeight: "100vh", pb: 6 }}>
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
            Contracts
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
          activeTab="contracts"
          counts={{
            certificates: vendor._count.certificates,
            contracts: vendor._count.contracts,
            rates: vendor._count.rates,
          }}
        />

        {/* Contracts Table */}
        <Card
          sx={{
            boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          {vendor.contracts.length === 0 ? (
            <CardContent
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
                <Typography
                  sx={{
                    fontSize: "2rem",
                    color: "#A8AAAE",
                  }}
                >
                  📄
                </Typography>
              </Box>
              <Typography
                variant="h6"
                sx={{
                  color: "#4B465C",
                  fontWeight: 600,
                  mb: 1,
                  fontSize: "1rem",
                }}
              >
                No contracts found
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
                This vendor does not have any contracts on record.
              </Typography>
            </CardContent>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "#A8AAAE",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        py: 2.5,
                        px: 3,
                        bgcolor: "#FAFBFC",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      Type
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "#A8AAAE",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        py: 2.5,
                        px: 3,
                        bgcolor: "#FAFBFC",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      Title
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "#A8AAAE",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        py: 2.5,
                        px: 3,
                        bgcolor: "#FAFBFC",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      Contract #
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "#A8AAAE",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        py: 2.5,
                        px: 3,
                        bgcolor: "#FAFBFC",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      Begin Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "#A8AAAE",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        py: 2.5,
                        px: 3,
                        bgcolor: "#FAFBFC",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      End Date
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        color: "#A8AAAE",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        textAlign: "right",
                        py: 2.5,
                        px: 3,
                        bgcolor: "#FAFBFC",
                        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      Contract Value
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendor.contracts.map((contract, index) => (
                    <TableRow
                      key={contract.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#FAFBFC",
                          transition: "background-color 0.2s ease",
                        },
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          py: 2.5,
                          px: 3,
                          borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        {contractTypeChip(contract.contractType)}
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 2.5,
                          px: 3,
                          borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        {contract.title ? (
                          <Typography
                            sx={{
                              fontSize: "0.9375rem",
                              color: "#4B465C",
                              fontWeight: 500,
                              lineHeight: 1.5,
                            }}
                          >
                            {contract.title}
                          </Typography>
                        ) : (
                          <Typography
                            component="span"
                            sx={{
                              color: "#DBDADE",
                              fontStyle: "italic",
                              fontSize: "0.9375rem",
                            }}
                          >
                            Untitled
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontSize: "0.875rem",
                          color: "#A8AAAE",
                          fontFamily: "monospace",
                          fontWeight: 500,
                          py: 2.5,
                          px: 3,
                          borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        {contract.contractNumber || "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontSize: "0.9375rem",
                          color: "#A8AAAE",
                          py: 2.5,
                          px: 3,
                          borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        {formatDate(contract.beginDate)}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontSize: "0.9375rem",
                          color: "#A8AAAE",
                          py: 2.5,
                          px: 3,
                          borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        {formatDate(contract.endDate)}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: "nowrap",
                          fontSize: "0.9375rem",
                          color: "#4B465C",
                          textAlign: "right",
                          fontWeight: 600,
                          py: 2.5,
                          px: 3,
                          borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
                        }}
                      >
                        {formatCurrency(contract.saContractValue)}
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
