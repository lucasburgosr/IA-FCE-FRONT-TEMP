import Tema from "./Tema"
import Unidad from "./Unidad"

export default interface Pregunta {
    contenido: string
    tema: Tema
    unidad: Unidad
    pregunta_id: number
    created_at: Date
}