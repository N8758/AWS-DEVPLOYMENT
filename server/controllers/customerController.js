const pool = require("../config/db");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const sendWhatsAppSimulator = require("../utils/sendWhatsAppSimulator");

function generateCustomerToken(mobile, name) {
  return jwt.sign({ customerMobile: mobile, customerName: name }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });
}

function getCustomerFromToken(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}

// POST /api/customer/request-otp  { mobile, name }
// Generates a 4-digit OTP and stores it in data.json.tempOtps
exports.requestOtp = async (req, res) => {
  try {
    const {
  name,
  email,
  mobile,
  password
} = req.body;


const existingCustomer = await pool.query(
  `SELECT customer_id, last_login
   FROM customers
   WHERE mobile = $1`,
  [mobile]
);

if (existingCustomer.rows.length > 0) {

  const customer = existingCustomer.rows[0];

  const lastLogin = new Date(customer.last_login);
  const now = new Date();

  const daysInactive =
    (now - lastLogin) / (1000 * 60 * 60 * 24);

  if (daysInactive <= 30) {
    return res.status(400).json({
      message:
        "Mobile number already registered. Please login."
    });
  }

}

if (!name || !email || !mobile || !password) {
  return res.status(400).json({
    message: "All fields are required"
  });
}



if (!mobile) {
  return res.status(400).json({
    message: "Mobile required"
  });
}

if (!/^[6-9]\d{9}$/.test(mobile)) {
  return res.status(400).json({
    message: "Enter valid 10 digit mobile number"
  });
}

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await pool.query(
  `INSERT INTO customer_otps
  (
    mobile,
    otp,
    name,
    email,
    password,
    expires_at
  )
  VALUES
  (
    $1,
    $2,
    $3,
    $4,
    $5,
    NOW() + INTERVAL '5 minutes'
  )
  ON CONFLICT (mobile)
  DO UPDATE SET
    otp = $2,
    name = $3,
    email = $4,
    password = $5,
    expires_at = NOW() + INTERVAL '5 minutes',
    created_at = NOW()`,
  [
    mobile,
    otp,
    name,
    email,
    password
  ]
);

    await sendWhatsAppSimulator(
    mobile,
    "otp_cutomer",
    [otp]
);

res.json({
   message: "OTP sent successfully"
});

  } catch (err) {
    console.error("OTP request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/customer/verify-otp  { mobile, otp }
// Returns JWT token on success
exports.verifyOtp = async (req, res) => {
  try {
    const { mobile, otp, name } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: "mobile and otp required" });
    }

    const result = await pool.query(
      "SELECT * FROM customer_otps WHERE mobile=$1",
      [mobile]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const record = result.rows[0];

    if (new Date(record.expires_at) < new Date()) {
  return res.status(401).json({ message: "OTP expired" });
}

    if (record.otp !== String(otp)) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    await pool.query(
      "DELETE FROM customer_otps WHERE mobile=$1",
      [mobile]
    );

    // save customer in DB and get customer_id
const hashedPassword = await bcrypt.hash(
record.password,
10
);

const result2 = await pool.query(
`INSERT INTO customers
(
  mobile,
  name,
  email,
  password,
  mobile_verified,
  last_login
)
VALUES
(
  $1,
  $2,
  $3,
  $4,
  true,
  NOW()
)
ON CONFLICT (mobile)
DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  mobile_verified = true,
  last_login = NOW()
RETURNING customer_id`,
[
  record.mobile,
  record.name,
  record.email,
  hashedPassword
]
);


const customerId = result2.rows[0].customer_id;

// create token with customer_id
const token = jwt.sign(
  {
    customerMobile: mobile,
    customerName: record.name,
    customerId: customerId
  },
  process.env.JWT_SECRET,
  { expiresIn: "2d" }
);

    res.json({ message: "OTP verified", token });

  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




// GET /api/customer/owner/:id  - get owner by uniqueID
exports.getOwnerById = async (req, res) => {
  try {
    const { id } = req.params;

   const result = await pool.query(
  `SELECT 
    owner_id,

    owner_name,
    email,
    mobile,
    unique_id,
    qr_code_data_url,
    shop_name,
    address,
    door_enabled,
    door_charge
   FROM owners 
WHERE unique_id=$1 OR email=$1`,
  [id]
);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const owner = result.rows[0];
    delete owner.password;

    res.json({ owner });

  } catch (err) {
    console.error("Get owner error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/customer/owner/:id/services - list owner services
exports.getOwnerServices = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        id,
        title,
         category,
        pricing_type AS "pricingType",
        price_per_kg AS "pricePerKg",
        item_prices AS "itemPrices",
        description AS "desc",
        image_url AS "imageUrl",
        gst
      FROM services
      WHERE owner_id=$1 AND is_active=true`,
      [id]
    );

    res.json({ services: result.rows });

  } catch (err) {
    console.error("Get services error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/customer/me
exports.getMe = async (req, res) => {
  try {
    const payload = getCustomerFromToken(req);

    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
  "SELECT name, email, mobile, address, latitude, longitude FROM customers WHERE customer_id=$1",
  [payload.customerId]
);

    const dbUser = result.rows[0];

    res.json({
      customer: {
  mobile: payload.customerMobile,
  name: dbUser?.name || payload.customerName,
  email: dbUser?.email || "",
  address: dbUser?.address || "",
  latitude: dbUser?.latitude || null,
  longitude: dbUser?.longitude || null
}
    });

  } catch (err) {
    console.error("Get customer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};





exports.updateCustomerProfile = async (req, res) => {
  try {
    const payload = getCustomerFromToken(req);

    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const customerId = payload.customerId;

    const { name, email, address, latitude, longitude } = req.body;

    const result = await pool.query(
      `UPDATE customers
       SET name=$1,
           email=$2,
           address=$3,
           latitude=$4,
           longitude=$5
       WHERE customer_id=$6
       RETURNING *`,
      [name, email, address, latitude, longitude, customerId]
    );

    res.json({
      message: "Customer profile updated successfully",
      customer: result.rows[0],
    });

  } catch (err) {
    console.error("Customer profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};












exports.loginCustomer = async (req, res) => {
try {
const { mobile, password } = req.body;


if (!mobile || !password) {
  return res.status(400).json({
    message: "Mobile and password are required",
  });
}

const result = await pool.query(
  `SELECT *
   FROM customers
   WHERE mobile = $1`,
  [mobile]
);

if (result.rows.length === 0) {
  return res.status(401).json({
    message: "Customer not found",
  });
}

const customer = result.rows[0];

const lastLogin = new Date(customer.last_login);
const now = new Date();

const daysInactive =
(now - lastLogin) / (1000 * 60 * 60 * 24);

if (daysInactive > 30) {
return res.status(403).json({
message:
"Your account has been inactive for more than 30 days.",
});
}



if (!customer.mobile_verified) {
  return res.status(401).json({
    message: "Mobile number not verified",
  });
}

const isValidPassword = await bcrypt.compare(
password,
customer.password
);

if (!isValidPassword) {
return res.status(401).json({
message: "Invalid password",
});
}

await pool.query(
`UPDATE customers
SET last_login = NOW()
WHERE customer_id = $1`,
[customer.customer_id]
);



const token = jwt.sign(

  
  {
    customerId: customer.customer_id,
    customerMobile: customer.mobile,
    customerName: customer.name,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "2d",
  }
);

res.json({
  message: "Login successful",
  token,
  customer: {
    customerId: customer.customer_id,
    name: customer.name,
    email: customer.email,
    mobile: customer.mobile,
  },
});


} catch (err) {
console.error("Customer login error:", err);
res.status(500).json({
message: "Server error",
});
}
};









exports.resetCustomerPassword = async (req, res) => {
try {
const { mobile, password, confirmPassword } = req.body;


if (!mobile || !password || !confirmPassword) {
  return res.status(400).json({
    message: "All fields are required",
  });
}

if (!/^[6-9]\d{9}$/.test(mobile)) {
  return res.status(400).json({
    message: "Enter valid mobile number",
  });
}

if (password.length < 6) {
  return res.status(400).json({
    message: "Password must be at least 6 characters",
  });
}

if (password !== confirmPassword) {
  return res.status(400).json({
    message: "Passwords do not match",
  });
}

const result = await pool.query(
  `SELECT *
   FROM customers
   WHERE mobile = $1`,
  [mobile]
);

if (result.rows.length === 0) {
  return res.status(404).json({
    message: "Mobile number not registered",
  });
}

const customer = result.rows[0];


const lastLogin = new Date(customer.last_login);
const now = new Date();

const daysInactive =
(now - lastLogin) / (1000 * 60 * 60 * 24);

if (daysInactive > 30) {
  return res.status(403).json({
    message:
      "Your account has been inactive for more than 30 days. Please contact support or register again."
  });
}



if (!customer.mobile_verified) {
  return res.status(400).json({
    message: "Mobile number not verified",
  });
}

const hashedPassword = await bcrypt.hash(
  password,
  10
);

await pool.query(
  `UPDATE customers
   SET password = $1
   WHERE mobile = $2`,
  [hashedPassword, mobile]
);

res.json({
  message: "Password reset successful",
});


} catch (err) {
console.error("Reset password error:", err);
res.status(500).json({
message: "Server error",
});
}
};












exports.saveFcmToken = async (req, res) => {
  try {
    const payload = getCustomerFromToken(req);

    if (!payload) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { fcmToken } = req.body;

    await pool.query(
      `UPDATE customers
       SET fcm_token = $1
       WHERE customer_id = $2`,
      [fcmToken, payload.customerId]
    );

    res.json({
      message: "FCM token saved successfully",
    });

  } catch (err) {
    console.error("Save FCM error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};