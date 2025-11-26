// src/store/alumnoStore.ts
import { create } from 'zustand'
import Alumno from '@/types/Alumno'

interface AlumnoState {
  estudiante: Alumno | null
  setAlumno:   (estudiante: Alumno) => void
  clearAlumno: () => void
}

export const useAlumnoStore = create<AlumnoState>((set) => ({
  estudiante: null,

  setAlumno: (estudiante) => set({ estudiante }),

  clearAlumno: () => set({ estudiante: null }),
}))
