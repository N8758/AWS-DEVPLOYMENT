const pool = require("../config/db");

exports.getCustomerById = async (customerId) => {
  const result = await pool.query(
    `SELECT name,address,latitude,longitude
     FROM customers
     WHERE customer_id=$1`,
    [customerId]
  );

  return result.rows;
};

exports.getOwnerStatus = async (ownerId) => {
  const result = await pool.query(
    `
    SELECT is_active
    FROM owners
    WHERE unique_id=$1
    `,
    [ownerId]
  );

  return result.rows;
};

exports.getOwnerHoliday = async (ownerId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM owner_holidays h
    JOIN owners o
    ON h.owner_id=o.owner_id
    WHERE o.unique_id=$1
    AND (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date
    BETWEEN h.start_date AND h.end_date
    `,
    [ownerId]
  );

  return result.rows;
};

exports.getServiceById = async (serviceId) => {
  const result = await pool.query(
    `
    SELECT owner_id,
           pricing_type,
           price_per_kg,
           item_prices,
           gst
    FROM services
    WHERE id=$1
    `,
    [serviceId]
  );

  return result.rows;
};

exports.insertBooking = async (booking, customerId) => {
  return await pool.query(
    `
    INSERT INTO bookings
    (
      owner_id,
      items,
      pickup_type,
      delivery_charge,
      total_price,
      weight,
      customer_id,
      customer_name,
      customer_mobile,
      customer_address,
      latitude,
      longitude,
      status,
      pickup_datetime,
      completion_datetime,
      hidden_for_customer,
      hidden_for_owner,
      created_at
    )
    VALUES
    (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,$11,$12,
      $13,$14,$15,$16,$17,$18
    )
    `,
    [
      booking.ownerId,
      JSON.stringify(booking.items),
      booking.pickupType,
      booking.deliveryCharge,
      booking.totalPrice,
      booking.weight,
      customerId,
      booking.customerName,
      booking.customerMobile,
      booking.customerAddress,
      booking.latitude,
      booking.longitude,
      booking.status,
      booking.pickupDateTime,
      booking.completionDateTime,
      booking.hiddenForCustomer,
      booking.hiddenForOwner,
      booking.createdAt
    ]
  );
};













exports.getOwnerBookings = async (ownerId) => {
  const result = await pool.query(
    `SELECT b.booking_id AS "bookingId",
      b.owner_id AS "ownerId",
      b.items,
      b.pickup_type AS "pickupType",
      b.delivery_charge AS "deliveryCharge",
      b.total_price AS "totalPrice",
      b.customer_name AS "customerName",
      b.customer_mobile AS "customerMobile",
      b.customer_address AS "customerAddress",
      ps.name AS "pickupStaffName",
      ds.name AS "deliveryStaffName",
      b.latitude,
      b.longitude,
      b.cancel_reason AS "cancelReason",
      b.reschedule_reason AS "rescheduleReason",
      b.customer_cancel_reason AS "customerCancelReason",
      b.customer_reschedule_reason AS "customerRescheduleReason",
      b.customer_cancel_request AS "customerCancelRequest",
      b.customer_reschedule_request AS "customerRescheduleRequest",
      b.status AS "status",
      b.pickup_datetime AS "pickupDateTime",
      b.completion_datetime AS "completionDateTime",
      b.created_at AS "createdAt"
      FROM bookings b
      LEFT JOIN staff ps
      ON b.pickup_staff_id = ps.staff_id
      LEFT JOIN staff ds
      ON b.delivery_staff_id = ds.staff_id
      WHERE b.owner_id=$1
      AND b.hidden_for_owner=false
      ORDER BY b.created_at DESC`,
    [ownerId]
  );

  return result.rows;
};



exports.getDeliveredBookings = async (
  ownerId,
  limit,
  offset
) => {
  const result = await pool.query(
    `
    SELECT
      b.booking_id AS "bookingId",
      b.owner_id AS "ownerId",
      b.items,
      b.pickup_type AS "pickupType",
      b.delivery_charge AS "deliveryCharge",
      b.total_price AS "totalPrice",
      b.customer_name AS "customerName",
      b.customer_mobile AS "customerMobile",
      b.customer_address AS "customerAddress",
      ps.name AS "pickupStaffName",
      ds.name AS "deliveryStaffName",
      b.latitude,
      b.longitude,
      b.status AS "status",
      b.pickup_datetime AS "pickupDateTime",
      b.completion_datetime AS "completionDateTime",
      b.created_at AS "createdAt"
    FROM bookings b
    LEFT JOIN staff ps
      ON b.pickup_staff_id = ps.staff_id
    LEFT JOIN staff ds
      ON b.delivery_staff_id = ds.staff_id
    WHERE b.owner_id = $1
      AND b.hidden_for_owner = false
      AND b.status IN ('delivered','completed')
    ORDER BY b.created_at DESC
    LIMIT $2
    OFFSET $3
    `,
    [ownerId, limit, offset]
  );

  return result.rows;
};



exports.getCustomerBookings = async (
  customerId,
  ownerId,
  limit,
  offset
) => {
  const result = await pool.query(
    `SELECT booking_id AS "bookingId",
      owner_id AS "ownerId",
      items,
      pickup_type AS "pickupType",
      delivery_charge AS "deliveryCharge",
      total_price AS "totalPrice",
      customer_name AS "customerName",
      customer_address AS "customerAddress",
      latitude,
      longitude,
      cancel_reason AS "cancelReason",
      reschedule_reason AS "rescheduleReason",
      customer_cancel_reason AS "customerCancelReason",
      customer_reschedule_reason AS "customerRescheduleReason",
      status,
      pickup_datetime AS "pickupDateTime",
      completion_datetime AS "completionDateTime",
      created_at AS "createdAt"
      FROM bookings
      WHERE customer_id=$1
      AND owner_id=$2
      AND hidden_for_customer=false
      ORDER BY created_at DESC
LIMIT $3
OFFSET $4`,
   [customerId, ownerId, limit, offset]
  );

  return result.rows;
};










 



















exports.getPickupStaffByBookingId = async (bookingId) => {
  const result = await pool.query(
    `
    SELECT pickup_staff_id
    FROM bookings
    WHERE booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};

exports.getBookingCustomerDetails = async (bookingId) => {
  const result = await pool.query(
    `
    SELECT b.customer_name,
           b.customer_mobile,
           c.fcm_token,
           o.shop_name
    FROM bookings b

    JOIN customers c
    ON b.customer_id = c.customer_id

    JOIN owners o
    ON b.owner_id = o.unique_id

    WHERE b.booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};

exports.updateBookingConfirmation = async (
  bookingId,
  status,
  pickupDate
) => {
  return await pool.query(
    `
    UPDATE bookings
    SET status=$1,
        pickup_datetime=$2
    WHERE booking_id=$3
    `,
    [status, pickupDate, bookingId]
  );
};










exports.getCompleteBookingDetails = async (bookingId) => {
  const result = await pool.query(
    `
    SELECT
        b.customer_name,
        b.customer_mobile,
          c.fcm_token,
        
        b.delivery_staff_id,
        s.name AS staff_name,
        o.mobile AS owner_mobile,
        
        o.shop_name
    FROM bookings b

    JOIN customers c
ON b.customer_id = c.customer_id


    JOIN owners o
    ON b.owner_id = o.unique_id
    LEFT JOIN staff s
    ON b.delivery_staff_id = s.staff_id
    WHERE b.booking_id = $1
    `,
    [bookingId]
  );

  return result.rows;
};

exports.getBookingPickupType = async (bookingId) => {
  const result = await pool.query(
    `
    SELECT pickup_type
    FROM bookings
    WHERE booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};

exports.updateBookingCompletion = async (
  bookingId,
  status,
  completionDate
) => {
  return await pool.query(
    `
    UPDATE bookings
    SET status=$1,
        completion_datetime=$2
    WHERE booking_id=$3
    `,
    [status, completionDate, bookingId]
  );
};



exports.getBookingWeightData = async (bookingId) => {
  const result = await pool.query(
    `
    SELECT items,
           delivery_charge,
           pickup_type
    FROM bookings
    WHERE booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};

exports.getBookingStatus = async (bookingId) => {
  const result = await pool.query(
    `
    SELECT status
    FROM bookings
    WHERE booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};

exports.updateBookingWeight = async (
  bookingId,
  items,
  total,
  status
) => {
  return await pool.query(
    `
    UPDATE bookings
    SET items=$1,
        total_price=$2,
        status=$3
    WHERE booking_id=$4
    `,
    [
      JSON.stringify(items),
      total,
      status,
      bookingId
    ]
  );
};


















exports.getPickupBookingDetails = async (
  bookingId
) => {
  const result = await pool.query(
    `
    SELECT
      b.customer_name,
      b.customer_mobile,
      c.fcm_token,
      s.name AS staff_name,
      o.shop_name,
      b.pickup_datetime
    FROM bookings b

    JOIN customers c
    ON b.customer_id = c.customer_id

    LEFT JOIN staff s
    ON b.pickup_staff_id = s.staff_id

    JOIN owners o
    ON b.owner_id = o.unique_id

    WHERE b.booking_id = $1
    `,
    [bookingId]
  );

  return result.rows;
};

exports.updatePickupOngoingStatus =
async (bookingId) => {
  return await pool.query(
    `
    UPDATE bookings
    SET status='pickup_ongoing'
    WHERE booking_id=$1
    `,
    [bookingId]
  );
};





exports.updatePickupCompletedStatus =
async (bookingId) => {
  return await pool.query(
    `
    UPDATE bookings
    SET status='pickup_completed'
    WHERE booking_id=$1
    `,
    [bookingId]
  );
};














exports.getDeliveryBookingDetails =
async (bookingId) => {
  const result = await pool.query(
    `
    SELECT
      b.customer_name,
      b.customer_mobile,
       c.fcm_token,
      s.name AS staff_name,
      o.shop_name,
       b.completion_datetime
      
    FROM bookings b

     JOIN customers c
    ON b.customer_id = c.customer_id


    LEFT JOIN staff s
    ON b.delivery_staff_id = s.staff_id

    JOIN owners o
    ON b.owner_id = o.unique_id

    WHERE b.booking_id = $1
    `,
    [bookingId]
  );

  return result.rows;
};



exports.updateDeliveryOngoingStatus =
async (bookingId) => {
  return await pool.query(
    `
    UPDATE bookings
    SET status='delivery_ongoing',
        delivery_ongoing=true
    WHERE booking_id=$1
    `,
    [bookingId]
  );
};







exports.getCompleteDeliveryDetails =
async (bookingId) => {
  const result = await pool.query(
    `
    SELECT
      b.customer_name,
      b.customer_mobile,
      c.fcm_token AS customer_fcm_token,
      o.fcm_token AS owner_fcm_token,
      b.delivery_staff_id,
      s.name AS staff_name,
      o.mobile AS owner_mobile,
      o.shop_name
    FROM bookings b

    JOIN customers c
    ON b.customer_id = c.customer_id

    JOIN owners o
    ON b.owner_id = o.unique_id

    LEFT JOIN staff s
    ON b.delivery_staff_id = s.staff_id

    WHERE b.booking_id = $1
    `,
    [bookingId]
  );

  return result.rows;
};




exports.markDeliveryCompleted =
async (bookingId) => {
  return await pool.query(
    `
    UPDATE bookings
    SET status='delivered'
    WHERE booking_id=$1
    `,
    [bookingId]
  );
};








exports.savePickupDate = async (
  bookingId,
  pickupDateTime
) => {
  return await pool.query(
    `
    UPDATE bookings
    SET pickup_datetime = $1
    WHERE booking_id = $2
    `,
    [pickupDateTime, bookingId]
  );
};




exports.saveDeliveryDate = async (
  bookingId,
  completionDateTime
) => {
  return await pool.query(
    `
    UPDATE bookings
    SET completion_datetime = $1
    WHERE booking_id = $2
    `,
    [completionDateTime, bookingId]
  );
};



exports.startProcessing = async (
  bookingId
) => {
  return await pool.query(
    `
    UPDATE bookings
    SET status='processing'
    WHERE booking_id=$1
    `,
    [bookingId]
  );
};




exports.updateReadyToDeliverStatus =
async (bookingId) => {
  return await pool.query(
    `
    UPDATE bookings
    SET status='ready_to_deliver'
    WHERE booking_id=$1
    `,
    [bookingId]
  );
};




exports.getBookingStatus = async (
  bookingId
) => {
  const result = await pool.query(
    `
    SELECT status
    FROM bookings
    WHERE booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};


exports.getBookingStaffInfo = async (
  bookingId
) => {
  const result = await pool.query(
    `
    SELECT pickup_staff_id,
           delivery_staff_id
    FROM bookings
    WHERE booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};




exports.getBookingCustomerDetails =
async (bookingId) => {
  const result = await pool.query(
    `
    SELECT
      b.customer_name,
      b.customer_mobile,
      c.fcm_token,
      o.shop_name
    FROM bookings b
    JOIN customers c
      ON b.customer_id = c.customer_id
    JOIN owners o
      ON b.owner_id = o.unique_id
    WHERE b.booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};


exports.cancelBooking = async (
  bookingId,
  reason
) => {
  await pool.query(
    `
    UPDATE bookings
    SET status='cancelled',
        cancel_reason=$1
    WHERE booking_id=$2
    `,
    [reason, bookingId]
  );
};



exports.getStaffByStaffId = async (
  staffId
) => {
  const result = await pool.query(
    `
    SELECT id
    FROM staff
    WHERE staff_id=$1
    `,
    [staffId]
  );

  return result.rows;
};



exports.insertStaffNotification =
async (staffId, message) => {
  await pool.query(
    `
    INSERT INTO staff_notifications
    (staff_id,message)
    VALUES ($1,$2)
    `,
    [staffId, message]
  );
};




exports.checkHoliday = async (
  bookingId,
  newDate
) => {
  const result = await pool.query(
    `
    SELECT 1
    FROM owner_holidays h
    WHERE h.owner_id = (
      SELECT o.owner_id
      FROM bookings b
      JOIN owners o
      ON o.unique_id = b.owner_id
      WHERE b.booking_id = $1
    )
    AND (
      (
        h.holiday_type = 'FULL'
        AND (($2::timestamptz AT TIME ZONE 'Asia/Kolkata'))::date
        BETWEEN h.start_date AND h.end_date
      )
      OR
      (
  h.holiday_type = 'HALF'
  AND (($2::timestamptz AT TIME ZONE 'Asia/Kolkata'))::date
      BETWEEN h.start_date AND h.end_date
  AND (($2::timestamptz AT TIME ZONE 'Asia/Kolkata'))::time
      BETWEEN h.start_time AND h.end_time
)
    )
    `,
    [bookingId, newDate]
  );

  return result.rows;
};


exports.getBookingCustomerDetails =
async (bookingId) => {
  const result = await pool.query(
    `
    SELECT
      b.customer_name,
      b.customer_mobile,
      c.fcm_token,
      o.shop_name
    FROM bookings b
    JOIN customers c
      ON b.customer_id = c.customer_id
    JOIN owners o
      ON b.owner_id = o.unique_id
    WHERE b.booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};



exports.reschedulePickup = async (
  bookingId,
  newDate,
  reason
) => {

  await pool.query(
    `
    UPDATE bookings
    SET pickup_datetime=$1,
        reschedule_reason=$2,
        pickup_staff_id=NULL,
        status='accepted'
    WHERE booking_id=$3
    `,
    [
      new Date(newDate),
      reason,
      bookingId
    ]
  );

};




exports.rescheduleDelivery = async (
  bookingId,
  newDate,
  reason
) => {

  await pool.query(
    `
    UPDATE bookings
    SET completion_datetime=$1,
        reschedule_reason=$2,
        delivery_staff_id=NULL,
        status='ready_to_deliver',
        delivery_rescheduled=true
    WHERE booking_id=$3
    `,
    [
      new Date(newDate),
      reason,
      bookingId
    ]
  );

};






exports.getStaffDetails = async (
  staffId
) => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      mobile,
      fcm_token
    FROM staff
    WHERE staff_id=$1
    `,
    [staffId]
  );

  return result.rows;
};



exports.getBookingDates = async (
  bookingId
) => {
  const result = await pool.query(
    `
    SELECT pickup_datetime,
           completion_datetime
    FROM bookings
    WHERE booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};



exports.checkStaffLeave = async (
  staffId,
  bookingDate
) => {
  const result = await pool.query(
    `
    SELECT *
    FROM leaves
    WHERE staff_id=$1
    AND status='Approved'
    AND from_date <= $2::date
    AND to_date >= $2::date
    `,
    [
      staffId,
      bookingDate
    ]
  );

  return result.rows;
};



exports.assignPickupStaff =
async (
  bookingId,
  staffId
) => {
  await pool.query(
    `
    UPDATE bookings
    SET pickup_staff_id=$1
    WHERE booking_id=$2
    `,
    [staffId, bookingId]
  );
};



exports.getDeliveryRescheduledFlag =
async (bookingId) => {
  const result = await pool.query(
    `
    SELECT delivery_rescheduled
    FROM bookings
    WHERE booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};




exports.assignDeliveryStaff =
async (
  bookingId,
  staffId
) => {
  await pool.query(
    `
    UPDATE bookings
    SET delivery_staff_id=$1
    WHERE booking_id=$2
    `,
    [staffId, bookingId]
  );
};


exports.assignDeliveryStaffRescheduled =
async (
  bookingId,
  staffId
) => {
  await pool.query(
    `
    UPDATE bookings
    SET delivery_staff_id=$1,
        status='delivery_assigned',
        delivery_rescheduled=false
    WHERE booking_id=$2
    `,
    [staffId, bookingId]
  );
};


exports.getShopNameByBooking =
async (bookingId) => {
  const result = await pool.query(
    `
    SELECT o.shop_name
    FROM bookings b
    JOIN owners o
    ON b.owner_id=o.unique_id
    WHERE b.booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};




exports.getCustomerCancelDetails =
async (bookingId) => {

  const result = await pool.query(
    `
    SELECT
      b.customer_name,
      b.customer_mobile,
      b.status,
      o.shop_name,
      o.mobile AS owner_mobile,
      o.fcm_token AS owner_fcm_token
    FROM bookings b
    JOIN owners o
    ON b.owner_id=o.unique_id
    WHERE b.booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};




exports.customerCancelBooking =
async (
  bookingId,
  reason
) => {

  await pool.query(
    `
    UPDATE bookings
    SET customer_cancel_request=true,
        customer_cancel_reason=$1,
        status='cancelled'
    WHERE booking_id=$2
    `,
    [
      reason,
      bookingId
    ]
  );

};




exports.getCustomerRescheduleDetails =
async (bookingId) => {

  const result = await pool.query(
    `
    SELECT
      b.customer_name,
      b.customer_mobile,
      b.status,
      b.completion_datetime,
      b.pickup_datetime,
      o.shop_name,
      o.mobile AS owner_mobile,
       o.fcm_token AS owner_fcm_token
    FROM bookings b
    JOIN owners o
    ON b.owner_id=o.unique_id
    WHERE b.booking_id=$1
    `,
    [bookingId]
  );

  return result.rows;
};




exports.customerReschedulePickup =
async (
  bookingId,
  newDate,
  reason
) => {

  await pool.query(
    `
    UPDATE bookings
    SET customer_reschedule_request=true,
        pickup_datetime=$1,
        customer_reschedule_reason=$2,
        pickup_staff_id=NULL,
        status='accepted'
    WHERE booking_id=$3
    `,
    [
      new Date(newDate),
      reason,
      bookingId
    ]
  );

};




exports.customerRescheduleDelivery =
async (
  bookingId,
  newDate,
  reason
) => {

  await pool.query(
    `
    UPDATE bookings
    SET customer_reschedule_request=true,
        completion_datetime=$1,
        customer_reschedule_reason=$2,
        delivery_staff_id=NULL,
        status='ready_to_deliver',
        delivery_rescheduled=true
    WHERE booking_id=$3
    `,
    [
      new Date(newDate),
      reason,
      bookingId
    ]
  );

};








exports.getBookingStaffAvailabilityData =
async (bookingId) => {

  const result = await pool.query(
    `
    SELECT pickup_datetime,
           completion_datetime,
           status,
           owner_id
    FROM bookings
    WHERE booking_id = $1
    `,
    [bookingId]
  );

  return result.rows;
};




exports.getOwnerNumericId =
async (ownerUniqueId) => {

  const result = await pool.query(
    `
    SELECT owner_id
    FROM owners
    WHERE unique_id = $1
    `,
    [ownerUniqueId]
  );

  return result.rows;
};



exports.getAvailableStaff =
async (ownerId, checkDate) => {

  const result = await pool.query(
    `
    SELECT *
    FROM staff s
    WHERE s.owner_id = $1
    AND s.id NOT IN (
      SELECT staff_id
      FROM leaves
      WHERE status = 'Approved'
      AND from_date <= $2::date
      AND to_date >= $2::date
    )
    ORDER BY s.name
    `,
    [ownerId, checkDate]
  );

  return result.rows;
};









exports.getStaffBookings = async (
  staffId
) => {

  const result = await pool.query(
    `
    SELECT
      booking_id,
      customer_name,
      customer_mobile,
      customer_address,
      latitude,
      longitude,
      pickup_type,
      status,
      total_price,
      pickup_datetime,
      completion_datetime,
      delivery_staff_id,
      pickup_staff_id,
      pickup_ongoing,
      delivery_ongoing,
      items
    FROM bookings
    WHERE
    (
      pickup_staff_id = $1
      AND status IN (
        'assigned',
        'accepted',
        'pickup_ongoing',
        'pickup_completed'
      )
    )
    OR
    (
      delivery_staff_id = $1
      AND status IN (
        'delivery_assigned',
        'delivery_ongoing',
        'delivered'
      )
    )
    ORDER BY created_at DESC
    `,
    [staffId]
  );

  return result.rows.map(b => ({
    ...b,
    items:
      typeof b.items === "string"
        ? JSON.parse(b.items)
        : b.items
  }));
};





exports.getDeliveredBookingsForStats =
async (ownerId) => {

  const result = await pool.query(
    `
    SELECT *
    FROM bookings
    WHERE owner_id = $1
    AND status = 'delivered'
    AND hidden_for_owner = false
    `,
    [ownerId]
  );

  return result.rows;
};





exports.getBookingCustomerDetailsWithDates =
async (bookingId) => {
  const result = await pool.query(
    `
    SELECT
      b.customer_name,
      b.customer_mobile,
      c.fcm_token,
      o.shop_name,
      b.pickup_datetime,
      b.completion_datetime
    FROM bookings b
    JOIN customers c
      ON b.customer_id = c.customer_id
    JOIN owners o
      ON b.owner_id = o.unique_id
    WHERE b.booking_id = $1
    `,
    [bookingId]
  );

  return result.rows;
};










exports.insertNotification = async (
  userId,
  userType,
  message
) => {
  await pool.query(
    `
    INSERT INTO notifications
    (user_id, user_type, message)
    VALUES ($1,$2,$3)
    `,
    [userId, userType, message]
  );
};