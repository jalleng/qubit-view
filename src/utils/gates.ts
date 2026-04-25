import { mulMat3Vec3, normalizeVec3, rotX, rotY, rotZ } from './matrixMath'
import type { Vec3 } from './matrixMath'

export interface Angles {
  theta: number
  phi: number
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function toBloch(theta: number, phi: number): Vec3 {
  return [
    Math.sin(theta) * Math.cos(phi),
    Math.sin(theta) * Math.sin(phi),
    Math.cos(theta),
  ]
}

function fromBloch(v: Vec3): Angles {
  const [x, y, z] = normalizeVec3(v)
  return {
    theta: Math.acos(clamp(z, -1, 1)),
    phi: Math.atan2(y, x),
  }
}

function applyRotation(theta: number, phi: number, mat: ReturnType<typeof rotX>): Angles {
  const v = toBloch(theta, phi)
  const nv = mulMat3Vec3(mat, v)
  return fromBloch(nv)
}

export function applyRx(theta: number, phi: number, angleDeg: number): Angles {
  return applyRotation(theta, phi, rotX((angleDeg * Math.PI) / 180))
}

export function applyRy(theta: number, phi: number, angleDeg: number): Angles {
  return applyRotation(theta, phi, rotY((angleDeg * Math.PI) / 180))
}

export function applyRz(theta: number, phi: number, angleDeg: number): Angles {
  return applyRotation(theta, phi, rotZ((angleDeg * Math.PI) / 180))
}

/** Intermediate states for animated rotation (40 steps, cubic ease-out) */
export function rotationFrames(
  theta: number,
  phi: number,
  applyFn: (t: number, p: number, deg: number) => Angles,
  totalDeg: number,
  steps = 40,
): Angles[] {
  const frames: Angles[] = []
  for (let i = 1; i <= steps; i++) {
    const p = i / steps
    const ease = 1 - (1 - p) ** 3
    frames.push(applyFn(theta, phi, totalDeg * ease))
  }
  return frames
}
