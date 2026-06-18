// src/pages/Stats.jsx — live statistics dashboard with D3.js graphs (requirement #29).
import { useEffect, useState } from "react";
import { statsApi } from "../api/endpoints";
import StatChart from "../components/StatChart";

export default function Stats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    statsApi.overview().then(setData).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <h2>Community Statistics</h2>
      <p className="muted">All charts are generated live from the database (D3.js).</p>
      {error && <p className="error">{error}</p>}
      {!data ? (
        <p>Loading charts…</p>
      ) : (
        <div className="charts-grid">
          <div className="card"><StatChart type="bar" title="Posts per sport type" data={data.bySport} /></div>
          <div className="card"><StatChart type="line" title="Calories burned per month" data={data.caloriesByMonth} /></div>
          <div className="card"><StatChart type="pie" title="Posts per group" data={data.byGroup} /></div>
        </div>
      )}
    </div>
  );
}
