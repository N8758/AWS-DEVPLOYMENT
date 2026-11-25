import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CustomerOTP() {
const [otp, setOtp] = useState("");
const [mobile, setMobile] = useState("");
const navigate = useNavigate();

useEffect(() => {
const savedMobile =
localStorage.getItem("customerMobileForOtp");


if (!savedMobile) {
  navigate("/customer-register");
  return;
}

setMobile(savedMobile);


}, [navigate]);

const verify = async () => {
try {
if (!otp.trim()) {
return alert("Enter OTP");
}


  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/api/customer/verify-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile,
        otp,
      }),
    }
  );

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem(
      "customerToken",
      data.token
    );

    localStorage.removeItem(
      "customerMobileForOtp"
    );

    alert("Registration successful");

    navigate("/customer-login");
  } else {
    alert(data.message || "Invalid OTP");
  }
} catch (error) {
  console.error(error);
  alert("Verification failed");
}


};

return (
<div
style={{
maxWidth: "420px",
margin: "60px auto",
padding: "20px",
border: "1px solid #ddd",
borderRadius: "10px",
}}
> <h2>OTP Verification</h2>

```
  <p>
    OTP sent to <b>{mobile}</b>
  </p>

  <input
    type="text"
    maxLength={4}
    placeholder="Enter OTP"
    value={otp}
    onChange={(e) =>
      setOtp(
        e.target.value.replace(/\D/g, "")
      )
    }
    style={{
      width: "100%",
      padding: "10px",
      margin: "10px 0",
      boxSizing: "border-box",
    }}
  />

  <button
    onClick={verify}
    style={{
      width: "100%",
      padding: "10px",
      background: "#3a6ff7",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      borderRadius: "5px",
    }}
  >
    Verify & Continue
  </button>
</div>


);
}
