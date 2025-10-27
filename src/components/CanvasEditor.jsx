import React, { useEffect, useMemo, useRef, useState } from 'react';

// Utility helpers
const genId = () => Math.random().toString(36).slice(2, 9);
const snap = (v, step = 10) => Math.round(v / step) * step;

// Convert client coords to canvas coords considering pan/zoom
function clientToCanvas(e, container, pan, zoom) {
  const rect = container.getBoundingClientRect();
  const x = (e.clientX - rect.left - pan.x) / zoom;
  const y = (e.clientY - rect.top - pan.y) / zoom;
  return { x, y };
}

export default function CanvasEditor({
  tool,
  elements,
  setElements,
  selectedId,
  setSelectedId,
  zoom,
  setZoom,
  pan,
  setPan,
  onPushHistory,
  onMousePos,
}) {
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceDown, setSpaceDown] = useState(false);
  const [draft, setDraft] = useState(null);
  const dragState = useRef(null);

  // Keyboard handlers for panning with Space
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSpaceDown(true);
      }
    };
    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        setSpaceDown(false);
        setIsPanning(false);
        dragState.current = null;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Wheel zoom centered on cursor
  const onWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.05 : 0.95;
    const container = containerRef.current;
    if (!container) return;

    // Zoom around cursor position
    const { x: cx, y: cy } = clientToCanvas(e, container, pan, zoom);
    const newZoom = Math.min(4, Math.max(0.2, zoom * factor));

    // Adjust pan to keep cursor focus
    const nx = cx * newZoom + pan.x - cx * zoom;
    const ny = cy * newZoom + pan.y - cy * zoom;

    setZoom(newZoom);
    setPan({ x: nx, y: ny });
  };

  const onMouseDown = (e) => {
    const container = containerRef.current;
    if (!container) return;
    const pos = clientToCanvas(e, container, pan, zoom);

    // Space + drag to pan
    if (spaceDown || tool === 'hand') {
      setIsPanning(true);
      dragState.current = { type: 'pan', start: { x: e.clientX, y: e.clientY }, panStart: { ...pan } };
      return;
    }

    if (tool === 'select') {
      // Hit test elements (topmost)
      for (let i = elements.length - 1; i >= 0; i -= 1) {
        const el = elements[i];
        if (hitTest(el, pos)) {
          setSelectedId(el.id);
          dragState.current = { type: 'move', id: el.id, offset: { x: pos.x - el.x, y: pos.y - el.y } };
          return;
        }
      }
      setSelectedId(null);
      return;
    }

    // Start drawing draft
    if (tool === 'rect') {
      setDraft({ id: 'draft', type: 'rect', x: pos.x, y: pos.y, w: 0, h: 0, fill: '#E5E7EB', stroke: '#111827' });
    } else if (tool === 'ellipse') {
      setDraft({ id: 'draft', type: 'ellipse', x: pos.x, y: pos.y, w: 0, h: 0, fill: '#E5E7EB', stroke: '#111827' });
    } else if (tool === 'line') {
      setDraft({ id: 'draft', type: 'line', x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y, stroke: '#111827' });
    }
  };

  const onMouseMove = (e) => {
    const container = containerRef.current;
    if (!container) return;
    const pos = clientToCanvas(e, container, pan, zoom);
    onMousePos(pos);

    if (isPanning && dragState.current?.type === 'pan') {
      const dx = e.clientX - dragState.current.start.x;
      const dy = e.clientY - dragState.current.start.y;
      setPan({ x: dragState.current.panStart.x + dx, y: dragState.current.panStart.y + dy });
      return;
    }

    if (dragState.current?.type === 'move') {
      const { id, offset } = dragState.current;
      setElements((prev) =>
        prev.map((el) =>
          el.id === id
            ? { ...el, x: snap(pos.x - offset.x), y: snap(pos.y - offset.y) }
            : el
        )
      );
      return;
    }

    if (!draft) return;

    if (draft.type === 'rect' || draft.type === 'ellipse') {
      const w = pos.x - draft.x;
      const h = pos.y - draft.y;
      setDraft({ ...draft, w, h });
    } else if (draft.type === 'line') {
      setDraft({ ...draft, x2: pos.x, y2: pos.y });
    }
  };

  const onMouseUp = () => {
    setIsPanning(false);
    if (dragState.current?.type === 'move') {
      dragState.current = null;
      onPushHistory();
      return;
    }
    dragState.current = null;

    if (!draft) return;

    // Normalize shapes and commit
    if (draft.type === 'rect' || draft.type === 'ellipse') {
      const w = snap(Math.abs(draft.w));
      const h = snap(Math.abs(draft.h));
      const x = snap(draft.w < 0 ? draft.x - w : draft.x);
      const y = snap(draft.h < 0 ? draft.y - h : draft.y);
      const el = { id: genId(), type: draft.type, x, y, w, h, fill: draft.fill, stroke: draft.stroke };
      setElements((prev) => [...prev, el]);
      setSelectedId(el.id);
    } else if (draft.type === 'line') {
      const el = { id: genId(), type: 'line', x1: snap(draft.x1), y1: snap(draft.y1), x2: snap(draft.x2), y2: snap(draft.y2), stroke: draft.stroke };
      setElements((prev) => [...prev, el]);
      setSelectedId(el.id);
    }
    setDraft(null);
    onPushHistory();
  };

  const hitTest = (el, p) => {
    if (el.type === 'rect') {
      return p.x >= el.x && p.x <= el.x + el.w && p.y >= el.y && p.y <= el.y + el.h;
    }
    if (el.type === 'ellipse') {
      const rx = el.w / 2;
      const ry = el.h / 2;
      const cx = el.x + rx;
      const cy = el.y + ry;
      const nx = (p.x - cx) / rx;
      const ny = (p.y - cy) / ry;
      return nx * nx + ny * ny <= 1;
    }
    if (el.type === 'line') {
      // Distance from point to segment threshold
      const dist = pointToSegmentDistance(p, { x: el.x1, y: el.y1 }, { x: el.x2, y: el.y2 });
      return dist < 6; // 6px tolerance
    }
    return false;
  };

  const pointToSegmentDistance = (p, a, b) => {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const wx = p.x - a.x;
    const wy = p.y - a.y;
    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(p.x - a.x, p.y - a.y);
    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(p.x - b.x, p.y - b.y);
    const t = c1 / c2;
    const px = a.x + t * vx;
    const py = a.y + t * vy;
    return Math.hypot(p.x - px, p.y - py);
  };

  // Background grid pattern
  const patternSize = 20;
  const grid = useMemo(() => (
    <pattern id="grid" width={patternSize} height={patternSize} patternUnits="userSpaceOnUse">
      <path d={`M ${patternSize} 0 L 0 0 0 ${patternSize}`} fill="none" stroke="#E5E7EB" strokeWidth="1" />
    </pattern>
  ), []);

  return (
    <div id="editor" className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <div
        ref={containerRef}
        className="relative h-[70vh] w-full cursor-crosshair select-none"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <svg className="absolute inset-0 h-full w-full" role="img" aria-label="Design Canvas">
          <defs>{grid}</defs>
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <rect x={-20000} y={-20000} width={40000} height={40000} fill="url(#grid)" />

            {elements.map((el) => {
              if (el.type === 'rect') {
                return (
                  <g key={el.id}>
                    <rect x={el.x} y={el.y} width={el.w} height={el.h} fill={el.fill} stroke={el.stroke} />
                    {selectedId === el.id && (
                      <rect x={el.x} y={el.y} width={el.w} height={el.h} fill="none" stroke="#3B82F6" strokeDasharray="4 2" />
                    )}
                  </g>
                );
              }
              if (el.type === 'ellipse') {
                const rx = el.w / 2;
                const ry = el.h / 2;
                return (
                  <g key={el.id}>
                    <ellipse cx={el.x + rx} cy={el.y + ry} rx={rx} ry={ry} fill={el.fill} stroke={el.stroke} />
                    {selectedId === el.id && (
                      <ellipse cx={el.x + rx} cy={el.y + ry} rx={rx} ry={ry} fill="none" stroke="#3B82F6" strokeDasharray="4 2" />
                    )}
                  </g>
                );
              }
              if (el.type === 'line') {
                return (
                  <g key={el.id}>
                    <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke={el.stroke} strokeWidth={2} />
                    {selectedId === el.id && (
                      <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2} stroke="#3B82F6" strokeWidth={2} strokeDasharray="4 2" />
                    )}
                  </g>
                );
              }
              return null;
            })}

            {draft && draft.type === 'rect' && (
              <rect x={draft.w < 0 ? draft.x + draft.w : draft.x} y={draft.h < 0 ? draft.y + draft.h : draft.y} width={Math.abs(draft.w)} height={Math.abs(draft.h)} fill="#DBEAFE" stroke="#3B82F6" strokeDasharray="4 2" />
            )}
            {draft && draft.type === 'ellipse' && (
              <ellipse cx={draft.x + draft.w / 2} cy={draft.y + draft.h / 2} rx={Math.abs(draft.w) / 2} ry={Math.abs(draft.h) / 2} fill="#DBEAFE" opacity={0.5} stroke="#3B82F6" strokeDasharray="4 2" />
            )}
            {draft && draft.type === 'line' && (
              <line x1={draft.x1} y1={draft.y1} x2={draft.x2} y2={draft.y2} stroke="#3B82F6" strokeDasharray="4 2" />
            )}
          </g>
        </svg>

        {/* Hint for panning */}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs text-gray-700 shadow">Hold Space to pan</div>
      </div>

      {/* Footer inside the editor for tips */}
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
        <span>Snap: 10px • Guides: On</span>
        <span>Shortcuts: V Select • R Rectangle • O Ellipse • L Line • Space Pan</span>
      </div>
    </div>
  );
}
