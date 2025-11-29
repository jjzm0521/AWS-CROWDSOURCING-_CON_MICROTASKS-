"use client"

import { Scale, MessageSquare, User } from "lucide-react"

export default function DisputeResolution() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-6">
      {/* Balance scale icon */}
      <Scale className="w-16 h-16 text-primary" strokeWidth={1.5} />

      {/* Process steps */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Worker disputa</div>
            <div className="text-xs text-muted-foreground">Envía evidencia y razones</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Revisión humana</div>
            <div className="text-xs text-muted-foreground">Admin evalúa el caso</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Scale className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Resolución justa</div>
            <div className="text-xs text-muted-foreground">100%, 50% o 0% del pago</div>
          </div>
        </div>
      </div>

      {/* SLA indicator */}
      <div className="text-xs text-muted-foreground text-center">Resolución en &lt; 3 días</div>
    </div>
  )
}
