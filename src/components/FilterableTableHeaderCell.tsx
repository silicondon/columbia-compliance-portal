"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterableTableHeaderCellProps {
  label: string;
  sortKey?: string;
  filterKey?: string;
  filterType?: "text" | "select";
  filterOptions?: FilterOption[];
  currentSort?: string;
  currentOrder?: "asc" | "desc";
  align?: "left" | "center" | "right" | "inherit" | "justify";
  sx?: object;
}

export default function FilterableTableHeaderCell({
  label,
  sortKey,
  filterKey,
  filterType = "text",
  filterOptions = [],
  currentSort,
  currentOrder = "asc",
  align = "left",
  sx = {},
}: FilterableTableHeaderCellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filterValue, setFilterValue] = useState("");

  const isSortable = Boolean(sortKey);
  const isFilterable = Boolean(filterKey);
  const isActive = currentSort === sortKey;

  // Load current filter value from URL
  useEffect(() => {
    if (filterKey) {
      setFilterValue(searchParams.get(filterKey) || "");
    }
  }, [searchParams, filterKey]);

  // Determine the next sort order
  const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";

  // Build URL with sort parameters
  const buildSortUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortKey!);
    params.set("order", nextOrder);
    return `${pathname}?${params.toString()}`;
  };

  // Handle sort click
  const handleSortClick = () => {
    if (isSortable) {
      router.push(buildSortUrl());
    }
  };

  // Apply filter
  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set(filterKey!, value.trim());
    } else {
      params.delete(filterKey!);
    }
    // Reset to page 1 when filtering
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Clear filter
  const handleClearFilter = () => {
    setFilterValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete(filterKey!);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <TableCell
      align={align}
      sx={{
        ...sx,
        verticalAlign: "top",
        px: 3,
        py: 2,
        bgcolor: "#FAFAFA",
        borderBottom: "1px solid #F0F0F0",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {/* Label with sort */}
        {isSortable ? (
          <TableSortLabel
            active={isActive}
            direction={isActive ? currentOrder : "asc"}
            onClick={handleSortClick}
            sx={{
              width: "fit-content",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#8E8E93",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              "&.MuiTableSortLabel-root": {
                color: "#8E8E93",
              },
              "&.MuiTableSortLabel-root:hover": {
                color: "#003087",
              },
              "&.Mui-active": {
                color: "#003087",
              },
              "& .MuiTableSortLabel-icon": {
                opacity: 0.4,
                fontSize: "1rem",
              },
              "&.Mui-active .MuiTableSortLabel-icon": {
                opacity: 1,
                color: "#003087",
              },
            }}
          >
            {label}
            {isActive ? (
              <Box component="span" sx={{ display: "none" }}>
                {currentOrder === "desc" ? "sorted descending" : "sorted ascending"}
              </Box>
            ) : null}
          </TableSortLabel>
        ) : (
          <Box
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#8E8E93",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </Box>
        )}

        {/* Inline filter */}
        {isFilterable && (
          filterType === "text" ? (
            <TextField
              value={filterValue}
              onChange={(e) => handleFilterChange(e.target.value)}
              placeholder={`Filter...`}
              size="small"
              fullWidth
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: "0.875rem",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                },
                "& .MuiOutlinedInput-input": {
                  py: 0.75,
                  px: 1.5,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#F0F0F0",
                  borderWidth: "1px",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E0E0E0",
                },
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#003087",
                  borderWidth: "1px",
                },
              }}
              InputProps={{
                endAdornment: filterValue ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearFilter}
                      sx={{
                        padding: "4px",
                        "&:hover": { color: "#003087", bgcolor: "#F8F7FA" },
                      }}
                    >
                      <ClearIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          ) : (
            <TextField
              select
              value={filterValue}
              onChange={(e) => handleFilterChange(e.target.value)}
              size="small"
              fullWidth
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: "0.875rem",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                },
                "& .MuiOutlinedInput-input": {
                  py: 0.75,
                  px: 1.5,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#F0F0F0",
                  borderWidth: "1px",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E0E0E0",
                },
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#003087",
                  borderWidth: "1px",
                },
              }}
            >
              <MenuItem value="">All</MenuItem>
              {filterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )
        )}
      </Box>
    </TableCell>
  );
}
