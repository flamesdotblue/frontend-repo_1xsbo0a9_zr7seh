import React from 'react';

export default function StatusBar({ x, y, zoom, collaborators = 1, syncing = true }) {
  return (
    <div className="flex h-9 w-full items-center justify-between border-t border-gray-200 bg-white px-3 text-xs text-gray-600">
      <div className="flex items-center gap-4">
        <span>Pos: {Math.round(x)}, {Math.round(y)}</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
      </div>
      <div className="flex items-center gap-3">
        <span>Users: {collaborators}</span>
        <span className={syncing ? 'text-green-600' : 'text-yellow-600'}>{syncing ? 'Synced' : 'Syncing…'}</span>
      </div>
    </div>
  );
}
