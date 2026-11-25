import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/CustomerForgotPassword.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function CustomerForgotPassword() {
const navigate = useNavigate();

const [mobile, setMobile] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);


const handleResetPassword = async () => {
try {
if (!/^[6-9]\d{9}$/.test(mobile)) {
return alert("Enter valid 10 digit mobile number");
}


 if (password.length < 6) {
  return alert("Password must be at least 6 characters");
}

  if (password !== confirmPassword) {
    return alert("Passwords do not match");
  }

  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/customer/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile,
        password,
        confirmPassword,
      }),
    }
  );

  const data = await res.json();

  if (res.ok) {
    alert("Password reset successful");

    navigate("/customer-login");
  } else {
    alert(data.message || "Password reset failed");
  }
} catch (error) {
  console.error(error);
  alert("Something went wrong");
}


};

return ( <div className="customer-forgot-container"> <h2>Forgot Password</h2>

  <input
    type="text"
    placeholder="Mobile Number"
    maxLength={10}
    value={mobile}
    onChange={(e) =>
      setMobile(
        e.target.value.replace(/\D/g, "")
      )
    }
    className="customer-forgot-input"
  />
<div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="New Password (Minimum 6 characters)"
    value={password}
    minLength={6}
    onChange={(e) => setPassword(e.target.value)}
    className="customer-forgot-input"
  />

  <span
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

  <div className="password-wrapper">
  <input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Confirm Password"
    value={confirmPassword}
    minLength={6}
    onChange={(e) =>
      setConfirmPassword(e.target.value)
    }
    className="customer-forgot-input"
  />

  <span
    className="password-toggle"
    onClick={() =>
      setShowConfirmPassword(!showConfirmPassword)
    }
  >
    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

  <button
    onClick={handleResetPassword}
    className="customer-forgot-btn"
  >
    Reset Password
  </button>
</div>


);
}
