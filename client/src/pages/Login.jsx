// src/pages/Login.jsx — cinematic, full-screen sports login (CSS3, snowboard/extreme vibe).
// Still wired to the real auth flow (useAuth().login). The "email" field also accepts a username.
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Pre-computed snow particles (memoized so they don't jump on every keystroke).
  const flakes = useMemo(
    () =>
      Array.from({ length: 16 }).map(() => {
        const size = 2 + Math.random() * 5;
        return {
          left: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          animationDuration: `${6 + Math.random() * 9}s`,
          animationDelay: `${Math.random() * 8}s`,
        };
      }),
    []
  );

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("please fill in all fields.");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError((err.message || "login failed.").toLowerCase());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cine">
      {/* Background layers */}
      <div className="cine-bg" />
      <video className="cine-video" autoPlay loop muted playsInline poster="/login-bg.jpg">
        {/* Live snowboarder footage; falls back to a local file, then the CSS scene. */}
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_063509_7d167302-4fd4-480b-8260-18ab572333d4.mp4" type="video/mp4" />
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>
      <div className="cine-overlay" />
      <div className="cine-snow" aria-hidden="true">
        {flakes.map((style, i) => (
          <span key={i} className="flake" style={style} />
        ))}
      </div>

      {/* Floating pill navbar */}
      <nav className="cine-nav">
        <span className="cine-logo">fitconnect</span>
        <div className="cine-nav-links">
          <span>train</span>
          <span>connect</span>
          <span>move</span>
        </div>
        <Link to="/register" className="cine-nav-cta">join</Link>
      </nav>

      {/* Main content */}
      <main className="cine-main">
        <div className="cine-words">
          <span className="w w1">train</span>
          <span className="w w2">connect</span>
          <span className="w w3">move</span>
        </div>

        <form className="cine-card" onSubmit={submit}>
          <h1 className="cine-card-title">log in</h1>
          <p className="cine-card-sub">welcome back. let's move.</p>

          <label className="cine-field">
            <span>email</span>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@fitconnect.com"
              autoComplete="username"
            />
          </label>

          <label className="cine-field">
            <span>password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="cine-error">{error}</p>}

          <button className="cine-btn" disabled={busy}>
            {busy ? "logging in…" : "log in"}
          </button>

          <p className="cine-secondary">
            new here? <Link to="/register">create account</Link>
          </p>
          <p className="cine-demo">demo · maya · 123456</p>
        </form>
      </main>
    </div>
  );
}
