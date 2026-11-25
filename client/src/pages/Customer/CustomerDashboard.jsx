// client/src/pages/Customer/CustomerDashboard.jsx
import React, { useEffect, useState } from "react";
import { startNotificationListener } from "../../notificationListener";
import ServiceDetails from "./ServiceDetails";
import BookService from "./BookService";
import CustomerProfile from "./CustomerProfile";
import CustomerFeedback from "./CustomerFeedback";
import CustomerAnalytics from "./CustomerAnalytics";
import Notification from "../../components/Notification";
import "./style/CustomerDashboard.css";

export default function CustomerDashboard() {
  const ownerId = localStorage.getItem("ownerId");

  const [owner, setOwner] = useState(null);
  const [tab, setTab] = useState("services");
  const [approvedFeedback, setApprovedFeedback] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [holiday, setHoliday] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [pendingFeedbacks, setPendingFeedbacks] = useState([]);
const [selectedBooking, setSelectedBooking] = useState(null);



  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (!token) {
      window.location.href = "/customer-login";
    }
  }, []);

  useEffect(() => {
  startNotificationListener();
}, []);

  // Fetch owner on mount
  useEffect(() => {
    if (!ownerId) return;
    fetchOwner();
  }, [ownerId]);

  // Fetch customer on mount
  useEffect(() => {
    fetchCustomer();
    fetchBookings();
  }, []);

  // Fetch approved feedback when owner is loaded
  useEffect(() => {
    if (!owner) return;
    fetchApprovedFeedback(owner.unique_id);
  }, [owner]);

  useEffect(() => {
  if (!owner) return;
  fetchHoliday();
}, [owner]);


useEffect(() => {
  if (tab === "feedback") {
    fetchPendingFeedbacks();
  }
}, [tab]);




  function handleLogout() {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("ownerId");
    window.location.href = "/";
  }

  async function fetchOwner() {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/customer/owner/${ownerId}`);
      if (!res.ok) return alert("Owner not found");
      const data = await res.json();
      setOwner(data.owner);
    } catch (error) {
      console.error(error);
      alert("Failed to load owner");
    }
  }

  async function fetchCustomer() {
    try {
      const token = localStorage.getItem("customerToken");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/customer/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setCustomer(data.customer);
    } catch (err) {
      console.log("Error fetching customer");
    }
  }

  async function fetchBookings() {
  try {
    const token = localStorage.getItem("customerToken");

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/booking/customer/${ownerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setBookings(data.bookings || []);
  } catch (err) {
    console.log(err);
  }
}

  async function fetchApprovedFeedback(oid) {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/feedback/customer/${oid}`);
      const data = await res.json();
      setApprovedFeedback(data.feedbacks || []);
    } catch (e) {
      console.log("Error loading approved feedback");
    }
  }



  async function fetchPendingFeedbacks() {
  try {
    const token = localStorage.getItem("customerToken");

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/feedback/pending`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setPendingFeedbacks(data.bookings || []);

   if (data.bookings?.length > 0) {
  setSelectedBooking(data.bookings[0]);
} else {
  setSelectedBooking(null);
}
  } catch (err) {
    console.log(err);
  }
}


  async function fetchHoliday() {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/holidays/today/${owner.owner_id}`
    );

    const data = await res.json();

    if (data.holiday) {
      setHoliday(data.data);
    }
  } catch (err) {
    console.log(err);
  }
}

  // Loading state
  if (!owner) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <span>Loading laundry...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">

      {holiday && (
  <div
    style={{
      background: "#fff3cd",
      border: "1px solid #ffeeba",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "15px"
    }}
  >
    <h3>📢 Laundry Holiday Notice</h3>

    <p>
      <strong>Laundry:</strong> {owner.shop_name}
    </p>

    <p>
      <strong>From:</strong>{" "}
      {new Date(holiday.start_date).toLocaleDateString("en-GB")}
    </p>

    <p>
      <strong>To:</strong>{" "}
      {new Date(holiday.end_date).toLocaleDateString("en-GB")}
    </p>

    <p>
      <strong>Type:</strong>{" "}
      {holiday.holiday_type === "FULL"
        ? "Full Day"
        : "Custom Time"}
    </p>

    {holiday.holiday_type === "HALF" && (
      <p>
        <strong>Closed Time:</strong>{" "}
        {holiday.start_time} - {holiday.end_time}
      </p>
    )}

    <p>
      <strong>Reason:</strong> {holiday.reason}
    </p>
  </div>
)}

      {/* HEADER */}
      <div className="dashboard-header">
        <div className="dashboard-header__info">
          <h2>{customer?.name || "Customer"} — {owner.shop_name}</h2>
          <p><strong>ID:</strong> {owner.unique_id}</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>

      {/* TAB BAR */}
      <div className="tab-bar">
       
        <button
          onClick={() => setTab("services")}
          className={`tab-btn ${tab === "services" ? "active" : ""}`}
        >
          Services
        </button>
        <button
          onClick={() => setTab("booking")}
          className={`tab-btn ${tab === "booking" ? "active" : ""}`}
        >
          Book Service
        </button>
         <button
  onClick={() => setTab("notifications")}
  className={`tab-btn ${
    tab === "notifications"
      ? "active"
      : ""
  }`}
>
  Notifications
</button>
        <button
          onClick={() => setTab("profile")}
          className={`tab-btn ${tab === "profile" ? "active" : ""}`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab("feedback")}
          className={`tab-btn ${tab === "feedback" ? "active" : ""}`}
        >
          Feedback
        </button>

        <button
  onClick={() => setTab("analytics")}
  className={`tab-btn ${tab === "analytics" ? "active" : ""}`}
>
  Analytics
</button>
      </div>

      {/* TAB CONTENT */}
      <div className="tab-panel">

        {tab === "services" && <ServiceDetails ownerId={owner.unique_id} />}

        {tab === "booking" && <BookService ownerId={owner.unique_id} />}

        {tab === "profile" && <CustomerProfile owner={owner} />}
        {tab === "analytics" && (
  <CustomerAnalytics bookings={bookings} />
)}

{tab === "notifications" &&
  customer && (
    <Notification
      userId={customer.mobile}
      userType="customer"
    />
)}

        {tab === "feedback" && (
          <div>
            {selectedBooking ? (
  <CustomerFeedback
    bookingId={selectedBooking.bookingId}
    serviceName={
      selectedBooking.items
        ?.map((s) => s.serviceName)
        .join(", ") || ""
    }
    onSuccess={() => {
      fetchPendingFeedbacks();
    }}
  />
) : (
  <p>No pending feedback available.</p>
)}

            {/* APPROVED FEEDBACK LIST */}
            {approvedFeedback.length > 0 && (
              <div className="feedback-list">
                {approvedFeedback.map((f) => (
                  <div key={f.id} className="feedback-card">
                    <div className="feedback-card__header">
                      <span className="feedback-card__name">{f.name}</span>
                      <span className="feedback-card__rating">⭐ {f.rating}</span>
                    </div>
                    <p className="feedback-card__service">{f.service}</p>
                    <p className="feedback-card__comment">{f.suggestion}</p>
                  </div>
                ))}
              </div>
            )}

            {approvedFeedback.length === 0 && (
              <p style={{ color: "#9ca3af", marginTop: 16, fontSize: 14 }}>
                
              </p>
            )}
          </div>
        )}

      </div>
      
    </div>
  );
}