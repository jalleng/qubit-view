import { useRef } from "react";
import { Scene } from "../components/Scene";
import type { OrbitAxis } from "../components/Scene";
import classes from "./App.module.css";
import { ControlPanel } from "../components/ControlPanel";

export const BlochSpherePage = () => {
  const orbitAxisRef = useRef<{ axis: OrbitAxis; dir: number } | null>(null);
  const resetCamera = useRef<(() => void) | null>(null);

  return (
    <div className={classes.content}>
      <div className={classes.sceneWrapper}>
        <Scene orbitAxisRef={orbitAxisRef} resetCamera={resetCamera} />
      </div>
      <ControlPanel orbitAxisRef={orbitAxisRef} resetCamera={resetCamera} />
    </div>
  );
};
