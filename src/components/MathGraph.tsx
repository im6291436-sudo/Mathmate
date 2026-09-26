import React, { useRef, useEffect, useState } from 'react';
import { GraphData } from '../types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MathGraphProps {
  graphData?: GraphData;
  language: 'bn' | 'en';
}

export const MathGraph: React.FC<MathGraphProps> = ({ graphData, language }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState<number>(30); // pixels per unit
  const [origin, setOrigin] = useState<{ x: number; y: number }>({ x: 250, y: 175 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!graphData || !graphData.canPlot) return null;

  // Safely evaluate function fn in terms of x
  const evaluateFn = (fnStr: string, x: number): number | null => {
    try {
      // Clean and sanitize string
      let expr = fnStr
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/\^/g, '**');

      // Function constructor with isolated argument
      const fn = new Function('x', `return ${expr};`);
      const val = fn(x);
      return typeof val === 'number' && !isNaN(val) && isFinite(val) ? val : null;
    } catch {
      return null;
    }
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Draw vertical grid
    const leftX = Math.floor(-origin.x / scale);
    const rightX = Math.ceil((width - origin.x) / scale);
    for (let xVal = leftX; xVal <= rightX; xVal++) {
      const screenX = origin.x + xVal * scale;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();

      if (xVal !== 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(xVal.toString(), screenX - 5, origin.y + 12);
      }
    }

    // Draw horizontal grid
    const topY = Math.ceil(origin.y / scale);
    const bottomY = Math.floor((origin.y - height) / scale);
    for (let yVal = bottomY; yVal <= topY; yVal++) {
      const screenY = origin.y - yVal * scale;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
      ctx.stroke();

      if (yVal !== 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(yVal.toString(), origin.x + 5, screenY + 4);
      }
    }

    // Axes
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, height);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('X', width - 15, origin.y - 6);
    ctx.fillText('Y', origin.x + 6, 15);

    // Plot Function if available
    const fnToUse = graphData.fn || (graphData.equation ? graphData.equation.replace(/y\s*=\s*/, '') : null);
    if (fnToUse) {
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 3;
      ctx.beginPath();

      let started = false;
      for (let px = 0; px <= width; px += 2) {
        const xVal = (px - origin.x) / scale;
        const yVal = evaluateFn(fnToUse, xVal);

        if (yVal !== null) {
          const py = origin.y - yVal * scale;
          if (py >= -100 && py <= height + 100) {
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            started = false;
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }

    // Plot Key Points
    if (graphData.keyPoints && Array.isArray(graphData.keyPoints)) {
      graphData.keyPoints.forEach((point) => {
        const px = origin.x + point.x * scale;
        const py = origin.y - point.y * scale;

        // Outer glow
        ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fill();

        // Inner point
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px "Hind Siliguri", Inter, sans-serif';
        ctx.fillText(
          `${point.label} (${point.x}, ${point.y})`,
          px + 8,
          py - 6
        );
      });
    }
  };

  useEffect(() => {
    drawGraph();
  }, [scale, origin, graphData]);

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setOrigin((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-base">📈</span>
          <h4 className="text-sm font-semibold text-white">
            {language === 'bn' ? 'ফাংশন ও গ্রাফ বিশ্লেষণ' : 'Function & Graph Plot'}
          </h4>
          {graphData.equation && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs">
              {graphData.equation}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setScale((s) => Math.min(s + 8, 80))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(s - 8, 12))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setScale(30);
              setOrigin({ x: 250, y: 175 });
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-800">
        <canvas
          ref={canvasRef}
          width={500}
          height={320}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-auto cursor-grab active:cursor-grabbing block"
        />
        <div className="absolute bottom-2 right-2 bg-slate-950/70 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-400 pointer-events-none">
          {language === 'bn' ? 'ড্র্যাগ করে সরান' : 'Drag to pan view'}
        </div>
      </div>

      {graphData.description && (
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          💡 <span className="font-medium text-slate-200">{graphData.description}</span>
        </p>
      )}
    </div>
  );
};
