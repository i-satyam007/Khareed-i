// pages/test-signup.tsx
import React from "react";

export default function TestSignup() {
  async function handleSignup() {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          username: "testuser",
          password: "Password123",
          name: "Test User"
        }),
      });
      const data = await res.json();
      alert("Response: " + JSON.stringify(data));
      console.log("Signup response:", data);
    } catch (err) {
      alert("Network error: " + String(err));
      console.error(err);
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>Signup Test</h1>
      <p>Creates a test user (testuser).</p>
      <button onClick={handleSignup} style={{ padding: "8px 14px", background: "#EF5350", color: "#fff", border: "none", borderRadius: 6 }}>
        Run Signup
      </button>
    </div>
  );
}
