// Mirrors "Channel Flow Calculator" sheet in Trapezoid areas volumes.xlsx

export function calcChannelFlow({ depth, bottomWidth, drainSlope, sideSlope, manningsN, availableTopWidth }) {
  const d = depth;
  const b = bottomWidth;
  const s = drainSlope; // m/m
  const z = sideSlope; // 1 in z
  const n = manningsN;

  const area = d * z * d + d * b; // C11
  const ssLength = Math.sqrt(d * z * d * z + d * d); // C12
  const wettedPerimeter = ssLength + ssLength + b; // C13
  const hydraulicRadius = area / wettedPerimeter; // C14

  const capacity = (Math.pow(hydraulicRadius, 0.66666) * Math.sqrt(s) * area) / n; // C17
  const velocity = capacity / area; // C18
  const topWidth = b + d * z * 2; // C19
  const hazard = velocity * d; // C21
  const shearStress = s * hydraulicRadius * 9810; // C22

  const topWidthOk = availableTopWidth == null || availableTopWidth === '' ? null : topWidth <= availableTopWidth;
  const hazardOk = hazard <= 0.3;

  return {
    area, ssLength, wettedPerimeter, hydraulicRadius,
    capacity, velocity, topWidth, hazard, shearStress,
    topWidthOk, hazardOk,
  };
}

// Cross-section polyline points (mirrors chart data T3:U6), for SVG rendering
export function channelCrossSection({ depth, bottomWidth, sideSlope }) {
  const dx = depth * sideSlope;
  const p0 = { x: 0, y: depth };
  const p1 = { x: dx, y: 0 };
  const p2 = { x: dx + bottomWidth, y: 0 };
  const p3 = { x: dx + bottomWidth + dx, y: depth };
  return [p0, p1, p2, p3];
}
