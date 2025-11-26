import React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

const Login = () => {

  // Credenciales de inicio de sesión
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Estados
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // Store de usuario 
  const setAuth = useAuthStore((state) => state.setAuth)

  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL

  // Handler de inicio de sesión
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    try {

      const response = await axios.post(`${apiUrl}/auth/login`, {
        email,
        password
      });

      const { token, usuario_id, email_usuario, type: userType } = response.data;

      localStorage.setItem("token", token)

      setAuth(token, email_usuario, usuario_id, userType)

      if (userType === "estudiante") {
        navigate("/chat")
      } else if (userType === "profesor") {
        navigate("/alumnos")
      }

    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <img className="" src="/uncuyo-facultad-cs-economicas-color.svg" alt="Logo de la Facultad de Ciencias Económicas" />
      <Card className="w-full max-w-sm border-none rounded-lg p-6 gap-11 bg-transparent">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bienvenido al Tutor FCE</CardTitle>
          <CardDescription className="text-black">
            Inicia sesión 👇
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col space-y-2">
              <Label className="font-semibold" htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@fce.uncu.edu.ar"
                className=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label className="font-semibold" htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
            <Button
              type="submit"
              className="w-full mt-2 bg-fce-red hover:bg-fce-red-dark text-white"
              loading={loading}
            >
              Iniciar sesión
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-gray-500">
            ¿No tenés cuenta? <a href="/registro" className="text-blue-500">Registrate</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login