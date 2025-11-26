/* chat-message.tsx */
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeKatex from "rehype-katex"
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import remarkMath from "remark-math"
import type Mensaje from "@/types/Mensaje"

interface ChatMessageProps {
  message: Mensaje
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.rol === "user"

  const cleanAndTransform = (raw: string) => {
  let text = raw
    // 1) desescapar barras dobles
    .replace(/\\\\/g, '\\');

  // 2) escapar moneda: $20, $100...
  text = text.replace(/\$(?=\d+)/g, '\\$');

  // 3) \[ … \]  -> $$ … $$
  text = text.replace(/\\\[\s*([\s\S]+?)\s*\\\]/g, '$$\n$1\n$$');

  // 4) \( … \)  -> $ … $
  text = text.replace(/\\\(\s*([\s\S]+?)\s*\\\)/g, '$$$1$');

  // 5) align/align* -> aligned (KaTeX-friendly)
  text = text.replace(/\\begin{align\*?}([\s\S]*?)\\end{align\*?}/g, (_m, body) => {
    return `$$\n\\begin{aligned}${body}\\end{aligned}\n$$`;
  });

  // 6) begin{aligned} ... end{aligned} -> $$ ... $$
  // Este es el nuevo paso para manejar directamente los bloques \begin{aligned}
  text = text.replace(/\\begin{aligned}([\s\S]*?)\\end{aligned}/g, (_m, body) => {
    return `$$\n\\begin{aligned}${body}\\end{aligned}\n$$`;
  });

  // 7) Bloques con un solo $ en líneas separadas -> $$ … $$
  text = text.replace(
    /(^|\n)\s*\$\s*\n([\s\S]*?)\n\s*\$\s*(?=\n|$)/g,
    (_m, prefix, body) => `${prefix}$$\n${body}\n$$`
  );

  return text;
};

  const partes = (message.partes as any) ?? [
    { type: "text", text: message.texto }
  ]

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
            : "bg-fce-light-gray border border-gray-200 prose prose-sm"
        )}
      >
        {partes.map((p: any, idx: number) =>
          p.type === "text" ? (
            <div key={idx} className="whitespace-pre-wrap">
              <ReactMarkdown
                children={cleanAndTransform(p.text)}
                remarkPlugins={[remarkMath, remarkBreaks, remarkGfm]}
                rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
              />
            </div>
          ) : (
            <img
              key={idx}
              src={decodeURIComponent(p.data_url.trim())}
              alt="imagen generada"
              className="my-2 rounded-md shadow max-w-md"
            />
          )
        )}
      </Card>

      {isUser && (
        <Avatar className="h-8 w-8 bg-fce-red border-fce-red">
          <User className="h-5 w-5 m-auto text-fce-light-gray" />
        </Avatar>
      )}
    </div>
  )
}
