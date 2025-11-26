/* chat-message.tsx */
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"
import remarkGfm from 'remark-gfm'
import remarkMath from "remark-math"
import remarkBreaks from 'remark-breaks'
import type Mensaje from "@/types/Mensaje"
import { Streamdown } from 'streamdown'
import TypingIndicator from "./ui/typing-indicator"

interface ChatMessageProps {
  message: Mensaje
  isStreaming: boolean
}

const assistantsAnnotationRegex = /【\d+†source】/g;

const fixStreamedMarkdown = (raw: string) => {
  let text = raw.replace(assistantsAnnotationRegex, ''); // Limpiamos anotaciones

  // --- PASO 1: Fix de texto pegado (sin cambios) ---
  try {
    text = text
      .replace(/(#{1,6})([^\s#])/g, '$1 $2')
      .replace(/(\d+\.)([^\s\.])/g, '$1 $2')
      .replace(/(?<!\*)\*([^\s\*])/g, '* $1')
      .replace(/(^\s*-)([^\s-])/gm, '$1 $2');
  } catch (e) {
    text = text
      .replace(/(#{1,6})([^\s#])/g, '$1 $2')
      .replace(/(\d+\.)([^\s\.])/g, '$1 $2')
      .replace(/(\s\*)([^\s\*])/g, '$1 $2')
      .replace(/(^\s*-)([^\s-])/gm, '$1 $2');
  }
  
  text = text.replace(
    /([^\n])(\s*)(#{1,6} |\d+\. |\* |\- )/g,
    '$1\n\n$2$3'
  );
  text = text.replace(
    /([\.\?\!:\)\]\}])([^\s])/g,
    '$1 $2'
  );
  text = text.replace(
    /([a-z])([A-Z][a-z])/g,
    '$1 $2'
  );

  // Desescapar barras dobles
  text = text.replace(/\\\\/g, '\\');
  // Escapar moneda
  text = text.replace(/\$(?=\d+)/g, '\\$');

  // TRADUCIR FORMATOS DE BLOQUE (para evitar el error '[incomplete-link]')
  /* text = text.replace(/\\\[\s*([\s\S]+?)\s*\\\]/g, '$$\n$1\n$$');
  text = text.replace(/(^|\n)\[\s*([\s\S]+?)\s*\](?=\n|$)/g, '$1\n$$\n$2\n$$'); */

  // TRADUCIR FORMATOS INLINE
  // (Usamos la traducción a $...$ porque 'Streamdown' está configurado para aceptarla)
  /* text = text.replace(/\\\(\s*([\s\S]+?)\s*\\\)/g, '$$$1$');
  text = text.replace(/(?<!\$)\$([^\$\n]+?)\$(?!\$)/g, '$$$1$'); */

  return text;
};

// Tu función de limpieza de LaTeX (sin cambios, se usa al final)
const cleanAndTransform = (raw: string) => {
  let text = raw
    .replace(/\\\\/g, '\\');

  text = text.replace(/\$(?=\d+)/g, '\\$');

  text = text.replace(/\\\[\s*([\s\S]+?)\s*\\\]/g, '$$\n$1\n$$');

  text = text.replace(/\\\(\s*([\s\S]+?)\s*\\\)/g, '$$$1$');

  text = text.replace(/\\begin{align\*?}([\s\S]*?)\\end{align\*?}/g, (_m, body) => {
    return `$$\n\\begin{aligned}${body}\\end{aligned}\n$$`;
  });

  text = text.replace(/\\begin{aligned}([\s\S]*?)\\end{aligned}/g, (_m, body) => {
    return `$$\n\\begin{aligned}${body}\\end{aligned}\n$$`;
  });

  text = text.replace(
    /(^|\n)\s*\$\s*\n([\s\S]*?)\n\s*\$\s*(?=\n|$)/g,
    (_m, prefix, body) => `${prefix}$$\n${body}\n$$`
  );

  return text;
};


export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.rol === "user"
  const partes = (message.partes as any) ?? [
    { type: "text", text: message.texto }
  ]

  // Detecta si es el globo del bot, está en stream, Y aún no tiene texto.
  const isEmptyStream = isStreaming && !message.texto && !isUser;

  return (
    <div className={cn("flex items-start gap-3", isUser && "justify-end")}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-fce-light-gray border border-gray-200">
          <Bot className="h-5 w-5 m-auto text-fce-red" />
        </Avatar>
      )}

      <Card
        className={cn(
          "px-4 py-0 max-w-[85%] text-sm rounded-xl shadow-sm",
          isUser
            ? "bg-fce-red text-white prose prose-sm prose-invert"
            : "bg-fce-light-gray border border-gray-200 prose prose-sm",

          // Mantenemos la altura mínima para crear el "espacio en blanco"
          isEmptyStream && "min-h-32 flex items-center bg-fce-white border-none" // 'flex' centrará el indicador
        )}
      >
        {partes.map((p: any, idx: number) => {
          if (p.type === "text") {

            const isTextEmpty = !p.text || p.text.trim() === "";

            if (isStreaming && isTextEmpty && !isUser) {
              return <TypingIndicator key={idx} />
            }

            return (
              <Streamdown
                key={idx}
                isAnimating={isStreaming}
                remarkPlugins={[
                  remarkBreaks,
                  remarkGfm,
                  [remarkMath, { singleDollarTextMath: true }]
                ]}
              >
                {isStreaming
                  ? fixStreamedMarkdown(p.text.replace(assistantsAnnotationRegex, ''))
                  : cleanAndTransform(p.text.replace(assistantsAnnotationRegex, ''))
                }
              </Streamdown>
            );

          } else {
            return (
              <img
                key={idx}
                src={decodeURIComponent(p.data_url.trim())}
                alt="imagen generada"
                className="my-2 rounded-md shadow max-w-md"
              />
            );
          }
        })}
      </Card>

      {isUser && (
        <Avatar className="h-8 w-8 bg-fce-red border-fce-red">
          <User className="h-5 w-5 m-auto text-fce-light-gray" />
        </Avatar>
      )}
    </div>
  )
}