"use client";

import { createTheme } from "@mui/material/styles";
import { columbia } from "./colors";

const theme = createTheme({
  palette: {
    primary: {
      main: columbia.navyBlue,
      light: columbia.mediumBlue,
      dark: "#001D52",
      contrastText: columbia.white,
    },
    secondary: {
      main: columbia.lightBlue,
      light: columbia.blue,
      dark: "#4A8AC4",
      contrastText: columbia.white,
    },
    error: {
      main: columbia.magenta,
      light: "#D64D93",
      dark: "#7A1A52",
    },
    warning: {
      main: columbia.orange,
      light: "#FFB74D",
      dark: "#E68900",
    },
    success: {
      main: columbia.green,
      light: "#96A82D",
      dark: "#566514",
    },
    grey: {
      100: "#F5F5F4",
      200: columbia.lightGray,
      500: columbia.mediumGray,
      700: columbia.darkGray,
      900: "#2D2F31",
    },
    background: {
      default: "#F8F7FA",
      paper: columbia.white,
    },
    text: {
      primary: columbia.darkGray,
      secondary: columbia.mediumGray,
    },
    divider: columbia.lightGray,
  },
  typography: {
    fontFamily: [
      '"Proxima Nova"',
      '"Helvetica Neue"',
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "1.75rem",
      fontWeight: 700,
      color: columbia.navyBlue,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontSize: "1.375rem",
      fontWeight: 600,
      color: columbia.navyBlue,
    },
    h3: {
      fontSize: "1.125rem",
      fontWeight: 600,
      color: columbia.darkGray,
    },
    h4: {
      fontSize: "1rem",
      fontWeight: 600,
      color: columbia.darkGray,
    },
    body1: {
      fontSize: "0.9375rem",
      color: columbia.darkGray,
    },
    body2: {
      fontSize: "0.8125rem",
      color: columbia.mediumGray,
    },
    caption: {
      fontSize: "0.75rem",
      color: columbia.mediumGray,
      letterSpacing: "0.03em",
    },
    overline: {
      fontSize: "0.6875rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
      color: columbia.mediumGray,
    },
    button: {
      textTransform: "none" as const,
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
    "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
    "0 2px 4px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
    "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
    "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
    "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)",
    ...Array(18).fill("none"),
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "9px 18px",
          fontSize: "0.875rem",
          fontWeight: 500,
          boxShadow: "none",
          transition: "all 0.2s",
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#00408F",
            boxShadow: "0 4px 6px -1px rgba(0, 48, 135, 0.2), 0 2px 4px -1px rgba(0, 48, 135, 0.1)",
          },
        },
        outlined: {
          borderWidth: "1.5px",
          "&:hover": {
            borderWidth: "1.5px",
            backgroundColor: "rgba(0, 48, 135, 0.04)",
          },
        },
        sizeSmall: {
          padding: "6px 14px",
          fontSize: "0.8125rem",
        },
        sizeLarge: {
          padding: "11px 22px",
          fontSize: "0.9375rem",
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: `1px solid #EBEEF0`,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: `1px solid #EBEEF0`,
          borderRadius: 12,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
          backgroundImage: "none",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: "0.75rem",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            fontWeight: 600,
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase" as const,
            color: "#8E8E93",
            backgroundColor: "#FAFAFA",
            borderBottom: `1px solid #F0F0F0`,
            padding: "16px 20px",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: "#FAFAFA",
          },
          "&:last-child td": {
            borderBottom: 0,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          borderColor: "#F5F5F5",
          padding: "16px 20px",
          color: columbia.darkGray,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: "hidden",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none" as const,
          fontWeight: 500,
          fontSize: "0.9375rem",
          minHeight: 48,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: columbia.navyBlue,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small" as const,
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: columbia.white,
            transition: "all 0.2s ease",
            "& fieldset": {
              borderColor: "#EBEEF0",
              borderWidth: "1px",
            },
            "&:hover fieldset": {
              borderColor: "#D0D5DD",
            },
            "&.Mui-focused fieldset": {
              borderColor: columbia.navyBlue,
              borderWidth: "1.5px",
            },
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#8E8E93",
          },
          "& .MuiInputBase-input": {
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small" as const,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: columbia.mediumBlue,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardWarning: {
          backgroundColor: "#FFF8E1",
          border: "1px solid #FFE082",
        },
        standardError: {
          backgroundColor: "#FCE4EC",
          border: `1px solid ${columbia.magenta}33`,
        },
        standardSuccess: {
          backgroundColor: "#F1F8E9",
          border: `1px solid ${columbia.green}44`,
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontSize: "0.8125rem",
        },
      },
    },
  },
});

export { columbia, theme };
