import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import Attendance from "./Attendance";
import Leave from "./Leave";
import Salary from "./Salary";
import Notification from "../components/Notification";
import "./StaffDashboard.css";


export default function StaffDashboard() {
const [bookings, setBookings] = useState([]);
const [notifications, setNotifications] = useState([]);
const [weightInput, setWeightInput] = useState({});
const [activeSection, setActiveSection] = useState("orders");
const navigate = useNavigate();


const staff = JSON.parse(localStorage.getItem("staff"));

const handleLogout = () => {
  localStorage.removeItem("staff");
  window.location.href = "/staff-login";
};


useEffect(() => {

  if (!staff) {
    window.location.href = "/staff-login";
    return;
  }

  if (staff.staff_id) {
  fetchBookings();
  fetchNotifications();
}
}, []);



// ✅ Submit weight
const submitWeight = async (bookingId, serviceIndex) => {
const key = `${bookingId}_${serviceIndex}`;
const weight = weightInput[key];

if (!weight) return alert("Enter weight");

try {
  await axios.patch(
    `${process.env.REACT_APP_API_URL}/api/booking/owner/update-weight/${bookingId}`,
    {
      serviceIndex,
      weight,
    }
  );

  alert("Weight updated successfully");
  fetchBookings();
} catch (err) {
  console.error(err);
  alert("Error updating weight");
}


};

const fetchNotifications = async () => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/owner/staff/notifications/${staff.staff_id}`
    );

    setNotifications(res.data || []);
  } catch (err) {
    console.log(err);
  }
};

const fetchBookings = async () => {
  try {
    const API = process.env.REACT_APP_API_URL;

    const res = await axios.get(
      `${API}/api/owner/staff/bookings/${staff.staff_id}`
    );

    setBookings(res.data.bookings || []);

  } catch (err) {
    console.error(err);
    alert("Error fetching bookings");
  }
};

return (
<div className="staff-dashboard"> <div className="staff-header">

  <h2 className="staff-title">
    Staff Dashboard
  </h2>

  <p className="staff-info">
    Welcome {staff?.name}
  </p>

  <p className="staff-info">
    Staff ID: {staff?.staff_id}
  </p>

  <button
    className="submit-btn"
    onClick={handleLogout}
  >
    Logout
  </button>

</div>

  <div className="staff-tabs">
  <button
  className={
    activeSection === "orders"
      ? "staff-tab-btn staff-tab-active"
      : "staff-tab-btn"
  }
  onClick={() => setActiveSection("orders")}
>Orders</button>
  {/* <button
  className={
    activeSection === "attendance"
      ? "staff-tab-btn staff-tab-active"
      : "staff-tab-btn"
  }
  onClick={() => setActiveSection("attendance")}
>
  Attendance
</button> */}

<button
  className="staff-tab-btn"
  onClick={() => navigate("/staff-leave")}
>
  Leave
</button>

<button
  className="staff-tab-btn"
  onClick={() => navigate("/staff-salary")}
>
  Salary
</button>

<button
  className={
    activeSection === "notifications"
      ? "staff-tab-btn staff-tab-active"
      : "staff-tab-btn"
  }
  onClick={() =>
    setActiveSection("notifications")
  }
>
  Notifications
</button>


</div>

{activeSection === "notifications" && (
  <>
    {/* Notifications from database */}
    <Notification
      userId={staff.staff_id}
      userType="staff"
    />

    {/* Existing staff notifications */}
    {notifications.length > 0 && (
      <div className="notification-box">
        {notifications.map((n) => (
         <div
  key={n.id}
  className="notification-card"
>
            <p>{n.message}</p>

            <small>
              {new Date(n.created_at).toLocaleString("en-IN")}
            </small>
          </div>
        ))}
      </div>
    )}
  </>
)}

  {activeSection === "orders" && (
  <>
    <h4 className="orders-title">
      Assigned Orders
    </h4>

{/* {notifications.length > 0 && (
  <div className="notification-box">

    <h4>Notifications</h4>

    {notifications.map((n) => (
      <div
        key={n.id}
        style={{
          border: "1px solid #ddd",
          padding: "10px",
          marginBottom: "8px",
          borderRadius: "8px"
        }}
      >
        <p>{n.message}</p>

        <small>
          {new Date(n.created_at).toLocaleString("en-IN")}
        </small>
      </div>
    ))}

  </div>
)} */}



  {bookings.length === 0 ? (
   <p className="no-orders">
  No orders assigned
</p>
  ) : (
    bookings.map((b) => (
      <div
  key={b.booking_id}
  className="order-card"
>
        <p><b>Customer:</b> {b.customer_name}</p>
        <p><b>Mobile:</b> {b.customer_mobile}</p>
        <p><b>Address:</b> {b.customer_address}</p>
       {b.latitude && b.longitude ? (
  <button
    onClick={() =>
      window.open(`https://www.google.com/maps?q=${Number(b.latitude)},${Number(b.longitude)}`)
    }
    className="navigate-btn"
  >
    📍 Navigate to Customer
  </button>
) : (
  <p style={{ color: "red" }}>Location not available</p>
)}
        <p><b>Type:</b> {b.pickup_type}</p>
        <p><b>Status:</b> {b.status}</p>
        <p>
  <b>Total:</b> ₹{parseFloat(b.total_price || 0).toFixed(2)}
</p>
        <p>
  <b>Pickup Date:</b>{" "}
  {b.pickup_datetime
    ? new Date(b.pickup_datetime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Not assigned"}
</p>

<p>
  <b>Completion Date:</b>{" "}
  {b.completion_datetime
    ? new Date(b.completion_datetime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "Not completed"}
</p>

{String(b.pickup_staff_id).trim() === String(staff.staff_id).trim() &&
 (b.status === "assigned" || b.status === "accepted") &&
 !b.pickup_ongoing && (
  <button
    className="submit-btn"
    onClick={async () => {
     await axios.patch(
  `${process.env.REACT_APP_API_URL}/api/booking/staff/pickup-ongoing/${b.booking_id}`
);

alert("Customer notified");
fetchBookings();
    }}
  >
    Pickup Ongoing
  </button>
)}


{String(b.pickup_staff_id).trim() === String(staff.staff_id).trim() &&
 b.status === "pickup_ongoing" && (
  <button
    className="submit-btn"
    onClick={async () => {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/booking/staff/pickup-completed/${b.booking_id}`
      );

      alert("Pickup Completed");
      fetchBookings();
    }}
  >
    Pickup Completed
  </button>
)}




        <hr />

        {/* 🔥 SERVICES */}
        {b.items?.map((service, index) => (
          <div key={index} className="service-box">
            <strong className="service-title">
  {service.serviceName}
</strong>

            {/* PER ITEM */}
            {service.items?.length > 0 ? (
              service.items.map((item, i) => (
                <div key={i} style={{ marginLeft: "10px" }}>
                  {item.name} × {item.quantity}
                </div>
              ))
            ) : (
              <div className="weight-pending">
                {service.weight
                  ? `${service.weight} kg`
                  : "Weight pending"}
              </div>
            )}

            {/* ✅ KG INPUT ONLY FOR PICKUP STAFF */}
            {(
   b.status === "assigned" ||
   b.status === "accepted" ||
   b.status === "pickup_ongoing"
 ) &&
  b.pickup_type === "door" &&
  (!service.items || service.items.length === 0) && (
                <>
                  <input
  className="kg-input"
                    type="number"
                    placeholder="Enter weight (kg)"
                    value={
                      weightInput[`${b.booking_id}_${index}`] || ""
                    }
                    onChange={(e) =>
                      setWeightInput({
                        ...weightInput,
                        [`${b.booking_id}_${index}`]: e.target.value,
                      })
                    }
                  />

                  <button
  className="submit-btn"
                    onClick={() =>
                      submitWeight(b.booking_id, index)
                    }
                  >
                    Submit KG
                  </button>
                </>
              )}
          </div>
        ))}

        {/* ✅ DELIVERY INFO */}
        {/* ✅ DELIVERY INFO */}

        

{(
    b.status === "delivery_assigned" ||
   b.status === "delivery_ongoing"
 ) &&
 String(b.delivery_staff_id).trim() === String(staff.staff_id).trim() && (
  <>
    <p className="delivery-ready">
      Ready for Delivery 🚚
    </p>
{b.status === "delivery_assigned" && (
  <button
    className="submit-btn"
    onClick={async () => {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/booking/staff/delivery-ongoing/${b.booking_id}`
      );

      alert("Customer notified");
      fetchBookings();
    }}
  >
    Delivery Ongoing
  </button>
)}

    {b.status === "delivery_ongoing" && (
  <button
    className="submit-btn"
    onClick={async () => {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/booking/staff/complete-delivery/${b.booking_id}`
      );

      alert("Delivery Completed");
      fetchBookings();
    }}
  >
    Complete Delivery
  </button>
)}
  </>
)}
      </div>
    ))
  )}
  </>
)}
  
</div>


);
}
