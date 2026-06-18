// src/pages/SearchGroups.jsx — advanced group search with 4 parameters (requirement #20).
import { useState } from "react";
import { groupApi, SPORT_TYPES } from "../api/endpoints";
import GroupCard from "../components/GroupCard";

export default function SearchGroups() {
  const [q, setQ] = useState({ sportType: "", name: "", privacy: "", minMembers: "" });
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const set = (k) => (e) => setQ({ ...q, [k]: e.target.value });

  const search = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const params = Object.fromEntries(Object.entries(q).filter(([, v]) => v !== ""));
      setResults(await groupApi.search(params));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="page">
      <h2>Search Groups</h2>
      <form className="card form search-form" onSubmit={search}>
        <div className="row wrap">
          <label>Sport type
            <select value={q.sportType} onChange={set("sportType")}>
              <option value="">Any</option>
              {SPORT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>Name<input value={q.name} onChange={set("name")} placeholder="group name…" /></label>
          <label>Privacy
            <select value={q.privacy} onChange={set("privacy")}>
              <option value="">Any</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
          <label>Min members<input type="number" min="0" value={q.minMembers} onChange={set("minMembers")} /></label>
        </div>
        <button className="btn">Search</button>
      </form>

      {error && <p className="error">{error}</p>}
      {results && <p className="muted">{results.length} result(s)</p>}
      <div className="group-grid">
        {results && results.map((g) => <GroupCard key={g._id} group={g} />)}
      </div>
    </div>
  );
}
