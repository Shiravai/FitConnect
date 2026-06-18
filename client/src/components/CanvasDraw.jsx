// src/components/CanvasDraw.jsx — HTML5 Canvas drawing pad (requirement #26 – Canvas).
// Users can sketch their running route / a motivational drawing and attach it to a post.
import { useRef, useEffect, useState } from "react";

export default function CanvasDraw({ onExport }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [color, setColor] = useState("#ff5722");
  const [size, setSize] = useState(4);

  // Start with a clean white canvas so exported PNGs aren't transparent.
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, []);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };

  const start = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const end = () => (drawing.current = false);

  const clear = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Hand the drawing back to the parent as a PNG File ready to upload.
  const save = () => {
    canvasRef.current.toBlob((blob) => {
      const file = new File([blob], `drawing-${Date.now()}.png`, { type: "image/png" });
      onExport(file);
    }, "image/png");
  };

  return (
    <div className="canvas-draw">
      <div className="canvas-tools">
        <label>Color <input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
        <label>Brush <input type="range" min="1" max="20" value={size} onChange={(e) => setSize(Number(e.target.value))} /></label>
        <button type="button" className="btn btn-small btn-ghost" onClick={clear}>Clear</button>
        <button type="button" className="btn btn-small" onClick={save}>Use this drawing</button>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="canvas-pad"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
    </div>
  );
}
