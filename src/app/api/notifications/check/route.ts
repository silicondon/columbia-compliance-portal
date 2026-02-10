import { NextRequest, NextResponse } from 'next/server';
import { runNotificationChecks } from '@/lib/email/notification-service';

/**
 * POST /api/notifications/check
 *
 * Trigger notification checks for expiring certificates, non-compliant vendors, etc.
 * This endpoint should be called by a cron job or scheduler (e.g., daily at 9 AM)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API key for security (prevent unauthorized triggering)
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.NOTIFICATION_API_KEY || 'dev-notification-key';

    if (apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Notification API] Running notification checks...');

    const results = await runNotificationChecks();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        expiring: {
          count: results.expiring.length,
          notifications: results.expiring,
        },
        expired: {
          count: results.expired.length,
          notifications: results.expired,
        },
        nonCompliant: {
          count: results.nonCompliant.length,
          notifications: results.nonCompliant,
        },
        pending: {
          count: results.pending.length,
          notifications: results.pending,
        },
      },
      totalSent:
        results.expiring.length +
        results.expired.length +
        results.nonCompliant.length +
        results.pending.length,
    });
  } catch (error) {
    console.error('[Notification API] Error running notification checks:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run notification checks',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/check
 *
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Notification service is running',
    timestamp: new Date().toISOString(),
  });
}
