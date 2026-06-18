// src/components/VideoPlayer.jsx — React Video component with custom controls (requirement #26 – Video).
import { useRef, useState } from "react";

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const onTime = () => {
    const v = videoRef.current;
    if (v && v.duration) setProgress((v.currentTime / v.duration) * 100);
  };

  const seek = (e) => {
    const v = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (v && v.duration) v.currentTime = ratio * v.duration;
  };

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={src}
        onTimeUpdate={onTime}
        onEnded={() => setPlaying(false)}
        onClick={toggle}
      />
      <div className="video-controls">
        <button type="button" className="btn btn-small" onClick={toggle}>
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <div className="video-bar" onClick={seek}>
          <div className="video-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
