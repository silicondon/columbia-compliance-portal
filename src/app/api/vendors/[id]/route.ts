import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      certificates: { orderBy: { coverageType: "asc" } },
      contracts: { orderBy: { beginDate: "desc" } },
      rates: { orderBy: { rateCategory: "asc" } },
      insuranceRequirement: true,
    },
  });

  if (!vendor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(vendor);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const vendor = await prisma.vendor.update({ where: { id }, data: body });
  return NextResponse.json(vendor);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.vendor.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
