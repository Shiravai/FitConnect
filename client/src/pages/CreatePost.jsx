// src/pages/CreatePost.jsx — create a post with text, media (image/video), a Canvas drawing,
// an optional group, and workout stats.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postApi, groupApi, SPORT_TYPES } from "../api/endpoints";
import { uploadFile } from "../api/http";
import { useAuth } from "../context/AuthContext";
import CanvasDraw from "../components/CanvasDraw";

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [groupId, setGroupId] = useState("");
  const [myGroups, setMyGroups] = useState([]);
  const [mediaType, setMediaType] = useState("none");
  const [mediaUrl, setMediaUrl] = useState("");
  const [showCanvas, setShowCanvas] = useState(false);
  const [workout, setWorkout] = useState({ sportType: user.favoriteSport || "", durationMin: "", distanceKm: "", calories: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Load the groups this user belongs to, so they can post into them.
  useEffect(() => {
    groupApi.list().then((all) => {
      setMyGroups(all.filter((g) => g.members?.some((m) => String(m) === String(user._id)) || String(g.owner?._id || g.owner) === String(user._id)));
    });
  }, [user._id]);

  // Upload an image or video file and remember its URL.
  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    try {
      const { url, mimetype } = await uploadFile(file);
      setMediaUrl(url);
      setMediaType(mimetype.startsWith("video") ? "video" : "image");
      setShowCanvas(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Receive the exported PNG from the Canvas drawing pad and upload it.
  const onDrawingExport = async (file) => {
    try {
      const { url } = await uploadFile(file);
      setMediaUrl(url);
      setMediaType("drawing");
      setShowCanvas(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !mediaUrl) return setError("Add some text or media first.");
    setBusy(true);
    setError("");
    try {
      await postApi.create({
        text,
        group: groupId || null,
        mediaType,
        mediaUrl,
        workout: {
          sportType: workout.sportType || "",
          durationMin: Number(workout.durationMin) || 0,
          distanceKm: Number(workout.distanceKm) || 0,
          calories: Number(workout.calories) || 0,
        },
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const setW = (k) => (e) => setWorkout({ ...workout, [k]: e.target.value });

  return (
    <div className="page narrow">
      <h2>New Post</h2>
      <form className="card form" onSubmit={submit}>
        <label>What did you do today?
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your workout…" />
        </label>

        <label>Post to group (optional)
          <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">— Public / your profile —</option>
            {myGroups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </label>

        <div className="media-row">
          <label className="btn btn-ghost btn-small file-btn">
            📷 Photo / 🎬 Video
            <input type="file" accept="image/*,video/*" onChange={onFile} hidden />
          </label>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => setShowCanvas(!showCanvas)}>
            ✏️ Draw (Canvas)
          </button>
        </div>

        {showCanvas && <CanvasDraw onExport={onDrawingExport} />}

        {mediaUrl && (
          <div className="preview">
            {mediaType === "video" ? (
              <video src={mediaUrl} controls width="100%" />
            ) : (
              <img src={mediaUrl} alt="preview" />
            )}
            <button type="button" className="btn btn-small btn-ghost" onClick={() => { setMediaUrl(""); setMediaType("none"); }}>
              Remove media
            </button>
          </div>
        )}

        <fieldset className="workout-fields">
          <legend>Workout stats (optional)</legend>
          <select value={workout.sportType} onChange={setW("sportType")}>
            <option value="">Sport type</option>
            {SPORT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="number" min="0" placeholder="Duration (min)" value={workout.durationMin} onChange={setW("durationMin")} />
          <input type="number" min="0" placeholder="Distance (km)" value={workout.distanceKm} onChange={setW("distanceKm")} />
          <input type="number" min="0" placeholder="Calories" value={workout.calories} onChange={setW("calories")} />
        </fieldset>

        {error && <p className="error">{error}</p>}
        <button className="btn btn-block" disabled={busy}>{busy ? "Posting…" : "Publish"}</button>
      </form>
    </div>
  );
}
