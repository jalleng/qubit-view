import { create } from 'zustand'

export interface BlochVector {
  x: number
  y: number
  z: number
}

export interface QubitState {
  theta: number
  phi: number
  trail: BlochVector[]
  isAnimating: boolean
}

interface QubitActions {
  setAngles: (theta: number, phi: number) => void
  pushTrail: (v: BlochVector) => void
  clearTrail: () => void
  setAnimating: (v: boolean) => void
}

// Designed for Phase 2 extensibility: store will eventually hold qubits: QubitState[]
export const useQubitStore = create<QubitState & QubitActions>((set) => ({
  theta: 0,
  phi: 0,
  trail: [],
  isAnimating: false,

  setAngles: (theta, phi) => set({ theta, phi }),

  pushTrail: (v) =>
    set((s) => ({
      trail: [...s.trail, v].slice(-60),
    })),

  clearTrail: () => set({ trail: [] }),

  setAnimating: (v) => set({ isAnimating: v }),
}))
