import React, { useEffect, useState } from "react";
import "./SubscriptionRevenue.css";

const BASE_URL = process.env.REACT_APP_API_URL;

export default function SubscriptionRevenue() {
  const [owners, setOwners] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showTable, setShowTable] = useState(false);

  const [totalRevenue, setTotalRevenue] = useState(0);

  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const [search, setSearch] = useState("");

  useEffect(() => {
  fetchRevenueData();
  fetchRevenueStats();
}, [page]);

  const fetchRevenueData = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/owner-payment-status?page=${page}&limit=10`
      );

      const data = await res.json();

      setOwners(data.owners || []);
setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchRevenueStats = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/revenue-stats`
      );

      const data = await res.json();

      setTotalRevenue(
        data.totalRevenue || 0
      );
    } catch (err) {
      console.log(err);
    }
  };

  const paidOwners = owners.filter(
    (owner) => !owner.account_locked
  );

  const unpaidOwners = owners.filter(
    (owner) => owner.account_locked
  );

  const filteredOwners = (
  filter === "paid"
    ? paidOwners
    : filter === "unpaid"
    ? unpaidOwners
    : owners
).filter((owner) => {

  const text = search.toLowerCase();

  return (
    owner.owner_name?.toLowerCase().includes(text) ||
    owner.shop_name?.toLowerCase().includes(text) ||
    owner.mobile?.includes(text)
  );

});

  return (
    <div className="revenue-page">

      <h1 className="revenue-title">
        Subscription Revenue Report
      </h1>

      <input
  type="text"
  placeholder="Search owner, shop or mobile..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="search-box"
/>

      <div className="summary-cards">

        <div className="summary-card">
          <h3>Total Revenue</h3>
          <h1>₹{totalRevenue}</h1>
        </div>

        <div className="summary-card">
          <h3>Paid Owners</h3>
          <h1>{paidOwners.length}</h1>
        </div>

        <div className="summary-card">
          <h3>Not Paid Owners</h3>
          <h1>{unpaidOwners.length}</h1>
        </div>

      </div>

      <div className="filter-buttons">

        <button
          onClick={() => {
            setFilter("all");
            setShowTable(true);
            setPage(1);
          }}
        >
          All Owners
        </button>

        <button
          onClick={() => {
            setFilter("paid");
            setShowTable(true);
            setPage(1);
          }}
        >
          Paid Owners
        </button>

        <button
          onClick={() => {
            setFilter("unpaid");
            setShowTable(true);
            setPage(1);
          }}
        >
          Not Paid Owners
        </button>

      </div>

      {showTable && (
        <table className="revenue-table">

          <thead>
            <tr>
              <th>Owner</th>
              <th>Shop</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Expiry</th>
            </tr>
          </thead>

          <tbody>

            {filteredOwners.map((owner) => (

              <tr key={owner.owner_id}>

                <td>{owner.owner_name}</td>

                <td>{owner.shop_name}</td>

                <td>
                  {owner.subscription_plan || "-"}
                </td>

                <td>
                  ₹{owner.last_amount || 0}
                </td>

                <td>
                  {owner.account_locked
                    ? "Not Paid"
                    : "Paid"}
                </td>

                <td>
                  {owner.expiry_date
                    ? new Date(
                        owner.expiry_date
                      ).toLocaleDateString()
                    : "-"}
                </td>

              </tr>

            ))}

          </tbody>

          

        </table>







        
      )}

      <div className="pagination">

  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
  >
    Previous
  </button>

  <span>
    Page {page} of {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
  >
    Next
  </button>

</div>

    </div>
  );
}