"use client"

import { useState, useEffect } from "react"
import { DollarSign, ArrowRight, CheckCircle } from "lucide-react"

export default function AutomatedPayments() {
  const [isPaying, setIsPaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPaying(true)
      setTimeout(() => {
        setIsComplete(true)
        setTimeout(() => {
          setIsPaying(false)
          setIsComplete(false)
        }, 1500)
      }, 1500)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-6">
      {/* Payment flow */}
      <div className="flex items-center justify-center gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isPaying ? "bg-primary scale-110" : "bg-muted/30"
          }`}
        >
          <DollarSign className="w-6 h-6 text-foreground" />
        </div>

        <ArrowRight
          className={`w-6 h-6 transition-all ${isPaying ? "text-primary translate-x-1" : "text-muted-foreground"}`}
        />

        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isComplete ? "bg-green-500 scale-110" : "bg-muted/30"
          }`}
        >
          <CheckCircle className="w-6 h-6 text-foreground" />
        </div>
      </div>

      {/* Wallet display */}
      <div className="w-full bg-muted/30 rounded-lg p-4 text-center">
        <div className="text-xs text-muted-foreground mb-1">Balance disponible</div>
        <div className="text-2xl font-bold text-primary">$1,247.80</div>
      </div>

      {/* Status */}
      <div className="text-xs text-muted-foreground text-center">
        {isPaying && !isComplete && "Procesando pago..."}
        {isComplete && "¡Pago completado!"}
        {!isPaying && !isComplete && "Listo para recibir pagos"}
      </div>
    </div>
  )
}
