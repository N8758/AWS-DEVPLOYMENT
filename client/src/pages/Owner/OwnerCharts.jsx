// client/src/pages/Owner/OwnerCharts.jsx

import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import "./style/OwnerCharts.css";

const fmt = (date) =>
  date
    ? new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
    : "-";

export default function OwnerCharts({ ownerId }) {
  const [bookings,   setBookings]   = useState([]);
  const [filter,     setFilter]     = useState("all");
  const [dailyStats, setDailyStats] = useState([]);
  const [delivPage,  setDelivPage]  = useState(1);
  const [cancelPage, setCancelPage] = useState(1);
  const DELIV_PER_PAGE  = 8;
  const CANCEL_PER_PAGE = 8;

  useEffect(() => { if (ownerId) loadBookings(); }, [ownerId]);
  useEffect(() => { setDelivPage(1); setCancelPage(1); }, [filter]);

  const loadBookings = async () => {
    const res  = await fetch(`${process.env.REACT_APP_API_URL}/api/booking/owner/${ownerId}`);
    const data = await res.json();
    const list = data.bookings || [];
    setBookings(list);
    buildDailyStats(list);
  };

  const buildDailyStats = (list) => {
    const map = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = { date: key, selfRevenue: 0, doorRevenue: 0, selfBookings: 0, doorBookings: 0 };
    }
    list.forEach((b) => {
      const st = (b.status || "").toLowerCase();
      if (st !== "delivered" && st !== "completed") return;
      const day = b.completionDateTime?.slice(0, 10) || b.createdAt?.slice(0, 10);
      if (!map[day]) return;
      const price = parseFloat(b.totalPrice) || 0;
      if ((b.pickupType || "self") === "self") {
        map[day].selfRevenue  += price;
        map[day].selfBookings += 1;
      } else {
        map[day].doorRevenue  += price;
        map[day].doorBookings += 1;
      }
    });
    setDailyStats(Object.values(map));
  };

  // Self stats
  const selfAll       = bookings.filter((b) => (b.pickupType || "self") === "self");
  const selfPending   = selfAll.filter((b) => b.status === "pending_weight").length;
  const selfAccepted  = selfAll.filter((b) => b.status === "accepted").length;
  const selfDelivered = selfAll.filter((b) => b.status === "delivered" || b.status === "completed").length;
  const selfRevenue   = selfAll.filter((b) => b.status === "delivered" || b.status === "completed")
                               .reduce((s, b) => s + (parseFloat(b.totalPrice) || 0), 0);

  // Door stats
  const doorAll       = bookings.filter((b) => b.pickupType === "door");
  const doorPending   = doorAll.filter((b) => ["pending","pending_weight"].includes(b.status)).length;
  const doorAccepted  = doorAll.filter((b) => ["accepted","pickup_ongoing","pickup_completed","processing"].includes(b.status)).length;
  const doorReady     = doorAll.filter((b) => b.status === "ready_to_deliver").length;
  const doorDelivered = doorAll.filter((b) => b.status === "delivered" || b.status === "completed").length;
  const doorCancelled = doorAll.filter((b) => b.status === "cancelled" || b.customerCancelRequest).length;
  const doorRevenue   = doorAll.filter((b) => b.status === "delivered" || b.status === "completed")
                               .reduce((s, b) => s + (parseFloat(b.totalPrice) || 0), 0);

  // Pie data
  const selfPieData   = [
    { name: "Pending",   value: selfPending   },
    { name: "Accepted",  value: selfAccepted  },
    { name: "Delivered", value: selfDelivered },
  ];
  const selfPieColors = ["#f59e0b", "#3a6ff7", "#10b981"];

  const doorPieData   = [
    { name: "Pending",   value: doorPending   },
    { name: "Accepted",  value: doorAccepted  },
    { name: "Ready",     value: doorReady     },
    { name: "Delivered", value: doorDelivered },
    { name: "Cancelled", value: doorCancelled },
  ];
  const doorPieColors = ["#f59e0b", "#3a6ff7", "#0ea5e9", "#10b981", "#ef4444"];

  // Chart data filtered
  const chartData = dailyStats.map((d) => ({
    date: d.date,
    revenue:  filter === "self" ? d.selfRevenue  : filter === "door" ? d.doorRevenue  : d.selfRevenue + d.doorRevenue,
    bookings: filter === "self" ? d.selfBookings : filter === "door" ? d.doorBookings : d.selfBookings + d.doorBookings,
  }));

  // Delivered table
  const filtered = bookings.filter((b) => {
    if (filter === "self") return (b.pickupType || "self") === "self";
    if (filter === "door") return b.pickupType === "door";
    return true;
  });
  const deliveredList   = filtered.filter((b) => ["delivered","completed"].includes((b.status||"").toLowerCase()));
  const pagedDeliv      = deliveredList.slice((delivPage-1)*DELIV_PER_PAGE, delivPage*DELIV_PER_PAGE);
  const totalDelivPages = Math.ceil(deliveredList.length / DELIV_PER_PAGE);

  // Cancelled table — only door orders (self orders don't have cancel)
  const cancelledList   = bookings.filter((b) =>
    b.pickupType === "door" &&
    (b.status === "cancelled" || b.customerCancelRequest) &&
    (filter === "all" || filter === "door")
  );
  const pagedCancel      = cancelledList.slice((cancelPage-1)*CANCEL_PER_PAGE, cancelPage*CANCEL_PER_PAGE);
  const totalCancelPages = Math.ceil(cancelledList.length / CANCEL_PER_PAGE);

  const exportCSV = () => {
    if (!filtered.length) return alert("No data");
    const headers = ["Booking ID","Customer","Mobile","Type","Total","Status","Created At"];
    const rows    = filtered.map((b) => [b.bookingId,b.customerName,b.customerMobile,b.pickupType||"self",b.totalPrice,b.status,b.createdAt]);
    const csv     = headers.join(",") + "\n" + rows.map((r) => r.map((v) => `"${v??""}"` ).join(",")).join("\n");
    const blob    = new Blob([csv], { type: "text/csv" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href = url; a.download = `report-${filter}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!bookings.length) return <div className="charts-empty"><span>📊</span>No analytics data yet</div>;

  return (
    <div className="charts-container">

      {/* Top bar with heading + dropdown */}
      <div className="charts-top-bar">
        <h3 className="charts-heading">Owner Analytics</h3>
        <select className="charts-filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="self">🧺 Self Orders Only</option>
          <option value="door">🚪 Door Orders Only</option>
        </select>
      </div>

      {/* ── SELF SECTION ── */}
      {(filter === "all" || filter === "self") && (
        <div className="charts-section">
          <div className="charts-section-label self-label">
  {filter === "all"
    ? "📊 All Orders - Self Section"
    : "🧺 Self Orders"}
</div>

          <div className="charts-stats-row">
            <div className="charts-stat-card stat-orange">
              <span className="charts-stat-label">Pending</span>
              <span className="charts-stat-value">{selfPending}</span>
            </div>
            <div className="charts-stat-card stat-blue">
              <span className="charts-stat-label">Accepted</span>
              <span className="charts-stat-value">{selfAccepted}</span>
            </div>
            <div className="charts-stat-card stat-green">
              <span className="charts-stat-label">Delivered</span>
              <span className="charts-stat-value">{selfDelivered}</span>
            </div>
            <div className="charts-stat-card stat-teal">
              <span className="charts-stat-label">Revenue</span>
              <span className="charts-stat-value">₹{selfRevenue.toLocaleString()}</span>
            </div>
          </div>

          <div className="chart-card">
            <p className="chart-card-title">Self Orders — Status Breakdown</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={selfPieData} dataKey="value" nameKey="name" outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {selfPieData.map((_, i) => <Cell key={i} fill={selfPieColors[i]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── DOOR SECTION ── */}
      {(filter === "all" || filter === "door") && (
        <div className="charts-section">
          <div className="charts-section-label door-label">
  {filter === "all"
    ? "📊 All Orders - Door Section"
    : "🚪 Door Orders"}
</div>
          <div className="charts-stats-row">
            <div className="charts-stat-card stat-orange">
              <span className="charts-stat-label">Pending</span>
              <span className="charts-stat-value">{doorPending}</span>
            </div>
            <div className="charts-stat-card stat-blue">
              <span className="charts-stat-label">Accepted</span>
              <span className="charts-stat-value">{doorAccepted}</span>
            </div>
            <div className="charts-stat-card stat-teal">
              <span className="charts-stat-label">Ready</span>
              <span className="charts-stat-value">{doorReady}</span>
            </div>
            <div className="charts-stat-card stat-green">
              <span className="charts-stat-label">Delivered</span>
              <span className="charts-stat-value">{doorDelivered}</span>
            </div>
            <div className="charts-stat-card stat-red">
              <span className="charts-stat-label">Cancelled</span>
              <span className="charts-stat-value">{doorCancelled}</span>
            </div>
            <div className="charts-stat-card stat-green">
              <span className="charts-stat-label">Revenue</span>
              <span className="charts-stat-value">₹{doorRevenue.toLocaleString()}</span>
            </div>
          </div>

          <div className="chart-card">
            <p className="chart-card-title">Door Orders — Status Breakdown</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={doorPieData} dataKey="value" nameKey="name" outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {doorPieData.map((_, i) => <Cell key={i} fill={doorPieColors[i]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Revenue Line ── */}
      <div className="chart-card">
        <p className="chart-card-title">Revenue — Last 7 Days</p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `₹${v}`} />
            <Line type="monotone" dataKey="revenue" stroke="#3a6ff7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Daily Bookings Bar ── */}
      <div className="chart-card">
        <p className="chart-card-title">Daily Delivered Bookings</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="bookings" fill="#4CAF50" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Delivered Table + Pagination ── */}
      <div className="chart-card">
        <p className="chart-card-title">
          Delivered Orders
          <span className="chart-badge">{deliveredList.length} total</span>
        </p>
        <div className="deliv-table-wrap">
          <table className="deliv-table">
            <thead>
              <tr><th>Customer</th><th>Mobile</th><th>Type</th><th>Total</th><th>Delivered At</th></tr>
            </thead>
            <tbody>
              {pagedDeliv.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign:"center", color:"#94a3b8", padding:"20px" }}>No delivered orders</td></tr>
              ) : pagedDeliv.map((b) => (
                <tr key={b.bookingId}>
                  <td>{b.customerName}</td>
                  <td>{b.customerMobile}</td>
                  <td><span className={`type-badge type-${b.pickupType || "self"}`}>{(b.pickupType || "self").toUpperCase()}</span></td>
                  <td>₹{Number(b.totalPrice || 0).toFixed(2)}</td>
                  <td>{fmt(b.completionDateTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalDelivPages > 1 && (
          <div className="pagination-row">
            <button className="page-btn" disabled={delivPage === 1} onClick={() => setDelivPage(p => p-1)}>← Prev</button>
            <span className="page-info">Page {delivPage} of {totalDelivPages}</span>
            <button className="page-btn" disabled={delivPage === totalDelivPages} onClick={() => setDelivPage(p => p+1)}>Next →</button>
          </div>
        )}
      </div>

      {/* ── Cancelled Orders Table (Door only) ── */}
      {(filter === "all" || filter === "door") && (
        <div className="chart-card">
          <p className="chart-card-title">
            🚫 Cancelled Door Orders
            <span className="chart-badge cancel-badge">{cancelledList.length} total</span>
          </p>
          <div className="deliv-table-wrap">
            <table className="deliv-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Total</th>
                  <th>Reason</th>
                  <th>Booked At</th>
                </tr>
              </thead>
              <tbody>
                {pagedCancel.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign:"center", color:"#94a3b8", padding:"20px" }}>
                      No cancelled orders
                    </td>
                  </tr>
                ) : pagedCancel.map((b) => (
                  <tr key={b.bookingId} className="cancelled-row">
                    <td>{b.customerName}</td>
                    <td>{b.customerMobile}</td>
                    <td>₹{Number(b.totalPrice || 0).toFixed(2)}</td>
                    <td style={{ color: "#ef4444", fontSize: "0.82rem" }}>
                      {b.cancelReason || b.customerCancelReason || "—"}
                    </td>
                    <td>{fmt(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalCancelPages > 1 && (
            <div className="pagination-row">
              <button className="page-btn" disabled={cancelPage === 1}
                onClick={() => setCancelPage(p => p - 1)}>← Prev</button>
              <span className="page-info">Page {cancelPage} of {totalCancelPages}</span>
              <button className="page-btn" disabled={cancelPage === totalCancelPages}
                onClick={() => setCancelPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      )}

      <button className="btn-export-csv" onClick={exportCSV}>
        📤 Export CSV — {filter === "all" ? "All" : filter === "self" ? "Self" : "Door"} Orders
      </button>
    </div>
  );
}