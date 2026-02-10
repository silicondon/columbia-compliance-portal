"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import TableChartIcon from "@mui/icons-material/TableChart";

const navItems = [
  { label: "Dashboard", href: "/", icon: <DashboardIcon sx={{ fontSize: 18 }} /> },
  { label: "Vendors", href: "/vendors", icon: <BusinessIcon sx={{ fontSize: 18 }} /> },
  { label: "Compliance", href: "/compliance", icon: <VerifiedUserIcon sx={{ fontSize: 18 }} /> },
  { label: "Union Rates", href: "/rates/union-rates", icon: <TableChartIcon sx={{ fontSize: 18 }} /> },
];

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <Toolbar sx={{ maxWidth: 1280, width: "100%", mx: "auto", px: { xs: 2, sm: 3 } }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 12, marginRight: 32 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: "#B9D9EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.875rem",
              color: "#003087",
              letterSpacing: "-0.02em",
            }}
          >
            CU
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography variant="body1" sx={{ fontWeight: 600, color: "white", lineHeight: 1.2, fontSize: "0.9375rem" }}>
              Vendor Compliance Portal
            </Typography>
            <Typography variant="caption" sx={{ color: "#B9D9EB", lineHeight: 1, fontSize: "0.6875rem" }}>
              Construction &amp; Facilities
            </Typography>
          </Box>
        </Link>

        {/* Navigation */}
        <Box sx={{ display: "flex", gap: 0.5, flexGrow: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.href}
              component={Link}
              href={item.href}
              startIcon={item.icon}
              sx={{
                color: "white",
                fontSize: "0.8125rem",
                fontWeight: isActive(item.href) ? 600 : 400,
                px: 2,
                py: 1,
                borderRadius: 1.5,
                bgcolor: isActive(item.href) ? "rgba(185, 217, 235, 0.15)" : "transparent",
                "&:hover": {
                  bgcolor: "rgba(185, 217, 235, 0.1)",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Status chip */}
        <Chip
          label="Prototype"
          size="small"
          sx={{
            bgcolor: "rgba(185, 217, 235, 0.2)",
            color: "#B9D9EB",
            fontSize: "0.6875rem",
            fontWeight: 500,
            height: 24,
            display: { xs: "none", sm: "flex" },
          }}
        />
      </Toolbar>
    </AppBar>
  );
}
