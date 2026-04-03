import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import { CropFree } from "@mui/icons-material";
import { poopApiService } from "../../services/poopApiService";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  imageUrl: string;
  recordId: string;
}

const ImageCropTool: React.FC<Props> = ({ imageUrl, recordId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [rect, setRect] = useState<CropRect | null>(null);
  const [imgReady, setImgReady] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgReady) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (rect && rect.w > 2 && rect.h > 2) {
      // Dim everything outside the selection
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Redraw the selected region at full brightness
      ctx.drawImage(
        img,
        (rect.x / canvas.width) * img.naturalWidth,
        (rect.y / canvas.height) * img.naturalHeight,
        (rect.w / canvas.width) * img.naturalWidth,
        (rect.h / canvas.height) * img.naturalHeight,
        rect.x,
        rect.y,
        rect.w,
        rect.h
      );

      // Selection border
      ctx.strokeStyle = "#29b6f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

      // Corner handles
      const s = 8;
      ctx.fillStyle = "#29b6f6";
      [
        [rect.x, rect.y],
        [rect.x + rect.w, rect.y],
        [rect.x, rect.y + rect.h],
        [rect.x + rect.w, rect.y + rect.h],
      ].forEach(([hx, hy]) =>
        ctx.fillRect((hx as number) - s / 2, (hy as number) - s / 2, s, s)
      );
    }
  }, [rect, imgReady]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getPos(e);
    startRef.current = p;
    setDrawing(true);
    setRect({ x: p.x, y: p.y, w: 0, h: 0 });
    setResult(null);
    setError(null);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !startRef.current) return;
    const p = getPos(e);
    setRect({
      x: Math.min(startRef.current.x, p.x),
      y: Math.min(startRef.current.y, p.y),
      w: Math.abs(p.x - startRef.current.x),
      h: Math.abs(p.y - startRef.current.y),
    });
  };

  const onMouseUp = () => setDrawing(false);

  const getCroppedBase64 = (): string | null => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !rect || rect.w < 5 || rect.h < 5) return null;

    const scaleX = img.naturalWidth / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;

    const out = document.createElement("canvas");
    out.width = Math.round(rect.w * scaleX);
    out.height = Math.round(rect.h * scaleY);

    const ctx = out.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
      img,
      rect.x * scaleX,
      rect.y * scaleY,
      out.width,
      out.height,
      0,
      0,
      out.width,
      out.height
    );

    try {
      return out.toDataURL("image/jpeg", 0.9).split(",")[1] ?? null;
    } catch {
      // Canvas tainted — S3 CORS not configured for canvas reads
      return null;
    }
  };

  const handleAnalyze = async () => {
    const base64 = getCroppedBase64();
    if (!base64) {
      setError(
        "Could not extract the crop. Make sure S3 CORS is configured to allow canvas access (Access-Control-Allow-Origin)."
      );
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const data = await poopApiService.analyzeCrop(recordId, base64);
      setResult(data.data.analysis);
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImgLoad = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const maxW = Math.min(window.innerWidth - 80, 680);
    const maxH = Math.min(window.innerHeight - 320, 460);
    const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);

    canvas.width = Math.round(img.naturalWidth * ratio);
    canvas.height = Math.round(img.naturalHeight * ratio);

    setImgReady(true);
  };

  return (
    <Box>
      {/* Hidden source image for canvas drawing */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt=""
        crossOrigin="anonymous"
        style={{ display: "none" }}
        onLoad={handleImgLoad}
        onError={() =>
          setError(
            "Could not load image for cropping. S3 CORS may not be configured."
          )
        }
      />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Draw a rectangle to select the area you want to analyze.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <canvas
          ref={canvasRef}
          style={{
            cursor: "crosshair",
            display: "block",
            border: "1px solid #444",
            maxWidth: "100%",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setRect(null);
            setResult(null);
            setError(null);
          }}
        >
          Reset
        </Button>
        <Button
          size="small"
          variant="contained"
          disabled={!rect || rect.w < 5 || analyzing}
          startIcon={
            analyzing ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <CropFree />
            )
          }
          onClick={handleAnalyze}
        >
          {analyzing ? "Analyzing…" : "Analyze Crop"}
        </Button>
      </Box>

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {result && (
        <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            AI Analysis
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {result}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ImageCropTool;
