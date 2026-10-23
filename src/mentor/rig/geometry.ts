/**
 * Path geometry for Ozan's moving features, in the 300×330 rig space.
 * All functions are pure worklets so they can run on the UI thread.
 */

export const EYE_L = { cx: 126 };
export const EYE_R = { cx: 174 };

const clamp = (v: number, lo: number, hi: number) => {
  'worklet';
  return Math.max(lo, Math.min(hi, v));
};
const f = (n: number) => {
  'worklet';
  return Math.round(n * 100) / 100;
};

/** Almond eye opening; also the clip for everything inside the eye. */
export function eyeShape(cx: number): string {
  'worklet';
  return `M${cx - 16} 128 Q${cx} 113 ${cx + 16} 128 Q${cx} 139 ${cx - 16} 128 Z`;
}

function lidGeom(amount: number) {
  'worklet';
  const a = clamp(amount, -0.2, 1);
  const y = 114 + a * 20;
  const curve = y - 7 * (1 - clamp(a, 0, 1));
  return { y: y + 1, curve };
}

/** Upper lid, skin-filled, covering the eye from above. 0 = open, 1 = closed. */
export function lidPath(cx: number, amount: number): string {
  'worklet';
  const { y, curve } = lidGeom(amount);
  return `M${cx - 20} 104 H${cx + 20} V${f(y)} Q${cx} ${f(curve)} ${cx - 20} ${f(y)} Z`;
}

/** The lash line: the lid's own bottom edge, so it can never drift into the eye. */
export function lidEdge(cx: number, amount: number): string {
  'worklet';
  const { y, curve } = lidGeom(amount);
  return `M${cx + 20} ${f(y)} Q${cx} ${f(curve)} ${cx - 20} ${f(y)}`;
}

function lowGeom(squint: number) {
  'worklet';
  const s = clamp(squint, 0, 1);
  const y = 136 - s * 7;
  return { y, curve: y - 4 - s * 3 };
}

/** Lower lid rising when smiling or squinting. */
export function lowLidPath(cx: number, squint: number): string {
  'worklet';
  const { y, curve } = lowGeom(squint);
  return `M${cx - 20} 142 H${cx + 20} V${f(y)} Q${cx} ${f(curve)} ${cx - 20} ${f(y)} Z`;
}

export function lowLidEdge(cx: number, squint: number): string {
  'worklet';
  const { y, curve } = lowGeom(squint);
  return `M${cx - 20} ${f(y)} Q${cx} ${f(curve)} ${cx + 20} ${f(y)}`;
}

/** Brow arch from inner to outer end; inner/outer lift each end. */
export function browPath(xIn: number, xOut: number, yBase: number, inner: number, outer: number): string {
  'worklet';
  const yi = yBase - inner * 7;
  const yo = yBase - outer * 6 + 2;
  const mx = (xIn + xOut) / 2;
  const my = (yi + yo) / 2 - 7 + Math.max(0, inner - outer) * 2;
  return `M${xIn} ${f(yi)} Q${f(mx)} ${f(my)} ${xOut} ${f(yo)}`;
}

/** Mouth from smile (corners up, wider) and jaw (open). */
export function mouth(smile: number, jaw: number) {
  'worklet';
  const s = clamp(smile, 0, 1.05);
  const j = clamp(jaw, 0, 1);
  const w = 13 + s * 7 - j * 2.5;
  const cy = 178;
  const cornerY = cy - s * 5 + j * 1.5;
  const upperY = cy - 1 - j * 1.5 - s * 1.5;
  const lowerY = cy + 2 + j * 13 + s * 7;
  const l = 150 - w;
  const r = 150 + w;
  return {
    inner: `M${f(l)} ${f(cornerY)} Q150 ${f(upperY - 2)} ${f(r)} ${f(cornerY)} Q150 ${f(lowerY + 3)} ${f(l)} ${f(cornerY)} Z`,
    line: `M${f(l)} ${f(cornerY)} Q150 ${f(lowerY + 3)} ${f(r)} ${f(cornerY)}`,
    upperY,
    lowerY,
    lineOpacity: clamp(1 - j * 2.5, 0, 1),
    innerOpacity: clamp(j * 3 + s * 0.4, 0, 1),
  };
}

const SHOULDER: [number, number] = [105, 255];
const SAMPLES = 9;

/**
 * Sleeve as a filled outline tapering from the shoulder to the wrist along a
 * quadratic curve bent through the elbow, with a rounded shoulder cap.
 */
export function arm(wx: number, wy: number, ex: number, ey: number) {
  'worklet';
  const [sx, sy] = SHOULDER;
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / (SAMPLES - 1);
    const u = 1 - t;
    const px = u * u * sx + 2 * u * t * ex + t * t * wx;
    const py = u * u * sy + 2 * u * t * ey + t * t * wy;
    const dx = 2 * u * (ex - sx) + 2 * t * (wx - ex);
    const dy = 2 * u * (ey - sy) + 2 * t * (wy - ey);
    const len = Math.hypot(dx, dy) || 1;
    // Slight belly at the forearm reads as cloth, not a tube.
    const r = 13 - 4 * t + Math.sin(t * Math.PI) * 1.2;
    const nx = -dy / len;
    const ny = dx / len;
    left.push([px + nx * r, py + ny * r]);
    right.push([px - nx * r, py - ny * r]);
  }
  const d0x = ex - sx;
  const d0y = ey - sy;
  const d0 = Math.hypot(d0x, d0y) || 1;
  const capX = sx - (d0x / d0) * 15;
  const capY = sy - (d0y / d0) * 15;
  let d = `M${f(right[0][0])} ${f(right[0][1])} Q${f(capX)} ${f(capY)} ${f(left[0][0])} ${f(left[0][1])}`;
  for (let i = 1; i < SAMPLES; i++) d += ` L${f(left[i][0])} ${f(left[i][1])}`;
  for (let i = SAMPLES - 1; i >= 0; i--) d += ` L${f(right[i][0])} ${f(right[i][1])}`;
  d += ' Z';
  return { sleeve: d, cuffAngle: (Math.atan2(wy - ey, wx - ex) * 180) / Math.PI };
}
