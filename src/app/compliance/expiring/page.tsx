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

function rowBackgroundColor(days: number | null): string {
  if (days === null) return "#fff";
  if (days < 7) return "#FCE4EC";
  if (days < 30) return "#FFF3E0";
  if (days < 60) return "#FFF8E1";
  return "#fff";
}

export default async function ExpiringCertificatesPage() {
  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 86400000);

  const expiringCerts = await prisma.certificate.findMany({
    where: {
      expirationDate: {
        gte: now,
        lte: in90,
      },
    },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          contactPerson: true,
        },
      },
    },
    orderBy: { expirationDate: "asc" },
  });

  const countUnder7 = expiringCerts.filter((c) => {
    const d = daysUntil(c.expirationDate);
    return d !== null && d < 7;
  }).length;
  const countUnder30 = expiringCerts.filter((c) => {
    const d = daysUntil(c.expirationDate);
    return d !== null && d < 30;
  }).length;

  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#53565A" }}
          >
            Expiring Certificates
          </Typography>
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "#75787B",
              mt: 0.5,
            }}
          >
            Certificates expiring within 90 days ({expiringCerts.length} total)
          </Typography>
        </Box>
        <Link href="/compliance" style={{ textDecoration: 'none' }}>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#D0D0CE",
              color: "#53565A",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              borderRadius: "6px",
              px: 3,
              "&:hover": {
                borderColor: "#75787B",
                backgroundColor: "#F7F8FA",
              },
            }}
          >
            Back to Compliance
          </Button>
        </Link>
      </Stack>

      {/* Urgency Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              backgroundColor: "#FCE4EC",
              border: "1px solid #F8BBD0",
              borderRadius: "8px",
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#AE2573",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Critical (&lt; 7 days)
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#AE2573",
                  mt: 0.5,
                }}
              >
                {countUnder7}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              backgroundColor: "#FFF3E0",
              border: "1px solid #FFE0B2",
              borderRadius: "8px",
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#E65100",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Urgent (&lt; 30 days)
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#E65100",
                  mt: 0.5,
                }}
              >
                {countUnder30}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              backgroundColor: "#FFF8E1",
              border: "1px solid #FFF176",
              borderRadius: "8px",
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#F57F17",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                All within 90 days
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#F57F17",
                  mt: 0.5,
                }}
              >
                {expiringCerts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Color Legend */}
      <Stack
        direction="row"
        sx={{
          gap: 3,
          mb: 2,
          alignItems: "center",
        }}
      >
        <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 12,
              borderRadius: "3px",
              backgroundColor: "#FCE4EC",
              border: "1px solid #F8BBD0",
            }}
          />
          <Typography sx={{ fontSize: "0.75rem", color: "#75787B" }}>
            Less than 7 days
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 12,
              borderRadius: "3px",
              backgroundColor: "#FFF3E0",
              border: "1px solid #FFE0B2",
            }}
          />
          <Typography sx={{ fontSize: "0.75rem", color: "#75787B" }}>
            Less than 30 days
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 12,
              borderRadius: "3px",
              backgroundColor: "#FFF8E1",
              border: "1px solid #FFF176",
            }}
          />
          <Typography sx={{ fontSize: "0.75rem", color: "#75787B" }}>
            Less than 60 days
          </Typography>
        </Stack>
      </Stack>

      {/* Expiring Certificates Table */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: "8px",
          border: "1px solid #D0D0CE",
          overflow: "hidden",
        }}
      >
        {expiringCerts.length === 0 ? (
          <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
            <Alert
              severity="info"
              sx={{
                justifyContent: "center",
                backgroundColor: "#E8F0FE",
                color: "#003087",
              }}
            >
              No certificates expiring within the next 90 days.
            </Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F7F8FA" }}>
                  {[
                    "Vendor",
                    "Coverage Type",
                    "Policy #",
                    "Carrier",
                    "Expiration Date",
                    "Days Remaining",
                    "Contact",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#75787B",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {expiringCerts.map((cert) => {
                  const days = daysUntil(cert.expirationDate);
                  const bgColor = rowBackgroundColor(days);
                  return (
                    <TableRow
                      key={cert.id}
                      sx={{
                        backgroundColor: bgColor,
                        "&:hover": {
                          backgroundColor:
                            bgColor === "#fff" ? "#F7F8FA" : bgColor,
                          filter: bgColor !== "#fff" ? "brightness(0.97)" : "none",
                        },
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Link
                          href={`/vendors/${cert.vendor.id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "#003087",
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            {cert.vendor.name}
                          </Typography>
                        </Link>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography sx={{ fontSize: "0.875rem", color: "#53565A" }}>
                          {cert.coverageType}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            color: "#53565A",
                            fontFamily: "monospace",
                          }}
                        >
                          {cert.policyNumber || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography sx={{ fontSize: "0.875rem", color: "#53565A" }}>
                          {cert.carrierName || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography sx={{ fontSize: "0.875rem", color: "#53565A" }}>
                          {formatDate(cert.expirationDate)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {days !== null ? (
                          <Typography
                            sx={{
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              color:
                                days < 7
                                  ? "#AE2573"
                                  : days < 30
                                    ? "#E65100"
                                    : days < 60
                                      ? "#F57F17"
                                      : "#53565A",
                            }}
                          >
                            {days} days
                          </Typography>
                        ) : (
                          <Typography sx={{ fontSize: "0.875rem", color: "#D0D0CE" }}>
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                          {cert.vendor.contactPerson && (
                            <Typography
                              sx={{
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#53565A",
                              }}
                            >
                              {cert.vendor.contactPerson}
                            </Typography>
                          )}
                          {cert.vendor.email && (
                            <Typography
                              component="a"
                              href={`mailto:${cert.vendor.email}`}
                              sx={{
                                fontSize: "0.875rem",
                                color: "#003087",
                                textDecoration: "none",
                                display: "block",
                                "&:hover": { textDecoration: "underline" },
                              }}
                            >
                              {cert.vendor.email}
                            </Typography>
                          )}
                          {cert.vendor.phone && (
                            <Typography
                              component="a"
                              href={`tel:${cert.vendor.phone}`}
                              sx={{
                                fontSize: "0.875rem",
                                color: "#75787B",
                                textDecoration: "none",
                                display: "block",
                              }}
                            >
                              {cert.vendor.phone}
                            </Typography>
                          )}
                          {!cert.vendor.email && !cert.vendor.phone && (
                            <Typography
                              sx={{
                                fontSize: "0.875rem",
                                color: "#D0D0CE",
                                fontStyle: "italic",
                              }}
                            >
                              No contact info
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
