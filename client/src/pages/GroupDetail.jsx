// src/pages/GroupDetail.jsx — group page: posts, join/leave, and manager controls (requirement #21).
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { groupApi, postApi, SPORT_TYPES } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", sportType: "", privacy: "" });

  const load = async () => {
    try {
      const g = await groupApi.getOne(id);
      setGroup(g);
      setForm({ name: g.name, description: g.description, sportType: g.sportType, privacy: g.privacy });
      try {
        setPosts(await postApi.byGroup(id));
      } catch {
        setPosts(null); // private group, not a member
      }
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => { load(); }, [id]);

  if (!group) return <div className="page narrow"><p>{error || "Loading…"}</p></div>;

  const isManager = String(group.owner?._id || group.owner) === String(user._id) || user.role === "admin";
  const isMember = group.members?.some((m) => String(m._id || m) === String(user._id));
  const isPending = group.pendingRequests?.some((m) => String(m._id || m) === String(user._id));

  const join = async () => {
    try { const r = await groupApi.join(id); setNotice(r.message); load(); }
    catch (e) { setError(e.message); }
  };
  const leave = async () => {
    try { await groupApi.leave(id); load(); }
    catch (e) { setError(e.message); }
  };
  const saveGroup = async () => {
    try { await groupApi.update(id, form); setEditing(false); load(); }
    catch (e) { setError(e.message); }
  };
  const deleteGroup = async () => {
    if (!window.confirm("Delete this group and all its posts?")) return;
    await groupApi.remove(id);
    navigate("/groups");
  };
  const approve = async (uid) => { await groupApi.approve(id, uid); load(); };
  const reject = async (uid) => { await groupApi.reject(id, uid); load(); };
  const removeMember = async (uid) => { await groupApi.removeMember(id, uid); load(); };
  const onDeleted = (pid) => setPosts((prev) => prev.filter((p) => p._id !== pid));

  return (
    <div className="page narrow">
      <div className="card group-detail-head">
        <div className="group-cover" data-sport={group.sportType}>{group.sportType}</div>
        <h2>{group.name}</h2>
        <p className="muted">{group.privacy === "private" ? "🔒 Private group" : "🌍 Public group"} · {group.members?.length} members</p>
        <p>{group.description}</p>
        <p className="muted small">Manager: {group.owner?.name}</p>
        {notice && <p className="notice">{notice}</p>}
        {error && <p className="error">{error}</p>}

        <div className="profile-actions">
          {!isMember && !isPending && <button className="btn btn-small" onClick={join}>Join group</button>}
          {isPending && <span className="chip">Request pending…</span>}
          {isMember && !isManager && <button className="btn btn-small btn-ghost" onClick={leave}>Leave group</button>}
          {isMember && <Link to="/create" className="btn btn-small">+ Post in group</Link>}
          {isManager && <button className="btn btn-small" onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit group"}</button>}
          {isManager && <button className="btn btn-small btn-danger" onClick={deleteGroup}>Delete group</button>}
        </div>

        {editing && isManager && (
          <div className="edit-box form">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label>Sport
              <select value={form.sportType} onChange={(e) => setForm({ ...form, sportType: e.target.value })}>
                {SPORT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>Privacy
              <select value={form.privacy} onChange={(e) => setForm({ ...form, privacy: e.target.value })}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </label>
            <button className="btn btn-small" onClick={saveGroup}>Save changes</button>
          </div>
        )}
      </div>

      {/* Manager-only panel: pending requests + member management (requirement #21) */}
      {isManager && (
        <div className="card">
          <h3>Manage members</h3>
          {group.pendingRequests?.length > 0 && (
            <>
              <h4 className="muted">Pending requests</h4>
              {group.pendingRequests.map((p) => (
                <div className="member-row" key={p._id}>
                  <span>{p.name} <span className="muted">@{p.username}</span></span>
                  <span>
                    <button className="btn btn-small" onClick={() => approve(p._id)}>Approve</button>
                    <button className="btn btn-small btn-ghost" onClick={() => reject(p._id)}>Reject</button>
                  </span>
                </div>
              ))}
            </>
          )}
          <h4 className="muted">Members</h4>
          {group.members?.map((m) => (
            <div className="member-row" key={m._id}>
              <Link to={`/profile/${m._id}`}>{m.name} <span className="muted">@{m.username}</span></Link>
              {String(m._id) !== String(group.owner?._id || group.owner) && (
                <button className="btn btn-small btn-danger" onClick={() => removeMember(m._id)}>Remove</button>
              )}
            </div>
          ))}
        </div>
      )}

      <h3>Group posts</h3>
      {posts === null ? (
        <p className="muted">This is a private group. Join to see its posts.</p>
      ) : posts.length === 0 ? (
        <p className="muted">No posts in this group yet.</p>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} onDeleted={onDeleted} />)
      )}
    </div>
  );
}
