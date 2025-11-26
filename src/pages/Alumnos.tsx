import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { useAuthStore } from "@/store/authStore"
import {
  Table,
  // TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import Alumno from "@/types/Alumno"
import { Button } from "@/components/ui/button"
import { AlumnoStatsModal } from "@/components/estadisticas-modal"

export function Alumnos() {
  const navigate = useNavigate()
  const profesorId = useAuthStore(s => s.usuario_id)
  const token = localStorage.getItem("token") ?? ""
  const apiUrl = import.meta.env.VITE_API_URL

  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Control del modal
  const [isOpen, setIsOpen] = useState(false)
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null)

  const axiosConfig = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token])

  useEffect(() => {
    if (!profesorId) {
      navigate("/login")
      return
    }

    setLoading(true)

    // 1) Creamos la función async dentro del efecto
    const fetchAlumnos = async () => {
      try {
        const res = await axios.get<Alumno[]>(
          `${apiUrl}/profesores/${profesorId}/alumnos`,
          axiosConfig
        )
        setAlumnos(res.data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar los alumnos.")
      } finally {
        setLoading(false)
      }
    }

    // 2) La invocamos (sin await ni return)
    fetchAlumnos()
  }, [profesorId, axiosConfig, navigate, apiUrl])


  return (
    <div className="p-6">
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle>Alumnos asignados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Cargando alumnos…</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Table>
              {/* <TableCaption>Listado de alumnos que usan el Tutor Virtual de Matemática - Ingreso</TableCaption> */}
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Apellido</TableHead>
                  <TableHead className="text-center">Nombre</TableHead>
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead className="text-center">Último login</TableHead>
                  <TableHead className="text-center">Interacción</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-center">
                {alumnos.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.apellido}</TableCell>
                    <TableCell>{a.nombres}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>{new Date(a.last_login).toLocaleString()}</TableCell>
                    <TableCell>{a.tiempo_interaccion}</TableCell>
                    <TableCell>
                      <Button
                        className="w-full mt-2 bg-fce-red hover:bg-fce-red-dark hover:text-white text-white"
                        variant="outline"
                        onClick={() => {
                          setAlumnoSeleccionado(a)
                          setIsOpen(true)
                        }}
                      >
                        Ver estadísticas
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal fuera de la tabla */}
      {alumnoSeleccionado && (
        <AlumnoStatsModal
          estudiante={alumnoSeleccionado}
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) setAlumnoSeleccionado(null)
          }}
        />
      )}
    </div>
  )
}
