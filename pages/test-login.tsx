// pages/test-login.tsx
import React from "react";

export default function TestLogin() {
  async function handleLogin() {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: "testuser", 
          password: "Password123"
        }),
      });
      const data = await res.json();
      alert("Response: " + JSON.stringify(data));
      console.log("Login response:", data);
    } catch (err) {
      alert("Network error: " + String(err));
      console.error(err);
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>Login Test</h1>
      <p>Logs in the test user (testuser) and sets the cookie.</p>
      <button onClick={handleLogin} style={{ padding: "8px 14px", background: "#6B46C1", color: "#fff", border: "none", borderRadius: 6 }}>
        Run Login
      </button>
    </div>
  );
}
