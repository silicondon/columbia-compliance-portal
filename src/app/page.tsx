import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import VerifiedIcon from "@mui/icons-material/Verified";
import DescriptionIcon from "@mui/icons-material/Description";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import { columbia } from "@/lib/colors";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalVendors, activeVendors, suspendedVendors, exemptVendors, allCerts] = await Promise.all([
    prisma.vendor.count(),
    prisma.vendor.count({ where: { status: "active" } }),
    prisma.vendor.count({ where: { status: "suspended" } }),
    prisma.vendor.count({ where: { exemptFromInsurance: true } }),
    prisma.certificate.findMany({ select: { complianceStatus: true, expirationDate: true } }),
  ]);

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 86400000);
  const in60 = new Date(now.getTime() + 60 * 86400000);
  const in90 = new Date(now.getTime() + 90 * 86400000);

  return {
    totalVendors,
    activeVendors,
    suspendedVendors,
    exemptVendors,
    totalCerts: allCerts.length,
    compliant: allCerts.filter((c) => c.complianceStatus === "compliant").length,
    expired: allCerts.filter((c) => c.expirationDate && c.expirationDate < now).length,
    expiring30: allCerts.filter((c) => c.expirationDate && c.expirationDate >= now && c.expirationDate <= in30).length,
    expiring60: allCerts.filter((c) => c.expirationDate && c.expirationDate >= now && c.expirationDate <= in60).length,
    expiring90: allCerts.filter((c) => c.expirationDate && c.expirationDate >= now && c.expirationDate <= in90).length,
  };
}

export default async function Dashboard() {
  const s = await getStats();

  const vendorCards: {
    label: string;
    value: number;
    icon: React.ReactNode;
    pastelBg: string;
    iconColor: string;
    href: string
  }[] = [
    {
      label: "Total Vendors",
      value: s.totalVendors,
      icon: <BusinessIcon />,
      pastelBg: columbia.pastel.blue,
      iconColor: columbia.pastel.blueDark,
      href: "/vendors"
    },
    {
      label: "Active",
      value: s.activeVendors,
      icon: <CheckCircleIcon />,
      pastelBg: columbia.pastel.green,
      iconColor: columbia.pastel.greenDark,
      href: "/vendors?status=active"
    },
    {
      label: "Suspended",
      value: s.suspendedVendors,
      icon: <BlockIcon />,
      pastelBg: columbia.pastel.coral,
      iconColor: columbia.pastel.coralDark,
      href: "/vendors?status=suspended"
    },
    {
      label: "Exempt",
      value: s.exemptVendors,
      icon: <VerifiedIcon />,
      pastelBg: columbia.pastel.purple,
      iconColor: columbia.pastel.purpleDark,
      href: "/vendors?exempt=true"
    },
  ];

  const certCards: {
    label: string;
    value: number;
    icon: React.ReactNode;
    pastelBg: string;
    iconColor: string
  }[] = [
    {
      label: "Total Certs",
      value: s.totalCerts,
      icon: <DescriptionIcon />,
      pastelBg: columbia.pastel.blue,
      iconColor: columbia.pastel.blueDark
    },
    {
      label: "Compliant",
      value: s.compliant,
      icon: <EventAvailableIcon />,
      pastelBg: columbia.pastel.green,
      iconColor: columbia.pastel.greenDark
    },
    {
      label: "Expired",
      value: s.expired,
      icon: <ErrorIcon />,
      pastelBg: columbia.pastel.coral,
      iconColor: columbia.pastel.coralDark
    },
    {
      label: "< 30 days",
      value: s.expiring30,
      icon: <WarningIcon />,
      pastelBg: columbia.pastel.yellow,
      iconColor: columbia.pastel.yellowDark
    },
    {
      label: "< 60 days",
      value: s.expiring60,
      icon: <WarningIcon />,
      pastelBg: columbia.pastel.yellow,
      iconColor: columbia.pastel.yellowDark
    },
    {
      label: "< 90 days",
      value: s.expiring90,
      icon: <WarningIcon />,
      pastelBg: columbia.pastel.yellow,
      iconColor: columbia.pastel.yellowDark
    },
  ];

  const quickActions: {
    label: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    pastelBg: string;
    iconColor: string
  }[] = [
    {
      label: "Expiring Certificates",
      description: `${s.expiring30} within 30 days`,
      href: "/compliance/expiring",
      icon: <NotificationsActiveIcon />,
      pastelBg: columbia.pastel.yellow,
      iconColor: columbia.pastel.yellowDark,
    },
    {
      label: "Suspended Vendors",
      description: `${s.suspendedVendors} need attention`,
      href: "/vendors?status=suspended",
      icon: <BlockIcon />,
      pastelBg: columbia.pastel.coral,
      iconColor: columbia.pastel.coralDark,
    },
    {
      label: "All Vendors",
      description: `${s.totalVendors} total vendors`,
      href: "/vendors",
      icon: <PeopleIcon />,
      pastelBg: columbia.pastel.blue,
      iconColor: columbia.pastel.blueDark,
    },
  ];

  const systems: { name: string; status: string; chipColor: "warning" | "default" }[] = [
    { name: "Brokermatic API", status: "Mock Mode", chipColor: "warning" },
    { name: "Financial System (ARC)", status: "Not Connected", chipColor: "default" },
    { name: "Maximo (CMMS)", status: "Not Connected", chipColor: "default" },
    { name: "Unifier", status: "Not Connected", chipColor: "default" },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h1"
          sx={{
            mb: 1,
            fontSize: "2rem",
            fontWeight: 600,
            color: columbia.navyBlue,
          }}
        >
          Compliance Dashboard
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: columbia.mediumGray,
            fontSize: "0.9375rem",
            maxWidth: 600,
          }}
        >
          Monitor vendor compliance, track certificate status, and manage system integrations
        </Typography>
      </Box>

      {/* Vendor Stat Cards */}
      <Grid container spacing={4} sx={{ mb: 5 }}>
        {vendorCards.map((c) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={c.label}>
            <Link href={c.href} style={{ textDecoration: "none" }}>
              <Card
                sx={{
                  p: 0,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.05)",
                  "&:hover": {
                    boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.1)",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        backgroundColor: c.pastelBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "& svg": {
                          fontSize: "1.5rem",
                          color: c.iconColor,
                        },
                      }}
                    >
                      {c.icon}
                    </Box>
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: "2rem",
                      fontWeight: 600,
                      color: columbia.navyBlue,
                      mb: 0.5,
                      lineHeight: 1.2,
                    }}
                  >
                    {c.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: columbia.mediumGray,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {c.label}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* Certificate Compliance Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            mb: 1,
            fontSize: "1.375rem",
            fontWeight: 600,
            color: columbia.navyBlue,
          }}
        >
          Certificate Compliance
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: columbia.mediumGray,
            fontSize: "0.875rem",
          }}
        >
          Real-time overview of certificate statuses and expiration tracking
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {certCards.map((c) => (
          <Grid size={{ xs: 6, sm: 4, md: 4, lg: 2 }} key={c.label}>
            <Card
              sx={{
                p: 0,
                transition: "all 0.2s ease",
                boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.05)",
                "&:hover": {
                  boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.1)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      backgroundColor: c.pastelBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "& svg": {
                        fontSize: "1.25rem",
                        color: c.iconColor,
                      },
                    }}
                  >
                    {c.icon}
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    lineHeight: 1.2,
                    color: columbia.navyBlue,
                    mb: 0.5,
                  }}
                >
                  {c.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: columbia.mediumGray,
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                >
                  {c.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bottom Row: Quick Actions + System Integration */}
      <Grid container spacing={5}>
        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 0,
              height: "100%",
              boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <CardContent sx={{ p: 4, "&:last-child": { pb: 4 } }}>
              <Typography
                variant="h3"
                sx={{
                  mb: 0.5,
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: columbia.navyBlue,
                }}
              >
                Quick Actions
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: columbia.mediumGray,
                  mb: 3.5,
                  fontSize: "0.875rem",
                }}
              >
                Common tasks and shortcuts
              </Typography>
              <Stack spacing={2.5}>
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href} style={{ textDecoration: "none" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5,
                        p: 2.5,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 2,
                        border: "1px solid #EBEEF0",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.1)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          backgroundColor: action.pastelBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          "& svg": {
                            fontSize: "1.5rem",
                            color: action.iconColor,
                          },
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.9375rem",
                            color: columbia.navyBlue,
                            mb: 0.25,
                          }}
                        >
                          {action.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.8125rem",
                            color: columbia.mediumGray,
                          }}
                        >
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Link>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* System Integration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 0,
              height: "100%",
              boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <CardContent sx={{ p: 4, "&:last-child": { pb: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: columbia.pastel.purple,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& svg": {
                      fontSize: "1.25rem",
                      color: columbia.pastel.purpleDark,
                    },
                  }}
                >
                  <SettingsIcon />
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: columbia.navyBlue,
                  }}
                >
                  System Integration
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: columbia.mediumGray,
                  mb: 3.5,
                  fontSize: "0.875rem",
                  pl: 5.5,
                }}
              >
                External system connection status
              </Typography>
              <Stack spacing={0}>
                {systems.map((sys, index) => (
                  <Box key={sys.name}>
                    {index > 0 && <Divider sx={{ borderColor: "#F5F5F5" }} />}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 2.5,
                        transition: "background-color 0.15s ease",
                        px: 2,
                        mx: -2,
                        borderRadius: 1.5,
                        "&:hover": {
                          backgroundColor: "#FAFAFA",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: columbia.darkGray,
                          fontWeight: 500,
                          fontSize: "0.875rem",
                        }}
                      >
                        {sys.name}
                      </Typography>
                      <Chip
                        label={sys.status}
                        size="small"
                        color={sys.chipColor}
                        variant={sys.chipColor === "default" ? "outlined" : "filled"}
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          ...(sys.chipColor === "default" && {
                            backgroundColor: "#F9FAFB",
                            borderColor: "#E5E7EB",
                            color: columbia.mediumGray,
                            borderWidth: "1px",
                          }),
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
