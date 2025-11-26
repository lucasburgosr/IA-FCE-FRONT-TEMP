import Asistente from "./Asistente"
import Evaluacion from "./Evaluacion"
import Pregunta from "./Pregunta"
import Thread from "./Thread"

export default interface Alumno {
    email: string
    nombres: string
    apellido: string
    firebase_uid: string | null
    id: number
    last_login: Date
    mensajes_enviados: number
    tiempo_interaccion: string
    asistentes: Asistente[]
    preguntas: Pregunta[]
    threads: Thread[]
    evaluaciones: Evaluacion[]
    resumen_ultima_sesion: string
}