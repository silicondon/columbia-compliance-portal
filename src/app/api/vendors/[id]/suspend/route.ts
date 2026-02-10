import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { reason } = await request.json();

  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      status: "suspended",
      suspendedDate: new Date(),
      suspendedReason: reason || "Expired insurance certificates",
    },
  });

  return NextResponse.json(vendor);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      status: "active",
      suspendedDate: null,
      suspendedReason: null,
    },
  });

  return NextResponse.json(vendor);
}
