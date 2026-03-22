import { useEffect, useRef, useState } from 'react';

export type Shape = {
  id: string;
  type: 'rect' | 'circle';
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
};

type Handle = 'tl' | 'tr' | 'bl' | 'br';

export default function CanvasStage({
  selectedIds,
  setSelectedIds,
  shapes,
  setShapes,
  commit,
  currentShapeType,
}: {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  shapes: Shape[];
  setShapes: (fn: (prev: Shape[]) => Shape[]) => void;
  commit: (next: Shape[]) => void;
  currentShapeType: 'rect' | 'circle';
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tempShape, setTempShape] = useState<Shape | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number } | null>(null);

  const [resizeHandle, setResizeHandle] = useState<Handle | null>(null);

  const selectedId = selectedIds[0] ?? null;

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const hitTest = (x: number, y: number) => {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      if (s.type === 'rect') {
        if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) {
          return s;
        }
      } else if (s.type === 'circle') {
        const centerX = s.x + s.w / 2;
        const centerY = s.y + s.h / 2;
        const radius = Math.min(s.w, s.h) / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance <= radius) {
          return s;
        }
      }
    }
    return null;
  };

  const hitHandle = (x: number, y: number, s: Shape): Handle | null => {
    const size = 10;
    const handles = [
      { key: 'tl', x: s.x, y: s.y },
      { key: 'tr', x: s.x + s.w, y: s.y },
      { key: 'bl', x: s.x, y: s.y + s.h },
      { key: 'br', x: s.x + s.w, y: s.y + s.h },
    ];

    for (const h of handles) {
      if (
        x >= h.x - size &&
        x <= h.x + size &&
        y >= h.y - size &&
        y <= h.y + size
      ) {
        return h.key as Handle;
      }
    }
    return null;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f1115';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((s) => {
      ctx.fillStyle = s.color || 'rgba(96,165,250,0.3)';
      if (s.type === 'rect') {
        ctx.fillRect(s.x, s.y, s.w, s.h);
      } else if (s.type === 'circle') {
        ctx.beginPath();
        ctx.arc(s.x + s.w / 2, s.y + s.h / 2, Math.min(s.w, s.h) / 2, 0, 2 * Math.PI);
        ctx.fill();
      }

      if (selectedIds.includes(s.id)) {
        ctx.strokeStyle = '#f59e0b';
        if (s.type === 'rect') {
          ctx.strokeRect(s.x, s.y, s.w, s.h);
        } else if (s.type === 'circle') {
          ctx.stroke();
        }
      }
    });

    if (tempShape) {
      ctx.fillStyle = 'rgba(96,165,250,0.2)';
      if (tempShape.type === 'rect') {
        ctx.fillRect(tempShape.x, tempShape.y, tempShape.w, tempShape.h);
      } else if (tempShape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(tempShape.x + tempShape.w / 2, tempShape.y + tempShape.h / 2, Math.min(tempShape.w, tempShape.h) / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  useEffect(draw, [shapes, tempShape, selectedIds]);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        draw();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getPoint(e);

    if (selectedId) {
      const s = shapes.find(s => s.id === selectedId);
      if (s) {
        const h = hitHandle(p.x, p.y, s);
        if (h) {
          setResizeHandle(h);
          return;
        }
      }
    }

    const hit = hitTest(p.x, p.y);

    if (hit) {
      setSelectedIds([hit.id]);
      setIsDragging(true);

      dragOffsetRef.current = {
        x: p.x - hit.x,
        y: p.y - hit.y,
      };
      return;
    }

    setSelectedIds([]);
    setIsDrawing(true);
    startRef.current = p;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getPoint(e);

    if (resizeHandle && selectedId) {
      setShapes(prev =>
        prev.map(s => {
          if (s.id !== selectedId) return s;

          let { x, y, w, h } = s;

          if (resizeHandle === 'br') {
            w = p.x - x;
            h = p.y - y;
          } else if (resizeHandle === 'tr') {
            w = p.x - x;
            h = y - p.y;
            y = p.y;
          } else if (resizeHandle === 'bl') {
            w = x - p.x;
            h = p.y - y;
            x = p.x;
          } else if (resizeHandle === 'tl') {
            w = x - p.x;
            h = y - p.y;
            x = p.x;
            y = p.y;
          }

          return { ...s, x, y, w, h };
        })
      );
      return;
    }

    if (isDragging && selectedId && dragOffsetRef.current) {
      const o = dragOffsetRef.current;

      setShapes(prev =>
        prev.map(s =>
          s.id === selectedId
            ? { ...s, x: p.x - o.x, y: p.y - o.y }
            : s
        )
      );
      return;
    }

    if (isDrawing && startRef.current) {
      const s = startRef.current;
      setTempShape({
        id: crypto.randomUUID(),
        type: currentShapeType,
        x: s.x,
        y: s.y,
        w: p.x - s.x,
        h: p.y - s.y,
        color: 'rgba(96,165,250,0.3)',
      });
    }
  };

  const onMouseUp = () => {
    if (tempShape) {
      commit([...shapes, tempShape]);
    }

    setTempShape(null);
    setIsDrawing(false);
    setIsDragging(false);
    setResizeHandle(null);
  };

  return (
    <div ref={containerRef} style={{ flex: 1, minWidth: 300, height: '100%' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
}