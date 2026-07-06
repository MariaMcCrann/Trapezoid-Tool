import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import CrossSection from '../components/CrossSection.jsx'
import { calcChannelFlow, channelCrossSection } from '../lib/channelFlow.js'

const num = (v) => (v === '' || v == null ? NaN : Number(v))
const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : '—')

export default function ChannelFlow() {
  const [depth, setDepth] = useState('1')
  const [bottomWidth, setBottomWidth] = useState('2')
  const [drainSlope, setDrainSlope] = useState('0.0155')
  const [sideSlope, setSideSlope] = useState('5')
  const [manningsN, setManningsN] = useState('0.05')
  const [availableTopWidth, setAvailableTopWidth] = useState('10')
  const [requiredQ, setRequiredQ] = useState('')

  const inputs = useMemo(
    () => ({
      depth: num(depth),
      bottomWidth: num(bottomWidth),
      drainSlope: num(drainSlope),
      sideSlope: num(sideSlope),
      manningsN: num(manningsN),
      availableTopWidth: availableTopWidth === '' ? null : num(availableTopWidth),
    }),
    [depth, bottomWidth, drainSlope, sideSlope, manningsN, availableTopWidth]
  )

  const valid = Object.values(inputs).every((v) => v === null || Number.isFinite(v))
  const r = valid ? calcChannelFlow(inputs) : null

  const oneInX = Number.isFinite(inputs.drainSlope) && inputs.drainSlope > 0 ? 1 / inputs.drainSlope : NaN
  const slopePct = Number.isFinite(inputs.drainSlope) ? inputs.drainSlope * 100 : NaN

  const reqQ = requiredQ === '' ? null : num(requiredQ)
  const capacityOk = r && reqQ != null && Number.isFinite(reqQ) ? r.capacity >= reqQ : null

  const points = valid
    ? channelCrossSection({ depth: inputs.depth, bottomWidth: inputs.bottomWidth, sideSlope: inputs.sideSlope })
    : []

  function handleExport() {
    if (!r) return
    const rows = [
      ['Trapezoid Calculator — Channel Flow Calculation'],
      [],
      ['INPUTS'],
      ['Depth (m)', inputs.depth],
      ['Bottom width (m)', inputs.bottomWidth],
      ['Drain slope (m/m)', inputs.drainSlope],
      ['Drain slope (1 in X)', oneInX],
      ['Drain slope (%)', slopePct],
      ['Side slope (1 in X)', inputs.sideSlope],
      ["Manning's n", inputs.manningsN],
      ['Available top width (m)', inputs.availableTopWidth ?? ''],
      ['Required flow capacity, Q (m³/s)', reqQ ?? ''],
      [],
      ['CALCULATIONS'],
      ['Area (m²)', r.area],
      ['Side slope length (m)', r.ssLength],
      ['Wetted perimeter (m)', r.wettedPerimeter],
      ['Hydraulic radius, R (m)', r.hydraulicRadius],
      [],
      ['OUTPUTS'],
      ['Capacity (m³/s)', r.capacity],
      ['Velocity (m/s)', r.velocity],
      ['Top width (m)', r.topWidth],
      ['Hazard, d·v (m²/s)', r.hazard],
      ['Shear stress (N/m²)', r.shearStress],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [{ wch: 30 }, { wch: 16 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Channel Flow')
    XLSX.writeFile(wb, 'channel-flow-calculation.xlsx')
  }

  return (
    <div>
      <h1 className="page-title">Channel Flow Calculator</h1>
      <p className="page-subtitle">Trapezoidal channel capacity via Manning's equation</p>

      <div className="layout-grid">
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-badge">1</div>
                <div className="card-title">Channel geometry &amp; slope</div>
              </div>
              <div className="card-header-hint">Trapezoidal channel, straight batters</div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Depth, d</label>
                <span className="field-hint">Design flow depth</span>
                <input type="number" step="any" value={depth} onChange={(e) => setDepth(e.target.value)} />
                <div className="field-unit">m</div>
              </div>
              <div className="field">
                <label className="field-label">Bottom width, b</label>
                <input type="number" step="any" value={bottomWidth} onChange={(e) => setBottomWidth(e.target.value)} />
                <div className="field-unit">m</div>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Drain slope</label>
                <span className="field-hint">
                  Longitudinal invert slope, as a decimal (m/m). Equivalent to 1 in {fmt(oneInX, 1)} · {fmt(slopePct, 2)}%
                </span>
                <input type="number" step="any" value={drainSlope} onChange={(e) => setDrainSlope(e.target.value)} />
                <div className="field-unit">m/m</div>
              </div>
              <div className="field">
                <label className="field-label">Side slopes, 1 in X</label>
                <span className="field-hint">
                  Refer to office standard values for appropriate side slopes to use.
                </span>
                <input type="number" step="any" value={sideSlope} onChange={(e) => setSideSlope(e.target.value)} />
                <div className="field-unit">X</div>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Manning's n</label>
                <span className="field-hint">Refer to office standard values for appropriate roughness.</span>
                <input type="number" step="any" value={manningsN} onChange={(e) => setManningsN(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Available top width</label>
                <span className="field-hint">Space available for the channel at the top of bank</span>
                <input
                  type="number"
                  step="any"
                  value={availableTopWidth}
                  onChange={(e) => setAvailableTopWidth(e.target.value)}
                />
                <div className="field-unit">m</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-badge">2</div>
                <div className="card-title">Design check (optional)</div>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Required flow capacity, Q</label>
                <span className="field-hint">Leave blank to skip the capacity check</span>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 2.5"
                  value={requiredQ}
                  onChange={(e) => setRequiredQ(e.target.value)}
                />
                <div className="field-unit">m³/s</div>
              </div>
            </div>
          </div>
        </div>

        <div className="results-panel">
          <div className="results-heading">Results</div>
          <div className="results-sub">Live calculation</div>

          <div className="headline-card">
            <div className="headline-label">Channel flow capacity</div>
            <div className="headline-value">
              {r ? fmt(r.capacity, 2) : '—'}
              <span className="headline-unit">m³/s</span>
            </div>
          </div>

          {r && (
            <div className="badge-row">
              {capacityOk != null && (
                <span className={`badge ${capacityOk ? 'ok' : 'bad'}`}>
                  {capacityOk ? '✓' : '✗'} Capacity {capacityOk ? 'meets' : 'below'} required Q
                </span>
              )}
              {r.topWidthOk != null && (
                <span className={`badge ${r.topWidthOk ? 'ok' : 'bad'}`}>
                  {r.topWidthOk ? '✓' : '✗'} Top width {r.topWidthOk ? 'fits' : 'exceeds'} available space
                </span>
              )}
              <span className={`badge ${r.hazardOk ? 'ok' : 'warn'}`}>
                {r.hazardOk ? '✓' : '!'} Hazard (d·v) {r.hazardOk ? '≤ 0.3' : '> 0.3 — check standard'}
              </span>
            </div>
          )}

          {r && (
            <div className="result-list">
              <div className="result-row">
                <span className="result-row-label">Area</span>
                <span className="result-row-value">{fmt(r.area, 2)} m²</span>
              </div>
              <div className="result-row">
                <span className="result-row-label">Wetted perimeter</span>
                <span className="result-row-value">{fmt(r.wettedPerimeter, 2)} m</span>
              </div>
              <div className="result-row">
                <span className="result-row-label">Hydraulic radius, R</span>
                <span className="result-row-value">{fmt(r.hydraulicRadius, 3)} m</span>
              </div>
              <div className="result-row">
                <span className="result-row-label">Velocity</span>
                <span className="result-row-value">{fmt(r.velocity, 2)} m/s</span>
              </div>
              <div className="result-row">
                <span className="result-row-label">Top width</span>
                <span className="result-row-value">{fmt(r.topWidth, 2)} m</span>
              </div>
              <div className="result-row">
                <span className="result-row-label">Hazard (d·v)</span>
                <span className="result-row-value">{fmt(r.hazard, 3)} m²/s</span>
              </div>
              <div className="result-row">
                <span className="result-row-label">Shear stress</span>
                <span className="result-row-value">{fmt(r.shearStress, 1)} N/m²</span>
              </div>
            </div>
          )}

          {valid && (
            <CrossSection
              title="CROSS SECTION (schematic)"
              points={points}
              labels={[
                { text: `Top width: ${fmt(inputs.bottomWidth + 2 * inputs.depth * inputs.sideSlope, 2)} m`, x: (points[0].x + points[3].x) / 2, y: inputs.depth + inputs.depth * 0.18 },
                { text: `Bottom width: ${fmt(inputs.bottomWidth, 2)} m`, x: (points[1].x + points[2].x) / 2, y: -inputs.depth * 0.1 },
              ]}
            />
          )}

          <div className="export-row">
            <button className="export-btn" onClick={handleExport} disabled={!r}>
              ↓ Export Excel table
            </button>
          </div>

          <div className="methodology">
            <b>Methodology notes.</b> Capacity uses Manning's equation: Q = (R^0.667 · S^0.5 · A) / n, where A is the
            flow area, R the hydraulic radius and S the drain slope (m/m). Shear stress = S · R · 9810 N/m² (Constructed
            Waterways Design Manual, Melbourne Water). Hazard is checked against d·v &gt; 0.3 by default — confirm the
            relevant standard for your project location before relying on this threshold.
          </div>
        </div>
      </div>
    </div>
  )
}
