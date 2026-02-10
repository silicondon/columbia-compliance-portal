import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status");
  const trade = searchParams.get("trade");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 25;

  const where: Record<string, unknown> = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (status) where.status = status;
  if (trade) where.primaryTrade = trade;

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: { _count: { select: { certificates: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vendor.count({ where }),
  ]);

  return NextResponse.json({ vendors, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const vendor = await prisma.vendor.create({ data: body });
  return NextResponse.json(vendor, { status: 201 });
}
