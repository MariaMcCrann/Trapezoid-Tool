import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      <h1 className="page-title">Trapezoid Calculator</h1>
      <p className="page-subtitle">
        Trapezoidal channel flow and stage-storage tools, based on the "Trapezoid areas volumes" workbook.
      </p>
      <div className="tool-grid">
        <Link className="tool-card" to="/channel-flow">
          <div className="tool-card-title">Channel Flow Calculator</div>
          <div className="tool-card-desc">
            Manning's equation capacity, velocity, hazard and shear stress for a trapezoidal channel.
          </div>
        </Link>
        <Link className="tool-card" to="/stage-storage">
          <div className="tool-card-title">Stage Storage Calculator</div>
          <div className="tool-card-desc">
            Depth-vs-volume stage storage table for a trapezoidal pit or basin.
          </div>
        </Link>
      </div>
    </div>
  )
}
