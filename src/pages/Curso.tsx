import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { useAuthStore } from "@/store/authStore"
import { useAsistenteStore } from "@/store/asistenteStore"
import { useNavigate } from "react-router-dom"
import Pregunta from "@/types/Pregunta"
import Evaluacion from "@/types/Evaluacion"
import Unidad from "@/types/Unidad"
import Tema from "@/types/Tema"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function Curso() {
  const navigate = useNavigate()
  const profesorId = useAuthStore((s) => s.usuario_id)
  const asistenteId = useAsistenteStore((s) => s.asistente_id)
  const token = localStorage.getItem("token") ?? ""
  const apiUrl = import.meta.env.VITE_API_URL

  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])

  const axiosConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` },
    }),
    [token]
  )

  useEffect(() => {
    if (!profesorId) {
      navigate("/login")
      return
    }

    const fetchDatos = async () => {
      try {
        const [pregRes, evalRes] = await Promise.all([
          axios.get(`${apiUrl}/preguntas/asistente/${asistenteId}`, axiosConfig),
          axios.get<Evaluacion[]>(`${apiUrl}/evaluaciones/asistente/${asistenteId}`, axiosConfig),
        ])
        setPreguntas(pregRes.data)
        setEvaluaciones(evalRes.data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchDatos()
  }, [profesorId, asistenteId, apiUrl, axiosConfig, navigate])

  const totalPreguntas = preguntas.length
  const totalEvaluaciones = evaluaciones.length

  const agrupadoPreguntas = useMemo(() => {
    type EntradaUnidad = {
      unidad: Unidad
      count: number
      subtemas: Map<number, { tema: Tema; count: number }>
    }

    const mapUnidades = new Map<number, EntradaUnidad>()

    preguntas.forEach((q) => {
      let entradaU = mapUnidades.get(q.unidad.unidad_id)
      if (!entradaU) {
        entradaU = {
          unidad: q.unidad,
          count: 0,
          subtemas: new Map(),
        }
        mapUnidades.set(q.unidad.unidad_id, entradaU)
      }
      entradaU.count++

      const sid = q.tema.tema_id
      let entradaS = entradaU.subtemas.get(sid)
      if (!entradaS) {
        entradaS = { tema: q.tema, count: 0 }
        entradaU.subtemas.set(sid, entradaS)
      }
      entradaS.count++
    })

    return Array.from(mapUnidades.values()).map((u) => ({
      unidad: u.unidad,
      count: u.count,
      subtemas: Array.from(u.subtemas.values()),
    }))
  }, [preguntas])

  const agrupadoEvaluaciones = useMemo(() => {
    const map = new Map<number, { tema: Tema; notas: number[] }>()

    evaluaciones.forEach((ev) => {
      const sid = ev.tema.tema_id
      const entrada = map.get(sid)

      if (!entrada) {
        map.set(sid, {
          tema: ev.tema,
          notas: [ev.nota],
        })
      } else {
        entrada.notas.push(ev.nota)
      }
    })

    return Array.from(map.values()).map(({ tema, notas }) => ({
      tema,
      cantidad: notas.length,
      promedio: (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1),
    }))
  }, [evaluaciones])

  return (
    <div className="max-h-full px-6 pb-12 mb-4 mt-4">
      <h2 className="text-2xl font-semibold">Estadísticas de Curso</h2>
      <div className="flex flex-row mt-4 gap-4">
        <Card className=" max-w-xl">
          <CardHeader>
            <CardTitle>Total de preguntas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPreguntas}</p>
          </CardContent>
        </Card>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Total de evaluaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalEvaluaciones}</p>
          </CardContent>
        </Card>
      </div>


      <Separator className="my-6" />

      <h3 className="text-xl font-semibold mb-2">Preguntas por unidad</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {agrupadoPreguntas.map(({ unidad, count, subtemas }) => (
          <Card key={unidad.unidad_id}>
            <CardHeader>
              <CardTitle>{unidad.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2"><span className="font-medium">Total:</span> {count}</p>
              <ul className="list-disc ml-5 space-y-1">
                {subtemas.map(({ tema, count: ct }) => (
                  <li key={tema.tema_id}>{tema.nombre}: {ct}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-6" />

      <h3 className="text-xl font-semibold mb-2">Evaluaciones por tema</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agrupadoEvaluaciones.map(({ tema, cantidad, promedio }) => (
          <Card key={tema.tema_id}>
            <CardHeader>
              <CardTitle>{tema.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><span className="font-medium">Evaluaciones:</span> {cantidad}</p>
              <p><span className="font-medium">Promedio:</span> {promedio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
