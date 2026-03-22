export default function Toolbar({
  currentShapeType,
  setCurrentShapeType,
}: {
  currentShapeType: 'rect' | 'circle';
  setCurrentShapeType: (type: 'rect' | 'circle') => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: 10,
        background: '#1a1c22',
        color: '#fff',
        borderBottom: '1px solid #2a2d36',
      }}
    >
      <button
        onClick={() => setCurrentShapeType('rect')}
        style={{
          padding: '8px 12px',
          background: currentShapeType === 'rect' ? '#3b82f6' : '#2a2d36',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Rectangle
      </button>
      <button
        onClick={() => setCurrentShapeType('circle')}
        style={{
          padding: '8px 12px',
          background: currentShapeType === 'circle' ? '#3b82f6' : '#2a2d36',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Circle
      </button>
    </div>
  );
}