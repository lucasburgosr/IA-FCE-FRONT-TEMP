// src/types/Mensaje.ts
export type ParteMensaje =
  | { type: "text"; text: string }
  | { type: "image"; data_url: string }

export default interface Mensaje {
  id: string
  rol: "user" | "assistant"
  fecha: Date         // o string si llega en ISO
  /** Texto plano para compatibilidad con mensajes antiguos */
  texto?: string
  /** Partes mixtas (si no llega, el frontend rellena con texto) */
  partes?: ParteMensaje[]
}