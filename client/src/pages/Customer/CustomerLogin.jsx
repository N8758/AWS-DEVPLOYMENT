import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/customerlogin.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { requestNotificationPermission } from "../../requestNotificationPermission";


export default function CustomerLogin() {
const [mobile, setMobile] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [name, setName] = useState("");
const navigate = useNavigate();

const handleLogin = async () => {
  if (!name.trim()) {
  return alert("Enter your name");
}

try {
if (!/^[6-9]\d{9}$/.test(mobile)) {
return alert("Enter valid 10 digit mobile number");
}


  if (!password.trim()) {
    return alert("Enter password");
  }

  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/customer/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile,
        password,
      }),
    }
  );

  const data = await res.json();

 if (res.ok) {
  localStorage.setItem("customerToken", data.token);

  const fcmToken = await requestNotificationPermission();

  if (fcmToken) {
    await fetch(
      `${process.env.REACT_APP_API_URL}/api/customer/save-fcm-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          fcmToken,
        }),
      }
    );
  }

  alert("Login successful");

  navigate("/customer-scan");
} else {
    alert(data.message || "Login failed");
  }
} catch (error) {
  console.error(error);
  alert("Something went wrong");
}


};

return ( <div className="customer-login-container"> <h2>Customer Login</h2>

<input
  type="text"
  placeholder="Full Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="customer-login-input"
/>


  <input
    placeholder="Mobile Number"
    value={mobile}
    maxLength={10}
    onChange={(e) =>
      setMobile(e.target.value.replace(/\D/g, ""))
    }
    className="customer-login-input"
  />

<div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="customer-login-input"
  />

  <span
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>


  <button
    onClick={handleLogin}
    className="customer-login-btn"
  >
    Login
  </button>


  <p
  onClick={() => navigate("/customer-forgot-password")}
  style={{
    textAlign: "center",
    marginTop: "12px",
    color: "#3a6ff7",
    cursor: "pointer",
    fontWeight: "500"
  }}
>
  Forgot Password?
</p>


</div>

);
}
