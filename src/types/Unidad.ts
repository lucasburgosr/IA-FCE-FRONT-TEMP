import Materia from "./Materia"
import Tema from "./Tema"

export default interface Unidad {
    nombre: string
    descripcion: string | null
    materia: Materia
    unidad_id: number
    subtemas: Tema[]
}