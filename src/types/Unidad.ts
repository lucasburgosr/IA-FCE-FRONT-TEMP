import Materia from "./Materia"
import Tema from "./Tema"

export default interface Unidad {
    nombre: string
    materia: Materia
    unidad_id: number
    temas: Tema[]
}