"use client"

import React, { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card"

export default function SignUpPage() {
    const navigate = useNavigate()
    const apiUrl = import.meta.env.VITE_API_URL

    // Estado agrupado para el formulario
    const [formData, setFormData] = useState({
        nombres: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: "",
        dni: ""
    })

    const [errorMsg, setErrorMsg] = useState("")
    const [loading, setLoading] = useState(false)

    // Configuración de axios
    const axiosConfig = { headers: { "Content-Type": "application/json" } }

    // Handler genérico para inputs
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { id, value } = e.target
            setFormData((f) => ({ ...f, [id]: value }))
        },
        []
    )

    // Verificar que password y confirmPassword coincidan
    const passwordsMatch = useCallback(() => {
        if (formData.password !== formData.confirmPassword) {
            setErrorMsg("Las contraseñas no coinciden")
            return false
        }
        setErrorMsg("")
        return true
    }, [formData.password, formData.confirmPassword])

    // Envío del formulario
    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            setLoading(true)
            setErrorMsg("")

            if (!passwordsMatch()) {
                setLoading(false)
                return
            }

            try {
                const payload = {
                    email: formData.email,
                    password: formData.password,
                    dni: formData.dni,
                    nombres: formData.nombres,
                    apellido: formData.apellido
                }

                const res = await axios.post(
                    `${apiUrl}/auth/register`,
                    payload,
                    axiosConfig
                )

                if (res.status === 200) {
                    navigate("/login")
                }
            } catch (err: any) {
                setErrorMsg(
                    err.response?.data?.detail ?? "Error al registrar usuario"
                )
            } finally {
                setLoading(false)
            }
        },
        [apiUrl, axiosConfig, formData, navigate, passwordsMatch]
    )

    const {
        nombres,
        apellido,
        email,
        password,
        confirmPassword,
        dni
    } = formData

    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <Card className="w-full max-w-sm shadow-sm border border-gray-300 rounded-lg p-6">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Regístrate en Tutor IA
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Completa el formulario para crear tu cuenta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/** Campo Nombre */}
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="nombres">Nombre</Label>
                            <Input
                                id="nombres"
                                type="text"
                                placeholder="Ingresa tu/s nombre/s"
                                value={nombres}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/** Campo Apellido */}
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="apellido">Apellido</Label>
                            <Input
                                id="apellido"
                                type="text"
                                placeholder="Ingresa tu apellido"
                                value={apellido}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/** Campo Email */}
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Ingresa tu correo"
                                value={email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/** Campo Contraseña */}
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/** Campo Repetir Contraseña */}
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="confirmPassword">Repetir contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="********"
                                value={confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/** Campo DNI */}
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="dni">DNI</Label>
                            <Input
                                id="dni"
                                type="text"
                                placeholder="00000001"
                                value={dni}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {errorMsg && (
                            <p className="text-red-500 text-sm">{errorMsg}</p>
                        )}

                        {/** Botón de enviar con loading */}
                        <Button
                            type="submit"
                            className="w-full mt-2 bg-red-700 hover:bg-red-800 text-white"
                            loading={loading}
                        >
                            Registrarse
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-center space-y-2">
                    <p className="text-sm text-gray-500">
                        ¿Ya tienes cuenta?{" "}
                        <a href="/login" className="text-blue-500">
                            Inicia sesión
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
