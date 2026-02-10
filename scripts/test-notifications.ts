/**
 * Test Notifications Script
 *
 * Run this script to test the notification system locally
 * Usage: npx tsx scripts/test-notifications.ts
 */

import { runNotificationChecks } from '../src/lib/email/notification-service';

async function main() {
  console.log('======================================');
  console.log('  Testing Notification System');
  console.log('======================================\n');

  try {
    const results = await runNotificationChecks();

    console.log('\n======================================');
    console.log('  Notification Test Complete');
    console.log('======================================\n');

    console.log('Summary:');
    console.log(`  Expiring certificates: ${results.expiring.length} notifications`);
    console.log(`  Expired certificates: ${results.expired.length} notifications`);
    console.log(`  Non-compliant vendors: ${results.nonCompliant.length} notifications`);
    console.log(`  Pending requests: ${results.pending.length} notifications`);

    const total =
      results.expiring.length +
      results.expired.length +
      results.nonCompliant.length +
      results.pending.length;

    console.log(`\nTotal notifications sent: ${total}\n`);

    if (total === 0) {
      console.log('✓ No notifications needed at this time.\n');
    } else {
      console.log('Notifications sent:\n');
      [...results.expiring, ...results.expired, ...results.nonCompliant, ...results.pending].forEach(
        (notification) => {
          console.log(`  - ${notification}`);
        }
      );
      console.log();
    }
  } catch (error) {
    console.error('Error running notification checks:', error);
    process.exit(1);
  }
}

main();
