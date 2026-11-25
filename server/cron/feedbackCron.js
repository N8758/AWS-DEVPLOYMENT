const cron = require("node-cron");
const pool = require("../config/db");

// Runs every 2 minutes (TESTING)
cron.schedule("0 2 * * *", async () => {
  try {
    console.log("Running feedback cleanup...");

    const result = await pool.query(`
      DELETE FROM feedbacks
      WHERE created_at < NOW() - INTERVAL '30 days'
    `);

    console.log(`${result.rowCount} feedback(s) deleted.`);
  } catch (error) {
    console.error("Feedback cron error:", error);
  }
});

console.log("Feedback cron initialized.");