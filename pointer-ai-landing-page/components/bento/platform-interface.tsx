"use client"

import { useState } from "react"
import { CheckCircle2, Clock, DollarSign } from "lucide-react"

export default function PlatformInterface() {
  const [activeTab, setActiveTab] = useState("worker")

  const tasks = [
    {
      id: 1,
      title: "Clasificar imágenes de productos",
      type: "Clasificación de imágenes",
      reward: "$0.15",
      time: "~2 min",
      available: 450,
    },
    {
      id: 2,
      title: "Transcribir audio médico",
      type: "Transcripción",
      reward: "$0.80",
      time: "~8 min",
      available: 120,
    },
    {
      id: 3,
      title: "Etiquetar sentimiento en texto",
      type: "Anotación de texto",
      reward: "$0.10",
      time: "~1 min",
      available: 890,
    },
  ]

  return (
    <div className="w-full h-full bg-background border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Header with tabs */}
      <div className="flex items-center border-b border-border bg-muted/30">
        <div className="px-4 py-2 text-sm font-bold text-primary">CrowdTasker</div>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setActiveTab("worker")}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === "worker"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Soy Worker
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === "historial"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Historial
          </button>
          <button
            onClick={() => setActiveTab("requester")}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === "requester"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Soy Requester
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {activeTab === "worker" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">Tareas Disponibles</h3>
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{task.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{task.type}</div>
                  </div>
                  <div className="text-xs font-bold text-primary whitespace-nowrap">{task.reward}</div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.time}
                  </span>
                  <span>{task.available} disponibles</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "historial" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">Historial de Tareas</h3>
            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-foreground">Clasificar imágenes</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Hace 2 horas</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-500">+$4.50</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-foreground">Transcripción de audio</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Hace 5 horas</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-500">+$12.00</span>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "requester" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">Crear Nueva Tarea</h3>
            <div className="p-4 rounded-lg border-2 border-dashed border-border bg-muted/20 text-center">
              <DollarSign className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <div className="text-xs text-muted-foreground">Sube un CSV o JSON con tus datos</div>
              <button className="mt-2 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors">
                Subir Dataset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
