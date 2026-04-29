import { useState } from "react";
import { useQubitStore } from "../store/useQubitStore";
import { detectStateLabel, PRESETS } from "../utils/stateLabels";
import { applyRx, applyRy, applyRz, rotationFrames } from "../utils/gates";
import type { OrbitAxis } from "./Scene";
import { theme } from "../theme";

// ── animated state setter ─────────────────────────────────────────────────────

function animateToState(
  targetTheta: number,
  targetPhi: number,
  store: ReturnType<typeof useQubitStore.getState>,
  steps = 30,
) {
  const {
    theta: t0,
    phi: p0,
    clearTrail,
    setAngles,
    pushTrail,
    setAnimating,
  } = store;
  clearTrail();
  setAnimating(true);
  let i = 0;
  const id = setInterval(() => {
    i++;
    const ease = 1 - (1 - i / steps) ** 3;
    const theta = t0 + (targetTheta - t0) * ease;
    const phi = p0 + (targetPhi - p0) * ease;
    setAngles(theta, phi);
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    pushTrail({ x, y, z });
    if (i >= steps) {
      clearInterval(id);
      setAnimating(false);
    }
  }, 12);
}

// ── gate rotation animator ────────────────────────────────────────────────────

type GateFn = (
  theta: number,
  phi: number,
  deg: number,
) => { theta: number; phi: number };

function animateGate(
  gateFn: GateFn,
  deg: number,
  store: ReturnType<typeof useQubitStore.getState>,
) {
  const { theta, phi, pushTrail, setAngles, setAnimating } = store;
  const frames = rotationFrames(theta, phi, gateFn, deg, 40);
  setAnimating(true);
  let i = 0;
  const id = setInterval(() => {
    const f = frames[i];
    setAngles(f.theta, f.phi);
    const x = Math.sin(f.theta) * Math.cos(f.phi);
    const y = Math.sin(f.theta) * Math.sin(f.phi);
    const z = Math.cos(f.theta);
    pushTrail({ x, y, z });
    i++;
    if (i >= frames.length) {
      clearInterval(id);
      setAnimating(false);
    }
  }, 12);
}

// ── subcomponents ─────────────────────────────────────────────────────────────

interface CoordCardProps {
  label: string;
  value: string;
  sub?: boolean;
}

function CoordCard({ label, value, sub }: CoordCardProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg px-2 py-2 ${sub ? "bg-slate-800" : "bg-slate-700"} gap-0.5`}
    >
      <span className="text-xs text-slate-400 leading-none">{label}</span>
      <span className="text-sm font-mono text-slate-100 leading-none">
        {value}
      </span>
    </div>
  );
}

interface OrbitButtonProps {
  axis: OrbitAxis;
  dir: 1 | -1;
  label: string;
  orbitAxisRef: React.MutableRefObject<{ axis: OrbitAxis; dir: number } | null>;
}

function OrbitButton({ axis, dir, label, orbitAxisRef }: OrbitButtonProps) {
  const axisColor = theme.axes[axis];

  const start = () => {
    orbitAxisRef.current = { axis, dir };
  };
  const stop = () => {
    orbitAxisRef.current = null;
  };

  return (
    <button
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={start}
      onTouchEnd={stop}
      style={{ "--c": axisColor } as React.CSSProperties}
      className="text-xs border border-[--c] text-[--c] hover:bg-[--c]/20 active:bg-[--c]/40 rounded px-2 py-1 select-none cursor-pointer transition-colors"
    >
      {label}
    </button>
  );
}

// ── rotation row ──────────────────────────────────────────────────────────────

interface RotationRowProps {
  axis: "X" | "Y" | "Z";
  isAnimating: boolean;
}

function RotationRow({ axis, isAnimating }: RotationRowProps) {
  const [deg, setDeg] = useState(0);

  const colorText: Record<string, string> = {
    X: "text-red-400",
    Y: "text-green-400",
    Z: "text-blue-400",
  };
  const gateFnMap: Record<string, GateFn> = {
    X: applyRx,
    Y: applyRy,
    Z: applyRz,
  };

  const apply = () => {
    if (isAnimating) return;
    animateGate(gateFnMap[axis], deg, useQubitStore.getState());
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold w-5 ${colorText[axis]}`}>
        R{axis}
      </span>
      <input
        type="range"
        min={-180}
        max={180}
        step={1}
        value={deg}
        onChange={(e) => setDeg(Number(e.target.value))}
        className="flex-1 accent-slate-400 h-1"
      />
      <span className="text-xs text-slate-300 w-10 text-right font-mono">
        {deg}°
      </span>
      <button
        onClick={apply}
        disabled={isAnimating}
        className="text-xs border border-slate-500 text-slate-300 hover:bg-slate-600 disabled:opacity-40 rounded px-2 py-1 transition-colors cursor-pointer"
      >
        Apply
      </button>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

interface ControlPanelProps {
  orbitAxisRef: React.MutableRefObject<{ axis: OrbitAxis; dir: number } | null>;
  resetCamera: React.MutableRefObject<(() => void) | null>;
}

export function ControlPanel({ orbitAxisRef, resetCamera }: ControlPanelProps) {
  const theta = useQubitStore((s) => s.theta);
  const phi = useQubitStore((s) => s.phi);
  const isAnimating = useQubitStore((s) => s.isAnimating);

  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);
  const thetaDeg = ((theta * 180) / Math.PI).toFixed(1);
  const phiDeg = ((phi * 180) / Math.PI).toFixed(1);
  const namedLabel = detectStateLabel(theta, phi);

  const handlePreset = (t: number, p: number) => {
    if (isAnimating) return;
    animateToState(t, p, useQubitStore.getState());
  };

  return (
    <div className="flex flex-col gap-4 w-72 min-w-60 bg-slate-900 border-l border-slate-700 p-4 overflow-y-auto text-slate-200">
      <h1 className="text-sm font-bold tracking-widest text-slate-400 uppercase">
        QubitView
      </h1>

      {/* ── coordinates ── */}
      <section>
        <h2 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          State
        </h2>
        <div className="grid grid-cols-3 gap-1.5">
          <CoordCard label="|ψ⟩" value={namedLabel} />
          <CoordCard label="θ" value={`${thetaDeg}°`} sub />
          <CoordCard label="φ" value={`${phiDeg}°`} sub />
          <CoordCard label="x" value={x.toFixed(3)} sub />
          <CoordCard label="y" value={y.toFixed(3)} sub />
          <CoordCard label="z" value={z.toFixed(3)} sub />
        </div>
      </section>

      {/* ── camera orbit ── */}
      <section>
        <h2 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          Camera
        </h2>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          <OrbitButton axis="x" dir={1}  label="X ↻" orbitAxisRef={orbitAxisRef} />
          <OrbitButton axis="x" dir={-1} label="X ↺" orbitAxisRef={orbitAxisRef} />
          <OrbitButton axis="y" dir={1}  label="Y ↻" orbitAxisRef={orbitAxisRef} />
          <OrbitButton axis="y" dir={-1} label="Y ↺" orbitAxisRef={orbitAxisRef} />
          <OrbitButton axis="z" dir={1}  label="Z ↻" orbitAxisRef={orbitAxisRef} />
          <OrbitButton axis="z" dir={-1} label="Z ↺" orbitAxisRef={orbitAxisRef} />
        </div>
        <button
          onClick={() => resetCamera.current?.()}
          className="w-full text-xs border border-slate-600 text-slate-400 hover:bg-slate-700 rounded px-2 py-1.5 transition-colors cursor-pointer"
        >
          Reset view
        </button>
      </section>

      {/* ── gate rotations ── */}
      <section>
        <h2 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          Rotation
        </h2>
        <div className="flex flex-col gap-3">
          <RotationRow axis="X" isAnimating={isAnimating} />
          <RotationRow axis="Y" isAnimating={isAnimating} />
          <RotationRow axis="Z" isAnimating={isAnimating} />
        </div>
      </section>

      {/* ── presets ── */}
      <section>
        <h2 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
          Presets
        </h2>
        <div className="grid grid-cols-3 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p.theta, p.phi)}
              disabled={isAnimating}
              className="text-xs border border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-40 rounded px-2 py-1.5 font-mono transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
