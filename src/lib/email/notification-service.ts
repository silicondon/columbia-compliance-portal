/**
 * Notification Service
 *
 * Handles triggering email notifications based on certificate status
 */

import { prisma } from '@/lib/db';
import { sendEmail, sendBulkEmail } from './email-service';
import {
  certificateExpiringTemplate,
  certificateExpiredTemplate,
  nonCompliantNotificationTemplate,
  pendingRequestReminderTemplate,
} from './templates';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Check for expiring certificates and send notifications
 */
export async function checkExpiringCertificates() {
  console.log('[Notification Service] Checking for expiring certificates...');

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  // Find certificates expiring within 90 days that haven't been notified recently
  const expiringCertificates = await prisma.certificate.findMany({
    where: {
      expirationDate: {
        gte: now,
        lte: in90Days,
      },
      OR: [
        { notifiedDate: null },
        { notifiedDate: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }, // Not notified in last 7 days
      ],
    },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  console.log(`[Notification Service] Found ${expiringCertificates.length} expiring certificates`);

  const notifications: string[] = [];

  for (const cert of expiringCertificates) {
    const daysUntilExpiration = Math.ceil(
      (new Date(cert.expirationDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Only send at specific intervals: 90, 60, 30 days
    const shouldNotify =
      daysUntilExpiration === 90 ||
      daysUntilExpiration === 60 ||
      daysUntilExpiration === 30 ||
      daysUntilExpiration <= 30; // Daily for last 30 days

    if (!shouldNotify) continue;

    const recipients = getNotificationRecipients();

    const result = await sendEmail({
      to: recipients,
      subject: `Certificate Expiring Soon: ${cert.vendor.name} - ${cert.coverageType}`,
      html: certificateExpiringTemplate({
        vendorName: cert.vendor.name,
        coverageType: cert.coverageType,
        policyNumber: cert.policyNumber || 'N/A',
        expirationDate: cert.expirationDate!.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        daysUntilExpiration,
        certificateUrl: `${BASE_URL}/certificates/${cert.id}`,
      }),
    });

    if (result.success) {
      // Update notified date
      await prisma.certificate.update({
        where: { id: cert.id },
        data: { notifiedDate: now },
      });

      notifications.push(`Sent expiration notice for ${cert.vendor.name} - ${cert.coverageType}`);
    }
  }

  return notifications;
}

/**
 * Check for expired certificates and send urgent notifications
 */
export async function checkExpiredCertificates() {
  console.log('[Notification Service] Checking for expired certificates...');

  const now = new Date();

  // Find certificates that expired in the last day (to send immediate notification)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const expiredCertificates = await prisma.certificate.findMany({
    where: {
      expirationDate: {
        gte: yesterday,
        lt: now,
      },
      complianceStatus: { not: 'expired' }, // Not already marked as expired
    },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  console.log(`[Notification Service] Found ${expiredCertificates.length} newly expired certificates`);

  const notifications: string[] = [];

  for (const cert of expiredCertificates) {
    const daysOverdue = Math.ceil(
      (now.getTime() - new Date(cert.expirationDate!).getTime()) / (1000 * 60 * 60 * 24)
    );

    const recipients = getNotificationRecipients();

    const result = await sendEmail({
      to: recipients,
      subject: `URGENT: Certificate Expired - ${cert.vendor.name}`,
      html: certificateExpiredTemplate({
        vendorName: cert.vendor.name,
        coverageType: cert.coverageType,
        policyNumber: cert.policyNumber || 'N/A',
        expirationDate: cert.expirationDate!.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        daysOverdue,
        vendorUrl: `${BASE_URL}/vendors/${cert.vendor.id}/insurance`,
      }),
    });

    if (result.success) {
      // Update compliance status to expired
      await prisma.certificate.update({
        where: { id: cert.id },
        data: {
          complianceStatus: 'expired',
          notifiedDate: now,
        },
      });

      // Update vendor insurance status
      await prisma.vendor.update({
        where: { id: cert.vendorId },
        data: { insuranceStatus: 'expired' },
      });

      notifications.push(`Sent expiration alert for ${cert.vendor.name} - ${cert.coverageType}`);
    }
  }

  return notifications;
}

/**
 * Check for non-compliant certificates and send notifications
 */
export async function checkNonCompliantCertificates() {
  console.log('[Notification Service] Checking for non-compliant certificates...');

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Find vendors with non_compliant status updated in last 24 hours
  const nonCompliantVendors = await prisma.vendor.findMany({
    where: {
      insuranceStatus: 'non_compliant',
      updatedAt: {
        gte: oneDayAgo,
      },
    },
    include: {
      certificateRequests: {
        where: {
          status: 'non_compliant',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  console.log(`[Notification Service] Found ${nonCompliantVendors.length} newly non-compliant vendors`);

  const notifications: string[] = [];

  for (const vendor of nonCompliantVendors) {
    const latestRequest = vendor.certificateRequests[0];
    if (!latestRequest || !latestRequest.complianceResult) continue;

    // Parse compliance gaps
    const complianceResult = latestRequest.complianceResult as any;
    const gaps: string[] = [];

    if (complianceResult.coverageResults) {
      complianceResult.coverageResults.forEach((coverage: any) => {
        if (!coverage.found) {
          gaps.push(`Missing required coverage: ${coverage.coverageType.replace(/_/g, ' ')}`);
        } else if (!coverage.limitsPass && coverage.limitsGaps) {
          coverage.limitsGaps.forEach((gap: any) => {
            gaps.push(
              `${coverage.coverageType.replace(/_/g, ' ')}: ${gap.limitName} is insufficient (required: $${gap.required.toLocaleString()}, actual: $${gap.actual.toLocaleString()})`
            );
          });
        }
      });
    }

    if (gaps.length === 0) {
      gaps.push('Certificate does not meet Columbia University requirements');
    }

    const recipients = getNotificationRecipients();

    const result = await sendEmail({
      to: recipients,
      subject: `Non-Compliant Certificate: ${vendor.name}`,
      html: nonCompliantNotificationTemplate({
        vendorName: vendor.name,
        vendorId: vendor.id,
        complianceGaps: gaps,
        vendorUrl: `${BASE_URL}/vendors/${vendor.id}/insurance`,
      }),
    });

    if (result.success) {
      notifications.push(`Sent non-compliance notice for ${vendor.name}`);
    }
  }

  return notifications;
}

/**
 * Check for pending certificate requests and send reminders
 */
export async function checkPendingRequests() {
  console.log('[Notification Service] Checking for pending certificate requests...');

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Find requests pending for 7 or 14 days
  const pendingRequests = await prisma.certificateRequest.findMany({
    where: {
      status: { in: ['pending', 'fulfilled'] },
      createdAt: {
        lte: sevenDaysAgo,
      },
    },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          brokerEmail: true,
          brokerName: true,
        },
      },
    },
  });

  console.log(`[Notification Service] Found ${pendingRequests.length} pending requests`);

  const notifications: string[] = [];

  for (const request of pendingRequests) {
    const daysPending = Math.ceil(
      (now.getTime() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Send reminders at 7, 14, 21, 28 days
    if (daysPending % 7 !== 0) continue;

    const recipients = getNotificationRecipients();

    const result = await sendEmail({
      to: recipients,
      subject: `Pending Certificate Request: ${request.vendor.name} (${daysPending} days)`,
      html: pendingRequestReminderTemplate({
        vendorName: request.vendor.name,
        brokerEmail: request.vendor.brokerEmail || 'Not provided',
        brokerName: request.vendor.brokerName || '',
        requestedDate: request.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        daysPending,
        vendorUrl: `${BASE_URL}/vendors/${request.vendor.id}/insurance`,
      }),
    });

    if (result.success) {
      notifications.push(`Sent pending request reminder for ${request.vendor.name} (${daysPending} days)`);
    }
  }

  return notifications;
}

/**
 * Run all notification checks
 */
export async function runNotificationChecks() {
  console.log('[Notification Service] Running all notification checks...');

  const results = {
    expiring: await checkExpiringCertificates(),
    expired: await checkExpiredCertificates(),
    nonCompliant: await checkNonCompliantCertificates(),
    pending: await checkPendingRequests(),
  };

  const totalNotifications =
    results.expiring.length +
    results.expired.length +
    results.nonCompliant.length +
    results.pending.length;

  console.log(`[Notification Service] Sent ${totalNotifications} notifications`);
  console.log(`  - Expiring: ${results.expiring.length}`);
  console.log(`  - Expired: ${results.expired.length}`);
  console.log(`  - Non-Compliant: ${results.nonCompliant.length}`);
  console.log(`  - Pending Requests: ${results.pending.length}`);

  return results;
}

/**
 * Get notification recipients from environment or default list
 */
function getNotificationRecipients(): string[] {
  const recipients = process.env.NOTIFICATION_RECIPIENTS?.split(',').map((email) => email.trim()) || [];

  if (recipients.length === 0) {
    // Default recipients if not configured
    return ['insurance@columbia.edu', 'riskmanagement@columbia.edu'];
  }

  return recipients;
}
