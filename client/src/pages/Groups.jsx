// src/pages/Groups.jsx — list all groups + create a new group.
import { useEffect, useState } from "react";
import { groupApi, SPORT_TYPES } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import GroupCard from "../components/GroupCard";

export default function Groups() {
  const { user, setUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", sportType: "Running", privacy: "public" });

  const load = async () => {
    try { setGroups(await groupApi.list()); }
    catch (e) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Group name is required.");
    try {
      await groupApi.create(form);
      // Creating a group makes you a manager — refresh the local user role.
      if (user.role === "user") setUser({ ...user, role: "manager" });
      setShowForm(false);
      setForm({ name: "", description: "", sportType: "Running", privacy: "public" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <h2>Groups</h2>
        <button className="btn" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "+ Create group"}</button>
      </div>
      {error && <p className="error">{error}</p>}

      {showForm && (
        <form className="card form" onSubmit={create}>
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="row">
            <label>Sport
              <select value={form.sportType} onChange={(e) => setForm({ ...form, sportType: e.target.value })}>
                {SPORT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>Privacy
              <select value={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.value })}>
                <option value="public">Public</option>
                <option value="private">Private (approval needed)</option>
              </select>
            </label>
          </div>
          <button className="btn">Create group</button>
        </form>
      )}

      <div className="group-grid">
        {groups.map((g) => <GroupCard key={g._id} group={g} />)}
      </div>
    </div>
  );
}
