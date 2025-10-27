import React, { useCallback, useMemo, useRef, useState } from 'react';
import HeroCover from './components/HeroCover';
import Toolbar from './components/Toolbar';
import CanvasEditor from './components/CanvasEditor';
import StatusBar from './components/StatusBar';

export default function App() {
  // Global editor state
  const [tool, setTool] = useState('select');
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Simple history for undo/redo
  const history = useRef({ past: [], future: [] });
  const pushHistory = useCallback(() => {
    history.current.past.push(JSON.stringify(elements));
    history.current.future = [];
  }, [elements]);
  const undo = useCallback(() => {
    if (!history.current.past.length) return;
    const prev = history.current.past.pop();
    history.current.future.push(JSON.stringify(elements));
    setElements(JSON.parse(prev));
  }, [elements]);
  const redo = useCallback(() => {
    if (!history.current.future.length) return;
    const next = history.current.future.pop();
    history.current.past.push(JSON.stringify(elements));
    setElements(JSON.parse(next));
  }, [elements]);

  const zoomIn = () => setZoom((z) => Math.min(4, z * 1.1));
  const zoomOut = () => setZoom((z) => Math.max(0.2, z / 1.1));

  // Keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, [contenteditable="true"]')) return;
      if (e.key.toLowerCase() === 'v') setTool('select');
      if (e.key.toLowerCase() === 'r') setTool('rect');
      if (e.key.toLowerCase() === 'o') setTool('ellipse');
      if (e.key.toLowerCase() === 'l') setTool('line');
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '=') zoomIn();
      if ((e.metaKey || e.ctrlKey) && e.key === '-') zoomOut();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <HeroCover />
      <Toolbar
        tool={tool}
        onToolChange={setTool}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onUndo={undo}
        onRedo={redo}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <CanvasEditor
          tool={tool}
          elements={elements}
          setElements={setElements}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          zoom={zoom}
          setZoom={setZoom}
          pan={pan}
          setPan={setPan}
          onPushHistory={pushHistory}
          onMousePos={setMouse}
        />
      </main>

      <footer className="sticky bottom-0 z-10 w-full bg-white/80 backdrop-blur">
        <StatusBar x={mouse.x} y={mouse.y} zoom={zoom} collaborators={1} syncing={true} />
      </footer>
    </div>
  );
}
