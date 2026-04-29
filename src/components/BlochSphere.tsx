import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useQubitStore } from "../store/useQubitStore";
import { theme } from "../theme";

// ── helpers ──────────────────────────────────────────────────────────────────

function toBloch(theta: number, phi: number): THREE.Vector3 {
  return new THREE.Vector3(
    Math.sin(theta) * Math.cos(phi),
    Math.sin(theta) * Math.sin(phi),
    Math.cos(theta),
  );
}

/** Build a circle of points in a given plane, radius r, N segments */
function circlePoints(
  normal: THREE.Vector3,
  r: number,
  N: number,
): THREE.Vector3[] {
  // Build a local frame perpendicular to normal
  const u = new THREE.Vector3();
  const v = new THREE.Vector3();
  const ref =
    Math.abs(normal.z) < 0.9
      ? new THREE.Vector3(0, 0, 1)
      : new THREE.Vector3(1, 0, 0);
  u.crossVectors(normal, ref).normalize();
  v.crossVectors(normal, u);

  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    pts.push(
      u
        .clone()
        .multiplyScalar(Math.cos(a) * r)
        .addScaledVector(v, Math.sin(a) * r),
    );
  }
  return pts;
}

// ── great circle with front/back split ───────────────────────────────────────

interface GreatCircleProps {
  normal: THREE.Vector3;
  color: string;
}

function GreatCircle({ normal, color }: GreatCircleProps) {
  const solidRef = useRef<THREE.BufferGeometry>(null);
  const dashedRef = useRef<THREE.BufferGeometry>(null);
  const solidLineRef = useRef<THREE.Line>(null);
  const dashedLineRef = useRef<THREE.Line>(null);
  const { camera } = useThree();

  const N = 128;

  useFrame(() => {
    const camDir = camera.position.clone().normalize();
    const pts = circlePoints(normal, 1, N);

    const solidPts: THREE.Vector3[] = [];
    const dashedPts: THREE.Vector3[] = [];
    let lastFront: boolean | null = null;

    for (let i = 0; i < pts.length - 1; i++) {
      const mid = pts[i]
        .clone()
        .add(pts[i + 1])
        .multiplyScalar(0.5)
        .normalize();
      const front = mid.dot(camDir) >= 0;
      if (lastFront !== front) {
        solidPts.push(pts[i]);
        dashedPts.push(pts[i]);
        lastFront = front;
      }
      if (front) solidPts.push(pts[i], pts[i + 1]);
      else dashedPts.push(pts[i], pts[i + 1]);
    }

    if (solidRef.current) solidRef.current.setFromPoints(solidPts);
    if (dashedRef.current) dashedRef.current.setFromPoints(dashedPts);
    if (dashedLineRef.current)
      (dashedLineRef.current.material as THREE.LineDashedMaterial).dashSize =
        0.06;
  });

  return (
    <group>
      <line ref={solidLineRef as any}>
        <bufferGeometry ref={solidRef} />
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </line>
      <line ref={dashedLineRef as any}>
        <bufferGeometry ref={dashedRef} />
        <lineDashedMaterial
          color={color}
          transparent
          opacity={0.2}
          dashSize={0.06}
          gapSize={0.04}
        />
      </line>
    </group>
  );
}

// ── axis arrow ────────────────────────────────────────────────────────────────

interface AxisArrowProps {
  dir: THREE.Vector3;
  color: string;
  label: string;
  labelOffset?: THREE.Vector3;
}

function AxisArrow({ dir, color, label, labelOffset }: AxisArrowProps) {
  const len = 1.35;
  const shaftEnd = dir.clone().multiplyScalar(len - 0.12);
  const negEnd = dir.clone().multiplyScalar(-len * 0.6);
  const tipPos = dir.clone().multiplyScalar(len);

  // Cone quaternion: default cone points +Y, we want it along dir
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir.clone().normalize(),
  );

  const posOff = labelOffset ?? dir.clone().multiplyScalar(len + 0.18);

  return (
    <group>
      {/* positive shaft */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([0, 0, 0, shaftEnd.x, shaftEnd.y, shaftEnd.z]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={2} />
      </line>
      {/* negative half dashed */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([0, 0, 0, negEnd.x, negEnd.y, negEnd.z]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineDashedMaterial
          color={color}
          transparent
          opacity={0.5}
          dashSize={20}
          gapSize={20}
        />
      </line>
      {/* arrowhead cone */}
      <mesh position={tipPos} quaternion={quat}>
        <coneGeometry args={[0.04, 0.12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={posOff.toArray()}
        fontSize={0.14}
        color={color}
        anchorX="center"
        anchorY="middle"
        renderOrder={1}
      >
        {label}
      </Text>
    </group>
  );
}

// ── state vector ──────────────────────────────────────────────────────────────

interface StateVectorProps {
  bloch: THREE.Vector3;
}

function StateVector({ bloch }: StateVectorProps) {
  const tipPos = bloch.clone();
  const shaftEnd = bloch.clone().multiplyScalar(0.88);
  const dir = bloch.clone().normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    dir,
  );

  // equatorial shadow point
  const shadow = new THREE.Vector3(bloch.x, bloch.y, 0);
  const conePos = bloch.clone().multiplyScalar(0.92);

  return (
    <group>
      {/* thick shaft */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([0, 0, 0, shaftEnd.x, shaftEnd.y, shaftEnd.z]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={theme.stateVector.body} linewidth={3} />
      </line>
      {/* cone */}
      <mesh position={conePos.toArray()} quaternion={quat}>
        <coneGeometry args={[0.035, 0.16, 12]} />
        <meshStandardMaterial color={theme.stateVector.body} />
      </mesh>
      {/* tip dot */}
      <mesh position={tipPos.toArray()}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial
          color={theme.stateVector.body}
          emissive={theme.stateVector.body}
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* vertical projection dashed */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                shadow.x,
                shadow.y,
                0,
                tipPos.x,
                tipPos.y,
                tipPos.z,
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineDashedMaterial
          color={theme.stateVector.projection.polar}
          opacity={1}
          dashSize={0.1}
          gapSize={0.05}
        />
      </line>
      {/* equatorial shadow dashed */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, shadow.x, shadow.y, 0]), 3]}
          />
        </bufferGeometry>
        <lineDashedMaterial
          color={theme.stateVector.projection.equatorial}
          opacity={1}
          dashSize={0.1}
          gapSize={0.05}
        />
      </line>
    </group>
  );
}

// ── trail ─────────────────────────────────────────────────────────────────────

function Trail() {
  const trail = useQubitStore((s) => s.trail);
  if (trail.length < 2) return null;

  return (
    <>
      {trail.slice(1).map((pt, i) => {
        const prev = trail[i];
        const opacity = (i + 1) / trail.length;
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([prev.x, prev.y, prev.z, pt.x, pt.y, pt.z]),
                  3,
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={theme.stateVector.trail}
              transparent
              opacity={opacity * 0.7}
            />
          </line>
        );
      })}
    </>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export function BlochSphere() {
  const theta = useQubitStore((s) => s.theta);
  const phi = useQubitStore((s) => s.phi);
  const bloch = useMemo(() => toBloch(theta, phi), [theta, phi]);

  return (
    <group>
      {/* sphere */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={theme.sphere.shell}
          transparent
          opacity={0.08}
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color={theme.sphere.wireframe}
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* great circles: equator (XY), XZ meridian, YZ meridian */}
      <GreatCircle
        normal={new THREE.Vector3(0, 0, 1)}
        color={theme.sphere.greatCircle}
      />
      <GreatCircle
        normal={new THREE.Vector3(0, 1, 0)}
        color={theme.sphere.greatCircle}
      />
      <GreatCircle
        normal={new THREE.Vector3(1, 0, 0)}
        color={theme.sphere.greatCircle}
      />

      {/* axes */}
      <AxisArrow
        dir={new THREE.Vector3(1, 0, 0)}
        color={theme.axes.x}
        label="+X"
      />
      <AxisArrow
        dir={new THREE.Vector3(0, 1, 0)}
        color={theme.axes.y}
        label="+Y"
      />
      <AxisArrow
        dir={new THREE.Vector3(0, 0, 1)}
        color={theme.axes.z}
        label="+Z"
      />

      {/* pole labels */}
      <Text
        position={[0, 0, 1.25]}
        fontSize={0.13}
        color={theme.labels.poles}
        anchorX="center"
        anchorY="middle"
      >
        |0⟩
      </Text>
      <Text
        position={[0, 0, -1.25]}
        fontSize={0.13}
        color={theme.labels.poles}
        anchorX="center"
        anchorY="middle"
      >
        |1⟩
      </Text>

      {/* state vector + projections */}
      <StateVector bloch={bloch} />

      {/* trail */}
      <Trail />
    </group>
  );
}
