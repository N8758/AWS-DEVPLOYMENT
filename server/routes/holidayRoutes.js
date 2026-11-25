const express = require("express");
const router = express.Router();

const holidayController = require("../controllers/holidayController");

// Add Holiday
router.post("/add", holidayController.addHoliday);

// Get All Holidays of Owner
router.get("/:ownerId", holidayController.getHolidays);

// Delete Holiday
router.delete("/:holidayId", holidayController.deleteHoliday);

// Check Today's Holiday (Customer Side)
router.get("/today/:ownerId", holidayController.checkTodayHoliday);

module.exports = router;