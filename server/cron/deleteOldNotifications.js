const db = require("../config/db");

async function deleteOldNotifications() {
  try {
    // Delete old customer/owner/staff notifications
    const notificationResult = await db.query(`
      DELETE FROM notifications
      WHERE created_at < NOW() - INTERVAL '30 days'
    `);

    // Delete old staff notifications
    const staffNotificationResult = await db.query(`
      DELETE FROM staff_notifications
      WHERE created_at < NOW() - INTERVAL '30 days'
    `);

    console.log(
      `[Notification Cron] Deleted ${notificationResult.rowCount} notifications`
    );

    console.log(
      `[Notification Cron] Deleted ${staffNotificationResult.rowCount} staff notifications`
    );

  } catch (err) {
    console.error("[Notification Cron Error]", err);
  }
}

// Run once when server starts
deleteOldNotifications();

// Run every 24 hours
setInterval(() => {
  deleteOldNotifications();
}, 24 * 60 * 60 * 1000);