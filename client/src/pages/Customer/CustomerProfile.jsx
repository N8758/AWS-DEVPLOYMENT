import React, { useState, useEffect } from "react";
import "./style/CustomerProfile.css";

const BASE_URL = process.env.REACT_APP_API_URL;

export default function CustomerProfile({ owner }) {
  const token = localStorage.getItem("customerToken");

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    latitude: null,
    longitude: null
  });

  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [holiday, setHoliday] = useState(null);

  // 🔹 Load customer data
  useEffect(() => {
  fetchCustomer();

  if (owner?.owner_id) {
    fetchHoliday();
  }
}, [owner]);

  async function fetchCustomer() {
    try {
      const res = await fetch(`${BASE_URL}/api/customer/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setForm({
          name: data.customer.name || "",
          email: data.customer.email || "",
          address: data.customer.address || "",
          latitude: data.customer.latitude || null,
          longitude: data.customer.longitude || null
        });
        setMobile(data.customer.mobile || "");
      }
    } catch (err) {
      console.log("Error loading customer");
    }
  }

  const fetchHoliday = async () => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/holidays/today/${owner.owner_id}`
    );

    const data = await res.json();

    if (data.holiday) {
      setHoliday(data.data);
    }
  } catch (err) {
    console.log(err);
  }
};



  // 🔹 Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Get GPS Location
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
  (pos) => {
    setForm((prev) => ({
      ...prev,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    }));

    alert(
      `Location captured ✅\nAccuracy: ${Math.round(
        pos.coords.accuracy
      )} meters`
    );
  },
  (err) => {
    alert("Unable to get location ❌");
  },
  {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  }
);
  };

  // 🔹 Save profile
  const handleSave = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/api/customer/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Update failed");
      } else {
        alert("Profile updated successfully ✅");
        setIsEditing(false); // 🔥 lock again
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h3 className="profile-title">Customer Profile</h3>

      {/* Editable Form */}
      <div className="profile-form">
        <label>Name</label>
        <input
          className="profile-input"
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <label>Email</label>
        <input
          className="profile-input"
          name="email"
          value={form.email}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <label>Address</label>
        <input
          className="profile-input"
          name="address"
          value={form.address}
          onChange={handleChange}
          disabled={!isEditing}
        />

        {/* Location Button */}
        {isEditing && (
          <button className="profile-btn" onClick={getLocation}>
            Capture Location 📍
          </button>
        )}

        {/* Show Lat/Lng */}
        {form.latitude && form.longitude && (
          <p style={{ fontSize: "12px" }}>
            Lat: {form.latitude} | Lng: {form.longitude}
          </p>
        )}
      </div>

      {/* Non-editable info */}
      <div className="profile-info">
        <p><strong>Mobile:</strong> {mobile}</p>
        <p><strong>Laundry ID:</strong> {owner?.unique_id}</p>
        <p><strong>Laundry Name:</strong> {owner?.shop_name}</p>
        <p><strong>Laundry Address:</strong> {owner?.address}</p>

        {holiday && (
  <div
    style={{
      marginTop: "15px",
      padding: "12px",
      border: "1px solid #ff9800",
      borderRadius: "8px",
      background: "#fff8e1"
    }}
  >
    <h4>📢 Holiday Notice</h4>

   <p>
  <strong>Start Date:</strong>{" "}
  {new Date(holiday.start_date).toLocaleDateString("en-GB")}
</p>

<p>
  <strong>End Date:</strong>{" "}
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
        <strong>Time:</strong>{" "}
        {new Date(`2000-01-01T${holiday.start_time}`).toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }
        )}
        {" - "}
        {new Date(`2000-01-01T${holiday.end_time}`).toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }
        )}
      </p>
    )}

    <p><strong>Reason:</strong> {holiday.reason}</p>
  </div>
)}

      </div>

      {/* Buttons */}
      {!isEditing ? (
  <button
    className="profile-btn"
    onClick={() => setIsEditing(true)}
  >
    Edit Profile ✏️
  </button>
) : (
  <div style={{ display: "flex", gap: "10px" }}>
    <button
      onClick={handleSave}
      disabled={loading}
      className="profile-btn"
    >
      {loading ? "Saving..." : "Save Profile ✅"}
    </button>

    <button
      className="profile-btn"
      onClick={() => {
        setIsEditing(false);
        fetchCustomer(); // restore original values
      }}
    >
      Cancel ❌
    </button>
  </div>
)}
    </div>
  );
}