import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect
} from "react"
import { useChat } from "ai/react"
import axios from "axios"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAsistenteStore } from "@/store/asistenteStore"
import { useAuthStore } from "@/store/authStore"
import { useAlumnoStore } from "@/store/alumnoStore"
import type Mensaje from "@/types/Mensaje"
import MessageList from "@/components/message-list"
import { useProfesorStore } from "@/store/profesorStore"

import TextareaAutosize from "react-textarea-autosize"
import { useAssistantPolling } from "@/hooks/useAssistantPolling"

interface StartRunResponse {
  status: string;
  run_id: string;
  thread_id: string;
}

export default function Home() {
  const { input, setInput, handleInputChange } = useChat()
  const [messages, setMessages] = useState<Mensaje[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [creatingThread, setCreatingThread] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const userType = useAuthStore(s => s.userType)
  const isProfesor = userType === "profesor"

  const asistenteId = useAsistenteStore(s => s.asistente_id)
  const setAsistenteId = useAsistenteStore(s => s.setAsistenteId)
  const alumnoId = useAuthStore(s => s.usuario_id)
  const estudiante = useAlumnoStore(s => s.estudiante)
  const profesor = useProfesorStore(s => s.profesor)

  const apiUrl = import.meta.env.VITE_API_URL
  const token = localStorage.getItem("token") ?? ""

  const [sesionId, setSesionId] = useState<number | null>(null)
  const [_error, setError] = useState<string | null>(null);

  const axiosConfig = React.useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` }
    }),
    [token]
  )

  const initialThreadId = estudiante?.threads?.[0]?.id;
  const [localThreadId, setLocalThreadId] = useState<string | null>(null);

  useEffect(() => {
    console.log("useEffect initialThreadId cambió: ", initialThreadId)
    if (initialThreadId) {
      setLocalThreadId(initialThreadId);
    }
  }, [initialThreadId]);

  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const lastMessage = messagesContainerRef.current?.lastElementChild;

    if (lastMessage) {
      lastMessage.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (isProfesor || !localThreadId || !asistenteId) return;

    (async () => {
      try {
        const res = await axios.post(
          `${apiUrl}/sesiones/iniciar/${alumnoId}`, { thread_id: localThreadId }, axiosConfig
        );
        setSesionId(res.data.sesion_id);
      } catch (err) {
        console.error("No se pudo iniciar la sesión:", err);
      }
    })();
  }, [localThreadId, asistenteId]);

  useEffect(() => {
    if (isProfesor && profesor?.materia?.asistente?.asistente_id) {
      setAsistenteId(profesor.materia.asistente.asistente_id)
    }
  }, [isProfesor, profesor])


  useEffect(() => {
    if (isProfesor || sesionId === null) return;

    const endSession = async () => {
      try {
        await axios.post(
          `${apiUrl}/sesiones/finalizar`,
          { estudiante_id: alumnoId, sesion_id: sesionId, thread_id: localThreadId },
          axiosConfig
        );
      } catch (err) {
        console.error("Error finalizando la sesión:", err);
      }
    };

    return () => {
      endSession();
    };
  }, [sesionId]);

  useEffect(() => {
    if (!localThreadId || !asistenteId) return

    const fetchMensajes = async () => {
      try {
        setIsLoading(true)
        const res = await axios.get<Mensaje[]>(
          `${apiUrl}/threads/${localThreadId}/messages`,
          axiosConfig
        )
        setMessages(res.data)
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
        setMessages(res.data.messages)
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


  const handlePollingSuccess = useCallback(async () => {
    if (!localThreadId) return;
    try {
      const finalMessagesRes = await axios.get<Mensaje[]>(
        `${apiUrl}/threads/${localThreadId}/messages`,
        axiosConfig
      );
      setMessages(finalMessagesRes.data);
    } catch (err) {
      console.error("Error al obtener los mensajes finales:", err);
      setError("No se pudieron cargar los mensajes finales.");
    } finally {
      setIsTyping(false)
    }
  }, [localThreadId, axiosConfig, apiUrl]);

  const handlePollingError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsTyping(false)
  }, []);

  const { startPolling } = useAssistantPolling({
    onSuccess: handlePollingSuccess,
    onError: handlePollingError,
    axiosConfig,
    apiUrl,
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const texto = input.trim();
      if (!texto || !localThreadId || !asistenteId) return;

      setInput("");

      const userMsg: Mensaje = {
        id: `u-${Date.now()}`,
        rol: "user",
        texto: texto,
        fecha: new Date(),
      };

      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const res = await axios.post<StartRunResponse>(
          `${apiUrl}/threads/${localThreadId}`,
          {
            input: texto,
            asistente_id: asistenteId,
            estudiante_id: alumnoId,
          },
          axiosConfig
        );

        const { run_id } = res.data;
        if (run_id) {
          startPolling(localThreadId, run_id);
        } else {
          throw new Error("No se recibió un run_id del servidor.");
        }
      } catch (submitErr) {
        console.error("Error al enviar el mensaje:", submitErr);
        setError("No se pudo enviar tu mensaje. Por favor, intenta de nuevo.");
        setIsTyping(false);
        setMessages(prev => prev.filter(msg => msg.id !== userMsg.id));
      }
    },
    [input, localThreadId, asistenteId, alumnoId, setInput, startPolling, axiosConfig, apiUrl]
  );

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
    // 1. Contenedor principal: ahora solo tiene padding y es un flex container.
    // La altura se gestiona con h-full para que ocupe el espacio del Layout.main
    <div className="h-full p-4 flex flex-col items-center justify-center lg:p-8">
      <Card className="w-full max-w-6xl h-full">
        <div className="relative flex-1 overflow-y-auto p-4 flex flex-col gap-4" ref={messagesContainerRef}>
          <MessageList isLoading={isLoading} messages={messages} isTyping={isTyping} />
        </div>
        <div className="p-4 border-t bg-card flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex space-x-2 items-center">
            <div className="flex-1 overflow-hidden rounded-lg border border-gray-300 focus-within:border-red-800 focus-within:ring-1 focus-within:ring-red-800">
              <TextareaAutosize
                className="w-full resize-none border-0 bg-transparent p-3 focus:outline-none focus:ring-0 placeholder:text-gray-700"
                placeholder="Hacé una pregunta..."
                minRows={1}          // parte con 1 renglón
                maxRows={5}          // no crecerá más de 5 renglones
                value={input}
                onChange={handleInputChange}
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
