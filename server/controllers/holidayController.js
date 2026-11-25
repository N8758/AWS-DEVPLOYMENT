const db = require("../config/db");

// ==============================
// ADD HOLIDAY
// ==============================
exports.addHoliday = async (req, res) => {
  try {
    const {
  owner_id,
  start_date,
  end_date,
  holiday_type,
  start_time,
  end_time,
  reason,
} = req.body;

    if (
  !owner_id ||
  !start_date ||
  !end_date ||
  !holiday_type ||
  !reason?.trim()
) {
  return res.status(400).json({
    success: false,
    message: "Owner, date, holiday type and reason are required.",
  });
}
    if (
      holiday_type !== "FULL" &&
      holiday_type !== "HALF"
    ) {
      return res.status(400).json({
        success: false,
        message: "Holiday type must be FULL or HALF.",
      });
    }

    if (new Date(start_date) > new Date(end_date)) {
  return res.status(400).json({
    success: false,
    message: "End date cannot be before start date.",
  });
}

    // Check duplicate holiday
    const existing = await db.query(
  `SELECT * FROM owner_holidays
   WHERE owner_id = $1
   AND start_date = $2
   AND end_date = $3`,
  [owner_id, start_date, end_date]
);

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Holiday already added for this date.",
      });
    }

    const result = await db.query(
      `INSERT INTO owner_holidays
(
  owner_id,
  holiday_date,
  holiday_type,
  start_time,
  end_time,
  start_date,
  end_date,
  reason
)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
    [
  owner_id,
  null,
  holiday_type,
  holiday_type === "HALF" ? start_time : null,
  holiday_type === "HALF" ? end_time : null,
  start_date,
  end_date,
  reason || null,
]
    );

    res.status(201).json({
      success: true,
      message: "Holiday added successfully.",
      holiday: result.rows[0],
    });
  } catch (error) {
    console.error("Add Holiday Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// GET ALL HOLIDAYS OF OWNER
// ==============================
exports.getHolidays = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const result = await db.query(
      `SELECT *
       FROM owner_holidays
       WHERE owner_id = $1
       ORDER BY start_date ASC`,
      [ownerId]
    );

    res.json({
      success: true,
      holidays: result.rows,
    });
  } catch (error) {
    console.error("Get Holidays Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// DELETE HOLIDAY
// ==============================
exports.deleteHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;

    const result = await db.query(
      `DELETE FROM owner_holidays
       WHERE holiday_id = $1
       RETURNING *`,
      [holidayId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found.",
      });
    }

    res.json({
      success: true,
      message: "Holiday deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Holiday Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ==============================
// CHECK TODAY HOLIDAY
// (Customer Side)
// ==============================
exports.checkTodayHoliday = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const result = await db.query(
      `SELECT *
       FROM owner_holidays
       WHERE owner_id = $1
AND (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date
       BETWEEN start_date AND end_date`,
      [ownerId]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        holiday: false,
      });
    }

    res.json({
      success: true,
      holiday: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Check Holiday Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};