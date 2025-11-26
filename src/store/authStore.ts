import { persist } from 'zustand/middleware'
import { create } from 'zustand'

interface AuthState {
    token: string | null,
    emailUsuario: string | null,
    usuario_id: number | null,
    userType: string | null

    setAuth: (token: string, emailUsuario: string, usuario_id: number, userType: string) => void;
    clearAuth: () => void
}

export const useAuthStore = create<AuthState, [["zustand/persist", AuthState]]>(
    persist(
        (set) => ({
            token: null,
            emailUsuario: null,
            usuario_id: null,
            userType: null,
            setAuth: (token: any, emailUsuario: any, usuario_id: any, userType: any) => set({token, emailUsuario, usuario_id, userType}),
            clearAuth: () => set({token: null, emailUsuario: null, usuario_id: null, userType: null})
        }),
        {
            name: 'auth-storage',
        }
    )
)