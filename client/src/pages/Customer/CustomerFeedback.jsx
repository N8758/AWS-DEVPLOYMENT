// client/src/pages/Customer/CustomerFeedback.jsx

import React, { useState } from "react";
import "./style/CustomerFeedback.css";

export default function CustomerFeedback({ bookingId, serviceName, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [suggestion, setSuggestion] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true); // for fade out

  const BASE_URL = process.env.REACT_APP_API_URL;

  const submit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setMessage("Please select a star rating.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/feedback/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("customerToken")}`,
        },
        body: JSON.stringify({ bookingId, rating, suggestion }),
      });

      const body = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage("Feedback submitted successfully ✅");
        setRating(0);
        setSuggestion("");

        // Wait 1.5 seconds, fade out, then call onSuccess
        setTimeout(() => {
          setVisible(false); // triggers CSS fade-out
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 400); // wait for fade animation to finish
        }, 1500);
      } else {
        setIsSuccess(false);
        setMessage(body.message || "Something went wrong.");
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`feedback-container ${visible ? "fade-in" : "fade-out"}`}>
      <h3 className="feedback-title">Give Feedback</h3>

      <form onSubmit={submit} className="feedback-form">

        <div className="feedback-group">
          <label className="feedback-label">Booking ID</label>
          <input className="feedback-input" value={bookingId} disabled />
        </div>

        <div className="feedback-group">
          <label className="feedback-label">Services</label>
          <textarea className="feedback-textarea" value={serviceName} disabled />
        </div>

        <div className="feedback-group">
          <label className="feedback-label">Rating</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hovered || rating) ? "active" : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="feedback-group">
          <label className="feedback-label">Suggestion</label>
          <textarea
            className="feedback-textarea"
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Write your suggestion here..."
          />
        </div>

        <button type="submit" className="feedback-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>

      </form>

      {message && (
        <p className={`feedback-message ${isSuccess ? "success" : "error"}`}>
          {message}
        </p>
      )}
    </div>
  );
}