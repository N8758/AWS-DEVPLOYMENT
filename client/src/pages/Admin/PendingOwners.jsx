import React, { useEffect, useState } from "react";
import "./PendingOwners.css";

export default function PendingOwners() {

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const [search, setSearch] = useState("");

  useEffect(() => {
  fetchPending();
}, [page]);

  async function fetchPending() {
    try {

      setLoading(true);

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/pending?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const data = await res.json();

      setPending(data.pending || []);
setTotalPages(data.totalPages || 1);

    } catch (error) {
      alert("Failed to load pending owners");
      console.log(error);

    } finally {
      setLoading(false);
    }
  }

  async function approve(ownerEmail) {

    try {

      if (!window.confirm("Approve this owner?")) return;

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/admin/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({
            email: ownerEmail,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Approved Successfully");
        fetchPending();
      } else {
        alert(data.message);
      }

    } catch (error) {
      alert("Something went wrong");
      console.log(error);
    }
  }

  if (loading)
    return <h2 className="loading">Loading...</h2>;

  if (!pending.length)
    return <h2 className="loading">No Pending Owners</h2>;

  return (
    <div className="pending-container">

      <h2 className="pending-title">
        Pending Laundry Owners
      </h2>

      <input
  type="text"
  placeholder="Search by owner, shop, mobile..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="search-box"
/>

      {pending
  .filter((o) => {

    const text = search.toLowerCase();

    return (
      o.owner_name?.toLowerCase().includes(text) ||
      o.shop_name?.toLowerCase().includes(text) ||
      o.mobile?.includes(text) ||
      o.email?.toLowerCase().includes(text)
    );

  })
  .map((o, i) => (

        <div
          className="pending-card"
          key={i}
        >

          <p>
            <b>{o.shop_name || "—"}</b> — {o.owner_name}
          </p>

          <p>
            Email: {o.email}
          </p>

          <p>
            Mobile: {o.mobile}
          </p>

          <p>
            Address: {o.address}
          </p>

          <button
            className="approve-btn"
            onClick={() => approve(o.email)}
          >
            Approve
          </button>

        </div>

      ))}

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