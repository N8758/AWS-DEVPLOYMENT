import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./style/OwnerForgotPassword.css";

export default function OwnerForgotPassword() {
  const navigate = useNavigate();

  const [laundryId, setLaundryId] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!laundryId.trim()) {
      return alert("Enter Laundry ID");
    }

    if (!mobile.trim()) {
      return alert("Enter Mobile Number");
    }

    if (!password.trim()) {
      return alert("Enter New Password");
    }

    if (!confirmPassword.trim()) {
      return alert("Enter Confirm Password");
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/owner/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            laundryId,
            mobile,
            password,
            confirmPassword,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        navigate("/owner-login");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="owner-forgot-container">
      <div className="owner-forgot-card">
        <h2>Reset Owner Password</h2>

        <input
          type="text"
          placeholder="Laundry ID"
          value={laundryId}
          onChange={(e) => setLaundryId(e.target.value)}
        />

        <input
          type="text"
          placeholder="Mobile Number"
          value={mobile}
          maxLength={12}
          onChange={(e) =>
            setMobile(e.target.value.replace(/\D/g, ""))
          }
        />

        <div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="New Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
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
    onChange={(e) => setConfirmPassword(e.target.value)}
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

        <button onClick={handleResetPassword}>
          Reset Password
        </button>

        <p
          className="back-login"
          onClick={() => navigate("/owner-login")}
        >
          Back To Login
        </p>
      </div>
    </div>
  );
}