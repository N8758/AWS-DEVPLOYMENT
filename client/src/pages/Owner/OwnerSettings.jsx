import React, { useState, useEffect } from "react";
import "./style/ownersettings.css";

export default function OwnerSettings({ token, owner, refreshOwner }) {
  const [doorEnabled, setDoorEnabled] = useState(true);
  const [doorCharge, setDoorCharge] = useState(0);
  const [holidayDate, setHolidayDate] = useState("");
const [holidayType, setHolidayType] = useState("FULL");
const [startTime, setStartTime] = useState("");
const [endTime, setEndTime] = useState("");
const [reason, setReason] = useState("");

const [holidays, setHolidays] = useState([]);

const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (owner) {
      setDoorEnabled(owner.doorEnabled ?? true);
setDoorCharge(owner.doorCharge ?? 0);
loadHolidays();
    }
  }, [owner]);

  const loadHolidays = async () => {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/holidays/${owner.owner_id}`
    );

    const data = await res.json();

    if (data.success) {
      setHolidays(data.holidays);
    }
  } catch (err) {
    console.log(err);
  }
};


  const addHoliday = async () => {
  try {
    if (!reason.trim()) {
  alert("Reason is required");
  return;
}

    if (new Date(startDate) > new Date(endDate)) {
  alert("End date cannot be before start date");
  return;
}
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/holidays/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          owner_id: owner.owner_id, // change if your field name is different
          start_date: startDate,
end_date: endDate,
          holiday_type: holidayType,
          start_time: holidayType === "HALF" ? startTime : null,
          end_time: holidayType === "HALF" ? endTime : null,
          reason
        })
      }
    );

    const data = await res.json();

   if (res.ok) {
  alert("Holiday Added Successfully!");
  loadHolidays();

  setStartDate("");
  setEndDate("");
  setHolidayType("FULL");
  setStartTime("");
  setEndTime("");
  setReason("");
} else {
      alert(data.message);
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
};

  const saveSettings = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/owner/door-settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
  doorEnabled: doorEnabled,
  doorCharge: Number(doorCharge)
})

    });

    alert("Settings saved!");
    refreshOwner();
  };
  console.log(owner);

  return (
    <div className="owner-settings-container">
      <h3 className="owner-settings-title">
  Door Pickup Settings
</h3>

      <label className="owner-settings-checkbox">
        <input
          type="checkbox"
          checked={doorEnabled}
          onChange={() => setDoorEnabled(!doorEnabled)}
        />
        Enable Door Pickup
      </label>

      <br /><br />

      <input
  className="owner-settings-input"
  type="number"
        value={doorCharge}
        onChange={(e) => setDoorCharge(e.target.value)}
        disabled={!doorEnabled}
        placeholder="Door Pickup Charge"
      />

      <br /><br />

      <button
  className="owner-settings-btn"
  onClick={saveSettings}
>
        Save Settings
      </button>


      <hr style={{ margin: "30px 0" }} />

<h3 className="owner-settings-title">
  Holiday Settings
</h3>

<input
  className="owner-settings-input"
  type="date"
  min={new Date().toISOString().split("T")[0]}
  value={startDate}
  onChange={(e) => setStartDate(e.target.value)}
/>

<br /><br />

<input
  className="owner-settings-input"
  type="date"
  min={startDate || new Date().toISOString().split("T")[0]}
  value={endDate}
  onChange={(e) => setEndDate(e.target.value)}
/>

<br /><br />

<select
  className="owner-settings-input"
  value={holidayType}
  onChange={(e) => setHolidayType(e.target.value)}
>
  <option value="FULL">Full Day</option>
  <option value="HALF">Custom Time</option>
</select>

<br /><br />

{holidayType === "HALF" && (
  <>
   <input
  className="owner-settings-input"
  type="time"
  value={startTime}
  onChange={(e) => setStartTime(e.target.value)}
/>

<p style={{ fontSize: "12px", color: "#666" }}>
  {startTime &&
    `Selected: ${new Date(
      `2000-01-01T${startTime}`
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`}
</p>

<br /><br />

   <input
  className="owner-settings-input"
  type="time"
  value={endTime}
  onChange={(e) => setEndTime(e.target.value)}
/>

<p style={{ fontSize: "12px", color: "#666" }}>
  {endTime &&
    `Selected: ${new Date(
      `2000-01-01T${endTime}`
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`}
</p>

<br /><br />
  </>
)}

<input
  className="owner-settings-input"
  placeholder="Reason"
  value={reason}
  onChange={(e) => setReason(e.target.value)}
/>

<br /><br />

<button
  className="owner-settings-btn"
  onClick={addHoliday}
>
  Add Holiday
</button>
<hr style={{ margin: "20px 0" }} />

<h4>Added Holidays</h4>

{holidays.map((item, index) => (
  <div
    key={index}
    style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "10px",
      marginTop: "10px"
    }}
  >
    <p>
  <strong>Start Date:</strong>
  {new Date(item.start_date).toLocaleDateString("en-GB")}
</p>

<p>
  <strong>End Date:</strong>
  {new Date(item.end_date).toLocaleDateString("en-GB")}
</p>

<p>
  <strong>Type:</strong>{" "}
  {item.holiday_type === "FULL"
    ? "Full Day"
    : "Custom Time"}
</p>

{item.holiday_type === "HALF" && (
  <p>
    <strong>Time:</strong>{" "}
    {new Date(`2000-01-01T${item.start_time}`).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    )}
    {" - "}
    {new Date(`2000-01-01T${item.end_time}`).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    )}
  </p>
)}

    <p><strong>Reason:</strong> {item.reason}</p>

    <button
  className="owner-settings-btn"
  style={{
    marginTop: "10px",
    background: "#e53935"
  }}
  onClick={async () => {
    if (!window.confirm("Delete this holiday?")) return;

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/holidays/${item.holiday_id}`,
      {
        method: "DELETE"
      }
    );

    const data = await res.json();

    if (data.success) {
      alert("Holiday Deleted!");
      loadHolidays();   // refresh list
    } else {
      alert(data.message);
    }
  }}
>
  Delete
</button>


  </div>
))}

    </div>
  );
}