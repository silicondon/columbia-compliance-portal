import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import Box from "@mui/material/Box";
import ThemeProvider from "@/components/ThemeProvider";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Columbia University - Vendor Compliance Portal",
  description: "Vendor management, insurance certificate tracking, and compliance monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <NavBar />
            <Box
              component="main"
              sx={{
                maxWidth: 1280,
                mx: "auto",
                px: { xs: 2, sm: 3 },
                py: 4,
              }}
            >
              {children}
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
