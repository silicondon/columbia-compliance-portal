"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import Box from "@mui/material/Box";

interface TableHeaderCellProps {
  label?: string;
  children?: React.ReactNode;
  sortKey?: string;
  currentSort?: string;
  currentOrder?: "asc" | "desc";
  align?: "left" | "center" | "right" | "inherit" | "justify";
  sx?: object;
}

export default function TableHeaderCell({
  label,
  children,
  sortKey,
  currentSort,
  currentOrder = "asc",
  align = "left",
  sx = {},
}: TableHeaderCellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const displayLabel = label || children;
  const isSortable = Boolean(sortKey);
  const isActive = currentSort === sortKey;

  // Determine the next sort order
  const nextOrder = isActive && currentOrder === "asc" ? "desc" : "asc";

  // Build the href for sorting - preserves all current search params
  const buildHref = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sortKey!);
    params.set("order", nextOrder);
    return `${pathname}?${params.toString()}`;
  };

  if (!isSortable) {
    return (
      <TableCell align={align} sx={sx}>
        {displayLabel}
      </TableCell>
    );
  }

  return (
    <TableCell align={align} sx={sx}>
      <Link href={buildHref()} style={{ textDecoration: "none", color: "inherit" }}>
        <TableSortLabel
          active={isActive}
          direction={isActive ? currentOrder : "asc"}
          sx={{
            "&.MuiTableSortLabel-root": {
              color: "inherit",
            },
            "&.MuiTableSortLabel-root:hover": {
              color: "#003087",
            },
            "&.Mui-active": {
              color: "#003087",
            },
            "& .MuiTableSortLabel-icon": {
              opacity: 0.5,
            },
            "&.Mui-active .MuiTableSortLabel-icon": {
              opacity: 1,
              color: "#003087",
            },
          }}
        >
          {displayLabel}
          {isActive ? (
            <Box component="span" sx={{ display: "none" }}>
              {currentOrder === "desc" ? "sorted descending" : "sorted ascending"}
            </Box>
          ) : null}
        </TableSortLabel>
      </Link>
    </TableCell>
  );
}
