// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) return setError("Please fill in all fields.");
    setBusy(true);
    try {
      await login(identifier, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-brand">Fit<span>Connect</span></h1>
        <p className="muted">Welcome back — log in to your fitness community.</p>
        <form onSubmit={submit}>
          <label>Username or Email
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="e.g. maya" />
          </label>
          <label>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-block" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
        </form>
        <p className="muted small">No account? <Link to="/register">Create one</Link></p>
        <div className="demo-hint">
          <strong>Demo logins</strong> (password <code>123456</code>): admin · maya · daniel · noa
        </div>
      </div>
    </div>
  );
}
