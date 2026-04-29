import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useEffect, useCallback } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { BlochSphere } from "./BlochSphere";
import { mulMat3Vec3, rotX, rotY, rotZ } from "../utils/matrixMath";
import type { Vec3 } from "../utils/matrixMath";

// Default camera: +Z up on screen, +X right, +Y into scene
const DEFAULT_CAM_POS = new THREE.Vector3(2.5, -1.5, 1.8);
const CAM_UP = new THREE.Vector3(0, 0, 1);

export type OrbitAxis = "x" | "y" | "z";

interface SceneInnerProps {
  orbitRef: React.MutableRefObject<OrbitControlsImpl | null>;
}

function SceneInner({ orbitRef }: SceneInnerProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 3, 5]} intensity={0.8} />
      {/* Scene-level rotation to present Z-up visually while Three.js stays Y-up internally.
          We apply this at the group level so OrbitControls camera math is unaffected. */}
      <group rotation={[0, 0, 0]}>
        <BlochSphere />
      </group>
      <OrbitControls
        ref={orbitRef}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
        makeDefault
      />
    </>
  );
}

interface SceneProps {
  orbitAxisRef: React.MutableRefObject<{ axis: OrbitAxis; dir: number } | null>;
  resetCamera: React.MutableRefObject<(() => void) | null>;
}

export function Scene({ orbitAxisRef, resetCamera }: SceneProps) {
  const orbitRef = useRef<OrbitControlsImpl | null>(null);

  // Programmatic orbit: called every 16ms while a button is held
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const ctrl = orbitAxisRef.current;
      const orbit = orbitRef.current;
      if (ctrl && orbit) {
        const cam = (orbit as any).object as THREE.Camera;
        const pos: Vec3 = [cam.position.x, cam.position.y, cam.position.z];
        const angle = 0.04 * ctrl.dir;
        let mat;
        if (ctrl.axis === "x") mat = rotX(angle);
        else if (ctrl.axis === "y") mat = rotY(angle);
        else mat = rotZ(angle);
        const [nx, ny, nz] = mulMat3Vec3(mat, pos);
        cam.position.set(nx, ny, nz);

        const upVec: Vec3 = [cam.up.x, cam.up.y, cam.up.z]; // ← rotate current up
        const [ux, uy, uz] = mulMat3Vec3(mat, upVec);
        cam.up.set(ux, uy, uz);

        cam.lookAt(0, 0, 0);
        orbit.update();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [orbitAxisRef]);

  // Expose reset function
  const doReset = useCallback(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;
    const cam = (orbit as any).object as THREE.Camera;
    const start = cam.position.clone();
    const target = DEFAULT_CAM_POS.clone();
    const steps = 30;
    let i = 0;
    const id = setInterval(() => {
      i++;
      const p = i / steps;
      const ease = 1 - (1 - p) ** 3;
      cam.position.lerpVectors(start, target, ease);
      cam.up.copy(CAM_UP);
      cam.lookAt(0, 0, 0);
      orbit.update();
      if (i >= steps) clearInterval(id);
    }, 16);
  }, []);

  useEffect(() => {
    resetCamera.current = doReset;
  }, [doReset, resetCamera]);

  return (
    <Canvas
      camera={{
        position: DEFAULT_CAM_POS.toArray(),
        up: CAM_UP.toArray(),
        fov: 45,
      }}
      gl={{ antialias: true }}
      style={{ background: "#0d1117" }}
    >
      <SceneInner orbitRef={orbitRef} />
    </Canvas>
  );
}
