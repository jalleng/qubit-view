import { useRef } from 'react'
import { Scene } from './components/Scene'
import type { OrbitAxis } from './components/Scene'
import { ControlPanel } from './components/ControlPanel'
import './index.css'

export default function App() {
  const orbitAxisRef = useRef<{ axis: OrbitAxis; dir: number } | null>(null)
  const resetCamera = useRef<(() => void) | null>(null)

  return (
    <div style={{ display: 'flex', width: '100dvw', height: '100dvh', overflow: 'hidden' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Scene orbitAxisRef={orbitAxisRef} resetCamera={resetCamera} />
      </div>
      <ControlPanel orbitAxisRef={orbitAxisRef} resetCamera={resetCamera} />
    </div>
  )
}
