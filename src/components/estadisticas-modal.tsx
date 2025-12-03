"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Alumno from "@/types/Alumno"

// Nuevos tipos auxiliares
type FiltroPregunta = "unidad" | "subtema"
type Vista = "preguntas" | "evaluaciones"

type Props = {
    estudiante: Alumno
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AlumnoStatsModal({ estudiante, open, onOpenChange }: Props) {
    const [vista, setVista] = useState<Vista>("preguntas")
    const [filtro, setFiltro] = useState<FiltroPregunta>("unidad")
    const [seleccionado, setSeleccionado] = useState<string | null>(null)

    const preguntas = estudiante.preguntas || []
    const evaluaciones = estudiante.evaluaciones || []

    const agrupadasPreguntas = preguntas.reduce<Record<string, number>>((acc, p) => {
        const key = filtro === "unidad" ? p.unidad.nombre : p.subtema.nombre
        acc[key] = (acc[key] || 0) + 1
        return acc
    }, {})

    const filtradasPreguntas = seleccionado
        ? preguntas.filter(p =>
            filtro === "unidad"
                ? p.unidad.nombre === seleccionado
                : p.subtema.nombre === seleccionado
        )
        : []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full min-w-fit max-h-full bg-white flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        Estadísticas de {estudiante.nombres} {estudiante.apellido}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex gap-4 mb-4">
                    <Select value={vista} onValueChange={(v) => {
                        setVista(v as Vista)
                        setSeleccionado(null)
                    }}>
                        <SelectTrigger className="w-44 bg-white">
                            <SelectValue placeholder="Ver estadísticas de" />
                        </SelectTrigger>
                        <SelectContent aria-placeholder="Seleccione..." className="bg-white">
                            <SelectItem value="preguntas">Preguntas</SelectItem>
                            <SelectItem value="evaluaciones">Evaluaciones</SelectItem>
                        </SelectContent>
                    </Select>

                    {vista === "preguntas" && (
                        <Select
                            value={filtro}
                            onValueChange={(v) => {
                                setFiltro(v as FiltroPregunta)
                                setSeleccionado(null)
                            }}
                        >
                            <SelectTrigger className="w-40 bg-white">
                                <SelectValue placeholder="Filtrar por" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="unidad">Por unidad</SelectItem>
                                <SelectItem value="subtema">Por subtema</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {vista === "preguntas" ? (
                    !seleccionado ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{filtro === "unidad" ? "Unidad" : "subtema"}</TableHead>
                                    <TableHead className="text-right">Preguntas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.keys(agrupadasPreguntas).map(nombre => (
                                    <TableRow key={nombre}>
                                        <TableCell>{nombre}</TableCell>
                                        <TableCell className="text-right">{agrupadasPreguntas[nombre]}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div>
                            <h4 className="mb-2 font-semibold text-sm">
                                Preguntas de {seleccionado}:
                            </h4>
                            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                                {filtradasPreguntas.map(p => (
                                    <li key={p.pregunta_id}>{p.contenido}</li>
                                ))}
                            </ul>
                        </div>
                    )
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>subtema</TableHead>
                                <TableHead>Nota</TableHead>
                                <TableHead>Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {evaluaciones.map((ev, i) => (
                                <TableRow key={i}>
                                    <TableCell>{ev.subtema.nombre}</TableCell>
                                    <TableCell>{ev.nota}</TableCell>
                                    <TableCell>{new Date(ev.evaluacion_fecha).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </DialogContent>
        </Dialog>
    )
}
