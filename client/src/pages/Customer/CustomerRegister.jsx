import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/CustomerRegister.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function CustomerRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    try {
      if (!name.trim()) {
return alert("Enter your name");
}

if (!/^[A-Za-z ]+$/.test(name.trim())) {
return alert("Name should contain only letters");
}

     if (!email.trim()) {
return alert("Enter email");
}

if (!/^[^\s@]+@[^\s@]+.[^\s@]+$/.test(email)) {
return alert("Enter valid email address");
}


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
        `${process.env.REACT_APP_API_URL}/api/customer/request-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            mobile,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("customerMobileForOtp", mobile);

        alert("OTP sent successfully");

        navigate("/customer-otp");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="customer-register-container">
      <h2>Customer Registration</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="customer-register-input"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="customer-register-input"
      />

      <input
        type="text"
        placeholder="Mobile Number"
        maxLength={10}
        value={mobile}
        onChange={(e) =>
          setMobile(e.target.value.replace(/\D/g, ""))
        }
        className="customer-register-input"
      />

      <div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password (Minimum 6 characters)"
    value={password}
    minLength={6}
    onChange={(e) => setPassword(e.target.value)}
    className="customer-register-input"
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
    onChange={(e) => setConfirmPassword(e.target.value)}
    className="customer-register-input"
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
        onClick={handleRegister}
        className="customer-register-btn"
      >
        Register
      </button>
    </div>
  );
}