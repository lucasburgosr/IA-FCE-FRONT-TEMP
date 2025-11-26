import { Card } from "@/components/ui/card"

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">

      <Card className="px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex space-x-1 items-center h-5">
          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </Card>
    </div>
  )
}