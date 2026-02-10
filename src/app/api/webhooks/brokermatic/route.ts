import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import type { WebhookPayload } from '@/lib/brokermatic/smart-coi-client';

/**
 * Brokermatic Webhook Endpoint
 *
 * Receives real-time events from Brokermatic:
 * - certificate.issued
 * - certificate.updated
 * - certificate.expiring
 * - certificate.expired
 * - policy.cancelled
 * - policy.renewed
 * - compliance.gap
 */

/**
 * Verify webhook signature from Brokermatic
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Handle certificate.issued event
 */
async function handleCertificateIssued(payload: WebhookPayload) {
  const { certificate, requestId } = payload.data;

  console.log('[Webhook] Certificate issued:', {
    certificateId: certificate.id,
    requestId,
    insured: certificate.namedInsured.name,
    complianceStatus: certificate.complianceStatus,
  });

  // Find the certificate request in our database
  if (requestId) {
    // Update certificate request with brokermatic request ID
    const certRequest = await prisma.certificateRequest.findFirst({
      where: {
        brokermaticRequestId: requestId,
      },
      include: {
        vendor: true,
      },
    });

    if (certRequest) {
      // Update request status
      await prisma.certificateRequest.update({
        where: { id: certRequest.id },
        data: {
          status: certificate.complianceStatus === 'compliant' ? 'compliant' : 'non_compliant',
          uploadedAt: new Date(),
          validatedAt: new Date(),
          complianceResult: {
            overallStatus: certificate.complianceStatus,
            certificate,
          },
        },
      });

      // Update vendor insurance status
      await prisma.vendor.update({
        where: { id: certRequest.vendorId },
        data: {
          insuranceStatus: certificate.complianceStatus,
          insuranceComplianceAt: certificate.complianceStatus === 'compliant' ? new Date() : null,
        },
      });

      // TODO: Download and store certificate PDF
      // const pdfUrl = await brokermaticClient.downloadCertificate(certificate.id);
      // await storeCertificatePDF(certRequest.id, pdfUrl);

      console.log('[Webhook] Updated vendor insurance status:', {
        vendorId: certRequest.vendorId,
        vendorName: certRequest.vendor.name,
        status: certificate.complianceStatus,
      });
    }
  }
}

/**
 * Handle certificate.updated event
 */
async function handleCertificateUpdated(payload: WebhookPayload) {
  const { certificate, changes } = payload.data;

  console.log('[Webhook] Certificate updated:', {
    certificateId: certificate.id,
    changes: changes?.map(c => c.field),
  });

  // Find vendors with this certificate
  const certRequests = await prisma.certificateRequest.findMany({
    where: {
      complianceResult: {
        path: ['certificate', 'id'],
        equals: certificate.id,
      },
    },
    include: {
      vendor: true,
    },
  });

  for (const request of certRequests) {
    // Update stored certificate data
    await prisma.certificateRequest.update({
      where: { id: request.id },
      data: {
        complianceResult: {
          ...request.complianceResult as object,
          certificate,
          lastUpdated: new Date().toISOString(),
        },
      },
    });

    // Update vendor status if compliance changed
    if (changes?.some(c => c.field === 'complianceStatus')) {
      await prisma.vendor.update({
        where: { id: request.vendorId },
        data: {
          insuranceStatus: certificate.complianceStatus,
        },
      });
    }
  }
}

/**
 * Handle certificate.expiring event
 */
async function handleCertificateExpiring(payload: WebhookPayload) {
  const { certificate, daysRemaining } = payload.data;

  console.log('[Webhook] Certificate expiring:', {
    certificateId: certificate.id,
    insured: certificate.namedInsured.name,
    daysRemaining,
  });

  // Find vendors with this certificate
  const certRequests = await prisma.certificateRequest.findMany({
    where: {
      complianceResult: {
        path: ['certificate', 'id'],
        equals: certificate.id,
      },
    },
    include: {
      vendor: true,
    },
  });

  for (const request of certRequests) {
    // Update vendor status to show expiration warning
    await prisma.vendor.update({
      where: { id: request.vendorId },
      data: {
        insuranceStatus: 'expiring_soon',
      },
    });

    // TODO: Send notification email to vendor
    // await sendExpirationNotification(request.vendor, daysRemaining);
  }
}

/**
 * Handle certificate.expired event
 */
async function handleCertificateExpired(payload: WebhookPayload) {
  const { certificate } = payload.data;

  console.log('[Webhook] Certificate expired:', {
    certificateId: certificate.id,
    insured: certificate.namedInsured.name,
  });

  // Find vendors with this certificate
  const certRequests = await prisma.certificateRequest.findMany({
    where: {
      complianceResult: {
        path: ['certificate', 'id'],
        equals: certificate.id,
      },
    },
    include: {
      vendor: true,
    },
  });

  for (const request of certRequests) {
    // Update vendor status to expired
    await prisma.vendor.update({
      where: { id: request.vendorId },
      data: {
        insuranceStatus: 'expired',
        insuranceComplianceAt: null,
      },
    });

    // TODO: Send urgent notification email
    // await sendExpiredNotification(request.vendor);
  }
}

/**
 * Handle compliance.gap event
 */
async function handleComplianceGap(payload: WebhookPayload) {
  const { certificate, gaps } = payload.data;

  console.log('[Webhook] Compliance gap detected:', {
    certificateId: certificate.id,
    insured: certificate.namedInsured.name,
    gaps: gaps?.map(g => g.message),
  });

  // Find vendors with this certificate
  const certRequests = await prisma.certificateRequest.findMany({
    where: {
      complianceResult: {
        path: ['certificate', 'id'],
        equals: certificate.id,
      },
    },
    include: {
      vendor: true,
    },
  });

  for (const request of certRequests) {
    // Update certificate request with gap details
    await prisma.certificateRequest.update({
      where: { id: request.id },
      data: {
        status: 'non_compliant',
        complianceResult: {
          ...request.complianceResult as object,
          gaps,
          lastChecked: new Date().toISOString(),
        },
      },
    });

    // Update vendor status
    await prisma.vendor.update({
      where: { id: request.vendorId },
      data: {
        insuranceStatus: 'non_compliant',
        insuranceComplianceAt: null,
      },
    });
  }
}

/**
 * POST /api/webhooks/brokermatic
 *
 * Receive webhook events from Brokermatic
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const payload: WebhookPayload = JSON.parse(rawBody);

    // Verify webhook signature
    const signature = request.headers.get('x-brokermatic-signature');
    const webhookSecret = process.env.BROKERMATIC_WEBHOOK_SECRET || 'mock_webhook_secret';

    if (signature && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('[Webhook] Received event:', payload.event, {
      id: payload.id,
      timestamp: payload.timestamp,
    });

    // Route to appropriate handler
    switch (payload.event) {
      case 'certificate.issued':
        await handleCertificateIssued(payload);
        break;

      case 'certificate.updated':
        await handleCertificateUpdated(payload);
        break;

      case 'certificate.expiring':
        await handleCertificateExpiring(payload);
        break;

      case 'certificate.expired':
        await handleCertificateExpired(payload);
        break;

      case 'policy.cancelled':
      case 'policy.renewed':
        // Handle similarly to certificate.updated
        await handleCertificateUpdated(payload);
        break;

      case 'compliance.gap':
        await handleComplianceGap(payload);
        break;

      default:
        console.warn('[Webhook] Unknown event type:', payload.event);
    }

    // Always respond with 200 OK quickly
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);

    // Still return 200 to prevent Brokermatic from retrying
    // Log the error for investigation
    return NextResponse.json(
      { received: true, error: 'Processing error logged' },
      { status: 200 }
    );
  }
}

/**
 * GET /api/webhooks/brokermatic
 *
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/brokermatic',
    events: [
      'certificate.issued',
      'certificate.updated',
      'certificate.expiring',
      'certificate.expired',
      'policy.cancelled',
      'policy.renewed',
      'compliance.gap',
    ],
  });
}
