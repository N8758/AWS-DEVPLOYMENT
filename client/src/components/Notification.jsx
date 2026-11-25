import React, { useEffect, useState } from "react";
import "./notification.css";
import axios from "axios";

export default function Notification({
  userId,
  userType
}) {
  const [notifications, setNotifications] =
    useState([]);

  useEffect(() => {
    if (userId && userType) {
      fetchNotifications();
    }
  }, [userId, userType]);

  const fetchNotifications = async () => {
    try {
      console.log(
        "Loading notifications:",
        userType,
        userId
      );

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/notifications/${userType}/${userId}`
      );

      console.log(res.data);

      setNotifications(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="notification-container">
      <h2>Notifications</h2>

      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className="notification-card"
          >
            <p>{n.message}</p>

            <small>
              {new Date(
                n.created_at
              ).toLocaleString("en-IN")}
            </small>
          </div>
        ))
      )}
    </div>
  );
}