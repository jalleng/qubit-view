# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server (HMR)
npm run build      # tsc -b && vite build
npm run lint       # eslint .
npm run preview    # preview production build
```

No test suite is configured.

## Stack

- React 19 + TypeScript + Vite
- Three.js via `@react-three/fiber` (R3F) and `@react-three/drei`
- Zustand v5 for global state
- Mantine for components + CSS modules (`.module.css` per component)

## Architecture

### Layout (`App.tsx`)

Full-viewport flex column: a top `<nav>` bar + a content row with `<Scene>` (flex:1, the 3D canvas) and `<ControlPanel>` (18rem right sidebar, min 15rem). Layout and nav styles live in `src/App.module.css`. `main.tsx` wraps the tree in `<MantineProvider>` with dark color scheme and a monospace font family. Communication between Scene and ControlPanel uses two `useRef` values passed as props — `orbitAxisRef` and `resetCamera` — to avoid React re-renders for high-frequency camera operations.

### 3D Scene (`components/Scene.tsx`)

- Wraps R3F `<Canvas>` with a fixed camera: position `(3.0, -1.8, 2.3)` (`DEFAULT_CAM_POS`), up `(0,0,1)`, fov 45.
- Camera orbit buttons work via a `requestAnimationFrame` loop that reads `orbitAxisRef` and applies rotation matrices directly to `cam.position` and `cam.up` each frame — **not** through React state.
- `<OrbitControls>` handles mouse drag; the rAF loop coexists by calling `orbit.update()` after manual changes.

### Bloch Sphere (`components/BlochSphere.tsx`)

All 3D geometry lives here. Renders: transparent sphere shell, wireframe overlay, three great circles (XY/XZ/YZ), three axis arrows (+X red, +Y green, +Z blue), pole labels (|0⟩ at +Z, |1⟩ at -Z), state vector with projection shadows, and the motion trail.

`GreatCircle` uses `useFrame` to split each circle into solid (front-facing) and dashed (back-facing) segments based on dot product with camera direction — recalculated every frame.

### Control Panel (`components/ControlPanel.tsx`)

Sidebar with four sections: State coordinates, Camera orbit buttons, Rotation gate sliders (Rx/Ry/Rz), and State presets. All animations are `setInterval`-based at 12ms intervals. The `isAnimating` flag (from store) blocks concurrent animations. Uses Mantine components: `Stack`, `SimpleGrid`, `Group`, `UnstyledButton`, `Slider` (replaces native `<input type="range">`). Styles live in `src/components/ControlPanel.module.css`.

### State (`store/useQubitStore.ts`)

Single Zustand store with: `theta`, `phi` (spherical angles), `trail` (last 60 Bloch vectors), `isAnimating`. Designed with a comment noting future extensibility to `qubits: QubitState[]` for multi-qubit Phase 2.

### Theme (`src/theme.ts`)

Exports a single `theme` const with color tokens for the canvas background, sphere shell/wireframe/great-circle colors, axis colors (X red, Y green, Z blue), state vector + trail + projection colors, and pole label color. Imported by `Scene.tsx` and `ControlPanel.tsx` to keep 3D and UI colors in sync.

### Math utilities

- `utils/matrixMath.ts`: `Vec3`/`Mat3` types, `rotX/rotY/rotZ` (3×3 rotation matrices), `mulMat3Vec3`, `mulMat3`, `normalizeVec3`.
- `utils/gates.ts`: `applyRx/Ry/Rz` (apply a rotation gate to current theta/phi), `rotationFrames` (generates 40-step cubic ease-out animation frames).
- `utils/stateLabels.ts`: `PRESETS` array (|0⟩, |1⟩, |+⟩, |−⟩, |i⟩, |−i⟩) and `detectStateLabel` (snaps display label within ~2.3° tolerance).

## Coordinate system

The logical space is **Z-up**: |0⟩ is at +Z pole, |1⟩ at −Z pole. Bloch vector: `x = sin(θ)cos(φ)`, `y = sin(θ)sin(φ)`, `z = cos(θ)`. Three.js is internally Y-up but the camera `up` vector is set to `(0,0,1)` to compensate visually without rotating the scene group.
