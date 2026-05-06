import { useState, useCallback } from "react";

const CX = 340;
const CY = 240;
const R = 180;

const RAD_LABELS: Record<number, string> = {
  0: "0",
  30: "π/6",
  45: "π/4",
  60: "π/3",
  90: "π/2",
  120: "2π/3",
  135: "3π/4",
  150: "5π/6",
  180: "π",
  210: "7π/6",
  225: "5π/4",
  240: "4π/3",
  270: "3π/2",
  300: "5π/3",
  315: "7π/4",
  330: "11π/6",
  360: "2π",
};

interface CircleState {
  deg: number;
  cv: number;
  sv: number;
  px: number;
  py: number;
  radLabel: string;
}

function computeState(deg: number): CircleState {
  const rad = (deg * Math.PI) / 180;
  const cv = Math.cos(rad);
  const sv = Math.sin(rad);
  return {
    deg,
    cv,
    sv,
    px: CX + R * cv,
    py: CY - R * sv,
    radLabel: RAD_LABELS[deg] ?? rad.toFixed(2) + " rad",
  };
}

function arcPath(deg: number, cv: number, sv: number): string {
  if (deg === 0) return "";
  const ar = 30;
  const ax = CX + ar * cv;
  const ay = CY - ar * sv;
  const lg = deg > 180 ? 1 : 0;
  return `M ${CX + ar} ${CY} A ${ar} ${ar} 0 ${lg} 0 ${ax} ${ay}`;
}

export default function UnitCircle() {
  const [state, setState] = useState<CircleState>(() => computeState(0));

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setState(computeState(Number(e.target.value)));
  }, []);

  const { deg, cv, sv, px, py, radLabel } = state;

  const cosLabelX = (CX + px) / 2;
  const cosLabelY = CY + (sv >= 0 ? -12 : 20);
  const sinLabelX = px + (cv >= 0 ? 10 : -90);
  const sinLabelY = (CY + py) / 2 + 4;
  const ptLabelX = px + (cv >= 0 ? 10 : -100);
  const ptLabelY = py - 14;

  const isEulerIdentity = deg === 180;

  return (
    <div style={{ fontFamily: "'Georgia', serif", padding: "1.25rem 0" }}>
      {/* SVG Canvas */}
      <svg
        width="100%"
        viewBox="0 0 680 480"
        role="img"
        aria-label="Interactive unit circle showing Euler's formula"
      >
        <defs>
          <marker
            id="uc-arr"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M2 1L8 5L2 9"
              fill="none"
              stroke="context-stroke"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        {/* Axes */}
        <line
          x1="80"
          y1="240"
          x2="600"
          y2="240"
          stroke="#888"
          strokeWidth="1"
          opacity="0.4"
          markerEnd="url(#uc-arr)"
        />
        <line
          x1="340"
          y1="460"
          x2="340"
          y2="20"
          stroke="#888"
          strokeWidth="1"
          opacity="0.4"
          markerEnd="url(#uc-arr)"
        />
        <text fontSize="12" fill="#888" x="606" y="244">
          Re
        </text>
        <text fontSize="12" fill="#888" x="344" y="16">
          Im
        </text>

        {/* Unit circle */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="#888"
          strokeWidth="1"
          opacity="0.25"
        />

        {/* Tick marks */}
        {[
          { x1: 520, y1: 234, x2: 520, y2: 246 },
          { x1: 160, y1: 234, x2: 160, y2: 246 },
          { x1: 334, y1: 60, x2: 346, y2: 60 },
          { x1: 334, y1: 420, x2: 346, y2: 420 },
        ].map((t, i) => (
          <line key={i} {...t} stroke="#888" strokeWidth="1" opacity="0.5" />
        ))}

        {/* Tick labels */}
        <text fontSize="12" fill="#888" x="520" y="258" textAnchor="middle">
          1
        </text>
        <text fontSize="12" fill="#888" x="160" y="258" textAnchor="middle">
          −1
        </text>
        <text fontSize="12" fill="#888" x="328" y="64" textAnchor="end">
          i
        </text>
        <text fontSize="12" fill="#888" x="328" y="424" textAnchor="end">
          −i
        </text>
        <text fontSize="12" fill="#888" x="328" y="254" textAnchor="end">
          0
        </text>

        {/* Key fixed points */}
        <circle cx="520" cy="240" r="5" fill="#639922" />
        <circle cx="340" cy="60" r="5" fill="#639922" />
        <circle
          cx="160"
          cy="240"
          r="7"
          fill={isEulerIdentity ? "#E8593C" : "#D85A30"}
        />
        <circle cx="340" cy="420" r="5" fill="#639922" />
        <text fontSize="11" fill="#3B6D11" x="526" y="232">
          0
        </text>
        <text fontSize="11" fill="#3B6D11" x="348" y="58">
          π/2
        </text>
        <text fontSize="11" fill="#993C1D" x="100" y="234">
          π ★
        </text>
        <text fontSize="11" fill="#3B6D11" x="348" y="434">
          3π/2
        </text>

        {/* cos component (red dashed horizontal) */}
        <line
          x1={CX}
          y1={CY}
          x2={px}
          y2={CY}
          stroke="#D85A30"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          opacity="0.85"
        />
        {/* sin component (green dashed vertical) */}
        <line
          x1={px}
          y1={CY}
          x2={px}
          y2={py}
          stroke="#1D9E75"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          opacity="0.85"
        />
        {/* Radius line */}
        <line
          x1={CX}
          y1={CY}
          x2={px}
          y2={py}
          stroke="#378ADD"
          strokeWidth="2"
          opacity="0.9"
        />
        {/* Angle arc */}
        <path
          d={arcPath(deg, cv, sv)}
          fill="none"
          stroke="#378ADD"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* Moving point */}
        <circle
          cx={px}
          cy={py}
          r="8"
          fill={isEulerIdentity ? "#E8593C" : "#378ADD"}
          stroke="white"
          strokeWidth="2"
        />

        {/* Dynamic labels */}
        <text
          fontSize="12"
          fontWeight="500"
          fill="#D85A30"
          x={cosLabelX}
          y={cosLabelY}
          textAnchor="middle"
        >
          cos θ = {cv.toFixed(2)}
        </text>
        <text
          fontSize="12"
          fontWeight="500"
          fill="#1D9E75"
          x={sinLabelX}
          y={sinLabelY}
          textAnchor="start"
        >
          sin θ = {sv.toFixed(2)}
        </text>
        <text
          fontSize="12"
          fontWeight="500"
          fill={isEulerIdentity ? "#993C1D" : "#185FA5"}
          x={ptLabelX}
          y={ptLabelY}
          textAnchor="start"
        >
          e^(i·{radLabel})
        </text>
      </svg>

      {/* Slider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 12px",
          marginTop: 4,
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: "#888",
            minWidth: 12,
            fontStyle: "italic",
          }}
        >
          θ
        </span>
        <input
          type="range"
          min={0}
          max={360}
          value={deg}
          onChange={handleSlider}
          style={{ flex: 1 }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            minWidth: 70,
            textAlign: "right",
          }}
        >
          {deg}° ({radLabel})
        </span>
      </div>

      {/* Result box */}
      <div
        style={{
          margin: "10px 12px 0",
          padding: "10px 14px",
          borderRadius: 8,
          border: "0.5px solid rgba(128,128,128,0.2)",
          background: "rgba(128,128,128,0.07)",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        <span style={{ fontWeight: 500 }}>e^(i·{radLabel})</span>
        {" = "}
        <span style={{ color: "#D85A30" }}>
          cos {deg}° = {cv.toFixed(2)}
        </span>
        {" + "}
        <span style={{ color: "#1D9E75" }}>
          i·sin {deg}° = {sv.toFixed(2)}
        </span>
        {" = "}
        <span
          style={{
            color: isEulerIdentity ? "#993C1D" : "#185FA5",
            fontWeight: 500,
          }}
        >
          {cv.toFixed(2)} + {sv.toFixed(2)}i
        </span>
        {isEulerIdentity && (
          <span style={{ color: "#993C1D", fontWeight: 600, marginLeft: 8 }}>
            → e^(iπ) + 1 = 0 ★
          </span>
        )}
      </div>
    </div>
  );
}
