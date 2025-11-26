import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TableCell } from "@/components/ui/table"

interface ResumenCellProps {
  resumen: string
}

export function ResumenCell({ resumen }: ResumenCellProps) {
  const [open, setOpen] = useState(false)

  return (
    <TableCell>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full mt-2 bg-blue-700 hover:bg-blue-800 text-white">
            Resumen
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Resumen de la sesión</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-line text-sm text-gray-700 mt-2">
            {resumen || "No hay resumen disponible."}
          </div>
        </DialogContent>
      </Dialog>
    </TableCell>
  )
}
