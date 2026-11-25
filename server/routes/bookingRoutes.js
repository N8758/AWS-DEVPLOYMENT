const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/bookingController");


console.log("updateWeight =", typeof ctrl.updateWeight);
console.log("completeBooking =", typeof ctrl.completeBooking);
console.log("cancelBooking =", typeof ctrl.cancelBooking);
console.log("rescheduleBooking =", typeof ctrl.rescheduleBooking);
console.log("customerCancelRequest =", typeof ctrl.customerCancelRequest);
console.log("customerRescheduleRequest =", typeof ctrl.customerRescheduleRequest);
console.log("completeDelivery =", typeof ctrl.completeDelivery);
console.log("pickupOngoing =", typeof ctrl.pickupOngoing);
console.log("deliveryOngoing =", typeof ctrl.deliveryOngoing);
console.log("pickupCompleted =", typeof ctrl.pickupCompleted);
console.log("getAvailablePickupStaff =", typeof ctrl.getAvailablePickupStaff);
console.log("savePickupDate =", typeof ctrl.savePickupDate);
console.log("startProcessing =", typeof ctrl.startProcessing);
console.log("readyToDeliver =", typeof ctrl.readyToDeliver);
console.log("saveDeliveryDate =", typeof ctrl.saveDeliveryDate);

router.post("/create", ctrl.createBooking);
router.get("/owner/:ownerId", ctrl.getOwnerBookings);
router.get(
  "/owner/:ownerId/delivered",
  ctrl.getDeliveredBookings
);
router.get("/customer/:ownerId", ctrl.getCustomerBookings);
/* CUSTOMER DELETE / CANCEL */
router.patch("/customer/hide/:bookingId", ctrl.hideCustomerBooking);

/* OWNER ACTIONS */
router.patch("/owner/confirm", ctrl.confirmBooking);
router.patch("/owner/hide/:bookingId", ctrl.hideOwnerBooking);
router.patch("/owner/update-weight/:bookingId", ctrl.updateWeight); 
router.get("/owner/:ownerId/stats", ctrl.getOwnerStats);
router.patch("/owner/complete", ctrl.completeBooking);

router.patch("/owner/cancel/:bookingId", ctrl.cancelBooking);
router.patch("/owner/reschedule/:bookingId", ctrl.rescheduleBooking);

router.patch("/owner/assign-staff", ctrl.assignStaff);

router.get("/owner/staff/bookings/:staffId", ctrl.getStaffBookings);


// CUSTOMER REQUESTS
router.patch(
"/customer/cancel-request/:bookingId",
ctrl.customerCancelRequest
);

router.patch(
"/customer/reschedule-request/:bookingId",
ctrl.customerRescheduleRequest
);


router.patch(
  "/staff/complete-delivery/:bookingId",
  ctrl.completeDelivery
);



router.patch(
  "/staff/pickup-ongoing/:bookingId",
  ctrl.pickupOngoing
);

router.patch(
  "/staff/delivery-ongoing/:bookingId",
  ctrl.deliveryOngoing
);


router.patch(
  "/staff/pickup-completed/:bookingId",
  ctrl.pickupCompleted
);

router.get(
  "/available-staff/:bookingId",
 ctrl.getAvailablePickupStaff
);


router.patch(
  "/owner/save-pickup-date",
  ctrl.savePickupDate
);


router.patch(
  "/owner/start-processing/:bookingId",
  ctrl.startProcessing
);

router.patch(
  "/owner/ready-to-deliver/:bookingId",
  ctrl.readyToDeliver
);

router.patch(
  "/owner/save-delivery-date",
  ctrl.saveDeliveryDate
);
module.exports = router;
