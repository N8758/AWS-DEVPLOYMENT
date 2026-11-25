import React, { useEffect, useState } from "react";
import "./OwnerStatusManagement.css";

export default function OwnerStatusManagement() {

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const [search, setSearch] = useState("");

  const fetchOwners = async () => {
    try {

      const res = await fetch(
  `${process.env.REACT_APP_API_URL}/api/admin/owner-status-management?page=${page}&limit=10`
);

      const data = await res.json();

      setOwners(data.owners || []);
setTotalPages(data.totalPages || 1);

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
  fetchOwners();
}, [page]);

  const deactivateOwner = async (ownerId) => {

    if (!window.confirm("Deactivate this owner?"))
      return;

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/admin/owner/deactivate`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ownerId
        })
      }
    );

    const data = await res.json();

    alert(data.message);

    fetchOwners();
  };

  const activateOwner = async (ownerId) => {

    if (!window.confirm("Activate this owner?"))
      return;

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/api/admin/owner/activate`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ownerId
        })
      }
    );

    const data = await res.json();

    alert(data.message);

    fetchOwners();
  };

  if (loading) {
    return <h3>Loading...</h3>;
  }

  return (
    <div className="owner-status-container">

      <h2>Owner Status Management</h2>


      <input
  type="text"
  placeholder="Search by ID, owner, shop or mobile..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="search-box"
/>

      <table className="owner-status-table">

        <thead>
          <tr>

            <th>Laundry ID</th>
            
            <th>Owner</th>
            <th>Shop</th>
            <th>Mobile</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Expiry</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {owners
  .filter((owner) => {

    const text = search.toLowerCase();

    return (
      owner.unique_id?.toLowerCase().includes(text) ||
      owner.owner_name?.toLowerCase().includes(text) ||
      owner.shop_name?.toLowerCase().includes(text) ||
      owner.mobile?.includes(text)
    );

  })
  .map((owner) => (

            <tr key={owner.owner_id}>

                 <td>{owner.unique_id}</td>

              <td>{owner.owner_name}</td>

              <td>{owner.shop_name}</td>

              <td>{owner.mobile}</td>

              <td>{owner.subscription_plan || "-"}</td>

              <td>
                <span
                  className={
                    owner.is_active
                      ? "status-active"
                      : "status-inactive"
                  }
                >
                  {owner.is_active
                    ? "Active"
                    : "Inactive"}
                </span>
              </td>

              <td>
                {owner.subscription_end
                  ? new Date(
                      owner.subscription_end
                    ).toLocaleDateString()
                  : "-"}
              </td>

              <td>

                {owner.is_active ? (

                  <button
                    className="deactivate-btn"
                    onClick={() =>
                      deactivateOwner(
                        owner.owner_id
                      )
                    }
                  >
                    Deactivate
                  </button>

                ) : (

                  <button
                    className="activate-btn"
                    onClick={() =>
                      activateOwner(
                        owner.owner_id
                      )
                    }
                  >
                    Activate
                  </button>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

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