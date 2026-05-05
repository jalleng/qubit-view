import { useRef } from "react";
import { Scene } from "./components/Scene";
import type { OrbitAxis } from "./components/Scene";
import { ControlPanel } from "./components/ControlPanel";
import classes from "./App.module.css";

export default function App() {
  const orbitAxisRef = useRef<{ axis: OrbitAxis; dir: number } | null>(null);
  const resetCamera = useRef<(() => void) | null>(null);

  return (
    <div className={classes.root}>
      <nav className={classes.nav}>
        <h1 className={classes.navTitle}>QbitView</h1>
      </nav>
      <div className={classes.content}>
        <div className={classes.sceneWrapper}>
          <Scene orbitAxisRef={orbitAxisRef} resetCamera={resetCamera} />
        </div>
        <ControlPanel orbitAxisRef={orbitAxisRef} resetCamera={resetCamera} />
      </div>
    </div>
  );
}
