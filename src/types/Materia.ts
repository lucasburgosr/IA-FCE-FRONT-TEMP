import Asistente from "./Asistente"
import Unidad from "./Unidad"

export default interface Materia {
    nombre: string
    materia_id: number
    unidades: Unidad[]
    asistente: Asistente
}