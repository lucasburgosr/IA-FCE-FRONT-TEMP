"use client"

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AsistenteOpenAI } from "@/types/AsistenteOpenAI"
import { useAsistenteStore } from "@/store/asistenteStore"


function AsistenteEdit() {
  const navigate = useNavigate()
  const asistenteId = useAsistenteStore((s) => s.asistente_id)
  const apiUrl = import.meta.env.VITE_API_URL

  // Datos del asistente
  const [asistente, setAsistente] = useState<AsistenteOpenAI | null>(null)
  const [name, setName] = useState("")
  const [baseInstructions, setBaseInstructions] = useState("") // prompt original
  const [instructions, setInstructions] = useState("")         // prompt editable

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch inicial
  useEffect(() => {
    setLoading(true)
    axios
      .get<AsistenteOpenAI>(`${apiUrl}/asistentes/${asistenteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(({ data }) => {
        setAsistente(data)
        setName(data.name)
        setBaseInstructions(data.instructions)
        setInstructions(data.instructions)
      })
      .catch((err) => setError(`No se pudo cargar el asistente: ${err}`))
      .finally(() => setLoading(false))
  }, [apiUrl, asistenteId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await axios.put(
        `${apiUrl}/asistentes/${asistenteId}`,
        { name, instructions },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      navigate("/asistente")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error al actualizar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {asistente ? "Editar Asistente" : "Cargando..."}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Nombre */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="name">Nombre del Asistente</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Prompt borrador (editable) */}
            <div className="flex flex-col space-y-1">
              <Label htmlFor="instructions">Prompt del Asistente</Label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                required
                disabled={loading}
                className="block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                rows={10}
              />
            </div>

            <CardFooter className="pt-4">
              <Button
                type="submit"
                loading={loading}
                className="w-full bg-red-700 hover:bg-red-800 text-white"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AsistenteEdit
