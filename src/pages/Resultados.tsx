"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { useAlumnoStore } from "@/store/alumnoStore"
import { LoaderCircle } from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import Evaluacion from "@/types/Evaluacion"

/**
 * Vista "Resultados": promedio de notas por **tema**
 * para el estudiante autenticado (obtenido desde `useAlumnoStore`).
 */
export default function Resultados() {
  const estudiante = useAlumnoStore((s) => s.estudiante)
  const apiUrl = import.meta.env.VITE_API_URL
  const token = localStorage.getItem("token") ?? ""

  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const axiosCfg = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  )

  /* ─────────────────── Fetch evaluaciones ─────────────────── */
  useEffect(() => {
    if (!estudiante?.id) return

    const fetchEvals = async () => {
      try {
        setIsLoading(true)
        const { data } = await axios.get<Evaluacion[]>(
          `${apiUrl}/evaluaciones/estudiante/${estudiante.id}`,
          axiosCfg
        )
        setEvaluaciones(data)
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar las evaluaciones")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvals()
  }, [estudiante?.id, apiUrl, axiosCfg])


  const subtemas = useMemo(() => {
    const map = new Map<number, { nombre: string; notas: number[] }>()

    evaluaciones.forEach((ev) => {
      const sid = ev.subtema.subtema_id
      let entry = map.get(sid)
      if (!entry) {
        entry = { nombre: ev.subtema.nombre, notas: [] }
        map.set(sid, entry)
      }
      entry.notas.push(ev.nota)
    })

    return Array.from(map.values()).map((s) => ({
      nombre: s.nombre,
      promedio: promedio(s.notas),
      cantidad: s.notas.length,
    }))
  }, [evaluaciones])

  if (isLoading) return (<div className="flex h-full items-center justify-center" aria-busy="true">
    <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
    <span className="sr-only">Cargando mensajes…</span>
  </div>)
  if (error) return <p className="text-red-500 flex flex-col h-full items-center justify-center">{error}</p>
  if (!subtemas.length) return <div className="flex flex-col h-full items-center justify-center"><p className="text-muted-foreground">Sin evaluaciones aún.</p></div>

  return (
    <div className="m-4">
      <h3 className="text-xl font-semibold mb-4">Desempeño por tema</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subtemas.map(({ nombre, promedio, cantidad }) => (
          <Card key={nombre}>
            <CardHeader>
              <CardTitle>{nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Promedio: <span className="font-medium">{promedio.toFixed(1)}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Evaluaciones: {cantidad}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function promedio(arr: number[]): number {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}
