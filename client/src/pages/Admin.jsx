// src/pages/Admin.jsx — admin-only control panel (requirement #21).
// Visible only to users whose role is "admin"; everyone else is redirected away.
import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { adminApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [o, u, g] = await Promise.all([adminApi.overview(), adminApi.users(), adminApi.groups()]);
      setOverview(o);
      setUsers(u);
      setGroups(g);
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => { if (user.role === "admin") load(); }, []);

  // Block non-admins at the UI level (the server blocks them too — defense in depth).
  if (user.role !== "admin") return <Navigate to="/" replace />;

  const changeRole = async (id, role) => {
    try { await adminApi.setRole(id, role); load(); }
    catch (e) { setError(e.message); }
  };
  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their content?`)) return;
    try { await adminApi.deleteUser(id); load(); }
    catch (e) { setError(e.message); }
  };
  const deleteGroup = async (id, name) => {
    if (!window.confirm(`Delete group "${name}" and its posts?`)) return;
    try { await adminApi.deleteGroup(id); load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <div className="page">
      <div className="admin-banner">
        <h2>🛡️ Admin Control Panel</h2>
        <p>Site-wide management — visible to administrators only.</p>
      </div>
      {error && <p className="error">{error}</p>}

      {/* Stat cards */}
      {overview && (
        <div className="admin-stats">
          <div className="card stat-box"><span className="stat-num">{overview.totals.users}</span>Users</div>
          <div className="card stat-box"><span className="stat-num">{overview.totals.groups}</span>Groups</div>
          <div className="card stat-box"><span className="stat-num">{overview.totals.posts}</span>Posts</div>
          <div className="card stat-box"><span className="stat-num">{overview.totals.messages}</span>Messages</div>
          <div className="card stat-box small-box">
            <span>👤 {overview.roles.user} users</span>
            <span>⭐ {overview.roles.manager} managers</span>
            <span>🛡️ {overview.roles.admin} admins</span>
          </div>
        </div>
      )}

      {/* Users management */}
      <div className="card">
        <h3>Manage Users ({users.length})</h3>
        <div className="admin-table">
          <div className="admin-row admin-head">
            <span>Name</span><span>Username</span><span>Email</span><span>Role</span><span>Actions</span>
          </div>
          {users.map((u) => (
            <div className="admin-row" key={u._id}>
              <span><Link to={`/profile/${u._id}`}>{u.name}</Link></span>
              <span className="muted">@{u.username}</span>
              <span className="muted small">{u.email}</span>
              <span>
                <select
                  value={u.role}
                  disabled={String(u._id) === String(user._id)}
                  onChange={(e) => changeRole(u._id, e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="manager">manager</option>
                  <option value="admin">admin</option>
                </select>
              </span>
              <span>
                {String(u._id) !== String(user._id) ? (
                  <button className="btn btn-small btn-danger" onClick={() => deleteUser(u._id, u.name)}>Delete</button>
                ) : (
                  <span className="chip">you</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Groups management */}
      <div className="card">
        <h3>Manage Groups ({groups.length})</h3>
        <div className="admin-table">
          <div className="admin-row admin-head groups-row">
            <span>Group</span><span>Sport</span><span>Owner</span><span>Members</span><span>Actions</span>
          </div>
          {groups.map((g) => (
            <div className="admin-row groups-row" key={g._id}>
              <span><Link to={`/groups/${g._id}`}>{g.name}</Link></span>
              <span className="muted">{g.sportType}</span>
              <span className="muted">{g.owner?.username || "—"}</span>
              <span className="muted">{g.members?.length || 0}</span>
              <span><button className="btn btn-small btn-danger" onClick={() => deleteGroup(g._id, g.name)}>Delete</button></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
