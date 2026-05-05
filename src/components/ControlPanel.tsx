import { useState } from "react";
import {
  Stack,
  Text,
  SimpleGrid,
  Box,
  Group,
  UnstyledButton,
  Slider,
} from "@mantine/core";
import { useQubitStore } from "../store/useQubitStore";
import { detectStateLabel, PRESETS } from "../utils/stateLabels";
import { applyRx, applyRy, applyRz, rotationFrames } from "../utils/gates";
import type { OrbitAxis } from "./Scene";
import { theme } from "../theme";
import classes from "./ControlPanel.module.css";

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
    <Box
      className={`${classes.coordCard} ${sub ? classes.coordCardSub : classes.coordCardPrimary}`}
    >
      <Text className={classes.coordLabel}>{label}</Text>
      <Text className={classes.coordValue}>{value}</Text>
    </Box>
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
    <UnstyledButton
      className={classes.orbitButton}
      style={{ "--orbit-color": axisColor } as React.CSSProperties}
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={start}
      onTouchEnd={stop}
    >
      {label}
    </UnstyledButton>
  );
}

// ── rotation row ──────────────────────────────────────────────────────────────

interface RotationRowProps {
  axis: "X" | "Y" | "Z";
  isAnimating: boolean;
}

function RotationRow({ axis, isAnimating }: RotationRowProps) {
  const [deg, setDeg] = useState(0);

  const axisColorMap: Record<string, string> = {
    X: theme.axes.x,
    Y: theme.axes.y,
    Z: theme.axes.z,
  };
  const mantineColorMap: Record<string, string> = {
    X: "red",
    Y: "green",
    Z: "blue",
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
    <Group gap="xs" align="center" wrap="nowrap">
      <Text
        className={classes.rotationLabel}
        style={{ color: axisColorMap[axis] }}
      >
        R{axis}
      </Text>
      <Slider
        className={classes.rotationSlider}
        min={-180}
        max={180}
        step={1}
        value={deg}
        onChange={setDeg}
        color={mantineColorMap[axis]}
        size="xs"
        label={null}
      />
      <Text className={classes.rotationValue}>{deg}°</Text>
      <UnstyledButton
        className={classes.applyButton}
        onClick={apply}
        disabled={isAnimating}
      >
        Apply
      </UnstyledButton>
    </Group>
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
    <Stack className={classes.panel} gap="md">
      <div>
        <Text className={classes.panelTitle}>Bloch Sphere</Text>
        <Text className={classes.description}>
          An interactive Bloch sphere visualizer for single-qubit states. Rotate
          the view, apply gates, and explore preset states.
        </Text>
      </div>

      {/* ── coordinates ── */}
      <section>
        <Text className={classes.sectionTitle}>State</Text>
        <SimpleGrid cols={3} spacing="xs">
          <CoordCard label="|ψ⟩" value={namedLabel} />
          <CoordCard label="θ" value={`${thetaDeg}°`} sub />
          <CoordCard label="φ" value={`${phiDeg}°`} sub />
          <CoordCard label="x" value={x.toFixed(3)} sub />
          <CoordCard label="y" value={y.toFixed(3)} sub />
          <CoordCard label="z" value={z.toFixed(3)} sub />
        </SimpleGrid>
      </section>

      {/* ── camera orbit ── */}
      <section>
        <Text className={classes.sectionTitle}>Camera</Text>
        <SimpleGrid cols={4} spacing="xs" mb="xs">
          <OrbitButton
            axis="x"
            dir={1}
            label="X ↻"
            orbitAxisRef={orbitAxisRef}
          />
          <OrbitButton
            axis="x"
            dir={-1}
            label="X ↺"
            orbitAxisRef={orbitAxisRef}
          />
          <OrbitButton
            axis="y"
            dir={1}
            label="Y ↻"
            orbitAxisRef={orbitAxisRef}
          />
          <OrbitButton
            axis="y"
            dir={-1}
            label="Y ↺"
            orbitAxisRef={orbitAxisRef}
          />
          <OrbitButton
            axis="z"
            dir={1}
            label="Z ↻"
            orbitAxisRef={orbitAxisRef}
          />
          <OrbitButton
            axis="z"
            dir={-1}
            label="Z ↺"
            orbitAxisRef={orbitAxisRef}
          />
        </SimpleGrid>
        <UnstyledButton
          className={classes.resetButton}
          onClick={() => resetCamera.current?.()}
        >
          Reset view
        </UnstyledButton>
      </section>

      {/* ── gate rotations ── */}
      <section>
        <Text className={classes.sectionTitle}>Rotation</Text>
        <Stack gap="sm">
          <RotationRow axis="X" isAnimating={isAnimating} />
          <RotationRow axis="Y" isAnimating={isAnimating} />
          <RotationRow axis="Z" isAnimating={isAnimating} />
        </Stack>
      </section>

      {/* ── presets ── */}
      <section>
        <Text className={classes.sectionTitle}>Presets</Text>
        <SimpleGrid cols={3} spacing="xs">
          {PRESETS.map((p) => (
            <UnstyledButton
              key={p.label}
              className={classes.presetButton}
              onClick={() => handlePreset(p.theta, p.phi)}
              disabled={isAnimating}
            >
              {p.label}
            </UnstyledButton>
          ))}
        </SimpleGrid>
      </section>
    </Stack>
  );
}
