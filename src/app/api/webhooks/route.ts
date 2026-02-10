import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Webhook receiver for Brokermatic events
export async function POST(request: NextRequest) {
  const signature = request.headers.get("X-Brokermatic-Signature");
  const event = request.headers.get("X-Brokermatic-Event");

  if (!signature || !event) {
    return NextResponse.json({ error: "Missing signature or event header" }, { status: 400 });
  }

  // TODO: Verify HMAC-SHA256 signature with webhook secret
  const body = await request.json();

  switch (event) {
    case "certificate.expiring": {
      const { insured, coverageType, daysUntilExpiration } = body.data;
      // Find vendor by Brokermatic insured ID
      const vendor = await prisma.vendor.findFirst({
        where: { brokermaticInsuredId: insured?.id },
      });
      if (vendor) {
        // Update notification date on matching certificate
        await prisma.certificate.updateMany({
          where: { vendorId: vendor.id, coverageType },
          data: { notifiedDate: new Date(), complianceStatus: "expiring" },
        });
        console.log(`[webhook] Certificate expiring: ${vendor.name} - ${coverageType} (${daysUntilExpiration} days)`);
      }
      break;
    }

    case "certificate.expired": {
      const { insured, coverageType } = body.data;
      const vendor = await prisma.vendor.findFirst({
        where: { brokermaticInsuredId: insured?.id },
      });
      if (vendor) {
        await prisma.certificate.updateMany({
          where: { vendorId: vendor.id, coverageType },
          data: { complianceStatus: "expired" },
        });
        console.log(`[webhook] Certificate expired: ${vendor.name} - ${coverageType}`);
      }
      break;
    }

    case "compliance.gap_detected": {
      console.log(`[webhook] Compliance gap: ${JSON.stringify(body.data)}`);
      break;
    }

    default:
      console.log(`[webhook] Unhandled event: ${event}`);
  }

  return NextResponse.json({ received: true });
}
