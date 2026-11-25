const pool = require("../config/db");
const sendWhatsAppSimulator = require("../utils/sendWhatsAppSimulator");


const formatIST = (date) =>
  new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });

/* ================= CUSTOMER → CREATE BOOKING ================= */
const bookingCreationService =
require("../services/booking/bookingCreationService");

exports.createBooking = async (req, res) => {
  return bookingCreationService.createBooking(req, res);
};

const bookingViewService =
require("../services/booking/bookingViewService");

exports.getOwnerBookings = (req, res) => {
  return bookingViewService.getOwnerBookings(
    req,
    res
  );
};


exports.getDeliveredBookings = (req, res) => {
  return bookingViewService.getDeliveredBookings(
    req,
    res
  );
};

exports.getCustomerBookings = (req, res) => {
  return bookingViewService.getCustomerBookings(
    req,
    res
  );
};


/* ================= CUSTOMER → HIDE BOOKING ================= */
exports.hideCustomerBooking = async (req, res) => {
  const { bookingId } = req.params;

  await pool.query(
    "UPDATE bookings SET hidden_for_customer=true WHERE booking_id=$1",
    [bookingId]
  );

  res.json({ message: "Booking hidden for customer" });
};

/* ================= OWNER → CONFIRM BOOKING ================= */
const bookingStatusService =
require("../services/booking/bookingStatusService");

exports.confirmBooking = (req, res) => {
  return bookingStatusService.confirmBooking(
    req,
    res
  );
};








/* ================= OWNER → HIDE BOOKING ================= */
exports.hideOwnerBooking = async (req, res) => {
  try {
  const { bookingId } = req.params;

  await pool.query(
    "UPDATE bookings SET hidden_for_owner=true WHERE booking_id=$1",
    [bookingId]
  );

  res.json({ message: "Booking hidden for owner" });
   } catch (err) {
    console.error("Hide owner booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= OWNER → DASHBOARD STATS ================= */
exports.getOwnerStats = (req, res) => {
  return bookingViewService.getOwnerStats(
    req,
    res
  );
};



// ✅ OWNER → ASSIGN STAFF
exports.assignStaff = (req, res) => {
  return bookingStatusService.assignStaff(
    req,
    res
  );
};



exports.getStaffBookings = (req, res) => {
  return bookingViewService.getStaffBookings(
    req,
    res
  );
};










exports.pickupOngoing = (req, res) => {
  return bookingStatusService.pickupOngoing(
    req,
    res
  );
};

// ✅ STAFF → DELIVERY ONGOING
exports.deliveryOngoing = (req, res) => {
  return bookingStatusService.deliveryOngoing(
    req,
    res
  );
};




exports.pickupCompleted = (req, res) => {
  return bookingStatusService.pickupCompleted(
    req,
    res
  );
};




exports.getAvailablePickupStaff = (req, res) => {
  return bookingViewService.getAvailablePickupStaff(
    req,
    res
  );
};





exports.savePickupDate = (req, res) => {
  return bookingStatusService.savePickupDate(
    req,
    res
  );
};



exports.startProcessing = (req, res) => {
  return bookingStatusService.startProcessing(
    req,
    res
  );
};

exports.readyToDeliver = (req, res) => {
  return bookingStatusService.readyToDeliver(
    req,
    res
  );
};







exports.saveDeliveryDate = (req, res) => {
  return bookingStatusService.saveDeliveryDate(
    req,
    res
  );
};





exports.completeBooking = (req, res) => {
  return bookingStatusService.completeBooking(req, res);
};

exports.cancelBooking = (req, res) => {
  return bookingStatusService.cancelBooking(req, res);
};

exports.rescheduleBooking = (req, res) => {
  return bookingStatusService.rescheduleBooking(req, res);
};

exports.customerCancelRequest = (req, res) => {
  return bookingStatusService.customerCancelRequest(req, res);
};

exports.customerRescheduleRequest = (req, res) => {
  return bookingStatusService.customerRescheduleRequest(req, res);
};

exports.completeDelivery = (req, res) => {
  return bookingStatusService.completeDelivery(req, res);
};



exports.updateWeight = (req, res) => {
  return bookingStatusService.updateWeight(
    req,
    res
  );
};