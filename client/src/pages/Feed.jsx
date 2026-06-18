// src/pages/Feed.jsx — personal feed: own + friends' + joined groups' posts (requirement #22).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postApi } from "../api/endpoints";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await postApi.feed();
      setPosts(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChanged = (updated) =>
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  const onDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  return (
    <div className="page narrow">
      <div className="page-head">
        <h2>Your Feed</h2>
        <Link to="/create" className="btn">+ New Post</Link>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && posts.length === 0 && (
        <p className="muted">Your feed is empty. Join some groups or add friends to see their workouts!</p>
      )}
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onChanged={onChanged} onDeleted={onDeleted} />
      ))}
    </div>
  );
}
