import React, { useState } from "react";
import "./style/CustomerAnalytics.css";

export default function CustomerAnalytics({ bookings = [] }) {
  const PAGE_SIZE = 5;

  const [selectedType, setSelectedType] = useState("self");

  const [selfPage, setSelfPage] = useState(1);
  const [doorPage, setDoorPage] = useState(1);
  const [cancelPage, setCancelPage] = useState(1);

  const selfBookings = bookings.filter(
    (b) => b.pickupType === "self"
  );

  const doorBookings = bookings.filter(
    (b) => b.pickupType === "door"
  );

  const selfDelivered = selfBookings.filter((b) =>
    ["delivered", "completed"].includes(b.status)
  );

  const doorDelivered = doorBookings.filter((b) =>
    ["delivered", "completed"].includes(b.status)
  );

  const doorCancelled = doorBookings.filter(
    (b) => b.status === "cancelled"
  );

  const selfAmount = selfDelivered.reduce(
    (sum, b) => sum + Number(b.totalPrice || 0),
    0
  );

  const doorAmount = doorDelivered.reduce(
    (sum, b) => sum + Number(b.totalPrice || 0),
    0
  );

  const paginatedSelf = selfDelivered.slice(
    (selfPage - 1) * PAGE_SIZE,
    selfPage * PAGE_SIZE
  );

  const paginatedDoor = doorDelivered.slice(
    (doorPage - 1) * PAGE_SIZE,
    doorPage * PAGE_SIZE
  );

  const paginatedCancelled = doorCancelled.slice(
    (cancelPage - 1) * PAGE_SIZE,
    cancelPage * PAGE_SIZE
  );

  const selfTotalPages =
    Math.ceil(selfDelivered.length / PAGE_SIZE) || 1;

  const doorTotalPages =
    Math.ceil(doorDelivered.length / PAGE_SIZE) || 1;

  const cancelTotalPages =
    Math.ceil(doorCancelled.length / PAGE_SIZE) || 1;

  return (
    <div className="customer-analytics">
      <h2>Customer Analytics</h2>

      <div style={{ marginBottom: "20px" }}>
        <select
          className="analytics-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="self">
            Self Orders
          </option>

          <option value="door">
            Door Orders
          </option>
        </select>
      </div>

      <div className="analytics-grid">

        {selectedType === "self" && (
          <div className="analytics-card">
            <h3>Self Orders</h3>

            <p>
              Total Orders:
              <strong>{selfBookings.length}</strong>
            </p>

            <p>
              Delivered Orders:
              <strong>{selfDelivered.length}</strong>
            </p>

            <p>
              Amount Paid:
              <strong>
                ₹{selfAmount.toFixed(2)}
              </strong>
            </p>
          </div>
        )}

        {selectedType === "door" && (
          <div className="analytics-card">
            <h3>Door Orders</h3>

            <p>
              Total Orders:
              <strong>{doorBookings.length}</strong>
            </p>

            <p>
              Delivered Orders:
              <strong>{doorDelivered.length}</strong>
            </p>

            <p>
              Cancelled Orders:
              <strong>{doorCancelled.length}</strong>
            </p>

            <p>
              Amount Paid:
              <strong>
                ₹{doorAmount.toFixed(2)}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* SELF TABLE */}
      {selectedType === "self" &&
        paginatedSelf.length > 0 && (
          <>
            <h3 style={{ marginTop: "40px" }}>
              Self Delivered Orders
            </h3>

            <table className="book-items-table">
              <thead>
               <tr>
  <th>Booking ID</th>
  <th>Service Name</th>
  <th>Date</th>
  <th>Total</th>
</tr>
              </thead>

              <tbody>
                {paginatedSelf.map((b) => (
                  <tr key={b.bookingId}>
  <td>{b.bookingId}</td>

  <td>
    {b.items?.map((s) => s.serviceName).join(", ")}
  </td>

  <td>
    {new Date(b.createdAt).toLocaleDateString("en-IN")}
  </td>

  <td>
    ₹{Number(b.totalPrice || 0).toFixed(2)}
  </td>
</tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 10 }}>
              <button
                disabled={selfPage === 1}
                onClick={() =>
                  setSelfPage(selfPage - 1)
                }
              >
                Previous
              </button>

              <span
                style={{ margin: "0 10px" }}
              >
                {selfPage} / {selfTotalPages}
              </span>

              <button
                disabled={
                  selfPage === selfTotalPages
                }
                onClick={() =>
                  setSelfPage(selfPage + 1)
                }
              >
                Next
              </button>
            </div>
          </>
        )}

      {/* DOOR DELIVERED */}
      {selectedType === "door" &&
        paginatedDoor.length > 0 && (
          <>
            <h3 style={{ marginTop: "40px" }}>
              Door Delivered Orders
            </h3>

            <table className="book-items-table">
              <thead>
               <tr>
  <th>Booking ID</th>
  <th>Service Name</th>
  <th>Date</th>
  <th>Total</th>
</tr>
              </thead>

              <tbody>
                {paginatedDoor.map((b) => (
                  <tr key={b.bookingId}>
  <td>{b.bookingId}</td>

  <td>
    {b.items?.map((s) => s.serviceName).join(", ")}
  </td>

  <td>
    {new Date(b.createdAt).toLocaleDateString("en-IN")}
  </td>

  <td>
    ₹{Number(b.totalPrice || 0).toFixed(2)}
  </td>
</tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 10 }}>
              <button
                disabled={doorPage === 1}
                onClick={() =>
                  setDoorPage(doorPage - 1)
                }
              >
                Previous
              </button>

              <span
                style={{ margin: "0 10px" }}
              >
                {doorPage} / {doorTotalPages}
              </span>

              <button
                disabled={
                  doorPage === doorTotalPages
                }
                onClick={() =>
                  setDoorPage(doorPage + 1)
                }
              >
                Next
              </button>
            </div>
          </>
        )}

      {/* DOOR CANCELLED */}
      {selectedType === "door" &&
        paginatedCancelled.length > 0 && (
          <>
            <h3 style={{ marginTop: "40px" }}>
              Door Cancelled Orders
            </h3>

            <table className="book-items-table">
              <thead>
               <tr>
  <th>Booking ID</th>
  <th>Service Name</th>
  <th>Date</th>
  <th>Total</th>
</tr>
              </thead>

              <tbody>
                {paginatedCancelled.map((b) => (
                 <tr key={b.bookingId}>
  <td>{b.bookingId}</td>

  <td>
    {b.items?.map((s) => s.serviceName).join(", ")}
  </td>

  <td>
    {new Date(b.createdAt).toLocaleDateString("en-IN")}
  </td>

  <td>
    ₹{Number(b.totalPrice || 0).toFixed(2)}
  </td>
</tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 10 }}>
              <button
                disabled={cancelPage === 1}
                onClick={() =>
                  setCancelPage(cancelPage - 1)
                }
              >
                Previous
              </button>

              <span
                style={{ margin: "0 10px" }}
              >
                {cancelPage} / {cancelTotalPages}
              </span>

              <button
                disabled={
                  cancelPage ===
                  cancelTotalPages
                }
                onClick={() =>
                  setCancelPage(cancelPage + 1)
                }
              >
                Next
              </button>
            </div>
          </>
        )}
    </div>
  );
}