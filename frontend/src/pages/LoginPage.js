// src/pages/LoginPage.js
import React, { useState } from "react";
import { loginUser } from "../api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      setMessage(res.message + " – token: " + res.accessToken);
      // ở đây bạn có thể set localStorage, điều hướng sang trang Home, v.v.
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra (mock)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Đăng nhập (Mock)</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default LoginPage;
