import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestNotificationPermission } from "../../requestNotificationPermission";
import socket from "../../socket";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./style/ownerlogin.css";

export default function OwnerLogin() {
  const [key, setKey] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();


  const handleLogin = async () => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/owner/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, password }),
    });

    const data = await res.json();

    if (res.status === 200) {

  localStorage.setItem(
    "ownerToken",
    data.token
  );

  socket.connect();

socket.emit(
  "join-owner",
  data.ownerID
);

  localStorage.setItem(
    "subscription",
    JSON.stringify(
      data.subscription
    )
  );

  const fcmToken =
    await requestNotificationPermission();

  if (fcmToken) {
    await fetch(
      `${process.env.REACT_APP_API_URL}/api/owner/save-fcm-token`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          fcmToken,
        }),
      }
    );
  }

  alert("Login Successful");

  navigate("/owner-dashboard");
}else {
      alert(data.message);
    }
  } catch (error) {
    alert("Login failed");
    console.error(error);
  }
};

  return (
  <div className="owner-login-container">
    <input
      type="text"
      placeholder="Laundry ID or Email"
      onChange={(e) => setKey(e.target.value)}
      className="owner-input"
    />

    <div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    onChange={(e) => setPassword(e.target.value)}
    className="owner-input"
  />

  <span
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

    <button className="owner-login-btn" onClick={handleLogin}>
      Login
    </button>

    <p
  onClick={() =>
    navigate("/owner-forgot-password")
  }
  style={{
    marginTop: "15px",
    textAlign: "center",
    color: "#007bff",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  Forgot Password?
</p>

  </div>
);

}

const styles = {
  container: {
    width: "400px",
    margin: "100px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    textAlign: "center",
  },
  input: { width: "100%", padding: "10px", margin: "10px 0" },
  button: {
    width: "100%",
    padding: "10px",
    background: "#3a6ff7",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};
