import type { Shape } from './CanvasStage'

export default function LayersPanel({
  shapes,
  selectedIds,
  setSelectedIds,
}: {
  shapes: Shape[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}) {
  return (
    <div
      style={{
        width: 150,
        background: '#1a1c22',
        color: '#fff',
        padding: 10,
      }}
    >
      <div style={{ marginBottom: 10 }}>Layers</div>

      {shapes.map((shape, i) => (
        <div
          key={shape.id}
          onClick={() => setSelectedIds([shape.id])}
          style={{
            padding: '6px 8px',
            marginBottom: 4,
            background: selectedIds.includes(shape.id)
              ? '#3b82f6'
              : '#2a2d36',
            cursor: 'pointer',
          }}
        >
          {shape.type === 'rect' ? 'Rect' : 'Circle'} {i}
        </div>
      ))}
    </div>
  );
}