import { describe, it, expect } from "vitest";
import {
  mulMat3Vec3,
  mulMat3,
  rotX,
  rotY,
  rotZ,
  normalizeVec3,
} from "../utils/matrixMath";
import type { Vec3 } from "../utils/matrixMath";

function close(a: number, b: number) {
  return Math.abs(a - b) < 1e-10;
}

function vecClose(a: Vec3, b: Vec3) {
  return close(a[0], b[0]) && close(a[1], b[1]) && close(a[2], b[2]);
}

describe("mulMat3Vec3", () => {
  it("multiplies identity matrix by a vector unchanged", () => {
    const I = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ] as const;
    const v: Vec3 = [1, 2, 3];
    expect(mulMat3Vec3(I as any, v)).toEqual([1, 2, 3]);
  });
});

describe("rotX", () => {
  it("rotates +Z by 90° around X to -Y", () => {
    const R = rotX(Math.PI / 2);
    const result = mulMat3Vec3(R, [0, 0, 1]);
    expect(vecClose(result, [0, -1, 0])).toBe(true);
  });

  it("leaves +X vector unchanged", () => {
    const R = rotX(Math.PI / 3);
    const result = mulMat3Vec3(R, [1, 0, 0]);
    expect(vecClose(result, [1, 0, 0])).toBe(true);
  });
});

describe("rotY", () => {
  it("rotates +Z by 90° around Y to +X", () => {
    const R = rotY(Math.PI / 2);
    const result = mulMat3Vec3(R, [0, 0, 1]);
    expect(vecClose(result, [1, 0, 0])).toBe(true);
  });
});

describe("rotZ", () => {
  it("rotates +X by 90° around Z to +Y", () => {
    const R = rotZ(Math.PI / 2);
    const result = mulMat3Vec3(R, [1, 0, 0]);
    expect(vecClose(result, [0, 1, 0])).toBe(true);
  });

  it("leaves +Z vector unchanged", () => {
    const R = rotZ(Math.PI / 4);
    const result = mulMat3Vec3(R, [0, 0, 1]);
    expect(vecClose(result, [0, 0, 1])).toBe(true);
  });
});

describe("normalizeVec3", () => {
  it("normalizes a vector to unit length", () => {
    const result = normalizeVec3([3, 0, 0]);
    expect(result).toEqual([1, 0, 0]);
  });

  it("returns [0,0,1] for a zero vector", () => {
    expect(normalizeVec3([0, 0, 0])).toEqual([0, 0, 1]);
  });

  it("preserves a unit vector", () => {
    const v: Vec3 = [0, 1, 0];
    expect(vecClose(normalizeVec3(v), v)).toBe(true);
  });
});

describe("mulMat3", () => {
  it("composing rotZ(90°) twice equals rotZ(180°)", () => {
    const R90 = rotZ(Math.PI / 2);
    const R180 = rotZ(Math.PI);
    const composed = mulMat3(R90, R90);
    const v: Vec3 = [1, 0, 0];
    const a = mulMat3Vec3(composed, v);
    const b = mulMat3Vec3(R180, v);
    expect(vecClose(a, b)).toBe(true);
  });
});
