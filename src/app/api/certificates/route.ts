import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getBrokermaticClient } from "@/lib/brokermatic/client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { vendorId, coverageType, policyNumber, carrierName, aggregateAmount, eachOccurrenceAmount, effectiveDate, expirationDate } = body;

  // Create local certificate record
  const certificate = await prisma.certificate.create({
    data: {
      vendorId,
      coverageType,
      policyNumber,
      carrierName,
      aggregateAmount,
      eachOccurrenceAmount,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      complianceStatus: "pending",
    },
  });

  // Sync to Brokermatic (mock for now)
  try {
    const client = getBrokermaticClient();
    const bmCert = await client.createCertificate({
      insuredId: body.brokermaticInsuredId || "mock",
      source: "manual_entry",
      coverages: [
        {
          type: coverageType,
          policyNumber,
          carrierName,
          effectiveDate: effectiveDate || new Date().toISOString(),
          expirationDate: expirationDate || new Date().toISOString(),
          limits: {
            aggregate: aggregateAmount || 0,
            eachOccurrence: eachOccurrenceAmount || 0,
          },
          flags: {},
        },
      ],
    });

    await prisma.certificate.update({
      where: { id: certificate.id },
      data: { brokermaticCertId: bmCert.id, complianceStatus: bmCert.complianceStatus },
    });
  } catch {
    // Brokermatic sync failed - certificate still saved locally
  }

  return NextResponse.json(certificate, { status: 201 });
}
