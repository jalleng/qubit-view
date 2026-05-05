# QbitView

An interactive 3D Bloch sphere visualizer for exploring qubit states and quantum gates — live at **[qbitview.com](https://qbitview.com)**.

## What is it?

QbitView lets you visualize a qubit's state on the Bloch sphere in real time. The Bloch sphere is a geometric representation of a two-level quantum system, where every point on the sphere corresponds to a valid qubit state.

## Features

- **3D Bloch sphere** — transparent shell with wireframe overlay, axis arrows, and great circle guides
- **State vector** — displays the current qubit state with projection shadows onto each axis plane
- **Motion trail** — shows the path of the state vector as it moves
- **Rotation gates** — apply Rx, Ry, and Rz rotations with animated transitions
- **State presets** — jump instantly to common states: |0⟩, |1⟩, |+⟩, |−⟩, |i⟩, |−i⟩
- **Camera controls** — orbit the sphere with mouse drag or the directional camera buttons
- **State label detection** — automatically identifies named states within a small angular tolerance

## How to use it

1. Visit **[qbitview.com](https://qbitview.com)**
2. The sphere loads with the qubit in the |0⟩ state (north pole)
3. Use the **Rotation Gates** sliders (Rx, Ry, Rz) to apply rotations — the state animates smoothly to the new position
4. Click a **State Preset** to jump directly to a named state
5. Drag the sphere with your mouse or use the **Camera** buttons to orbit and inspect the state from any angle

## Local development

```bash
npm install
npm run dev       # start dev server with HMR
npm run build     # production build
npm run lint      # lint
npm test          # run unit tests
```

## More coming soon

New features are in development. Stay tuned.
