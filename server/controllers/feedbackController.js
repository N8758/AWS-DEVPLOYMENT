const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");


// CUSTOMER → SUBMIT FEEDBACK
// CUSTOMER → SUBMIT FEEDBACK
exports.submitFeedback = async (req, res) => {
  try {
    const { bookingId, rating, suggestion } = req.body;

    const customerId = req.user?.customerId;

    // ✅ Validation
    if (!bookingId) {
      return res.status(400).json({
        message: "bookingId is required",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // ✅ Get booking
    const bookingResult = await pool.query(
      `
      SELECT *
      FROM bookings
      WHERE booking_id = $1
      AND customer_id = $2
      `,
      [bookingId, customerId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const booking = bookingResult.rows[0];

    // ✅ Only delivered/completed bookings
    if (
      booking.status !== "delivered" &&
      booking.status !== "completed"
    ) {
      return res.status(400).json({
        message:
          "Feedback can only be given after delivery",
      });
    }

    // ✅ Prevent duplicate feedback
    const existingFeedback = await pool.query(
      `
      SELECT id
      FROM feedbacks
      WHERE booking_id = $1
      AND customer_id = $2
      `,
      [bookingId, customerId]
    );

    if (existingFeedback.rows.length > 0) {
      return res.status(400).json({
        message:
          "Feedback already submitted for this booking",
      });
    }

    // ✅ Get owner id from booking
    const ownerId = booking.owner_id;

    // ✅ Check owner active
    const ownerCheck = await pool.query(
      `
      SELECT is_active
      FROM owners
      WHERE unique_id = $1
      `,
      [ownerId]
    );

    if (
      ownerCheck.rows.length === 0 ||
      ownerCheck.rows[0].is_active === false
    ) {
      return res.status(403).json({
        message:
          "This laundry is currently inactive",
      });
    }

    // ✅ Get customer name
    const customerResult = await pool.query(
      `
      SELECT name
      FROM customers
      WHERE customer_id = $1
      `,
      [customerId]
    );

    const name =
      customerResult.rows[0]?.name || "";

    // ✅ Get service names from booking
    const serviceString =
      booking.items
        ?.map((s) => s.serviceName)
        .join(",") || "";

    const id = uuidv4();

    // ✅ Save feedback
    await pool.query(
      `
      INSERT INTO feedbacks
      (
        id,
        owner_id,
        customer_id,
        booking_id,
        name,
        service,
        rating,
        suggestion,
        status,
        created_at
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,
        'pending',
        NOW()
      )
      `,
      [
        id,
        ownerId,
        customerId,
        bookingId,
        name,
        serviceString,
        rating,
        suggestion,
      ]
    );

    res.json({
      message: "Feedback submitted successfully",
      feedback: {
        id,
        bookingId,
        ownerId,
        name,
        service: serviceString,
        rating,
        suggestion,
        status: "pending",
      },
    });
  } catch (err) {
    console.error("Submit feedback error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};





// OWNER → GET ALL FEEDBACK FOR THAT OWNER
exports.getFeedbacksByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const result = await pool.query(
      "SELECT * FROM feedbacks WHERE owner_id=$1 AND is_deleted=false" ,
      [ownerId]
    );

    // ✅ convert string → array
    const feedbacks = result.rows.map(f => ({
      ...f,
      services: f.service ? f.service.split(",") : []
    }));

    res.json({ feedbacks });

  } catch (err) {
    console.error("Get feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// OWNER → APPROVE FEEDBACK
exports.approveFeedback = async (req, res) => {
  try {
    const { ownerId, feedbackId } = req.params;

    const result = await pool.query(
      "UPDATE feedbacks SET status='approved' WHERE id=$1 AND owner_id=$2 AND is_deleted=false RETURNING *",
      [feedbackId, ownerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Approved", feedback: result.rows[0] });

  } catch (err) {
    console.error("Approve feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// OWNER → DELETE FEEDBACK
exports.deleteFeedback = async (req, res) => {
  try {
    const { ownerId, feedbackId } = req.params;

    const result = await pool.query(
      "UPDATE feedbacks SET is_deleted=true WHERE id=$1 AND owner_id=$2 AND is_deleted=false RETURNING *",
      [feedbackId, ownerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Deleted" });

  } catch (err) {
    console.error("Delete feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CUSTOMER → GET ONLY APPROVED FEEDBACK
exports.getApprovedFeedback = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const result = await pool.query(
  "SELECT * FROM feedbacks WHERE owner_id=$1 AND status='approved' AND is_deleted=false",
  [ownerId]
);

    res.json({ feedbacks: result.rows });

  } catch (err) {
    console.error("Approved feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
















exports.getPendingFeedbacks = async (req, res) => {
  try {
    const customerId = req.user.customerId;

    const result = await pool.query(
      `
      SELECT
        b.booking_id AS "bookingId",
        b.items
      FROM bookings b
      WHERE
        b.customer_id = $1
        AND b.status IN ('delivered', 'completed')
        AND NOT EXISTS (
          SELECT 1
          FROM feedbacks f
          WHERE
            f.booking_id = b.booking_id
            AND f.customer_id = b.customer_id
        )
      ORDER BY b.booking_id DESC
      `,
      [customerId]
    );

    res.json({
      bookings: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};










// OWNER → GET ALL FEEDBACK FOR THAT OWNER (WITH PAGINATION)
exports.getFeedbacksByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Total feedback count
    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM feedbacks
       WHERE owner_id = $1
       AND is_deleted = false`,
      [ownerId]
    );

    const total = parseInt(totalResult.rows[0].count);

    // Get paginated feedback
    const result = await pool.query(
      `
      SELECT *
      FROM feedbacks
      WHERE owner_id = $1
      AND is_deleted = false
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [ownerId, limit, offset]
    );

    const feedbacks = result.rows.map((f) => ({
      ...f,
      services: f.service ? f.service.split(",") : [],
    }));

    res.json({
      feedbacks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get feedback error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};