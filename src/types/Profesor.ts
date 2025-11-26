import Materia from "./Materia"

export default interface Profesor {
    email: string
    materia: Materia
    firebase_uid: string    
    contrasena: string
    profesor_id: number
}