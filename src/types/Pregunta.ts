import Subtema from "./Subtema"

import Unidad from "./Unidad"

export default interface Pregunta {
    contenido: string
    subtema: Subtema
    unidad: Unidad
    pregunta_id: number
    created_at: Date
}