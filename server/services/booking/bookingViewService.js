const jwt = require("jsonwebtoken");
const bookingRepo = require("../../repositories/bookingRepository");

exports.getOwnerBookings = async (req, res) => {
  try {

    const { ownerId } = req.params;

    const bookings =
      await bookingRepo.getOwnerBookings(ownerId);

    const parsedBookings = bookings.map(b => ({
      ...b,
      items:
        typeof b.items === "string"
          ? JSON.parse(b.items)
          : b.items
    }));

    res.json({
      bookings: parsedBookings
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });

  }
};

exports.getDeliveredBookings = async (req, res) => {
  try {

    const { ownerId } = req.params;

    const page = Number(req.query.page) || 1;

    const limit = 20;

    const offset = (page - 1) * limit;

    const bookings =
      await bookingRepo.getDeliveredBookings(
        ownerId,
        limit,
        offset
      );

    const parsedBookings = bookings.map(b => ({
      ...b,
      items:
        typeof b.items === "string"
          ? JSON.parse(b.items)
          : b.items
    }));

    res.json({
      bookings: parsedBookings
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });

  }
};




exports.getCustomerBookings = async (req, res) => {
  const page = Number(req.query.page) || 1;
const limit = 10;
const offset = (page - 1) * limit;
  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token"
      });
    }

    const token =
      authHeader.split(" ")[1];

    const payload =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    const { ownerId } = req.params;

    const bookings =
      await bookingRepo.getCustomerBookings(
        payload.customerId,
        ownerId,
        limit,
    offset
      );

    const parsedBookings = bookings.map(b => ({
      ...b,
      items:
        typeof b.items === "string"
          ? JSON.parse(b.items)
          : b.items
    }));

    res.json({
      bookings: parsedBookings
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server error"
    });

  }
};









exports.getAvailablePickupStaff = async (
  req,
  res
) => {
  try {

    const { bookingId } = req.params;

    const booking =
      await bookingRepo.getBookingStaffAvailabilityData(
        bookingId
      );

    if (booking.length === 0) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const checkDate =
      booking[0].status === "ready_to_deliver"
        ? booking[0].completion_datetime
        : booking[0].pickup_datetime;

    const owner =
      await bookingRepo.getOwnerNumericId(
        booking[0].owner_id
      );

    if (owner.length === 0) {
      return res.status(404).json({
        message: "Owner not found"
      });
    }

    const staff =
      await bookingRepo.getAvailableStaff(
        owner[0].owner_id,
        checkDate
      );

    res.json({
      staff
    });

  } catch (err) {

    console.error(
      "Available staff error:",
      err
    );

    res.status(500).json({
      message: "Server Error"
    });

  }
};








exports.getOwnerStats = async (
  req,
  res
) => {
  try {

    const { ownerId } = req.params;

    const bookings =
      await bookingRepo.getDeliveredBookingsForStats(
        ownerId
      );

    const today = new Date();

    const last7Days = [];

    for (let i = 6; i >= 0; i--) {

      const d = new Date();

      d.setDate(
        today.getDate() - i
      );

      last7Days.push({
        date: d.toISOString().slice(0, 10),
        revenue: 0,
        bookings: 0
      });

    }

    bookings.forEach(b => {

      const bookingDate =
        b.created_at
         .toISOString()
         .slice(0, 10);

      const day =
        last7Days.find(
          d => d.date === bookingDate
        );

      if (day) {

        day.revenue += Number(
          b.total_price || 0
        );

        day.bookings += 1;

      }

    });

    res.json({
      stats: last7Days
    });

  } catch (err) {

    console.error(
      "Owner stats error:",
      err
    );

    res.status(500).json({
      message: "Server error"
    });

  }
};