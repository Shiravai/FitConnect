// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SPORT_TYPES } from "../api/endpoints";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", favoriteSport: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Client-side validation (requirement #24).
  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email.";
    if (form.username.trim().length < 3) return "Username must be at least 3 characters.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setBusy(true);
    setError("");
    try {
      await register(form);
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
        <h1 className="auth-brand">Join Fit<span>Connect</span></h1>
        <form onSubmit={submit}>
          <label>Full name<input value={form.name} onChange={set("name")} /></label>
          <label>Email<input value={form.email} onChange={set("email")} /></label>
          <label>Username<input value={form.username} onChange={set("username")} /></label>
          <label>Password<input type="password" value={form.password} onChange={set("password")} /></label>
          <label>Favorite sport
            <select value={form.favoriteSport} onChange={set("favoriteSport")}>
              <option value="">— choose —</option>
              {SPORT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-block" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
        </form>
        <p className="muted small">Already a member? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
