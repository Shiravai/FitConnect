// src/pages/Profile.jsx — a user's profile: their info, their posts, edit/delete own account, friend toggle.
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userApi, postApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", favoriteSport: "", avatarUrl: "" });
  const [error, setError] = useState("");

  const isMe = String(id) === String(user._id);

  const load = async () => {
    try {
      const p = await userApi.getOne(id);
      setProfile(p);
      setForm({ name: p.name, bio: p.bio || "", favoriteSport: p.favoriteSport || "", avatarUrl: p.avatarUrl || "" });
      setPosts(await postApi.byUser(id));
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, [id]);

  const saveProfile = async () => {
    try {
      const { user: updated } = await userApi.updateMe(form);
      setUser(updated);
      setProfile(updated);
      setEditing(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete your account and all your posts? This cannot be undone.")) return;
    await userApi.deleteMe();
    logout();
    navigate("/login");
  };

  const toggleFriend = async () => {
    await userApi.toggleFriend(id);
    load();
  };

  const isFriend = user.friends?.some((f) => String(f) === String(id));
  const onDeleted = (pid) => setPosts((prev) => prev.filter((p) => p._id !== pid));

  if (!profile) return <div className="page narrow"><p>{error || "Loading…"}</p></div>;

  return (
    <div className="page narrow">
      <div className="card profile-head">
        <div className="profile-top">
          {profile.avatarUrl ? <img className="avatar-lg" src={profile.avatarUrl} alt="" /> : <span className="avatar-lg avatar-fallback">👤</span>}
          <div>
            <h2>{profile.name} <span className="muted">@{profile.username}</span></h2>
            {profile.role !== "user" && <span className="role-badge">{profile.role}</span>}
            <p className="muted">{profile.bio || "No bio yet."}</p>
            {profile.favoriteSport && <span className="chip">🏅 {profile.favoriteSport}</span>}
            <p className="muted small">{profile.friends?.length || 0} friends · {posts.length} posts</p>
          </div>
        </div>

        <div className="profile-actions">
          {isMe ? (
            <>
              <button className="btn btn-small" onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit profile"}</button>
              <button className="btn btn-small btn-danger" onClick={deleteAccount}>Delete account</button>
            </>
          ) : (
            <button className="btn btn-small" onClick={toggleFriend}>{isFriend ? "Remove friend" : "Add friend"}</button>
          )}
        </div>

        {editing && (
          <div className="edit-box form">
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Bio<textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
            <label>Favorite sport<input value={form.favoriteSport} onChange={(e) => setForm({ ...form, favoriteSport: e.target.value })} /></label>
            <label>Avatar URL<input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://…" /></label>
            <button className="btn btn-small" onClick={saveProfile}>Save</button>
          </div>
        )}
      </div>

      <h3>{isMe ? "My posts" : `${profile.name}'s posts`}</h3>
      {error && <p className="error">{error}</p>}
      {posts.length === 0 && <p className="muted">No posts yet.</p>}
      {posts.map((post) => <PostCard key={post._id} post={post} onDeleted={onDeleted} />)}
    </div>
  );
}
