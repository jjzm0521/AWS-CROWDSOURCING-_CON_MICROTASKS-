"use client"

import { TrendingUp, DollarSign, Target } from "lucide-react"

export default function WorkerDashboard() {
  const stats = [
    { icon: DollarSign, label: "Hoy", value: "$47.50", color: "text-primary" },
    { icon: TrendingUp, label: "Accuracy", value: "94%", color: "text-green-500" },
    { icon: Target, label: "Nivel", value: "Expert", color: "text-blue-500" },
  ]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-4">
      {/* Stats grid */}
      <div className="w-full grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/30 gap-2">
            <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2} />
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full mt-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progreso de nivel</span>
          <span>850/1000</span>
        </div>
        <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500"
            style={{ width: "85%" }}
          />
        </div>
      </div>

      {/* Task counter */}
      <div className="text-center mt-2">
        <div className="text-2xl font-bold text-foreground">127</div>
        <div className="text-xs text-muted-foreground">Tareas completadas hoy</div>
      </div>
    </div>
  )
}
