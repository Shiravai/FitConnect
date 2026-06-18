// src/components/ImageTextEditor.jsx — write text onto an uploaded photo using Canvas (requirement #26).
// The user types a caption, picks color/size, and clicks on the image to place it.
import { useEffect, useRef, useState } from "react";

export default function ImageTextEditor({ imageUrl, onExport, onCancel }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [text, setText] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(34);
  const [pos, setPos] = useState({ x: 0.5, y: 0.85 }); // relative position (0..1)
  const [ready, setReady] = useState(false);

  // Load the image once.
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      const maxW = 500;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      setReady(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Redraw image + text whenever something changes.
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

    if (text) {
      ctx.font = `bold ${size}px Poppins, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = Math.max(2, size / 8);
      ctx.strokeStyle = "rgba(0,0,0,0.85)"; // outline for readability
      ctx.fillStyle = color;
      const x = pos.x * canvas.width;
      const y = pos.y * canvas.height;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }
  }, [ready, text, color, size, pos]);

  // Click on the image to move the caption there.
  const place = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setPos({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  };

  const apply = () => {
    canvasRef.current.toBlob((blob) => {
      const file = new File([blob], `captioned-${Date.now()}.png`, { type: "image/png" });
      onExport(file);
    }, "image/png");
  };

  return (
    <div className="image-editor">
      <p className="muted small">Type your caption, then click on the photo to position it.</p>
      <div className="image-editor-tools">
        <input
          className="caption-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Caption text…"
        />
        <label>Color <input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
        <label>Size <input type="range" min="16" max="72" value={size} onChange={(e) => setSize(Number(e.target.value))} /></label>
      </div>
      <canvas ref={canvasRef} className="image-editor-canvas" onClick={place} />
      <div className="image-editor-actions">
        <button type="button" className="btn btn-small btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn btn-small" onClick={apply}>Apply text & use photo</button>
      </div>
    </div>
  );
}
