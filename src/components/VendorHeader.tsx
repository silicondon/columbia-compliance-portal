import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

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

interface Tab {
  label: string;
  href: string;
  active: boolean;
  count?: number;
}

interface VendorHeaderProps {
  vendor: {
    id: string;
    name: string;
    status: string;
    vmsId: string;
    primaryTrade: string | null;
  };
  activeTab: "general" | "insurance" | "contracts" | "rates";
  counts: {
    certificates: number;
    contracts: number;
    rates: number;
  };
}

export default function VendorHeader({
  vendor,
  activeTab,
  counts,
}: VendorHeaderProps) {
  const tabs: Tab[] = [
    {
      label: "General Info",
      href: `/vendors/${vendor.id}`,
      active: activeTab === "general",
    },
    {
      label: "Insurance",
      href: `/vendors/${vendor.id}/insurance`,
      active: activeTab === "insurance",
      count: counts.certificates,
    },
    {
      label: "Contracts",
      href: `/vendors/${vendor.id}/contracts`,
      active: activeTab === "contracts",
      count: counts.contracts,
    },
    {
      label: "Rates",
      href: `/vendors/${vendor.id}/rates`,
      active: activeTab === "rates",
      count: counts.rates,
    },
  ];

  return (
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
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 600,
                color: "#4B465C",
                fontSize: "1.375rem",
                letterSpacing: "-0.01em",
              }}
            >
              {vendor.name}
            </Typography>
            <StatusBadge status={vendor.status} />
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mt: 1.5 }}
          >
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
          </Stack>
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
          <Link
            key={tab.label}
            href={tab.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
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
  );
}
