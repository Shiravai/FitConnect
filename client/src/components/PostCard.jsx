// src/components/PostCard.jsx — renders a single post with likes, comments, edit & delete.
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import $ from "jquery";
import { postApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import VideoPlayer from "./VideoPlayer";

export default function PostCard({ post, onChanged, onDeleted }) {
  const { user } = useAuth();
  const cardRef = useRef(null);
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.some((id) => String(id) === String(user._id)) || false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [error, setError] = useState("");

  const isOwner = String(post.author?._id) === String(user._id) || user.role === "admin";

  // jQuery fade-in effect when the card mounts (requirement #25 — jQuery effects).
  useEffect(() => {
    $(cardRef.current).hide().fadeIn(400);
  }, []);

  const like = async () => {
    try {
      const res = await postApi.like(post._id);
      setLikes(res.likes);
      setLiked(res.liked);
    } catch (e) {
      setError(e.message);
    }
  };

  const sendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const updated = await postApi.comment(post._id, commentText);
      setComments(updated.comments);
      setCommentText("");
    } catch (e) {
      setError(e.message);
    }
  };

  const saveEdit = async () => {
    try {
      const updated = await postApi.update(post._id, { text: editText });
      setEditing(false);
      onChanged && onChanged(updated);
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await postApi.remove(post._id);
      // jQuery slide-up before removing from the list.
      $(cardRef.current).slideUp(300, () => onDeleted && onDeleted(post._id));
    } catch (e) {
      setError(e.message);
    }
  };

  const w = post.workout || {};
  const hasWorkout = w.sportType || w.durationMin || w.distanceKm || w.calories;

  return (
    <article className="post-card" ref={cardRef}>
      <header className="post-head">
        <Link to={`/profile/${post.author?._id}`} className="post-author">
          {post.author?.avatarUrl ? <img className="avatar" src={post.author.avatarUrl} alt="" /> : <span className="avatar avatar-fallback">👤</span>}
          <div>
            <strong>{post.author?.name}</strong>
            <span className="muted"> @{post.author?.username}</span>
            {post.group && <Link to={`/groups/${post.group._id}`} className="group-tag"> in {post.group.name}</Link>}
            <div className="muted small">{new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </Link>
        {isOwner && (
          <div className="post-actions">
            <button className="btn btn-small btn-ghost" onClick={() => setEditing(!editing)}>Edit</button>
            <button className="btn btn-small btn-danger" onClick={remove}>Delete</button>
          </div>
        )}
      </header>

      {editing ? (
        <div className="edit-box">
          <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
          <button className="btn btn-small" onClick={saveEdit}>Save</button>
        </div>
      ) : (
        post.text && <p className="post-text">{post.text}</p>
      )}

      {post.mediaType === "video" && post.mediaUrl && <VideoPlayer src={post.mediaUrl} />}
      {(post.mediaType === "image" || post.mediaType === "drawing") && post.mediaUrl && (
        <img className="post-media" src={post.mediaUrl} alt="post media" />
      )}

      {hasWorkout && (
        <div className="workout-chips">
          {w.sportType && <span className="chip">🏅 {w.sportType}</span>}
          {w.durationMin ? <span className="chip">⏱ {w.durationMin} min</span> : null}
          {w.distanceKm ? <span className="chip">📍 {w.distanceKm} km</span> : null}
          {w.calories ? <span className="chip">🔥 {w.calories} cal</span> : null}
        </div>
      )}

      <footer className="post-foot">
        <button className={liked ? "btn btn-small liked" : "btn btn-small btn-ghost"} onClick={like}>
          ♥ {likes}
        </button>
        <span className="muted small">{comments.length} comments</span>
      </footer>

      <div className="comments">
        {comments.map((c) => (
          <div className="comment" key={c._id || Math.random()}>
            <strong>{c.author?.username || "user"}:</strong> {c.text}
          </div>
        ))}
        <form className="comment-form" onSubmit={sendComment}>
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment…" />
          <button className="btn btn-small" type="submit">Send</button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}
    </article>
  );
}
