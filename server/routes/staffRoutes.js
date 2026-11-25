const express = require("express");
const router = express.Router();

const {
  addStaff,
  getStaffByOwner,
  deleteStaff,
  updateStaff,
   staffLogin ,
   getAssignedBookings ,
  getStaffNotifications
} = require("../controllers/staffController");

// ADD STAFF
router.post("/add", addStaff);

router.post("/login", staffLogin);

// STAFF BOOKINGS
router.get("/bookings/:staff_id", getAssignedBookings);

// STAFF NOTIFICATIONS
router.get("/notifications/:staff_id", getStaffNotifications);

// GET STAFF BY OWNER
router.get("/:owner_id", getStaffByOwner);

// DELETE STAFF
router.delete("/:id", deleteStaff);

// UPDATE STAFF
router.put("/:id", updateStaff);

module.exports = router;