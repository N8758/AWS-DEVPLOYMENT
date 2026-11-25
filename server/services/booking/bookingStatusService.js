const bookingRepo = require("../../repositories/bookingRepository");
const sendWhatsAppSimulator = require("../../utils/sendWhatsAppSimulator");
const sendNotification = require("../../utils/sendNotification");

exports.confirmBooking = async (req, res) => {
  try {
    const { bookingId, pickupDateTime } = req.body;

    const staffCheck = await bookingRepo.getPickupStaffByBookingId(
      bookingId
    );

    if (!staffCheck[0]?.pickup_staff_id) {
      return res.status(400).json({
        message: "Please assign pickup staff first"
      });
    }

    if (new Date(pickupDateTime) <= new Date()) {
      return res.status(400).json({
        message: "Pickup date and time must be in the future"
      });
    }

    const bookingData =
      await bookingRepo.getBookingCustomerDetails(
        bookingId
      );

    const customerName =
      bookingData[0]?.customer_name || "Customer";

    const shopName =
      bookingData[0]?.shop_name || "Laundry";

    const pickupDate = new Date(pickupDateTime);

    await bookingRepo.updateBookingConfirmation(
      bookingId,
      "accepted",
      pickupDate
    );

    const formattedDate =
      pickupDate.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

    // await sendWhatsAppSimulator(
    //   bookingData[0].customer_mobile,
    //   "pickup_schedule_notification",
    //   [
    //     customerName,
    //     shopName,
    //     formattedDate
    //   ]
    // );


    const customerToken =
  bookingData[0]?.fcm_token;

if (customerToken) {

  await sendNotification(
    customerToken,
    "Booking Accepted",
    `Hello ${customerName},

Your laundry pickup has been scheduled successfully.

🏪 Laundry: ${shopName}
📅 Pickup Date & Time: ${formattedDate}

Please ensure someone is available at the scheduled time.

If you need to reschedule, please do so at least 1 hour before the pickup time.

Thank you for choosing ${shopName}.`
  );

}

await bookingRepo.insertNotification(
  bookingData[0].customer_mobile,
  "customer",
  `Hello ${customerName},

Your laundry pickup has been scheduled successfully.

🏪 Laundry: ${shopName}
📅 Pickup Date & Time: ${formattedDate}

Please ensure someone is available at the scheduled time.

If you need to reschedule, please do so at least 1 hour before the pickup time.

Thank you for choosing ${shopName}.`
);



    res.json({
      message: "Booking confirmed"
    });

  } catch (err) {
    console.error("Confirm booking error:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};




exports.completeBooking = async (req, res) => {
  try {

    const { bookingId, completionDateTime } = req.body;

    if (new Date(completionDateTime) <= new Date()) {
      return res.status(400).json({
        message: "Completion date and time must be in the future"
      });
    }

    const result =
      await bookingRepo.getCompleteBookingDetails(
        bookingId
      );

    const customerName =
      result[0]?.customer_name || "Customer";

    const shopName =
      result[0]?.shop_name || "Laundry";
     
    const bookingData =
      await bookingRepo.getBookingPickupType(
        bookingId
      );

    const pickupType =
      bookingData[0]?.pickup_type;

    const newStatus =
      pickupType === "self"
        ? "delivered"
        : "delivery_assigned";

    const completionDate =
      new Date(completionDateTime);

    await bookingRepo.updateBookingCompletion(
      bookingId,
      newStatus,
      completionDate
    );

    

    const formattedDate =
      completionDate.toLocaleString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        }
      );

      const customerToken =
  result[0]?.fcm_token;

if (customerToken) {


    if (pickupType === "self") {

      // await sendWhatsAppSimulator(
      //   result[0].customer_mobile,
      //   "order_completed_self",
      //   [
      //     customerName,
      //     shopName,
      //     formattedDate
      //   ]
      // );


        await sendNotification(
      customerToken,
      "Order Completed",
      `Hello ${customerName}. Your laundry order is completed. Please come to our shop and collect your clothes. Collection Date & Time: ${formattedDate}. Shop: ${shopName}. Payment: Offline.`
    );


    const date = completionDate.toLocaleDateString("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "2-digit",
  year: "numeric"
});

const time = completionDate.toLocaleTimeString("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
});

await bookingRepo.insertNotification(
  result[0].customer_mobile,
  "customer",
  `Hello ${customerName},

Your laundry order is ready for collection.

🏪 Laundry: ${shopName}
📅 Collection Date: ${date}
🕒 Collection Time: ${time}

Please visit the shop to collect your clothes.

Thank you for choosing ${shopName}.`
);

    } else {

      // await sendWhatsAppSimulator(
      //   result[0].customer_mobile,
      //   "order_completed_door",
      //   [
      //     customerName,
      //     shopName,
      //     formattedDate
      //   ]
      // );


      await sendNotification(
      customerToken,
      "Order Completed",
      `Hello ${customerName}. Your laundry order is completed. Your clothes will be delivered to your address. Delivery Date & Time: ${formattedDate}. Shop: ${shopName}. Payment: Offline.`
    );

    await bookingRepo.insertNotification(
  result[0].customer_mobile,
  "customer",
  `Hello ${customerName},

Your laundry order has been processed successfully.

🏪 Laundry: ${shopName}
📅 Delivery Date & Time: ${formattedDate}

Our delivery staff will deliver your clothes to your address at the scheduled time.

If you need to reschedule, please do so at least 1 hour before the delivery time.

Thank you for choosing ${shopName}.`
);

    }
  }

    res.json({
      message: "Booking completed"
    });

  } catch (err) {

    console.error(
      "Complete booking error:",
      err
    );

    res.status(500).json({
      message: "Server error"
    });

  }
};

exports.updateWeight = async (req, res) => {
  try {

    const { bookingId } = req.params;
    const { serviceIndex, weight } = req.body;

    const result =
      await bookingRepo.getBookingWeightData(
        bookingId
      );

    if (result.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    let items = result[0].items;

    const deliveryCharge =
      result[0].delivery_charge || 0;

    items = items.map((s, i) => {
      if (i == serviceIndex) {
        return {
          ...s,
          weight: Number(weight)
        };
      }

      return s;
    });

    let total = Number(deliveryCharge || 0);

    items.forEach(s => {

      if (
        Array.isArray(s.items) &&
        s.items.length > 0
      ) {
        total += Number(s.total || 0);
      } else {

        const w =
          Number(s.weight || 0);

        const price =
          Number(s.price_per_kg || 0);

        const base = w * price;

        const gstPercent =
          Number(s.gst || 0);

        const gstAmount =
          (base * gstPercent) / 100;

        total += Number(
          (base + gstAmount).toFixed(2)
        );
      }

    });

    const allWeightsEntered =
      items.every(s => {

        if (
          s.items &&
          s.items.length > 0
        ) {
          return true;
        }

        return (
          s.weight !== null &&
          s.weight !== undefined
        );

      });

    let status;

    if (
      result[0].pickup_type === "self"
    ) {

      status = allWeightsEntered
        ? "accepted"
        : "pending_weight";

    } else {

      const currentBooking =
        await bookingRepo.getBookingStatus(
          bookingId
        );

      status =
        currentBooking[0].status;
    }

    await bookingRepo.updateBookingWeight(
      bookingId,
      items,
      total,
      status
    );

    res.json({
      message: "Weight updated",
      total
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Error updating weight"
    });

  }
};






exports.pickupOngoing = async (
  req,
  res
) => {
  try {

    const { bookingId } = req.params;

    const result =
      await bookingRepo.getPickupBookingDetails(
        bookingId
      );

    if (result.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const customerName =
      result[0].customer_name;

    const customerMobile =
      result[0].customer_mobile;

    const staffName =
      result[0].staff_name || "Staff";

    const shopName =
      result[0].shop_name || "Laundry";

    // await sendWhatsAppSimulator(
    //   customerMobile,
    //   "pickup_arrival_reminder",
    //   [
    //     customerName,
    //     staffName,
    //     shopName
    //   ]
    // );


    const customerToken = result[0]?.fcm_token;

if (customerToken) {
  await sendNotification(
    customerToken,
    "Pickup Arriving Soon",
    `Hello ${customerName}. Our pickup staff ${staffName} from ${shopName} will arrive within approximately 1 hour to collect your laundry. If you are unavailable, please reschedule your pickup through the app now.`
  );

  await bookingRepo.insertNotification(
  customerMobile,
  "customer",
  `Hello ${customerName},

🚚 Our pickup staff ${staffName} from ${shopName} is on the way to collect your laundry.

📅 Scheduled Pickup: ${new Date(result[0].pickup_datetime).toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
})}

Please stay at the pickup location and keep your laundry ready.

Thank you.`
);
}



    await bookingRepo.updatePickupOngoingStatus(
      bookingId
    );

    res.json({
      message:
        "Pickup ongoing message sent"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};







exports.pickupCompleted = async (
  req,
  res
) => {
  try {

    const { bookingId } = req.params;

    await bookingRepo.updatePickupCompletedStatus(
      bookingId
    );

    res.json({
      message: "Pickup completed"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



exports.deliveryOngoing = async (
  req,
  res
) => {
  try {

    const { bookingId } = req.params;

    const result =
      await bookingRepo.getDeliveryBookingDetails(
        bookingId
      );

    if (result.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const customerName =
      result[0].customer_name;

    const customerMobile =
      result[0].customer_mobile;

    const staffName =
      result[0].staff_name || "Staff";

    const shopName =
      result[0].shop_name || "Laundry";

    // await sendWhatsAppSimulator(
    //   customerMobile,
    //   "delivery_arrival_reminder",
    //   [
    //     customerName,
    //     staffName,
    //     shopName
    //   ]
    // );

    const customerToken =
  result[0]?.fcm_token;

if (customerToken) {
  await sendNotification(
    customerToken,
    "Delivery Arriving Soon",
    `Hello ${customerName}. Our delivery staff ${staffName} from ${shopName} will arrive within approximately 1 hour to deliver your laundry. Please ensure someone is available to receive the order. If you are unavailable, please reschedule your delivery through the app now.`
  );

  await bookingRepo.insertNotification(
  customerMobile,
  "customer",
  `Hello ${customerName},

🚚 Our delivery staff ${staffName} from ${shopName} is on the way with your laundry.

📅 Expected Arrival: ${new Date(result[0].completion_datetime).toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
})}

Please ensure someone is available to receive your order.

Thank you.`
);
}

    await bookingRepo.updateDeliveryOngoingStatus(
      bookingId
    );

    res.json({
      message:
        "Delivery ongoing message sent"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};






exports.completeDelivery = async (
  req,
  res
) => {
  try {

    const { bookingId } = req.params;

    const result =
      await bookingRepo.getCompleteDeliveryDetails(
        bookingId
      );

    if (result.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const customerName =
      result[0].customer_name;

    const customerMobile =
      result[0].customer_mobile;

    const ownerMobile =
      result[0].owner_mobile;

    const shopName =
      result[0].shop_name;

    const staffName =
      result[0].staff_name || "Staff";

    await bookingRepo.markDeliveryCompleted(
      bookingId
    );

    // await sendWhatsAppSimulator(
    //   customerMobile,
    //   "delivery_completed",
    //   [
    //     customerName,
    //     shopName
    //   ]
    // );

    // await sendWhatsAppSimulator(
    //   ownerMobile,
    //   "delivery_completed_owner",
    //   [
    //     customerName,
    //     shopName,
    //     staffName
    //   ]
    // );

    const customerToken =
  result[0]?.customer_fcm_token;

const ownerToken =
  result[0]?.owner_fcm_token;

if (customerToken) {
  await sendNotification(
    customerToken,
    "Order Delivered",
    `Hi ${customerName}, your laundry order from ${shopName} has been successfully delivered. Thank you for choosing us. We look forward to serving you again.`
  );

  await bookingRepo.insertNotification(
  customerMobile,
  "customer",
  `Hello ${customerName},

Your laundry order has been delivered successfully.

🏪 Laundry: ${shopName}
👨‍🔧 Delivered By: ${staffName}
📅 Delivered On: ${new Date().toLocaleString("en-IN")}

Thank you for choosing ${shopName}.

We look forward to serving you again. 😊`
);
}

if (ownerToken) {
  await sendNotification(
    ownerToken,
    "Delivery Completed",
    `The laundry order for ${customerName} has been successfully delivered. Laundry: ${shopName}. Delivered By: ${staffName}. The delivery process has been completed successfully.`
  );

  await bookingRepo.insertNotification(
  ownerMobile,
  "owner",
  `Customer: ${customerName}

Booking ID: #${bookingId}

Delivery completed successfully.

👨‍🔧 Delivered By: ${staffName}
📅 Date: ${new Date().toLocaleString("en-IN")}

The order has been marked as delivered successfully.`
);
}

    res.json({
      message: "Delivery completed"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};









exports.savePickupDate = async (
  req,
  res
) => {
  try {

    const {
      bookingId,
      pickupDateTime
    } = req.body;

    if (!bookingId || !pickupDateTime) {
      return res.status(400).json({
        message:
          "bookingId and pickupDateTime required"
      });
    }

    const holidayCheck =
  await bookingRepo.checkHoliday(
    bookingId,
    pickupDateTime
  );

if (holidayCheck.length > 0) {
  return res.status(400).json({
    message:
      "Laundry is closed on selected date due to holiday"
  });
}

    await bookingRepo.savePickupDate(
      bookingId,
      pickupDateTime
    );

    res.json({
      message: "Pickup date saved"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};













exports.saveDeliveryDate = async (
  req,
  res
) => {
  try {

    const {
      bookingId,
      completionDateTime
    } = req.body;

    if (!bookingId || !completionDateTime) {
      return res.status(400).json({
        message:
          "bookingId and completionDateTime required"
      });
    }


    const holidayCheck =
  await bookingRepo.checkHoliday(
    bookingId,
    completionDateTime
  );

if (holidayCheck.length > 0) {
  return res.status(400).json({
    message:
      "Laundry is closed on selected date due to holiday"
  });
}



    await bookingRepo.saveDeliveryDate(
      bookingId,
      completionDateTime
    );

    res.json({
      message: "Delivery date saved"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};







exports.startProcessing = async (
  req,
  res
) => {
  try {

    const { bookingId } = req.params;

    await bookingRepo.startProcessing(
      bookingId
    );

    res.json({
      message: "Processing started"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};







exports.readyToDeliver = async (
  req,
  res
) => {
  try {

    const { bookingId } = req.params;

    await bookingRepo.updateReadyToDeliverStatus(
      bookingId
    );

    res.json({
      message: "Ready To Deliver"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};











exports.cancelBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;
    const { reason } = req.body;

    const bookingCheck =
      await bookingRepo.getBookingStatus(
        bookingId
      );

    const status =
      bookingCheck[0].status;

    if (
      [
        "pickup_ongoing",
        "pickup_completed",
        "processing",
        "delivery_assigned",
        "delivery_ongoing",
        "delivered"
      ].includes(status)
    ) {
      return res.status(400).json({
        message:
          "Order cannot be cancelled after pickup completion"
      });
    }

    const staffInfo =
      await bookingRepo.getBookingStaffInfo(
        bookingId
      );

    const result =
      await bookingRepo.getBookingCustomerDetails(
        bookingId
      );

    const customerName =
      result[0]?.customer_name || "Customer";

    const customerMobile =
      result[0]?.customer_mobile;

    const shopName =
      result[0]?.shop_name || "Laundry";

    await bookingRepo.cancelBooking(
      bookingId,
      reason
    );

    const notifyStaff =
      staffInfo[0].delivery_staff_id ||
      staffInfo[0].pickup_staff_id;

    if (notifyStaff) {

      const staffRow =
        await bookingRepo.getStaffByStaffId(
          notifyStaff
        );

      if (staffRow.length > 0) {

        await bookingRepo.insertStaffNotification(
          staffRow[0].id,
          `Order #${bookingId} cancelled by owner`
        );

      }
    }

    // await sendWhatsAppSimulator(
    //   customerMobile,
    //   "booking_cancelled_owner",
    //   [
    //     customerName,
    //     shopName,
    //     reason
    //   ]
    // );


    const customerToken =
  result[0]?.fcm_token;

if (customerToken) {
  await sendNotification(
    customerToken,
    "Order Cancelled",
    `Hello ${customerName},

Laundry: ${shopName}

Your order has been cancelled.

Reason: ${reason}`
  );
  await bookingRepo.insertNotification(
  customerMobile,
  "customer",
  `Your order from ${shopName} has been cancelled. Reason: ${reason}`
);
}

    res.json({
      message: "Booking cancelled"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};



exports.rescheduleBooking = async (req, res) => {
  try {

    const { bookingId } = req.params;
    const { newDate, reason } = req.body;

    const bookingCheck =
      await bookingRepo.getBookingStatus(
        bookingId
      );

    const status =
      bookingCheck[0].status;

    if (
      ![
        "accepted",
        "assigned",
        "pickup_ongoing",
        "delivery_assigned",
        "delivery_ongoing"
      ].includes(status)
    ) {
      return res.status(400).json({
        message: "Reschedule not allowed"
      });
    }

    if (new Date(newDate) <= new Date()) {
      return res.status(400).json({
        message:
          "Please select a future date and time"
      });
    }

    const holidayCheck =
      await bookingRepo.checkHoliday(
        bookingId,
        newDate
      );

    if (holidayCheck.length > 0) {
      return res.status(400).json({
        message:
          "Laundry is closed on selected date due to holiday"
      });
    }

    const result =
      await bookingRepo.getBookingCustomerDetailsWithDates(
        bookingId
      );

    const customerName =
      result[0]?.customer_name || "Customer";

    const customerMobile =
      result[0]?.customer_mobile;

    const shopName =
      result[0]?.shop_name || "Laundry";

    const oldDate =
      status === "delivery_assigned" ||
      status === "delivery_ongoing"
        ? result[0].completion_datetime
        : result[0].pickup_datetime;

    const formattedOldDate =
      new Date(oldDate).toLocaleString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        }
      );

    const formattedNewDate =
      new Date(newDate).toLocaleString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        }
      );

    const staffInfo =
      await bookingRepo.getBookingStaffInfo(
        bookingId
      );

    const notifyStaff =
      (
        status === "delivery_assigned" ||
        status === "delivery_ongoing"
      )
      ? staffInfo[0].delivery_staff_id
      : staffInfo[0].pickup_staff_id;

    if (
      status === "delivery_assigned" ||
      status === "delivery_ongoing"
    ) {

      await bookingRepo.rescheduleDelivery(
        bookingId,
        newDate,
        reason
      );

    } else {

      await bookingRepo.reschedulePickup(
        bookingId,
        newDate,
        reason
      );

    }

    if (notifyStaff) {

      const staffRow =
        await bookingRepo.getStaffByStaffId(
          notifyStaff
        );

      if (staffRow.length > 0) {

        await bookingRepo.insertStaffNotification(
          staffRow[0].id,
          `Order #${bookingId} rescheduled by owner`
        );

      }
    }

    // await sendWhatsAppSimulator(
    //   customerMobile,
    //   "booking_rescheduled_owner",
    //   [
    //     customerName,
    //     shopName,
    //     formattedOldDate,
    //     formattedNewDate,
    //     reason
    //   ]
    // );


    const customerToken =
  result[0]?.fcm_token;

if (customerToken) {
  await sendNotification(
    customerToken,
    "Order Rescheduled",
    `Hello ${customerName},

Laundry: ${shopName}

Your order has been rescheduled.

Old Date: ${formattedOldDate}
New Date: ${formattedNewDate}

Reason: ${reason}

Thank you`
  );

  await bookingRepo.insertNotification(
  customerMobile,
  "customer",
  `Your order has been rescheduled from ${formattedOldDate} to ${formattedNewDate}.`
);
}
    res.json({
      message: "Booking rescheduled"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};





exports.assignStaff = async (req, res) => {
  try {

    const { bookingId, staff_id, type } = req.body;

    if (!bookingId || !staff_id || !type) {
      return res.status(400).json({
        message:
          "bookingId, staff_id and type required"
      });
    }

    const staffData =
      await bookingRepo.getStaffDetails(
        staff_id
      );

    if (staffData.length === 0) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    const numericStaffId =
      staffData[0].id;

    const bookingDateData =
      await bookingRepo.getBookingDates(
        bookingId
      );

    const bookingDate =
      type === "pickup"
        ? bookingDateData[0]
            .pickup_datetime
        : bookingDateData[0]
            .completion_datetime;

    if (!bookingDate) {
      return res.status(400).json({
        message:
          type === "pickup"
            ? "Please select pickup date first"
            : "Please select delivery date first"
      });
    }

    const leaveCheck =
      await bookingRepo.checkStaffLeave(
        numericStaffId,
        bookingDate
      );

    if (leaveCheck.length > 0) {
      return res.status(400).json({
        message:
          "Selected staff is on approved leave. Please choose another staff."
      });
    }

    if (type === "pickup") {

      await bookingRepo.assignPickupStaff(
        bookingId,
        staff_id
      );

    }

    const bookingInfo =
      await bookingRepo.getDeliveryRescheduledFlag(
        bookingId
      );

    const isRescheduled =
      bookingInfo[0]
        ?.delivery_rescheduled;

    if (type === "delivery") {

      if (isRescheduled) {

        await bookingRepo.assignDeliveryStaffRescheduled(
          bookingId,
          staff_id
        );

      } else {

        await bookingRepo.assignDeliveryStaff(
          bookingId,
          staff_id
        );

      }

    }

    const staffName =
      staffData[0]?.name || "Staff";

    const staffMobile =
      staffData[0]?.mobile;

    const shopData =
      await bookingRepo.getShopNameByBooking(
        bookingId
      );

    const shopName =
      shopData[0]?.shop_name ||
      "Laundry";

    // await sendWhatsAppSimulator(
    //   staffMobile,
    //   "staff_order_assigned",
    //   [
    //     staffName,
    //     type === "pickup"
    //       ? "Pickup"
    //       : "Delivery",
    //     shopName
    //   ]
    // );


    const staffToken =
  staffData[0]?.fcm_token;

if (staffToken) {
  await sendNotification(
    staffToken,
    `New ${type === "pickup" ? "Pickup" : "Delivery"} Order`,
    `Hello ${staffName}. You have been assigned a new ${
      type === "pickup" ? "Pickup" : "Delivery"
    } order from ${shopName}. Please check your Staff Dashboard for customer details.`
  );
  await bookingRepo.insertNotification(
  staff_id,
  "staff",
  `You have been assigned a new ${
    type === "pickup" ? "Pickup" : "Delivery"
  } order from ${shopName}.`
);
}


    res.json({
      message:
        "Staff assigned successfully"
    });

  } catch (err) {

    console.error(
      "Assign staff error:",
      err
    );

    res.status(500).json({
      message: "Server error"
    });

  }
};

exports.customerCancelRequest = async (
  req,
  res
) => {
  try {

    const { bookingId } = req.params;
    const { reason } = req.body;

    const result =
      await bookingRepo.getCustomerCancelDetails(
        bookingId
      );

    const customer = result[0];

    const bookingStatus =
      customer.status;

    if (
      [
        "pickup_completed",
        "processing",
        "delivery_assigned",
        "delivery_ongoing",
        "delivered"
      ].includes(bookingStatus)
    ) {
      return res.status(400).json({
        message:
          "Pickup already completed. Cancellation not allowed."
      });
    }

    const staffInfo =
      await bookingRepo.getBookingStaffInfo(
        bookingId
      );

    await bookingRepo.customerCancelBooking(
      bookingId,
      reason
    );

    const notifyStaff =
      staffInfo[0].delivery_staff_id ||
      staffInfo[0].pickup_staff_id;

    if (notifyStaff) {

      const staffRow =
        await bookingRepo.getStaffByStaffId(
          notifyStaff
        );

      if (staffRow.length > 0) {

        await bookingRepo.insertStaffNotification(
          staffRow[0].id,
          `Order #${bookingId} cancelled by customer`
        );

      }
    }

    // await sendWhatsAppSimulator(
    //   customer.owner_mobile,
    //   "customer_cancel_request",
    //   [
    //     customer.customer_name,
    //     customer.customer_mobile,
    //     bookingId,
    //     reason
    //   ]
    // );

    const ownerToken =
  customer.owner_fcm_token;

if (ownerToken) {
  await sendNotification(
    ownerToken,
    "New Customer Cancel Request",
    `Customer: ${customer.customer_name}

Mobile: ${customer.customer_mobile}

Booking ID: ${bookingId}

Reason: ${reason}`
  );

  await bookingRepo.insertNotification(
  customer.owner_mobile,
  "owner",
  `Customer ${customer.customer_name} requested cancellation for booking #${bookingId}.`
);
}

    res.json({
      message:
        "Cancel sent successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};





exports.customerRescheduleRequest =
async (req, res) => {
  try {

    const { bookingId } = req.params;
    const { newDate, reason } = req.body;

    if (new Date(newDate) <= new Date()) {
      return res.status(400).json({
        message:
          "Please select a future date and time"
      });
    }

    const holidayCheck =
      await bookingRepo.checkHoliday(
        bookingId,
        newDate
      );

    if (holidayCheck.length > 0) {
      return res.status(400).json({
        message:
          "Laundry is closed on selected date due to holiday"
      });
    }

    const result =
      await bookingRepo.getCustomerRescheduleDetails(
        bookingId
      );

    const customer = result[0];

    const bookingStatus =
      customer.status;

    if (
      ![
        "accepted",
        "assigned",
        "pickup_ongoing",
        "delivery_assigned",
        "delivery_ongoing"
      ].includes(bookingStatus)
    ) {
      return res.status(400).json({
        message:
          "Reschedule not allowed"
      });
    }

    const oldDate =
      bookingStatus ===
        "delivery_assigned" ||
      bookingStatus ===
        "delivery_ongoing"
        ? customer.completion_datetime
        : customer.pickup_datetime;

    const diffMinutes =
  (new Date(oldDate) -
    new Date()) /
  (1000 * 60);

if (diffMinutes < 60) {
  return res.status(400).json({
    message:
      "Reschedule allowed only before 1 hour"
  });
}
    const formattedOldDate =
      new Date(oldDate)
      .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

    const formattedNewDate =
      new Date(newDate)
      .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });

    const staffInfo =
      await bookingRepo.getBookingStaffInfo(
        bookingId
      );

    const notifyStaff =
      (
        bookingStatus ===
          "delivery_assigned" ||
        bookingStatus ===
          "delivery_ongoing" ||
        bookingStatus ===
          "delivered"
      )
      ? staffInfo[0].delivery_staff_id
      : staffInfo[0].pickup_staff_id;

    if (
      bookingStatus ===
        "ready_to_deliver" ||
      bookingStatus ===
        "delivery_assigned" ||
      bookingStatus ===
        "delivery_ongoing" ||
      bookingStatus ===
        "delivered"
    ) {

      await bookingRepo.customerRescheduleDelivery(
        bookingId,
        newDate,
        reason
      );

    } else {

      await bookingRepo.customerReschedulePickup(
        bookingId,
        newDate,
        reason
      );

    }

    if (notifyStaff) {

      const staffRow =
        await bookingRepo.getStaffByStaffId(
          notifyStaff
        );

      if (staffRow.length > 0) {

        await bookingRepo.insertStaffNotification(
          staffRow[0].id,
          `Order #${bookingId} rescheduled by customer`
        );

      }

    }

    // await sendWhatsAppSimulator(
    //   customer.owner_mobile,
    //   "customer_reschedule_request_v2",
    //   [
    //     customer.customer_name,
    //     customer.customer_mobile,
    //     bookingId,
    //     formattedOldDate,
    //     formattedNewDate,
    //     reason
    //   ]
    // );



    const ownerToken =
  customer.owner_fcm_token;

if (ownerToken) {
  await sendNotification(
    ownerToken,
    "New Customer Reschedule Request",
    `Customer: ${customer.customer_name}

Mobile: ${customer.customer_mobile}

Booking ID: ${bookingId}

Old Date: ${formattedOldDate}

New Date: ${formattedNewDate}

Reason: ${reason}`
  );

  await bookingRepo.insertNotification(
  customer.owner_mobile,
  "owner",
  `🔔 Customer Reschedule Request

Customer: ${customer.customer_name}
Booking ID: #${bookingId}

📅 Current Date & Time:
${formattedOldDate}

📅 Requested New Date & Time:
${formattedNewDate}

📝 Reason:
${reason}

Please review and approve or reject this request from the Owner Dashboard.`
);
}

    res.json({
      message:
        "Reschedule request sent to owner"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error"
    });

  }
};




exports.getStaffBookings = async (
  req,
  res
) => {
  try {

    const { staffId } = req.params;

    const bookings =
      await bookingRepo.getStaffBookings(
        staffId
      );

    res.json({ bookings });

  } catch (err) {

    console.error(
      "Staff bookings error:",
      err
    );

    res.status(500).json({
      message: "Server error"
    });

  }
};




