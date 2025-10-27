import React from 'react';
import {
  MousePointer,
  Square,
  Circle,
  Slash,
  Type,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Share2,
  User,
} from 'lucide-react';

const ToolButton = ({ active, title, onClick, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 ${
      active ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white'
    }`}
  >
    {children}
  </button>
);

export default function Toolbar({ tool, onToolChange, onZoomIn, onZoomOut, onUndo, onRedo }) {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Left: Logo + Project */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 text-white">
            <span className="text-sm font-semibold">FX</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">Untitled Project</p>
            <p className="text-xs text-gray-500">Autosaving…</p>
          </div>
        </div>

        {/* Center: Tools + Zoom */}
        <div className="flex items-center gap-2">
          <ToolButton title="Select (V)" active={tool === 'select'} onClick={() => onToolChange('select')}>
            <MousePointer size={18} />
          </ToolButton>
          <ToolButton title="Rectangle (R)" active={tool === 'rect'} onClick={() => onToolChange('rect')}>
            <Square size={18} />
          </ToolButton>
          <ToolButton title="Ellipse (O)" active={tool === 'ellipse'} onClick={() => onToolChange('ellipse')}>
            <Circle size={18} />
          </ToolButton>
          <ToolButton title="Line (L)" active={tool === 'line'} onClick={() => onToolChange('line')}>
            <Slash size={18} />
          </ToolButton>
          <div className="mx-3 h-6 w-px bg-gray-200" />
          <ToolButton title="Text (T)" active={tool === 'text'} onClick={() => onToolChange('text')}>
            <Type size={18} />
          </ToolButton>
          <ToolButton title="Image" active={tool === 'image'} onClick={() => onToolChange('image')}>
            <ImageIcon size={18} />
          </ToolButton>
          <div className="mx-3 h-6 w-px bg-gray-200" />
          <ToolButton title="Zoom In" onClick={onZoomIn}>
            <ZoomIn size={18} />
          </ToolButton>
          <ToolButton title="Zoom Out" onClick={onZoomOut}>
            <ZoomOut size={18} />
          </ToolButton>
        </div>

        {/* Right: Undo/Redo + Share + Avatar */}
        <div className="flex items-center gap-2">
          <ToolButton title="Undo (Ctrl/Cmd+Z)" onClick={onUndo}>
            <Undo size={18} />
          </ToolButton>
          <ToolButton title="Redo (Ctrl/Cmd+Shift+Z)" onClick={onRedo}>
            <Redo size={18} />
          </ToolButton>
          <button className="ml-2 inline-flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800">
            <Share2 size={16} /> Share
          </button>
          <div className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
