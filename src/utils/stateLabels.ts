const EPS = 0.04 // ~2.3°

function near(a: number, b: number) {
  return Math.abs(a - b) < EPS
}

interface Preset {
  label: string
  theta: number
  phi: number
}

export const PRESETS: Preset[] = [
  { label: '|0⟩', theta: 0,           phi: 0 },
  { label: '|1⟩', theta: Math.PI,     phi: 0 },
  { label: '|+⟩', theta: Math.PI / 2, phi: 0 },
  { label: '|−⟩', theta: Math.PI / 2, phi: Math.PI },
  { label: '|i⟩', theta: Math.PI / 2, phi: Math.PI / 2 },
  { label: '|−i⟩',theta: Math.PI / 2, phi: -Math.PI / 2 },
]

export function detectStateLabel(theta: number, phi: number): string {
  // normalise phi to [-π, π]
  let p = ((phi + Math.PI) % (2 * Math.PI)) - Math.PI

  for (const preset of PRESETS) {
    let pp = ((preset.phi + Math.PI) % (2 * Math.PI)) - Math.PI
    // poles: phi is degenerate when theta ~ 0 or π
    if (near(preset.theta, 0) && near(theta, 0)) return preset.label
    if (near(preset.theta, Math.PI) && near(theta, Math.PI)) return preset.label
    if (near(preset.theta, theta) && near(pp, p)) return preset.label
  }
  return '|ψ⟩'
}
