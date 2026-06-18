// src/pages/SearchPosts.jsx — advanced post search with 5 parameters (requirement #20).
import { useState } from "react";
import { postApi, SPORT_TYPES } from "../api/endpoints";
import PostCard from "../components/PostCard";

export default function SearchPosts() {
  const [q, setQ] = useState({ sportType: "", keyword: "", from: "", to: "", minDistance: "" });
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const set = (k) => (e) => setQ({ ...q, [k]: e.target.value });

  const search = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Only send non-empty parameters.
      const params = Object.fromEntries(Object.entries(q).filter(([, v]) => v !== ""));
      setResults(await postApi.search(params));
    } catch (e) {
      setError(e.message);
    }
  };

  const onDeleted = (id) => setResults((prev) => prev.filter((p) => p._id !== id));

  return (
    <div className="page narrow">
      <h2>Search Posts</h2>
      <form className="card form search-form" onSubmit={search}>
        <div className="row wrap">
          <label>Sport type
            <select value={q.sportType} onChange={set("sportType")}>
              <option value="">Any</option>
              {SPORT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>Keyword<input value={q.keyword} onChange={set("keyword")} placeholder="text contains…" /></label>
          <label>Min distance (km)<input type="number" min="0" value={q.minDistance} onChange={set("minDistance")} /></label>
        </div>
        <div className="row wrap">
          <label>From date<input type="date" value={q.from} onChange={set("from")} /></label>
          <label>To date<input type="date" value={q.to} onChange={set("to")} /></label>
        </div>
        <button className="btn">Search</button>
      </form>

      {error && <p className="error">{error}</p>}
      {results && <p className="muted">{results.length} result(s)</p>}
      {results && results.map((post) => <PostCard key={post._id} post={post} onDeleted={onDeleted} />)}
    </div>
  );
}
