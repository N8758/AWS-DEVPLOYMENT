import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">

      <h1 className="dashboard-title">
        Admin Dashboard
      </h1>

      <div className="dashboard-container">

        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/pending")}
        >
          <h3>Pending Laundry Owners</h3>
          <p>View and Approve Owners</p>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/admin/approved")}
        >
          <h3>Approved Owners</h3>
          <p>View all verified laundry owners</p>
        </div>

        <div
  className="dashboard-card"
  onClick={() => navigate("/admin/customer-stats")}
>
  <h3>Customer Statistics</h3>
  <p>View customer analytics</p>
</div>

<div
  className="dashboard-card"
  onClick={() =>
    navigate("/admin/subscription-revenue")
  }
>
  <h3>Revenue Report</h3>
  <p>View subscription payments</p>
</div>


<div
  className="dashboard-card"
  onClick={() =>
    navigate("/admin/owner-status-management")
  }
>
  <h3>Owner Status Management</h3>
  <p>Activate / Deactivate Laundry Owners</p>
</div>

        <div
          className="dashboard-card logout-card"
          onClick={() => {
            localStorage.removeItem("adminToken");
            navigate("/admin-login");
          }}
        >
          <h3>Logout</h3>
          <p>Sign out from admin panel</p>
        </div>

      </div>

    </div>
  );
}