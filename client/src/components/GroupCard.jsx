// src/components/GroupCard.jsx — a group tile with a direct Join button (requirement #19/#21).
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { groupApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function GroupCard({ group }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const myId = String(user._id);
  const ownerId = String(group.owner?._id || group.owner);
  const isOwner = ownerId === myId || user.role === "admin";
  const memberFromProps = (group.members || []).some((m) => String(m._id || m) === myId);
  const pendingFromProps = (group.pendingRequests || []).some((m) => String(m._id || m) === myId);

  // Local status so the button updates instantly after joining.
  const [status, setStatus] = useState(
    isOwner ? "owner" : memberFromProps ? "member" : pendingFromProps ? "pending" : "none"
  );

  const join = async (e) => {
    e.stopPropagation();
    setBusy(true);
    setError("");
    try {
      const res = await groupApi.join(group._id);
      setStatus(res.status === "pending" ? "pending" : "member");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const open = () => navigate(`/groups/${group._id}`);

  return (
    <div className="card group-card" onClick={open} role="button" tabIndex={0}>
      <div className="group-cover" data-sport={group.sportType}>{group.sportType}</div>
      <h3>{group.name}</h3>
      <p className="muted small">
        {group.privacy === "private" ? "🔒 Private" : "🌍 Public"} · {group.members?.length || 0} members
      </p>
      <p className="muted">{group.description}</p>

      <div className="group-card-foot" onClick={(e) => e.stopPropagation()}>
        {status === "owner" && <span className="chip">⭐ You manage this</span>}
        {status === "member" && <span className="chip success">✓ Joined</span>}
        {status === "pending" && <span className="chip">⏳ Request pending</span>}
        {status === "none" && (
          <button className="btn btn-small" onClick={join} disabled={busy}>
            {busy ? "Joining…" : group.privacy === "private" ? "Request to join" : "Join group"}
          </button>
        )}
        <button className="btn btn-small btn-ghost" onClick={open}>Open</button>
      </div>
      {error && <p className="error small">{error}</p>}
    </div>
  );
}
