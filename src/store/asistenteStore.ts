import { persist } from 'zustand/middleware'
import { create } from 'zustand'

interface AsistenteState {
    nombre: string | null,
    instructions: string | null,
    asistente_id: string | null,
    materia_id: number | null, // <-- 2. Agregá la materia_id al estado (puede ser null)
    setAsistenteId: (id: string) => void
    clearAsistente: () => void
}

export const useAsistenteStore = create<AsistenteState, [["zustand/persist", AsistenteState]]>(
    persist(
        (set) => ({
            nombre: null,
            instructions: null,
            asistente_id: null,
            materia_id: null,
            setAsistente: (nombre: any, instructions: any, asistente_id: any, materia_id: any) => set({ nombre, instructions, asistente_id, materia_id }),
            clearAsistente: () => set({ nombre: null, instructions: null, asistente_id: null, materia_id: null }),
            setAsistenteId: (id) => set({ asistente_id: id })
        }),
        {
            name: 'asistente-storage'
        }
    )
)