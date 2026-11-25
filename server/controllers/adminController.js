const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const pool = require("../config/db");
const { getIO } = require("../socket");

// UTILS
const generateUniqueID = require("../utils/generateUniqueID");
const generateQRCodeDataURL = require("../utils/qrGenerator");
const sendWhatsAppSimulator = require("../utils/sendWhatsAppSimulator");
const { decryptPassword } = require("../utils/passwordEncryption");

// Load admin credentials
const { adminEmail, adminPassword } = require("../config/adminCredentials");


const inactiveReminderTemplate = (ownerName) => {

  return `
Hello ${ownerName},

We noticed that your Laundry Management System is inactive.

If you are facing any issue or need support, please contact us:

📞 Support Number: +91 9876543210
📧 Support Email: support@laundryapp.com

Thank you.
  `;

};


/* ---------------------------------------------------------
   ADMIN LOGIN
---------------------------------------------------------- */
exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = jwt.sign(
    { role: "admin", email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return res.status(200).json({
    message: "Admin login successful",
    token,
  });
};

/* ---------------------------------------------------------
   LIST PENDING OWNERS
---------------------------------------------------------- */
exports.listPendingOwners = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const offset = (page - 1) * limit;

const totalResult = await pool.query(`
SELECT COUNT(*) AS total
FROM owners
WHERE status = 'pending'
`);

const result = await pool.query(
`
SELECT *
FROM owners
WHERE status = 'pending'
ORDER BY owner_id DESC
LIMIT $1 OFFSET $2
`,
[limit, offset]
);

res.json({
pending: result.rows,
currentPage: page,
totalPages: Math.ceil(Number(totalResult.rows[0].total) / limit),
totalRecords: Number(totalResult.rows[0].total)
});

   

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------------------------------------------
   APPROVE OWNER
---------------------------------------------------------- */
exports.approveOwner = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "email is required"
      });
    }

    const result = await pool.query(
      "SELECT * FROM owners WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Owner not found"
      });
    }

    const owner = result.rows[0];

    if (owner.status === "approved") {
      return res.json({
        message: "Owner already approved"
      });
    }

    // Decrypt the password saved during registration
    const plainPassword = decryptPassword(
      owner.encrypted_password
    );

    const uniqueID = generateUniqueID();

    const qrDataUrl = await generateQRCodeDataURL(
      uniqueID
    );

    // Approve owner
    // IMPORTANT: Do NOT change password here.
    await pool.query(
      `
      UPDATE owners
      SET status='approved',
          unique_id=$1,
          qr_code_data_url=$2
      WHERE email=$3
      `,
      [
        uniqueID,
        qrDataUrl,
        email
      ]
    );

    // Send original password to owner
    await sendWhatsAppSimulator(
      owner.mobile,
      "nilesh_content_one",
      [
        owner.owner_name,
        "Your Laundry Account",
        "Login Credentials",
        `ID: ${uniqueID}`,
        `Password: ${plainPassword}`,
        "log in and start using your account",
        "do not share your ID and password with anyone"
      ]
    );

    res.json({
      message: "Owner approved successfully",
      uniqueID
    });

  } catch (err) {
    console.error("Approve owner error:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};


/* ---------------------------------------------------------
   LIST APPROVED OWNERS
---------------------------------------------------------- */
/* ---------------------------------------------------------
   LIST APPROVED OWNERS
---------------------------------------------------------- */
exports.listApprovedOwners = async (req, res) => {

  try {

    // Auto set inactive owners
    await pool.query(`
      UPDATE owners
      SET usage_status = 'inactive'
      WHERE last_active IS NOT NULL
      AND last_active < NOW() - INTERVAL '8 days'
    `);

    // Get approved owners
    const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const offset = (page - 1) * limit;

const totalResult = await pool.query(`
SELECT COUNT(*) AS total
FROM owners
WHERE status='approved'
`);

const result = await pool.query(
`
SELECT *
FROM owners
WHERE status='approved'
ORDER BY owner_id DESC
LIMIT $1 OFFSET $2
`,
[limit, offset]
);

    // Console alert for inactive owners
    result.rows.forEach((owner) => {

      if (owner.usage_status === "inactive") {

       
      }

    });

    res.json({
  approved: result.rows,
  currentPage: page,
  totalPages: Math.ceil(Number(totalResult.rows[0].total) / limit),
  totalRecords: Number(totalResult.rows[0].total)
});

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }

};

/* ---------------------------------------------------------
   SEND REMINDER
---------------------------------------------------------- */
exports.sendReminder = async (req, res) => {

  try {

    const { ownerName } = req.body;

    const ownerResult = await pool.query(
      "SELECT * FROM owners WHERE owner_name=$1",
      [ownerName]
    );

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Owner not found"
      });
    }

    const owner = ownerResult.rows[0];

    await sendWhatsAppSimulator(
      owner.mobile,
      "inactive_system_reminder",
      [
        owner.owner_name,
        "+919876543210",
        "support@laundryapp.com"
      ]
    );

    res.json({
      message: "Reminder sent successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }

};














exports.deleteLaundry = async (req, res) => {
  const client = await pool.connect();

  try {
    const { owner_id } = req.params;

    await client.query("BEGIN");

    // Delete manual tables first
    await client.query(
      "DELETE FROM billing WHERE owner_id = $1",
      [owner_id]
    );

    await client.query(
      "DELETE FROM bookings WHERE owner_id = $1",
      [owner_id]
    );

    await client.query(
      "DELETE FROM services WHERE owner_id = $1",
      [owner_id]
    );

    await client.query(
      "DELETE FROM feedbacks WHERE owner_id = $1",
      [owner_id]
    );

    // Delete owner
    // staff, attendance, salaries, leaves,
    // owner_holidays, subscription_payments
    // will be deleted automatically because of ON DELETE CASCADE
    await client.query(
      "DELETE FROM owners WHERE owner_id = $1",
      [owner_id]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Laundry deleted permanently"
    });

  } catch (err) {

    await client.query("ROLLBACK");
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  } finally {

    client.release();

  }
};






























exports.getCustomerStats = async (req, res) => {
  try {

    const totalResult = await pool.query(`
      SELECT COUNT(*) AS total_customers
      FROM customers
    `);

    const activeResult = await pool.query(`
      SELECT COUNT(*) AS active_customers
      FROM customers
      WHERE last_login >= NOW() - INTERVAL '30 days'
    `);

    const inactiveResult = await pool.query(`
      SELECT COUNT(*) AS inactive_customers
      FROM customers
      WHERE last_login < NOW() - INTERVAL '30 days'
         OR last_login IS NULL
    `);

    res.json({
      totalCustomers: Number(totalResult.rows[0].total_customers),
      activeCustomers: Number(activeResult.rows[0].active_customers),
      inactiveCustomers: Number(inactiveResult.rows[0].inactive_customers)
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};














exports.getRevenueStats = async (req, res) => {
  try {

    const totalRevenue = await pool.query(`
      SELECT COALESCE(SUM(amount),0) AS total_revenue
      FROM subscription_payments
      WHERE payment_status='success'
    `);

    const paidOwners = await pool.query(`
      SELECT COUNT(DISTINCT owner_id) AS paid_owners
      FROM subscription_payments
      WHERE payment_status='success'
    `);

    const unpaidOwners = await pool.query(`
      SELECT COUNT(*) AS unpaid_owners
      FROM owners
      WHERE account_locked = true
    `);

    res.json({
      totalRevenue: Number(totalRevenue.rows[0].total_revenue),
      paidOwners: Number(paidOwners.rows[0].paid_owners),
      unpaidOwners: Number(unpaidOwners.rows[0].unpaid_owners)
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};











exports.getOwnerPaymentStatus = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const offset = (page - 1) * limit;

const totalResult = await pool.query(`
SELECT COUNT(*) AS total
FROM owners
`);




    const result = await pool.query(
`
SELECT
  o.owner_id,
  o.owner_name,
  o.shop_name,
  o.mobile,
  o.subscription_plan,
  o.subscription_status,
  o.account_locked,

  COALESCE(
    (
      SELECT sp.amount
      FROM subscription_payments sp
      WHERE sp.owner_id = o.owner_id
      ORDER BY sp.id DESC
      LIMIT 1
    ),
    0
  ) AS last_amount,

  (
    SELECT sp.payment_status
    FROM subscription_payments sp
    WHERE sp.owner_id = o.owner_id
    ORDER BY sp.id DESC
    LIMIT 1
  ) AS payment_status,

  (
    SELECT sp.end_date
    FROM subscription_payments sp
    WHERE sp.owner_id = o.owner_id
    ORDER BY sp.id DESC
    LIMIT 1
  ) AS expiry_date

FROM owners o
ORDER BY o.owner_name ASC
LIMIT $1 OFFSET $2
`,
[limit, offset]
);

    res.json({
  success: true,
  owners: result.rows,
  currentPage: page,
  totalPages: Math.ceil(Number(totalResult.rows[0].total) / limit),
  totalRecords: Number(totalResult.rows[0].total)
});

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};










exports.deactivateOwner = async (req,res)=>{
try{

const { ownerId } = req.body;

const owner = await pool.query(
`
SELECT
subscription_end
FROM owners
WHERE owner_id=$1
`,
[ownerId]
);

if(owner.rows.length===0){
return res.status(404).json({
message:"Owner not found"
});
}

let remainingDays = 0;

if(owner.rows[0].subscription_end){

remainingDays = Math.max(
0,
Math.ceil(
(
new Date(owner.rows[0].subscription_end)
-
new Date()
)
/
(1000*60*60*24)
)
);

}

await pool.query(
`
UPDATE owners
SET
is_active=false,
paused_at=NOW(),
remaining_days=$1
WHERE owner_id=$2
`,
[
remainingDays,
ownerId
]
);




const ownerResult = await pool.query(
  `
  SELECT unique_id
  FROM owners
  WHERE owner_id = $1
  `,
  [ownerId]
);

const io = getIO();

io.to(
  `owner-${ownerResult.rows[0].unique_id}`
).emit("owner-deactivated");



res.json({
message:"Owner deactivated"
});

}catch(err){
console.log(err);
res.status(500).json({
message:"Server error"
});
}
};









exports.activateOwner = async (req,res)=>{
try{

const { ownerId } = req.body;

const owner = await pool.query(
`
SELECT remaining_days
FROM owners
WHERE owner_id=$1
`,
[ownerId]
);

if(owner.rows.length===0){
return res.status(404).json({
message:"Owner not found"
});
}

const remaining =
owner.rows[0].remaining_days || 0;

const newEndDate = new Date();

newEndDate.setDate(
newEndDate.getDate() + remaining
);

await pool.query(
`
UPDATE owners
SET
is_active=true,
subscription_end=$1,
paused_at=NULL,
remaining_days=0
WHERE owner_id=$2
`,
[
newEndDate,
ownerId
]
);

res.json({
message:"Owner activated"
});

}catch(err){
console.log(err);
res.status(500).json({
message:"Server error"
});
}
};










exports.getOwnerStatusManagement = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const offset = (page - 1) * limit;

const totalResult = await pool.query(`
SELECT COUNT(*) AS total
FROM owners
WHERE status='approved'
`);

    const result = await pool.query(
`
SELECT
  owner_id,
  unique_id,
  owner_name,
  shop_name,
  mobile,
  subscription_plan,
  subscription_status,
  is_active,
  subscription_end
FROM owners
WHERE status='approved'
ORDER BY owner_name ASC
LIMIT $1 OFFSET $2
`,
[limit, offset]
);

    res.json({
  success: true,
  owners: result.rows,
  currentPage: page,
  totalPages: Math.ceil(Number(totalResult.rows[0].total) / limit),
  totalRecords: Number(totalResult.rows[0].total)
});
  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

