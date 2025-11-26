import { useEffect, useCallback, useMemo } from "react"
import axios from "axios"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Home, Bot, LogOut, User, Book, TestTube } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useAsistenteStore } from "@/store/asistenteStore"
import { useAlumnoStore } from "@/store/alumnoStore"
import type Alumno from "@/types/Alumno"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useProfesorStore } from "@/store/profesorStore"
import type Profesor from "@/types/Profesor"
import { cn } from "@/lib/utils"

const menuItems = [
  { title: "Tutor FCE", url: "/chat", icon: Home },
  { title: "Análisis de Estudiantes", url: "/alumnos", icon: User },
  { title: "Ajustes docentes del Asistente", url: "/asistente", icon: Bot },
  { title: "Estadísticas del Asistente", url: "/curso", icon: Book },
  { title: "Tus resultados", url: "/resultados", icon: TestTube },
  { title: "Cerrar sesión", url: "", icon: LogOut },
]

export function AppSidebar() {
  // Stores
  const usuarioId = useAuthStore((s) => s.usuario_id)
  const userType = useAuthStore((s) => s.userType)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const estudiante = useAlumnoStore((s) => s.estudiante)
  const clearAlumno = useAlumnoStore((s) => s.clearAlumno)
  const setAlumno = useAlumnoStore((s) => s.setAlumno)

  const setProfesor = useProfesorStore((s) => s.setProfesor)

  const clearAsistente = useAsistenteStore((s) => s.clearAsistente)
  const setAsistenteId = useAsistenteStore((s) => s.setAsistenteId)
  const selectedAsistenteId = useAsistenteStore((s) => s.asistente_id)

  const navigate = useNavigate()
  const location = useLocation()

  const apiUrl = import.meta.env.VITE_API_URL
  const token = localStorage.getItem("token") ?? ""
  const axiosConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  )

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token")
    clearAlumno()
    clearAuth()
    clearAsistente()
    navigate("/logout")
  }, [clearAlumno, clearAuth, clearAsistente, navigate])

  const fetchUsuario = useCallback(async () => {
    try {
      if (userType === "estudiante") {
        const res = await axios.get<Alumno>(`${apiUrl}/alumnos/${usuarioId}`, axiosConfig)
        setAlumno(res.data)
      }
      if (userType === "profesor") {
        const res = await axios.get<Profesor>(`${apiUrl}/profesores/${usuarioId}`, axiosConfig)
        setProfesor(res.data)
        setAsistenteId(res.data.materia.asistente.asistente_id)
      }
    } catch (err) {
      console.error("Error al obtener el usuario:", err)
    }
  }, [apiUrl, usuarioId, axiosConfig, setAlumno, setProfesor, setAsistenteId, userType])

  useEffect(() => {
    if (usuarioId) fetchUsuario()
  }, [usuarioId, fetchUsuario])

  const currentAsistenteName = estudiante?.asistentes.find(
    (a) => a.asistente_id === selectedAsistenteId
  )?.nombre

  const handleSelectAsistente = useCallback(
    (id: string) => {
      setAsistenteId(id)
    },
    [setAsistenteId]
  )

  // Filtrado de items según tipo de usuario
  const filteredMenu = useMemo(
    () =>
      menuItems.filter((item) => {
        if (
          ["Análisis de Estudiantes", "Ajustes docentes del Asistente", "Estadísticas del Asistente"].includes(
            item.title
          ) &&
          userType !== "profesor"
        ) {
          return false
        }
        if (["Tutor FCE", "Tus resultados"].includes(item.title) && userType !== "estudiante") {
          return false
        }
        return true
      }),
    [userType]
  )

  // Función para detectar activo
  const isActivePath = (url: string) =>
    location.pathname === url || location.pathname.startsWith(url + "/")

  return (
    <Sidebar className="w-64 flex-shrink-0 overflow-x-hidden">
      <SidebarContent className="flex flex-grow flex-col px-3.5">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {estudiante && <div className="text-center"><span className="font-bold text-white">¡Hola, {estudiante?.nombres} {estudiante?.apellido}!</span></div>}
              {estudiante && userType === "estudiante" && (
                <Select onValueChange={handleSelectAsistente} value={selectedAsistenteId || ""}>
                  <SelectTrigger className="min-w-0 w-full truncate bg-fce-light-gray">
                    <SelectValue placeholder="Elige un asistente…">
                      {currentAsistenteName || "Elige un asistente…"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {estudiante?.asistentes.map((a) => (
                      <SelectItem key={a.asistente_id} value={a.asistente_id}>
                        {a.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {filteredMenu.map((item) => {
                if (item.title === "Cerrar sesión") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="flex w-full items-center gap-2 px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white"
                      >
                        <button onClick={handleLogout} className="w-full text-left">
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          <span className="min-w-0 break-words">{item.title}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                const active = isActivePath(item.url)

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={active}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-white/80 transition-colors",
                        "hover:bg-white/10 hover:text-white",
                        "data-[active=true]:bg-white/15 data-[active=true]:text-white data-[active=true]:font-medium",
                        "data-[active=true]:border-l-4 data-[active=true]:border-white/60"
                      )}
                    >
                      <NavLink to={item.url} end aria-current={active ? "page" : undefined}>
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="min-w-0 break-words">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
