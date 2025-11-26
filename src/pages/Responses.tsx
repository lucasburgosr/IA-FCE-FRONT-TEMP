import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useLayoutEffect
} from "react"
import axios from "axios"
import { Send } from "lucide-react"
import { EventSourcePolyfill } from "event-source-polyfill"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAsistenteStore } from "@/store/asistenteStore"
import { useAuthStore } from "@/store/authStore"
import { useAlumnoStore } from "@/store/alumnoStore"
import type Mensaje from "@/types/Mensaje"
import MessageList from "@/components/message-list-response"
import { useProfesorStore } from "@/store/profesorStore"
import TextareaAutosize from "react-textarea-autosize"

export default function Responses() {
    const [input, setInput] = useState("")
    const [completedMessages, setCompletedMessages] = useState<Mensaje[]>([])
    const [streamingMessage, setStreamingMessage] = useState<Mensaje | null>(null)
    const [isTyping, setIsTyping] = useState(false)
    const [creatingThread, setCreatingThread] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [msgUsuario, setMsgUsuario] = useState(false)
    const userType = useAuthStore(s => s.userType)
    const isProfesor = userType === "profesor"
    const asistenteId = useAsistenteStore(s => s.asistente_id)
    const setAsistenteId = useAsistenteStore(s => s.setAsistenteId)
    const alumnoId = useAuthStore(s => s.usuario_id)
    const estudiante = useAlumnoStore(s => s.estudiante)
    const profesor = useProfesorStore(s => s.profesor)
    const messagesContainerRef = useRef<HTMLDivElement>(null)
    const sseRef = useRef<EventSource | null>(null)
    const assistantMsgIdRef = useRef<string | null>(null)
    const charBufferRef = useRef<string[]>([]);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
    const [sesionId, setSesionId] = useState<number | null>(null)
    const [_error, setError] = useState<string | null>(null)
    const [localThreadId, setLocalThreadId] = useState<string | null>(null)

    const initialThreadId = estudiante?.threads?.[0]?.id

    const apiUrl = import.meta.env.VITE_API_URL
    const token = localStorage.getItem("token") ?? ""

    const axiosConfig = React.useMemo(
        () => ({ headers: { Authorization: `Bearer ${token}` } }),
        [token]
    )

    useEffect(() => {
        if (isTyping) {

            const typingSpeed = 10;
            const batchSize = 3;

            intervalIdRef.current = setInterval(() => {

                if (charBufferRef.current.length === 0) {
                    return;
                }

                const charsToType = charBufferRef.current.splice(0, batchSize).join('');

                if (charsToType) {
                    setStreamingMessage(prev => {
                        if (!prev) return null;
                        return { ...prev, texto: (prev.texto ?? "") + charsToType };
                    });
                }

            }, typingSpeed);

        } else {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
            charBufferRef.current = [];
        }

        return () => {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        };
    }, [isTyping, setStreamingMessage]);

    useEffect(() => {
        if (initialThreadId) setLocalThreadId(initialThreadId)
    }, [initialThreadId])

    useLayoutEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const lastMessageElement = container.lastElementChild;
        if (!lastMessageElement) return;

        // Detecta el "primer frame" del stream del bot (ahora con altura)
        const isStreamStart = isTyping && streamingMessage && streamingMessage.texto === "";

        // CASO 1: El usuario envió
        // CASO 2: El bot TERMINÓ
        // CASO 3: El bot EMPIEZA (el globo con 'min-h')
        if (msgUsuario || !isTyping || isStreamStart) {
            lastMessageElement.scrollIntoView({ behavior: "smooth", block: "start" });

            if (msgUsuario) {
                setMsgUsuario(false);
            }
        }

        // CASO 4: El bot ESTÁ escribiendo (isTyping: true)
        // NO HACEMOS NADA (el texto crece hacia abajo).

    }, [
        completedMessages,
        streamingMessage, // Dependencia CRÍTICA
        isTyping,
        msgUsuario,
        setMsgUsuario
    ]);


    useEffect(() => {
        if (isProfesor || !localThreadId || !asistenteId) return;
        (async () => {
            try {
                const res = await axios.post(
                    `${apiUrl}/sesiones/iniciar/${alumnoId}`, { thread_id: localThreadId }, axiosConfig
                )
                setSesionId(res.data.sesion_id)
            } catch (err) {
                console.error("No se pudo iniciar la sesión:", err)
            }
        })()
    }, [localThreadId, asistenteId])

    useEffect(() => {
        if (isProfesor && profesor?.materia?.asistente?.asistente_id) {
            setAsistenteId(profesor.materia.asistente.asistente_id)
        }
    }, [isProfesor, profesor])

    useEffect(() => {
        if (isProfesor || sesionId === null) return
        const endSession = async () => {
            try {
                await axios.post(
                    `${apiUrl}/sesiones/finalizar`,
                    { estudiante_id: alumnoId, sesion_id: sesionId, thread_id: localThreadId },
                    axiosConfig
                )
            } catch (err) {
                console.error("Error finalizando la sesión:", err)
            }
        }
        return () => { endSession() }
    }, [sesionId])

    useEffect(() => {
        if (!localThreadId || !asistenteId) return
        const fetchMensajes = async () => {
            try {
                setIsLoading(true)
                const res = await axios.get<Mensaje[]>(
                    `${apiUrl}/threads/${localThreadId}/messages`,
                    axiosConfig
                )
                setCompletedMessages(res.data)
            } catch (err) {
                console.error("Error fetching mensajes:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchMensajes()
    }, [localThreadId, asistenteId, apiUrl, axiosConfig])

    const handleCreateThread = useCallback(async () => {
        if (!asistenteId) return
        setCreatingThread(true)

        try {
            const res = await axios.post(
                `${apiUrl}/threads/`,
                { alumnoId, asistente_id: asistenteId },
                axiosConfig
            )

            console.log("POST /threads respuesta:", res.data)

            if (Array.isArray(res.data?.messages)) {
                setCompletedMessages(res.data.messages)
            }

            // 👇 usar el campo correcto de la respuesta
            const threadId = res.data?.thread_id ?? res.data?.id

            if (threadId) {
                setLocalThreadId(threadId)
            } else {
                console.warn("No se encontró threadId en la respuesta del backend")
            }
        } catch (err) {
            console.error("No se pudo crear el thread:", err)
        } finally {
            setCreatingThread(false)
        }
    }, [alumnoId, asistenteId, apiUrl, axiosConfig])

    useEffect(() => {
        return () => {
            if (sseRef.current) {
                sseRef.current.close()
                sseRef.current = null
            }
        }
    }, [])

    // Esta función procesa la llegada de deltas desde el backend y los va mostrando en el chat
    // a medida que el mensaje se genera.
    const openSSE = useCallback(async ({
        threadId, texto, asistenteId, estudianteId
    }: { threadId: string, texto: string, asistenteId: string, estudianteId: number }) => {
        if (sseRef.current) {
            sseRef.current.close()
            sseRef.current = null
        }

        const assistantMsgId = `a-${Date.now()}`
        assistantMsgIdRef.current = assistantMsgId

        setIsTyping(true)
        setStreamingMessage({
            id: assistantMsgId,
            rol: "assistant",
            texto: "",
            fecha: new Date()
        })

        const qs = new URLSearchParams({
            thread_id: threadId,
            texto,
            asistente_id: asistenteId,
            estudiante_id: String(estudianteId),
        })

        const url = `${apiUrl}/responses/chat/stream?${qs.toString()}`

        const es = new EventSourcePolyfill(url, {
            headers: { Authorization: `Bearer ${token}` },
            heartbeatTimeout: 120000,
            withCredentials: false,
        }) as unknown as EventSource

        sseRef.current = es

        es.onmessage = (evt) => {
            const delta = evt.data ?? ""
            const id = assistantMsgIdRef.current
            if (!id) return

            charBufferRef.current.push(...delta.split(''));
        }

        es.addEventListener("done", async () => {
            es.close()
            sseRef.current = null
            setTimeout(async () => {
                try {
                    if (threadId) {
                        const finalRes = await axios.get<Mensaje[]>(
                            `${apiUrl}/threads/${threadId}/messages`,
                            axiosConfig
                        )
                        setCompletedMessages(finalRes.data)
                    }
                } catch (err) {
                    console.error("Error al sincronizar mensajes finales:", err)
                    if (streamingMessage) {
                        setCompletedMessages(prev => [...prev, streamingMessage])
                    }
                } finally {
                    setStreamingMessage(null)
                    setIsTyping(false)
                }
            }, 1000);
        })

        es.addEventListener("error", (e: MessageEvent) => {
            console.error("SSE error:", e)
            es.close()
            sseRef.current = null
            setIsTyping(false)
            setError(typeof e.data === "string" ? e.data : "Error de streaming")
            const id = assistantMsgIdRef.current
            if (id) {
                setStreamingMessage(null)
            }
        })
    }, [apiUrl, token, axiosConfig, streamingMessage, setCompletedMessages, setStreamingMessage, setIsTyping, setError])


    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const texto = input.trim()
        if (!texto || !localThreadId || !asistenteId) return

        if (alumnoId == null) {
            setError("No se encontró el ID del estudiante.")
            return
        }

        setMsgUsuario(true)

        setInput("")
        const userMsg: Mensaje = { id: `u-${Date.now()}`, rol: "user", texto, fecha: new Date() }
        setCompletedMessages(prev => [...prev, userMsg])

        await openSSE({
            threadId: localThreadId,
            texto,
            asistenteId,
            estudianteId: alumnoId as number,
        })
    }, [input, localThreadId, asistenteId, alumnoId, openSSE, setCompletedMessages, setMsgUsuario, setError, setInput])


    if (!asistenteId) {
        return (
            <div className="flex flex-col h-full bg-white items-center justify-center">
                <p className="text-2xl font-semibold text-gray-900">
                    Seleccioná un asistente para comenzar a chatear 💬
                </p>
            </div>
        )
    }

    if (!localThreadId) {
        return (
            <div className="flex flex-col h-screen bg-white items-center justify-center">
                <p className="text-2xl font-semibold text-gray-900 mb-4">
                    Inicia conversación para interactuar con el Tutor 👨‍⚕️
                </p>
                <Button
                    onClick={handleCreateThread}
                    disabled={creatingThread}
                    className="px-4 py-2 bg-fce-red hover:bg-fce-red-dark text-white rounded-lg"
                >
                    {creatingThread ? "Iniciando..." : "Iniciar conversación"}
                </Button>
            </div>
        )
    }

    return (
        <div className="h-full p-4 flex flex-col items-center justify-center lg:p-8">
            <Card className="w-full max-w-6xl h-full">
                <div className="relative flex-1 overflow-y-auto p-4 flex flex-col gap-16" ref={messagesContainerRef}>
                    <MessageList
                        isLoading={isLoading}
                        completedMessages={completedMessages}
                        streamingMessage={streamingMessage}
                    />
                </div>
                <div className="p-4 border-t bg-card flex-shrink-0">
                    <form onSubmit={handleSubmit} className="flex space-x-2 items-center">
                        <div className="flex-1 overflow-hidden rounded-lg border border-gray-300 focus-within:border-red-800 focus-within:ring-1 focus-within:ring-red-800">
                            <TextareaAutosize
                                className="w-full resize-none border-0 bg-transparent p-3 focus:outline-none focus:ring-0 placeholder:text-gray-700"
                                placeholder="Hacé una pregunta..."
                                minRows={1}
                                maxRows={5}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmit(e as any)
                                    }
                                }}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="px-4 py-2 bg-fce-red hover:bg-fce-red-dark text-white rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                            disabled={isTyping || !input.trim()}
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    )
}
