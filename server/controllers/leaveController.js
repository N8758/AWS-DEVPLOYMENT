const pool = require("../config/db");

// ✅ Apply Leave (STAFF)
exports.applyLeave = async (req, res) => {
  try {
    const { staff_id, from_date, to_date, reason } = req.body;

    // Validation
if (!reason || reason.trim() === "") {
  return res.status(400).json({
    message: "Reason is required"
  });
}

    // 🔥 Get owner_id from staff
    const staffRes = await pool.query(
      "SELECT owner_id FROM staff WHERE id=$1",
      [staff_id]
    );

    if (staffRes.rows.length === 0) {
      return res.status(400).json({ message: "Staff not found" });
    }

    const owner_id = staffRes.rows[0].owner_id;

    const result = await pool.query(
      `INSERT INTO leaves (staff_id, owner_id, from_date, to_date, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [staff_id, owner_id, from_date, to_date, reason]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Leave apply failed" });
  }
};



// ✅ Get Leaves (STAFF)
exports.getStaffLeaves = async (req, res) => {
  try {
    const { staff_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM leaves WHERE staff_id=$1 ORDER BY created_at DESC",
      [staff_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
};



// ✅ Get Leaves (OWNER)
exports.getOwnerLeaves = async (req, res) => {
  try {
    const { owner_id } = req.params;

    const result = await pool.query(
      `SELECT l.*, s.name 
       FROM leaves l
       JOIN staff s ON l.staff_id = s.id
       WHERE l.owner_id=$1
       ORDER BY l.created_at DESC`,
      [owner_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
};



// ✅ Approve / Reject Leave (OWNER)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Approved / Rejected

    const result = await pool.query(
      "UPDATE leaves SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );

    if (status === "Approved") {

  const leaveData = await pool.query(
    `SELECT *
     FROM leaves
     WHERE id=$1`,
    [id]
  );

  const leave = leaveData.rows[0];

  // Pickup bookings
  await pool.query(
    `
    UPDATE bookings
    SET pickup_staff_id = NULL,
        status = 'assigned'
    WHERE pickup_staff_id = $1
    AND DATE(pickup_datetime)
    BETWEEN $2 AND $3
    `,
    [
      leave.staff_id,
      leave.from_date,
      leave.to_date
    ]
  );

  // Delivery bookings
  await pool.query(
    `
    UPDATE bookings
    SET delivery_staff_id = NULL,
        status = 'pre_processing'
    WHERE delivery_staff_id = $1
    AND DATE(completion_datetime)
    BETWEEN $2 AND $3
    `,
    [
      leave.staff_id,
      leave.from_date,
      leave.to_date
    ]
  );

}

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};