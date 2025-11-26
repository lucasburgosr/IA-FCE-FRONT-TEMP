import Profesor from "@/types/Profesor";
import { create } from "zustand"

interface ProfesorState {
    profesor: Profesor | null
    setProfesor: (profesor: Profesor) => void
    clearProfesor: () => void
}

export const useProfesorStore = create<ProfesorState>((set) => ({
    profesor: null,

    setProfesor: (profesor) => set({profesor}),

    clearProfesor: () => set({profesor: null})
}))