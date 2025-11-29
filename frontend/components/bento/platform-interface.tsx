"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, DollarSign, Wallet } from "lucide-react"
import { get } from 'aws-amplify/api'

// Define interfaces based on backend response
interface Task {
  taskId: string;
  type: string;
  payload: {
    instructions: string;
    [key: string]: any;
  };
  status: string;
  reward?: number;
  // properties for placeholders/UI
  title?: string;
  time?: string;
  available?: number | string;
  isPlaceholder?: boolean;
}

export default function PlatformInterface() {
  const [activeTab, setActiveTab] = useState("worker")
  const [tasks, setTasks] = useState<Task[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTasks();
    fetchBalance();
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const restOperation = get({
        apiName: 'CrowdsourcingApi',
        path: '/worker/tasks'
      });
      const response = await restOperation.response;
      const body: any = await response.body.json();
      setTasks(body.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
        const restOperation = get({
            apiName: 'CrowdsourcingApi',
            path: '/worker/wallet'
        });
        const response = await restOperation.response;
        const body: any = await response.body.json();
        setBalance(body.balance);
    } catch (error) {
        console.error('Error fetching wallet:', error);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
     if (amount === undefined) return "$0.00";
     return `$${amount.toFixed(2)}`;
  }

  // Placeholder tasks to preserve design if no tasks are available
  const placeholderTasks: Task[] = [
    {
      taskId: "p1",
      type: "Clasificación de imágenes",
      payload: { instructions: "Clasificar imágenes de productos" },
      reward: 0.15,
      status: "OPEN",
      time: "~2 min",
      available: 450,
      isPlaceholder: true
    },
    {
      taskId: "p2",
      type: "Transcripción",
      payload: { instructions: "Transcribir audio médico" },
      reward: 0.80,
      status: "OPEN",
      time: "~8 min",
      available: 120,
      isPlaceholder: true
    },
    {
      taskId: "p3",
      type: "Anotación de texto",
      payload: { instructions: "Etiquetar sentimiento en texto" },
      reward: 0.10,
      status: "OPEN",
      time: "~1 min",
      available: 890,
      isPlaceholder: true
    },
  ];

  const displayTasks = tasks.length > 0 ? tasks : placeholderTasks;

  return (
    <div className="w-full h-full bg-background border border-border rounded-lg overflow-hidden flex flex-col">
      {/* Header with tabs */}
      <div className="flex items-center border-b border-border bg-muted/30 p-2">
        <div className="flex flex-col">
            <div className="px-2 text-sm font-bold text-primary">CrowdTasker</div>
            {balance !== null && (
                <div className="px-2 text-xs text-green-600 font-mono flex items-center gap-1">
                    <Wallet size={10} />
                    {formatCurrency(balance)}
                </div>
            )}
        </div>
        <div className="flex gap-1 ml-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("worker")}
            className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === "worker"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Worker
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === "historial"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Historial
          </button>
          <button
            onClick={() => setActiveTab("requester")}
            className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === "requester"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Requester
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {activeTab === "worker" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">
                {loading && tasks.length === 0 ? 'Cargando...' : 'Tareas Disponibles'}
            </h3>
            {displayTasks.map((task) => (
              <div
                key={task.taskId}
                className={`p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${task.isPlaceholder ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">
                        {task.payload?.instructions || task.title || 'Nueva Tarea'}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                        {task.type}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-primary whitespace-nowrap">
                    {formatCurrency(task.reward)}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.time || '~5 min'}
                  </span>
                  <span>{task.available || '1'} disponibles</span>
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
