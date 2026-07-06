// Renders the trapezoid cross-section from 4 points (top-left, bottom-left, bottom-right, top-right)
// in real-world units (x, y in metres, y = height above invert), scaled independently on each axis for legibility.
export default function CrossSection({ points, title, labels = [] }) {
  const width = 320
  const height = 220
  const padding = 30

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const yMax = Math.max(...ys, 0.01)

  const innerW = width - padding * 2
  const innerH = height - padding * 2

  const sx = (x) => padding + ((x - xMin) / (xMax - xMin || 1)) * innerW
  // y=0 (invert) at bottom, y=yMax (top) near top of box
  const sy = (y) => padding + innerH - (y / yMax) * innerH

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x)} ${sy(p.y)}`).join(' ') + ' Z'

  return (
    <div className="cross-section-box">
      {title && <div className="cross-section-title">{title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="200">
        <path d={pathD} fill="#f3d9d9" stroke="#1f2937" strokeWidth="1.5" />
        {labels.map((l, i) => (
          <text
            key={i}
            x={l.x != null ? sx(l.x) : width / 2}
            y={l.y != null ? sy(l.y) : padding - 10}
            fontSize="9.5"
            fill="#6b7280"
            textAnchor="middle"
          >
            {l.text}
          </text>
        ))}
      </svg>
    </div>
  )
}
