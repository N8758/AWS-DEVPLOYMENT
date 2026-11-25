
const bookingRepo =
require("../../repositories/bookingRepository");

exports.createBooking = async (req, res) => {
  try {
  const {
  ownerId,
  services,   // ✅ NEW
  customerAddress,
  pickupType,
  deliveryCharge
} = req.body;

  const jwt = require("jsonwebtoken");


// ✅ check header
const authHeader = req.headers.authorization;

if (!authHeader) {
  return res.status(401).json({ message: "No token provided" });
}

const token = authHeader.split(" ")[1];

let payload;
try {
  payload = jwt.verify(token, process.env.JWT_SECRET);
} catch (err) {
  return res.status(401).json({ message: "Invalid token" });
}
const customerMobile = payload.customerMobile;



// ✅ check customerId
if (!payload.customerId) {
  return res.status(400).json({ message: "customerId missing in token" });
}

// ✅ get customer from DB
const user = {
  rows: await bookingRepo.getCustomerById(
    payload.customerId
  )
};

if (user.rows.length === 0) {
  return res.status(404).json({ message: "Customer not found" });
}

const customerName = user.rows[0].name;

const dbAddress = user.rows[0].address;
const dbLat = user.rows[0].latitude;
const dbLng = user.rows[0].longitude;

// priority: booking address > profile address
const finalAddress = customerAddress || dbAddress;


  if (!ownerId || !services || !pickupType) {
    return res.status(400).json({ message: "Missing data" });
  }



  // CHECK OWNER ACTIVE STATUS
const ownerStatus = {
  rows: await bookingRepo.getOwnerStatus(ownerId)
};

if (
  ownerStatus.rows.length === 0 ||
  ownerStatus.rows[0].is_active === false
) {
  return res.status(403).json({
    message:
      "This laundry is temporarily unavailable"
  });
}


  // ✅ CHECK HOLIDAY

const holidayCheck = {
  rows: await bookingRepo.getOwnerHoliday(ownerId)
};

if (holidayCheck.rows.length > 0) {
  return res.status(400).json({
    message: "Laundry is closed today due to holiday"
  });
}

let finalTotal = 0;
let bookingStatus = pickupType === "door" ? "pending" : "accepted";
let allServicesData = [];

for (const s of services) {

  // ✅ check same owner
  const checkOwner = {
  rows: await bookingRepo.getServiceById(
    s.serviceId
  )
};

  const service = checkOwner.rows[0];


  if (!service) {
  return res.status(404).json({ message: "Service not found" });
}

  if (service.owner_id !== ownerId) {
    return res.status(400).json({
      message: "All services must belong to same owner"
    });
  }

  let serviceTotal = 0;

  // 🔥 PER KG
  if (service.pricing_type === "perKg") {
    bookingStatus = "pending_weight";
  }

  // 🔥 PER ITEM
  if (service.pricing_type === "perItem") {
    const itemPrices =
      typeof service.item_prices === "string"
        ? JSON.parse(service.item_prices)
        : service.item_prices;

    serviceTotal = s.items.reduce((sum, item) => {
      const found = itemPrices.find(
  i => i.item.trim().toLowerCase() === item.name.trim().toLowerCase()
);
      const price = found ? Number(found.price) : 0;

      return sum + price * Number(item.quantity || 0);
    }, 0);
  }

  // ✅ ADD GST
const gstPercent = Number(service.gst || 0);
const gstAmount = (serviceTotal * gstPercent) / 100;

serviceTotal += gstAmount;

// ✅ ADD TO FINAL
finalTotal += serviceTotal;

  allServicesData.push({
    serviceId: s.serviceId,
    serviceName: s.serviceName,
    items: service.pricing_type === "perKg" ? null : s.items,
    weight: null,
    total: serviceTotal,
    price_per_kg: service.price_per_kg || 0 ,
    gst: service.gst || 0 
  });
}

  

  const finalDeliveryCharge = pickupType === "door" ? Number(deliveryCharge || 0) : 0;

  finalTotal += finalDeliveryCharge;
  

  const booking = {
    
    ownerId,
   items: allServicesData,
   latitude: dbLat || req.body.latitude,
longitude: dbLng || req.body.longitude,
    
    pickupType, // self or door
    deliveryCharge: finalDeliveryCharge,
    totalPrice: finalTotal,
    weight: null,
    customerName,
    customerMobile,
    customerAddress: finalAddress,
    status: bookingStatus,
    pickupDateTime: null,
    completionDateTime: null,
    hiddenForCustomer: false,
    hiddenForOwner: false,
    createdAt: new Date()
  };

 await bookingRepo.insertBooking(
  booking,
  payload.customerId
);

  res.json({ message: "Booking successful", booking });

  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};