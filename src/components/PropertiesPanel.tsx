import type { Shape } from './CanvasStage'

export default function PropertiesPanel({
  shapes,
  selectedIds,
  setShapes,
  commit,
}: {
  shapes: Shape[];
  selectedIds: string[];
  setShapes: (fn: (prev: Shape[]) => Shape[]) => void;
  commit: (next: Shape[]) => void;
}) {
  const selectedShape = shapes.find(s => selectedIds.includes(s.id));

  const updateShape = (updates: Partial<Shape>) => {
    if (!selectedShape) return;
    setShapes(prev => prev.map(s => s.id === selectedShape.id ? { ...s, ...updates } : s));
    commit(shapes.map(s => s.id === selectedShape.id ? { ...s, ...updates } : s));
  };

  return (
    <div
      style={{
        width: 150,
        background: '#1a1c22',
        color: '#fff',
        padding: 10,
        borderLeft: '1px solid #2a2d36',
      }}
    >
      <div style={{ marginBottom: 10 }}>Properties</div>
      {selectedShape ? (
        <div>
          <div style={{ marginBottom: 8 }}>
            <label>Type: </label>
            <select
              value={selectedShape.type}
              onChange={(e) => updateShape({ type: e.target.value as 'rect' | 'circle' })}
              style={{ marginLeft: 8 }}
            >
              <option value="rect">Rectangle</option>
              <option value="circle">Circle</option>
            </select>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>X: </label>
            <input
              type="number"
              value={selectedShape.x}
              onChange={(e) => updateShape({ x: Number(e.target.value) })}
              style={{ width: 60, marginLeft: 8 }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Y: </label>
            <input
              type="number"
              value={selectedShape.y}
              onChange={(e) => updateShape({ y: Number(e.target.value) })}
              style={{ width: 60, marginLeft: 8 }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Width: </label>
            <input
              type="number"
              value={selectedShape.w}
              onChange={(e) => updateShape({ w: Number(e.target.value) })}
              style={{ width: 60, marginLeft: 8 }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Height: </label>
            <input
              type="number"
              value={selectedShape.h}
              onChange={(e) => updateShape({ h: Number(e.target.value) })}
              style={{ width: 60, marginLeft: 8 }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Color: </label>
            <input
              type="color"
              value={selectedShape.color || '#60a5fa'}
              onChange={(e) => updateShape({ color: e.target.value })}
              style={{ marginLeft: 8 }}
            />
          </div>
        </div>
      ) : (
        <div style={{ color: '#666' }}>No selection</div>
      )}
    </div>
  );
}