import React, { useEffect, useState } from "react";
import "./CustomerStats.css";

const BASE_URL = process.env.REACT_APP_API_URL;

export default function CustomerStats() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerStats();
  }, []);

  const fetchCustomerStats = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/customer-stats`
      );

      const data = await res.json();

      setStats({
        totalCustomers: data.totalCustomers || 0,
        activeCustomers: data.activeCustomers || 0,
        inactiveCustomers: data.inactiveCustomers || 0,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="customer-stats-container">
      <h2>Customer Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p>{stats.totalCustomers}</p>
        </div>

        <div className="stat-card">
          <h3>Active Customers</h3>
          <p>{stats.activeCustomers}</p>
        </div>

        <div className="stat-card">
          <h3>Inactive Customers</h3>
          <p>{stats.inactiveCustomers}</p>
        </div>
      </div>
    </div>
  );
}