import React, { useEffect, useState } from "react"
import ChatMessage from "@/components/chat-message-response"
// import TypingIndicator from "@/components/ui/typing-indicator"
import { LoaderCircle } from "lucide-react"
import type Mensaje from "@/types/Mensaje"
import axios from "axios"
import Materia from "@/types/Materia"
import { useAlumnoStore } from "@/store/alumnoStore"

const MemoizedChatMessage = React.memo(ChatMessage)

interface MessageListProps {
  completedMessages: Mensaje[]
  streamingMessage: Mensaje | null
  isLoading: boolean
}

function MessageList({ completedMessages, streamingMessage, isLoading }: MessageListProps) {

  const apiUrl = import.meta.env.VITE_API_URL
  const materia_id = useAlumnoStore(s => s.estudiante?.asistentes[0].materia_id)
  const [materia, setMateria] = useState<Materia>()
  const token = localStorage.getItem("token") ?? ""

  const axiosConfig = React.useMemo(
    () => ({
      headers: { Authorization: `Bearer ${token}` }
    }),
    [token]
  )

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(`${apiUrl}/materias/${materia_id}`, axiosConfig)
        setMateria(response.data)
      } catch {
        console.error("No se pudo obtener la materia")
      }
    })()
  }, [materia_id, apiUrl, axiosConfig]) 

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center" aria-busy="true">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        <span className="sr-only">Cargando mensajes…</span>
      </div>
    )
  }

  // 4. Lógica de 'lista vacía' actualizada
  if (completedMessages.length === 0 && !streamingMessage) {
    return (
      <div className="flex h-full items-center justify-center text-center">
        <p className="text-xl text-gray-900">
          👋 ¡Hola! Soy tu Asistente Virtual de {materia?.nombre}
          <br />
          Haceme una pregunta para empezar.
        </p>
      </div>
    )
  }

  return (
    <>
      {completedMessages.map((msg) => (
        <MemoizedChatMessage 
          key={msg.id} 
          message={msg} 
          isStreaming={false}
        />
      ))}

      {streamingMessage && (
        <MemoizedChatMessage
          key={streamingMessage.id}
          message={streamingMessage}
          isStreaming={true}
        />
      )}
      
      {/* El 'isTyping && <TypingIndicator />' se elimina,
        ya que el 'streamingMessage' (que empieza vacío)
        actúa como el indicador de "escribiendo".
      */}
    </>
  )
}

export default React.memo(MessageList)