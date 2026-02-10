import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { brokermaticClient } from '@/lib/brokermatic/smart-coi-client';
import { getColumbiaComplianceRequirements } from '@/lib/insurance-requirements';

/**
 * POST /api/vendors/[id]/request-insurance
 *
 * Submit insurance certificate request to Brokermatic for a vendor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vendorId } = await params;
    const body = await request.json();

    const { brokerEmail, brokerName, projectDescription } = body;

    if (!brokerEmail) {
      return NextResponse.json(
        { message: 'Broker email is required' },
        { status: 400 }
      );
    }

    // Get vendor details
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json(
        { message: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.certificateRequest.findFirst({
      where: {
        vendorId,
        status: {
          in: ['pending', 'fulfilled'],
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          message: 'A certificate request is already pending for this vendor',
          requestId: existingRequest.brokermaticRequestId,
        },
        { status: 409 }
      );
    }

    // Build compliance requirements
    const complianceRequirements = {
      ...getColumbiaComplianceRequirements(
        projectDescription || `General work for Columbia University by ${vendor.name}`
      ),
      insuredName: vendor.name,
    };

    // Create external ID for tracking
    const externalId = `COLUMBIA-VENDOR-${vendorId}`;

    // Submit requirements to Brokermatic
    const brokermaticResponse = await brokermaticClient.submitRequirements(
      complianceRequirements
    );

    console.log('[Request Insurance] Brokermatic response:', {
      requestId: brokermaticResponse.requestId,
      status: brokermaticResponse.status,
      vendorId,
      vendorName: vendor.name,
    });

    // Create certificate request record in our database
    const certRequest = await prisma.certificateRequest.create({
      data: {
        vendorId,
        brokermaticRequestId: brokermaticResponse.requestId,
        externalId,
        status: brokermaticResponse.status,
        legalText: complianceRequirements.projectDescription,
        coverageTypes: Object.keys(complianceRequirements.requirements).filter(
          (key) => complianceRequirements.requirements[key as keyof typeof complianceRequirements.requirements]?.required
        ),
        minimumLimits: complianceRequirements.requirements,
      },
    });

    // Update vendor with broker info and insurance status
    await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        brokerEmail,
        brokerName: brokerName || null,
        insuranceStatus: 'requested',
        insuranceRequestedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      requestId: brokermaticResponse.requestId,
      certificateRequestId: certRequest.id,
      externalId,
      status: brokermaticResponse.status,
      message: 'Insurance certificate request submitted successfully',
    });

  } catch (error) {
    console.error('[Request Insurance] Error:', error);

    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to submit insurance request',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
