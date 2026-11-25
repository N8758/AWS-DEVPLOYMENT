import React, { useEffect, useState } from "react";
import "./style/OwnerBookings.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
export default function OwnerBookings({ ownerId }) {
  const [bookings, setBookings] = useState([]);
  const [pickupTime, setPickupTime] = useState({});
  const [activeTab, setActiveTab] = useState("self");
  const [weightInput, setWeightInput] = useState({});
  const [staffList, setStaffList] = useState([]);
  const [availableStaff, setAvailableStaff] = useState({});
  const [showReschedule, setShowReschedule] = useState({});
const [rescheduleTime, setRescheduleTime] = useState({});
const [rescheduleBooking, setRescheduleBooking] = useState(null);
const [assignedStaff, setAssignedStaff] = useState({});

const [dateFilter, setDateFilter] = useState("today");
const [searchTerm, setSearchTerm] = useState("");

const [deliveredPage, setDeliveredPage] = useState(1);


const [doorDeliveredPage, setDoorDeliveredPage] = useState(1);
const [doorCancelledPage, setDoorCancelledPage] = useState(1);

useEffect(() => {
  setDeliveredPage(1);
}, [dateFilter]);




const formatDateTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  useEffect(() => {
    if (!ownerId) return;
    fetchBookings();
    fetchStaff();
  }, [ownerId]);

  const fetchStaff = async () => {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/owner/staff/${ownerId}`
  );
  const data = await res.json();
  setStaffList(data || []);
};

const assignStaff = async (bookingId, staff_id, type) => {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/booking/owner/assign-staff`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, staff_id, type }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  alert("Staff assigned successfully");
  fetchBookings();
};

  const fetchBookings = async () => {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/booking/owner/${ownerId}`
  );

  const data = await res.json();

  setBookings(data.bookings || []);

  for (const b of data.bookings || []) {

    if (
      b.pickupType === "door" &&
      b.pickupDateTime
    ) {
      fetchAvailableStaff(b.bookingId);
    }

    if (
      b.pickupType === "door" &&
      b.completionDateTime
    ) {
      fetchAvailableStaff(b.bookingId);
    }

  }
};


  const savePickupDate = async (bookingId) => {

  if (!pickupTime[bookingId]) {
    alert("Select pickup date first");
    return;
  }

  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/booking/owner/save-pickup-date`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bookingId,
        pickupDateTime: pickupTime[bookingId]
      })
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  alert("Pickup date saved");

await fetchAvailableStaff(bookingId);

fetchBookings();
};


const fetchAvailableStaff = async (bookingId) => {
  const res = await fetch(
  `${process.env.REACT_APP_API_URL}/api/booking/available-staff/${bookingId}`
);

  const data = await res.json();

  setAvailableStaff(prev => ({
    ...prev,
    [bookingId]: data.staff || []
  }));
};




  const confirmBooking = async (bookingId) => {
    if (!pickupTime[bookingId]) {

      const selected = new Date(pickupTime[bookingId]);

if (selected <= new Date()) {
  alert("Please select a future date and time");
  return;
}
      alert("Please select pickup date & time");
      return;
    }
    await fetch(`${process.env.REACT_APP_API_URL}/api/booking/owner/confirm`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, pickupDateTime: pickupTime[bookingId] })
    });
    alert("Pickup notification sent successfully ✅");
    fetchBookings();
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm("Delete this booking permanently?")) return;
    await fetch(
      `${process.env.REACT_APP_API_URL}/api/booking/owner/hide/${bookingId}`,
      { method: "PATCH" }
    );
    fetchBookings();
  };

  const selfBookings = bookings.filter(b => (b.pickupType || "self") === "self");
  const doorBookings = bookings.filter(b => b.pickupType === "door");

  
  const now = new Date();

const filteredDoorBookings = doorBookings.filter((b) => {
  const bookingDate = new Date(b.createdAt);

  if (dateFilter === "today") {
    return bookingDate.toDateString() === now.toDateString();
  }

  if (dateFilter === "week") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    return bookingDate >= sevenDaysAgo;
  }

  if (dateFilter === "month") {
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    );
  }

  return true;
});


const doorPendingBookings = filteredDoorBookings.filter(
  b =>
    b.status === "pending" ||
    b.status === "pending_weight"
);

const doorAcceptedBookings = filteredDoorBookings.filter(
  b =>
    b.status === "accepted" ||
    b.status === "pickup_ongoing" ||
    b.status === "pickup_completed" ||
    b.status === "processing"
);



const doorReadyBookings = filteredDoorBookings.filter(
  b => b.status === "ready_to_deliver"
);

const doorDeliveredBookings = filteredDoorBookings.filter(
  b =>
    b.status === "completed" ||
    b.status === "delivered"
);


const doorCancelledBookings = filteredDoorBookings.filter(
  b =>
    b.customerCancelRequest ||
    b.status === "cancelled"
);


const DOOR_PER_PAGE = 10;

// Delivered
const doorDeliveredStart =
  (doorDeliveredPage - 1) * DOOR_PER_PAGE;

const doorDeliveredEnd =
  doorDeliveredStart + DOOR_PER_PAGE;

const paginatedDoorDelivered =
  doorDeliveredBookings.slice(
    doorDeliveredStart,
    doorDeliveredEnd
  );

// Cancelled
const doorCancelledStart =
  (doorCancelledPage - 1) * DOOR_PER_PAGE;

const doorCancelledEnd =
  doorCancelledStart + DOOR_PER_PAGE;

const paginatedDoorCancelled =
  doorCancelledBookings.slice(
    doorCancelledStart,
    doorCancelledEnd
  );

const doorRescheduledBookings = filteredDoorBookings.filter(
  b =>
    b.customerRescheduleRequest ||
    b.deliveryRescheduled
);



const orderedDoorBookings = [
  ...filteredDoorBookings.filter(
    b => b.status === "pending" || b.status === "pending_weight"
  ),

  ...filteredDoorBookings.filter(
    b => b.status === "accepted"
  ),

  ...filteredDoorBookings.filter(
    b => b.status === "pickup_ongoing"
  ),

  ...filteredDoorBookings.filter(
    b => b.status === "pickup_completed"
  ),

  ...filteredDoorBookings.filter(
    b => b.status === "processing"
  ),

  ...filteredDoorBookings.filter(
    b => b.status === "ready_to_deliver"
  ),

  ...filteredDoorBookings.filter(
  b => b.status === "delivery_assigned"
),

  ...filteredDoorBookings.filter(
    b => b.status === "delivery_ongoing"
  ),

 

  
];


const filteredSelfBookings = selfBookings.filter((b) => {
  const bookingDate = new Date(b.createdAt);

  if (dateFilter === "today") {
    return (
      bookingDate.toDateString() ===
      now.toDateString()
    );
  }

  if (dateFilter === "week") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return bookingDate >= sevenDaysAgo;
  }

  if (dateFilter === "month") {
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    );
  }

  return true;
});


const pendingWeightBookings = filteredSelfBookings.filter(
  b => b.status === "pending_weight"
);

const acceptedBookings = filteredSelfBookings.filter(
  b => b.status === "accepted"
);

const deliveredBookings = filteredSelfBookings.filter(
  b =>
    b.status === "completed" ||
    b.status === "delivered"
);




const DELIVERED_PER_PAGE = 10;

const deliveredStart =
  (deliveredPage - 1) * DELIVERED_PER_PAGE;

const deliveredEnd =
  deliveredStart + DELIVERED_PER_PAGE;

const paginatedDeliveredBookings =
  deliveredBookings.slice(
    deliveredStart,
    deliveredEnd
  );

  



  if (!bookings.length) return <p>No bookings yet</p>;

  return (
    <div className="bookings-root">

      <div className="tab-group">
        <button
          className={`tab-btn ${activeTab === "self" ? "tab-self-active" : "tab-self-inactive"}`}
          onClick={() => setActiveTab("self")}
        >
          Self Orders
        </button>
        <button
          className={`tab-btn ${activeTab === "door" ? "tab-door-active" : "tab-door-inactive"}`}
          onClick={() => setActiveTab("door")}
        >
          Door Orders
        </button>
      </div>

      <h3 className="section-title">Customer Bookings</h3>

      {activeTab === "self" ? (
  <div style={{ marginBottom: "15px" }}>
    <b>Pending: {pendingWeightBookings.length}</b>
    {" | "}
    <b>Accepted: {acceptedBookings.length}</b>
    {" | "}
    <b>Delivered: {deliveredBookings.length}</b>
  </div>
) : (
  <div style={{ marginBottom: "15px" }}>
   <b>Pending: {doorPendingBookings.length}</b>
{" | "}
<b>Accepted: {doorAcceptedBookings.length}</b>
{" | "}
<b>Ready To Deliver: {doorReadyBookings.length}</b>
{" | "}
<b>Delivered: {doorDeliveredBookings.length}</b>

{" | "}
<b>Cancelled: {doorCancelledBookings.length}</b>
{" | "}
<b>Rescheduled: {doorRescheduledBookings.length}</b>

  </div>
)}

     



  
  <div style={{ marginBottom: "15px" }}>
    <select
      className="dt-input"
      value={dateFilter}
      onChange={(e) =>
        setDateFilter(e.target.value)
      }
    >
      <option value="today">
        Today Orders
      </option>

      <option value="week">
        This Week Orders
      </option>

      <option value="month">
        This Month Orders
      </option>
    </select>
  </div>
  
  <div style={{ marginBottom: "15px" }}>
  <input
    type="text"
    className="dt-input"
    placeholder="Search Service Name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>



      {(
  activeTab === "self"
    ? [
        ...pendingWeightBookings,
        ...acceptedBookings,
      ]
    : orderedDoorBookings
)
.filter((b) =>
  b.items?.some((service) =>
    service.serviceName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
)
.map((b) => (
        <div
          key={b.bookingId}
          className={`booking-card ${b.pickupType === "door" ? "door" : ""}`}
        >
          <div className="card-header">

            <div style={{ marginTop: "10px" }}>
  {b.items?.map((service, index) => (
  <div key={index} style={{ marginBottom: "10px" }}>

    <strong>{service.serviceName}</strong>

    {service.items?.length > 0 ? (
  service.items.map((item, i) => (
    <div key={i} style={{ marginLeft: "10px" }}>
      {item.name} × {item.quantity}
    </div>
  ))
) : (
  <div style={{ marginLeft: "10px", color: "orange" }}>
    {service.weight ? `${service.weight} kg` : "Weight pending"}
  </div>
)}

    {/* ✅ WEIGHT INPUT PER SERVICE */}
    {(b.status === "pending_weight" || b.status === "PENDING_WEIGHT") && (!service.items || service.items.length === 0) && (
      <>
        <input
          type="number"
          placeholder="Enter weight (kg)"
          className="dt-input"
          value={weightInput[`${b.bookingId}_${index}`] || ""}
          onChange={(e) =>
            setWeightInput({
              ...weightInput,
              [`${b.bookingId}_${index}`]: e.target.value,
            })
          }
        />

        <button
          className="btn btn-confirm"
          onClick={async () => {
            const kg = weightInput[`${b.bookingId}_${index}`];
            if (!kg) return alert("Enter weight");

            await fetch(
              `${process.env.REACT_APP_API_URL}/api/booking/owner/update-weight/${b.bookingId}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  serviceIndex: index,
                  weight: kg,
                }),
              }
            );

            fetchBookings();
          }}
        >
          Submit
        </button>
      </>
    )}

  </div>
))}





</div>
            
            <span className={`status-badge status-${b.status}`}>
  {b.status.toLowerCase() === "completed"
    ? "DELIVERED"
    : b.status.toUpperCase()}
</span>
          </div>

          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">Customer</span>
              <span className="info-value">{b.customerName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Mobile</span>
              <span className="info-value">{b.customerMobile}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address</span>
              <span className="info-value">{b.customerAddress}</span>
            </div>

            {b.latitude && b.longitude && (
  <div className="info-row">
    <span className="info-label">Map</span>
    <a
      href={`https://www.google.com/maps?q=${b.latitude},${b.longitude}`}
      target="_blank"
      rel="noreferrer"
      style={{ color: "blue" }}
    >
      Open in Google Maps 📍
    </a>
  </div>
)}

            <div className="info-row">
              <span className="info-label">Total</span>
              {b.status === "pending_weight" ? (
  <span className="info-value info-price">
  ₹{Number(b.totalPrice || 0).toFixed(2)}
</span>
) : (
  <span className="info-value info-price">
  ₹{Number(b.totalPrice || 0).toFixed(2)}
</span>
)}
            </div>
           <div className="info-row info-full">
            {b.pickupType === "self" ? (
  <div className="info-row info-full">
    <span className="info-label">Completion Date</span>
    <span className="info-value">
      {b.completionDateTime
        ? formatDateTime(b.completionDateTime)
        : "Not Completed"}
    </span>
  </div>
) : (
  <>
    <div className="info-row info-full">
  <span className="info-label">Pickup Date / Staff</span>

  <span className="info-value">
    {b.pickupDateTime
      ? formatDateTime(b.pickupDateTime)
      : "Not Assigned"}
  </span>

  {b.pickupStaffName && (
    <span className="info-value">
      Staff: {b.pickupStaffName}
    </span>
  )}
  {b.deliveryStaffName && (
  <span className="info-value">
    Delivery Staff: {b.deliveryStaffName}
  </span>
)}
</div>

    <div className="info-row info-full">
      <span className="info-label">Delivery date</span>
      <span className="info-value">
        {b.completionDateTime
          ? formatDateTime(b.completionDateTime)
          : "Not Completed"}
      </span>
    </div>
  </>
)}
  <span className="info-label">Order Date</span>
  <span className="info-value">
    {formatDateTime(b.createdAt)}
  </span>
</div>

</div>


{b.customerCancelRequest && (
<div className="customer-cancel-request">

<h4>❌ Customer Cancel </h4>

<p>
Reason: {b.customerCancelReason}
</p>

</div>
)}



{b.customerRescheduleRequest && (
<div className="customer-reschedule-request">

<h4>⟳ Customer Reschedule </h4>



<p>
Reason: {b.customerRescheduleReason}
</p>

</div>
)}

<hr className="card-divider" />

          <div className="action-row">

            {/* ✅ ASSIGN STAFF (ONLY DOOR ORDERS) */}
{/* ✅ PICKUP STAFF */}
{b.pickupType === "door" &&
 (
   b.status === "pending" ||
   b.status === "pending_weight"||
    b.status === "accepted" ||
   b.status === "pickup_ongoing"
 ) &&
 b.pickupDateTime &&
  !b.pickupStaffName &&  (
  <select
    className="dt-input"
    onChange={(e) => {
  setAssignedStaff({
    ...assignedStaff,
    [b.bookingId]: e.target.value
  });

  assignStaff(
    b.bookingId,
    e.target.value,
    "pickup"
  );
}}
    defaultValue=""
  >
    <option value="" disabled>
  Available Staff ({availableStaff[b.bookingId]?.length || 0})
</option>
    {availableStaff[b.bookingId]?.map((s) => (
  <option key={s.staff_id} value={s.staff_id}>
    {s.name}
  </option>
))}
  </select>
)}

{b.pickupType === "door" &&
 b.status === "ready_to_deliver" &&
 !b.completionDateTime && (
<>
  <DatePicker
    selected={pickupTime[b.bookingId] || null}
    onChange={(date) =>
      setPickupTime({
        ...pickupTime,
        [b.bookingId]: date,
      })
    }
    showTimeSelect
    minDate={new Date()}
    dateFormat="dd/MM/yyyy hh:mm aa"
    className="dt-input"
  />

  <button
    className="btn btn-confirm"
    onClick={async () => {
      if (!pickupTime[b.bookingId]) {
        alert("Select delivery date first");
        return;
      }
const res = await fetch(
  `${process.env.REACT_APP_API_URL}/api/booking/owner/save-delivery-date`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bookingId: b.bookingId,
      completionDateTime: pickupTime[b.bookingId],
    }),
  }
);

const data = await res.json();

if (!res.ok) {
  alert(data.message);
  return;
}

alert("Delivery date saved");

await fetchAvailableStaff(b.bookingId);

fetchBookings();
    }}
  >
    Save Delivery Date
  </button>
</>
)}

    {b.pickupType === "door" &&
 b.status === "ready_to_deliver" &&
 b.completionDateTime &&
 !b.deliveryStaffName && (

<select
  className="dt-input"
  onChange={(e) =>
    assignStaff(
      b.bookingId,
      e.target.value,
      "delivery"
    )
  }
  defaultValue=""
>
  <option value="" disabled>
    Select Delivery Staff
  </option>

  {availableStaff[b.bookingId]?.map((s) => (
    <option key={s.staff_id} value={s.staff_id}>
      {s.name}
    </option>
  ))}
</select>

)}

{b.pickupType === "door" &&
 b.status === "ready_to_deliver" &&
 b.completionDateTime &&
 b.deliveryStaffName &&
 !b.deliveryRescheduled && (

<button
  className="btn btn-complete"
  onClick={async () => {

    await fetch(
      `${process.env.REACT_APP_API_URL}/api/booking/owner/complete`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: b.bookingId,
          completionDateTime: b.completionDateTime
        }),
      }
    );

    alert(" order notification has been sent to the customer.");
    fetchBookings();

  }}
>
  Complete Delivery
</button>

)}

            {/* DOOR ORDER - CONFIRM PICKUP */}
         {(
  b.status === "pending" ||
  b.status === "pending_weight" 
 
) && b.pickupType === "door" && (
              <>
                <DatePicker
  selected={pickupTime[b.bookingId] || null}
  onChange={(date) =>
    setPickupTime({
      ...pickupTime,
      [b.bookingId]: date,
    })
  }
  showTimeSelect
  minDate={new Date()}
  minTime={
    pickupTime[b.bookingId] &&
    pickupTime[b.bookingId].toDateString() === new Date().toDateString()
      ? new Date()
      : new Date(0, 0, 0, 0, 0)
  }
  maxTime={new Date(0, 0, 0, 23, 59)}
  timeFormat="hh:mm aa"
  timeIntervals={30}
  dateFormat="dd/MM/yyyy hh:mm aa"
  placeholderText="Select Date & Time"
  className="dt-input"
/>
{!b.pickupStaffName && (
  <button
    className="btn btn-confirm"
    onClick={() => savePickupDate(b.bookingId)}
  >
    Save Date
  </button>
)}
               {b.pickupStaffName && (
  <button
    className="btn btn-confirm"
    onClick={() => confirmBooking(b.bookingId)}
  >
    Confirm Pickup
  </button>
)}
              </>
            )}

            {/* SELF ORDER - COMPLETE */}
            {( b.status === "accepted" ) && b.pickupType === "self" && (
              <>
               <DatePicker
  selected={pickupTime[b.bookingId] || null}
  onChange={(date) =>
    setPickupTime({
      ...pickupTime,
      [b.bookingId]: date,
    })
  }
  showTimeSelect
  minDate={new Date()}
  minTime={
    pickupTime[b.bookingId] &&
    pickupTime[b.bookingId].toDateString() === new Date().toDateString()
      ? new Date()
      : new Date(0, 0, 0, 0, 0)
  }
  maxTime={new Date(0, 0, 0, 23, 59)}
  timeFormat="hh:mm aa"
  timeIntervals={30}
  dateFormat="dd/MM/yyyy hh:mm aa"
  placeholderText="Select Date & Time"
  className="dt-input"
/>
                <button
                  className="btn btn-complete"
                  onClick={async () => {
                    if (!pickupTime[b.bookingId]) {
                      const selected = new Date(pickupTime[b.bookingId]);

if (selected <= new Date()) {
  alert("Please select a future date and time");
  return;
}
                      alert("Select completion date & time");
                      return;
                    }
                    await fetch(`${process.env.REACT_APP_API_URL}/api/booking/owner/complete`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ bookingId: b.bookingId, completionDateTime: pickupTime[b.bookingId] })
                    });
                    alert("Self order delivered.");
                    fetchBookings();
                  }}
                >
                  Deliver Order
                </button>
              </>
            )}

            {/* DOOR ORDER - MARK COMPLETED */}
            {/* DOOR ORDER - MARK COMPLETED */}
{b.status === "pickup_completed" && (
  <button
  className="btn btn-confirm"
  onClick={async () => {

    if (!window.confirm("Are you sure you want to start processing?")) {
      return;
    }

    await fetch(
      `${process.env.REACT_APP_API_URL}/api/booking/owner/start-processing/${b.bookingId}`,
      {
        method: "PATCH"
      }
    );

    alert("Processing started successfully ✅");

    fetchBookings();

  }}
>
  Start Processing
</button>
)}
            

            {b.status === "processing" &&
 b.pickupType === "door" && (

  <button
  className="btn btn-confirm"
  onClick={async () => {

    if (!window.confirm("Are you sure the order is ready to deliver?")) {
      return;
    }

    await fetch(
      `${process.env.REACT_APP_API_URL}/api/booking/owner/ready-to-deliver/${b.bookingId}`,
      {
        method: "PATCH"
      }
    );

    alert("Order is ready for delivery ✅");

    fetchBookings();

  }}
>
  Ready To Deliver
</button>

)}

            {/* CANCEL, RESCHEDULE, DELETE */}
{b.pickupType === "door" &&
 ![
  ,
   "pickup_completed",
   "processing",
   "ready_to_deliver",
   ,
   "delivered",
   "cancelled"
 ].includes(b.status) && (
              <>
              {!["delivery_assigned", "delivery_ongoing"].includes(b.status) && (
                <button
                  className="btn btn-cancel"
                  onClick={async () => {
                    const reason = prompt("Enter cancel reason");
                    if (!reason) return;
                    await fetch(
                      `${process.env.REACT_APP_API_URL}/api/booking/owner/cancel/${b.bookingId}`,
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ reason })
                      }
                    );

                    alert("Booking cancelled successfully ✅");
                    fetchBookings();
                  }}
                >
                  Cancel
                </button>
                )}

               {[
  "assigned",
  "accepted",
  "pickup_ongoing",
   "delivery_assigned",
  "delivery_ongoing"
].includes(b.status) && (
  <button
    className="btn btn-reschedule"
    onClick={() => setRescheduleBooking(b)}
  >
    Reschedule
  </button>
)}

                {/* <button
                  className="btn btn-delete"
                  onClick={() => deleteBooking(b.bookingId)}
                >
                  Delete
                </button> */}
              </>
            )}

          </div>
        </div>
           ))}

           {/* {activeTab === "self" && (
  <>
    
    <h3 className="delivered-title">
  Delivered Orders
</h3>

<table className="delivered-table">

  <thead className="delivered-table-head">
    <tr>
      <th>Customer</th>
      <th>Mobile</th>
      <th>Total</th>
      <th>Delivery Date</th>
    </tr>
  </thead>

  <tbody className="delivered-table-body">
    {paginatedDeliveredBookings.map((b) => (
      <tr key={b.bookingId} className="delivered-row">
        <td>{b.customerName}</td>
        <td>{b.customerMobile}</td>
        <td>₹{Number(b.totalPrice || 0).toFixed(2)}</td>
        <td>{formatDateTime(b.completionDateTime)}</td>
      </tr>
    ))}
  </tbody>

</table>
  </>
)} */}


{/* {activeTab === "door" && (
  <>
    <h3 className="delivered-title">
      Door Delivered Orders
    </h3>

    <table className="delivered-table">
      <thead>
        <tr>
          <th>Customer</th>
          <th>Mobile</th>
          <th>Total</th>
          <th>Delivery Date</th>
        </tr>
      </thead>

      <tbody>
        {paginatedDoorDelivered.map((b) => (
          <tr key={b.bookingId}>
            <td>{b.customerName}</td>
            <td>{b.customerMobile}</td>
            <td>₹{Number(b.totalPrice || 0).toFixed(2)}</td>
            <td>{formatDateTime(b.completionDateTime)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)} */}



{/* {activeTab === "door" &&
 doorDeliveredBookings.length > DOOR_PER_PAGE && (

<div style={{ marginTop: "20px", textAlign: "center" }}>

  <button
    disabled={doorDeliveredPage === 1}
    onClick={() =>
      setDoorDeliveredPage(doorDeliveredPage - 1)
    }
  >
    Previous
  </button>

  <span style={{ margin: "0 10px" }}>
    Page {doorDeliveredPage} of {
      Math.ceil(
        doorDeliveredBookings.length /
        DOOR_PER_PAGE
      )
    }
  </span>

  <button
    disabled={
      doorDeliveredEnd >=
      doorDeliveredBookings.length
    }
    onClick={() =>
      setDoorDeliveredPage(
        doorDeliveredPage + 1
      )
    }
  >
    Next
  </button>

</div>
)} */}


{/* {activeTab === "door" && (
  <>
    <h3 className="delivered-title">
      Cancelled Orders
    </h3>

    <table className="delivered-table">
      <thead>
        <tr>
          <th>Customer</th>
          <th>Mobile</th>
          <th>Reason</th>
        </tr>
      </thead>

      <tbody>
        {paginatedDoorCancelled.map((b) => (
          <tr key={b.bookingId}>
            <td>{b.customerName}</td>
            <td>{b.customerMobile}</td>
            <td>{b.cancelReason}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)} */}


{/* {activeTab === "door" &&
 doorCancelledBookings.length > DOOR_PER_PAGE && (

<div style={{ marginTop: "20px", textAlign: "center" }}>

  <button
    disabled={doorCancelledPage === 1}
    onClick={() =>
      setDoorCancelledPage(doorCancelledPage - 1)
    }
  >
    Previous
  </button>

  <span style={{ margin: "0 10px" }}>
    Page {doorCancelledPage} of {
      Math.ceil(
        doorCancelledBookings.length /
        DOOR_PER_PAGE
      )
    }
  </span>

  <button
    disabled={
      doorCancelledEnd >=
      doorCancelledBookings.length
    }
    onClick={() =>
      setDoorCancelledPage(
        doorCancelledPage + 1
      )
    }
  >
    Next
  </button>

</div>
)} */}



           {/* {activeTab === "self" &&
 deliveredBookings.length > DELIVERED_PER_PAGE && (

<div style={{ marginTop: "20px", textAlign: "center" }}>

  <button
    disabled={deliveredPage === 1}
    onClick={() =>
      setDeliveredPage(deliveredPage - 1)
    }
  >
    Previous
  </button>

  <span style={{ margin: "0 10px", fontWeight: "bold" }}>
  Page {deliveredPage} of {Math.ceil(deliveredBookings.length / DELIVERED_PER_PAGE)}
</span>

  <button
    disabled={
      deliveredEnd >= deliveredBookings.length
    }
    onClick={() =>
      setDeliveredPage(deliveredPage + 1)
    }
  >
    Next
  </button>

</div>

)} */}

           

      {rescheduleBooking && (
        <div className="reschedule-overlay">
          <div className="reschedule-modal">

            <DatePicker
              selected={
                rescheduleTime[rescheduleBooking.bookingId] || null
              }
              onChange={(date) =>
                setRescheduleTime({
                  ...rescheduleTime,
                  [rescheduleBooking.bookingId]: date,
                })
              }
              showTimeSelect
              minDate={new Date()}
              dateFormat="dd/MM/yyyy hh:mm aa"
              className="dt-input"
            />

            <br /><br />

            <button
              className="btn btn-cancel"
              onClick={() => setRescheduleBooking(null)}
            >
              Close
            </button>

            <button
              className="btn btn-reschedule"
              onClick={async () => {
                const reason = prompt("Enter reschedule reason");
                if (!reason) return;

                const res = await fetch(
                  `${process.env.REACT_APP_API_URL}/api/booking/owner/reschedule/${rescheduleBooking.bookingId}`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      newDate:
                        rescheduleTime[
                          rescheduleBooking.bookingId
                        ],
                      reason,
                    }),
                  }
                );
                const data = await res.json();

if (!res.ok) {
  alert(data.message);
  return;
}

alert("Booking rescheduled successfully ✅");

await fetchAvailableStaff(
  rescheduleBooking.bookingId
);

setRescheduleBooking(null);

fetchBookings();
              }}
            >
              Save
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

