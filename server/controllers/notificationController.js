const db = require("../config/db");

exports.getNotifications = async (req, res) => {
  try {
    const { userId, userType } = req.params;

    const result = await db.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      AND user_type = $2
      ORDER BY created_at DESC
      `,
      [userId, userType]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error"
    });
  }
};