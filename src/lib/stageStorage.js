// Mirrors "Stage Storage Calculator" sheet in Trapezoid areas volumes.xlsx

export function calcStageStorage({ depth, sideSlope, bottomLength, bottomWidth, increment }) {
  const bottomArea = bottomLength * bottomWidth; // C9
  const topLength = bottomLength + 2 * (depth * sideSlope); // C10
  const topWidth = bottomWidth + 2 * (depth * sideSlope); // C11
  const topArea = topLength * topWidth; // C12
  const sideLengthPerIncrement = increment * sideSlope; // C16

  const rows = [];
  let stage = 0;
  let prevLength = bottomLength;
  let prevWidth = bottomWidth;
  rows.push({ stage: 0, storage: 0, area: bottomArea, length: bottomLength, width: bottomWidth });

  while (true) {
    const nextStageRaw = stage + increment;
    if (nextStageRaw > depth + 1e-9) break;
    stage = nextStageRaw;
    const length = prevLength + 2 * sideLengthPerIncrement;
    const width = prevWidth + 2 * sideLengthPerIncrement;
    const area = (bottomLength + stage * sideSlope * 2) * (bottomWidth + stage * sideSlope * 2);
    const storage = 0.5 * (prevWidth + width) * stage * length;
    rows.push({ stage, storage, area, length, width });
    prevLength = length;
    prevWidth = width;
  }

  return { bottomArea, topLength, topWidth, topArea, sideLengthPerIncrement, rows };
}

// Solves for the bottom length (holding bottom width fixed) that achieves a target
// storage volume at full depth, mirroring the "goal seek storage by changing base length" workflow.
export function solveBottomLengthForTarget({ depth, sideSlope, bottomWidth, increment, targetStorage }) {
  const storageAt = (length) => {
    const { rows } = calcStageStorage({ depth, sideSlope, bottomLength: length, bottomWidth, increment })
    return rows[rows.length - 1].storage
  }

  let lo = increment
  let hi = Math.max(bottomWidth, increment) * 2
  let guard = 0
  while (storageAt(hi) < targetStorage && guard < 200) {
    hi *= 2
    guard += 1
  }
  if (storageAt(hi) < targetStorage) return null

  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2
    if (storageAt(mid) < targetStorage) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// Cross-section polyline points (mirrors chart data S3:T6), for SVG rendering
export function stageStorageCrossSection({ depth, sideSlope, bottomWidth }) {
  const dx = depth * sideSlope;
  const p0 = { x: 0, y: depth };
  const p1 = { x: dx, y: 0 };
  const p2 = { x: dx + bottomWidth, y: 0 };
  const p3 = { x: dx + bottomWidth + dx, y: depth };
  return [p0, p1, p2, p3];
}
