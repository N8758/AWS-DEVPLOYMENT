const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/feedbackController");
const customerAuth = require("../middleware/customerAuth");

router.post(
  "/submit",
  customerAuth,
  ctrl.submitFeedback
);

router.get(
  "/pending",
  customerAuth,
  ctrl.getPendingFeedbacks
);

// OWNER → list
router.get("/owner/:ownerId", ctrl.getFeedbacksByOwner);

// OWNER → approve
router.patch(
  "/owner/:ownerId/approve/:feedbackId",
  ctrl.approveFeedback
);

// OWNER → delete
router.delete(
  "/owner/:ownerId/:feedbackId",
  ctrl.deleteFeedback
);

// CUSTOMER → approved feedback
router.get(
  "/customer/:ownerId",
  ctrl.getApprovedFeedback
);

module.exports = router;