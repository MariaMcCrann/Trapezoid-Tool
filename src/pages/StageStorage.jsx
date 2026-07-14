import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import CrossSection from '../components/CrossSection.jsx'
import { calcStageStorage, solveBottomLengthForTarget, stageStorageCrossSection } from '../lib/stageStorage.js'

const num = (v) => (v === '' || v == null ? NaN : Number(v))
const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—')

export default function StageStorage() {
  const [depth, setDepth] = useState('2')
  const [sideSlope, setSideSlope] = useState('6')
  const [bottomLength, setBottomLength] = useState('160')
  const [bottomWidth, setBottomWidth] = useState('160')
  const [increment, setIncrement] = useState('0.1')
  const [targetStorage, setTargetStorage] = useState('')

  const inputs = useMemo(
    () => ({
      depth: num(depth),
      sideSlope: num(sideSlope),
      bottomLength: num(bottomLength),
      bottomWidth: num(bottomWidth),
      increment: num(increment),
    }),
    [depth, sideSlope, bottomLength, bottomWidth, increment]
  )

  const valid = Object.values(inputs).every((v) => Number.isFinite(v) && v > 0)
  const r = valid ? calcStageStorage(inputs) : null
  const finalRow = r ? r.rows[r.rows.length - 1] : null
  const ratio = valid ? inputs.bottomLength / inputs.bottomWidth : NaN

  const target = targetStorage === '' ? null : num(targetStorage)
  const requiredLength =
    valid && target != null && Number.isFinite(target) && target > 0
      ? solveBottomLengthForTarget({
          depth: inputs.depth,
          sideSlope: inputs.sideSlope,
          bottomWidth: inputs.bottomWidth,
          increment: inputs.increment,
          targetStorage: target,
        })
      : null

  const points = valid
    ? stageStorageCrossSection({ depth: inputs.depth, sideSlope: inputs.sideSlope, bottomWidth: inputs.bottomWidth })
    : []

  function handleExport() {
    if (!r) return
    const header = ['Stage (m)', 'Storage (m³)', 'Area (m²)', 'Length (m)', 'Width (m)']
    const body = r.rows.map((row) => [row.stage, row.storage, row.area, row.length, row.width])
    const ws = XLSX.utils.aoa_to_sheet([
      ['Trapezoid Calculator — Stage Storage Calculation'],
      [],
      ['INPUTS'],
      ['Depth (m)', inputs.depth],
      ['Side slope (1 in X)', inputs.sideSlope],
      ['Bottom length (m)', inputs.bottomLength],
      ['Bottom width (m)', inputs.bottomWidth],
      ['Increment (m)', inputs.increment],
      [],
      ['AREA'],
      ['Bottom area (m²)', r.bottomArea],
      ['Top length (m)', r.topLength],
      ['Top width (m)', r.topWidth],
      ['Top area (m²)', r.topArea],
      [],
      ['STAGE / STORAGE / AREA TABLE'],
      header,
      ...body,
    ])
    ws['!cols'] = [{ wch: 26 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Stage Storage')
    XLSX.writeFile(wb, 'stage-storage-calculation.xlsx')
  }

  return (
    <div>
      <h1 className="page-title">Stage Storage Calculator</h1>
      <p className="page-subtitle">Depth-vs-volume stage storage table for a trapezoidal pit or basin</p>

      <div className="layout-grid">
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-badge">1</div>
                <div className="card-title">Basin geometry</div>
              </div>
              <div className="card-header-hint">Trapezoidal pit, straight batters</div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Depth</label>
                <input type="number" step="any" value={depth} onChange={(e) => setDepth(e.target.value)} />
                <div className="field-unit">m</div>
              </div>
              <div className="field">
                <label className="field-label">Side slopes, 1 in X</label>
                <span className="field-hint">Refer to office standard values for appropriate side slopes.</span>
                <input type="number" step="any" value={sideSlope} onChange={(e) => setSideSlope(e.target.value)} />
                <div className="field-unit">X</div>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Bottom length</label>
                <span className="field-hint">
                  If the shape is unknown, set length and width equal. Current L:W ratio {Number.isFinite(ratio) ? ratio.toFixed(2) : '—'}
                </span>
                <input type="number" step="any" value={bottomLength} onChange={(e) => setBottomLength(e.target.value)} />
                <div className="field-unit">m</div>
              </div>
              <div className="field">
                <label className="field-label">Bottom width</label>
                <input type="number" step="any" value={bottomWidth} onChange={(e) => setBottomWidth(e.target.value)} />
                <div className="field-unit">m</div>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label className="field-label">Stage increment</label>
                <span className="field-hint">Depth step for the storage table</span>
                <input type="number" step="any" value={increment} onChange={(e) => setIncrement(e.target.value)} />
                <div className="field-unit">m</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <div className="card-badge">2</div>
                <div className="card-title">Target storage (optional)</div>
              </div>
              <div className="card-header-hint">Solves for bottom length, holding width fixed</div>
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label">Target storage volume</label>
                <span className="field-hint">Leave blank to skip — equivalent to Goal Seek on base length</span>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 30000"
                  value={targetStorage}
                  onChange={(e) => setTargetStorage(e.target.value)}
                />
                <div className="field-unit">m³</div>
              </div>
            </div>
          </div>

          {r && (
            <div className="card">
              <div className="card-header">
                <div className="card-header-left">
                  <div className="card-badge">3</div>
                  <div className="card-title">Stage / storage / area table</div>
                </div>
                <div className="card-header-hint">{r.rows.length} stages</div>
              </div>
              <div className="stage-table-wrap">
                <table className="stage-table">
                  <thead>
                    <tr>
                      <th>Stage (m)</th>
                      <th>Storage (m³)</th>
                      <th>Area (m²)</th>
                      <th>Length (m)</th>
                      <th>Width (m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.rows.map((row) => (
                      <tr key={row.stage}>
                        <td>{row.stage.toFixed(2)}</td>
                        <td>{fmt(row.storage, 1)}</td>
                        <td>{fmt(row.area, 1)}</td>
                        <td>{fmt(row.length, 1)}</td>
                        <td>{fmt(row.width, 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="results-panel">
          <div className="results-heading">Results</div>
          <div className="results-sub">Live calculation</div>

          <div className="headline-card">
            <div className="headline-label">Storage at full depth ({fmt(inputs.depth, 1)} m)</div>
            <div className="headline-value">
              {finalRow ? fmt(finalRow.storage, 0) : '—'}
              <span className="headline-unit">m³</span>
            </div>
          </div>

          {requiredLength != null && (
            <div className="badge-row">
              <span className="badge ok">
                Required bottom length: {fmt(requiredLength, 2)} m (width fixed at {fmt(inputs.bottomWidth, 2)} m)
              </span>
            </div>
          )}
          {target != null && Number.isFinite(target) && requiredLength == null && r && (
            <div className="badge-row">
              <span className="badge warn">! Target not reachable within a practical length</span>
            </div>
          )}

          {r && (
            <div className="result-list">
              <div className="result-row">
                <span className="result-row-label">Bottom area</span>
                <span className="result-row-value">{fmt(r.bottomArea, 1)} m²</span>
              </div>
              <div className="result-row">
                <span className="result-row-label">Top length</span>
                <span className="result-row-value">{fmt(r.topLength, 2)} m</span>
              </div>
              <div className="result-row">
                <span className="result-row-label">Top width</span>
                <span className="result-row-value">{fmt(r.topWidth, 2)} m</span>
              </div>
              <div className="result-row">
                <span className="result-row-label">Top area</span>
                <span className="result-row-value">{fmt(r.topArea, 1)} m²</span>
              </div>
            </div>
          )}

          {valid && (
            <CrossSection
              title="CROSS SECTION (schematic)"
              points={points}
              labels={[
                { text: `Top width: ${fmt(inputs.bottomWidth + 2 * inputs.depth * inputs.sideSlope, 1)} m`, x: (points[0].x + points[3].x) / 2, y: inputs.depth + inputs.depth * 0.1 },
                { text: `Bottom width: ${fmt(inputs.bottomWidth, 1)} m`, x: (points[1].x + points[2].x) / 2, y: -inputs.depth * 0.1 },
              ]}
            />
          )}

          <div className="export-row">
            <button className="export-btn" onClick={handleExport} disabled={!r}>
              ↓ Export stage/storage/area table
            </button>
          </div>

          <div className="methodology">
            <b>Methodology notes.</b> Storage at each stage is computed as 0.5 · (previous width + current width) ·
            stage · current length, accumulated over depth increments — matching the legacy spreadsheet's
            trapezoidal approximation rather than the exact frustum formula. Length and width grow by 2 ·
            (increment · side slope) per step. Use the target storage field to solve for the bottom length needed to
            hit a required volume, holding bottom width fixed — equivalent to the spreadsheet's manual Goal Seek.
          </div>
        </div>
      </div>
    </div>
  )
}
