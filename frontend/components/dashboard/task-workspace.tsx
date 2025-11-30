"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { post, get } from "aws-amplify/api"
import { ArrowLeft, Check, Info, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface Task {
    taskId: string
    type: string
    payload: {
        imageUrl?: string
        instructions?: string
        [key: string]: any
    }
}

export function TaskWorkspace({ taskId }: { taskId: string }) {
    const [task, setTask] = useState<Task | null>(null)
    const [assignmentId, setAssignmentId] = useState<string | null>(null)
    const [answer, setAnswer] = useState("")
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)
    const [error, setError] = useState("")
    const router = useRouter()

    useEffect(() => {
        const init = async () => {
            await fetchTaskDetails()
        }
        init()
    }, [taskId])

    useEffect(() => {
        if (task) {
            handleAssign()
        }
    }, [task])

    const fetchTaskDetails = async () => {
        try {
            // MVP: Fetch all tasks and find the one we need, since we might not have GET /tasks/:id
            const restOperation = get({
                apiName: "CrowdsourcingApi",
                path: "/worker/tasks",
            })
            const response = await restOperation.response
            const body = await response.body.json()
            const tasks = (body as any).tasks || []
            const foundTask = tasks.find((t: Task) => t.taskId === taskId)

            if (foundTask) {
                setTask(foundTask)
            } else {
                // Fallback for demo
                if (taskId.startsWith("demo")) {
                    setTask({
                        taskId,
                        type: "demo-task",
                        payload: { instructions: "Esta es una tarea de demostración. Describe lo que ves." }
                    })
                } else {
                    setError("Tarea no encontrada.")
                }
            }
        } catch (e) {
            console.error(e)
            setError("Error al cargar la tarea.")
        } finally {
            setInitializing(false)
        }
    }

    const handleAssign = async () => {
        if (!task) return
        setLoading(true)
        setError("")
        try {
            const restOperation = post({
                apiName: "CrowdsourcingApi",
                path: `/worker/tasks/${task.taskId}/assign`,
            })
            const response = await restOperation.response
            const data: any = await response.body.json()

            if (data.assignmentId) {
                setAssignmentId(data.assignmentId)
            } else {
                setError(data.message || "La tarea ya no está disponible o fue asignada a otro trabajador.")
            }
        } catch (err: any) {
            console.error(err)
            // For demo purposes, if API fails, simulate assignment
            if (task.taskId.startsWith("demo")) {
                setAssignmentId("demo-assignment-" + Date.now())
            } else {
                const errorBody = await err.response?.body.json().catch(() => ({}))
                setError(errorBody?.message || "Error al aceptar la tarea.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!assignmentId || !answer) return

        setLoading(true)
        try {
            const restOperation = post({
                apiName: "CrowdsourcingApi",
                path: `/worker/tasks/${taskId}/submit`,
                options: { body: { assignmentId, answer } },
            })
            await restOperation.response
            router.push("/dashboard")
        } catch (err) {
            console.error(err)
            // Demo fallback
            if (taskId.startsWith("demo")) {
                alert("Tarea enviada (Demo)")
                router.push("/dashboard")
            } else {
                setError("Error al enviar la respuesta.")
            }
        } finally {
            setLoading(false)
        }
    }

    if (initializing) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-10">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={() => router.push("/dashboard")} className="mt-4" variant="outline">
                    Volver al listado
                </Button>
            </div>
        )
    }

    if (!task) return null

    if (!assignmentId && loading) {
        return <div className="flex justify-center p-8 text-muted-foreground">Aceptando tarea...</div>
    }

    return (
        <div className="max-w-6xl mx-auto">
            <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-6 pl-0 hover:pl-2 transition-all">
                <ArrowLeft size={16} className="mr-2" /> Volver al listado
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Task Content */}
                <Card className="h-fit">
                    <CardHeader className="border-b bg-muted/40">
                        <div className="flex justify-between items-center">
                            <CardTitle>Instrucciones</CardTitle>
                            <Badge variant="outline" className="uppercase">{task.type}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                            <h3 className="font-bold text-blue-800 dark:text-blue-300 flex items-center mb-2">
                                <Info size={20} className="mr-2" /> Instrucciones
                            </h3>
                            <p className="text-blue-700 dark:text-blue-400">
                                {task.payload.instructions || "Por favor, completa la tarea siguiendo las indicaciones."}
                            </p>
                        </div>

                        {task.payload.imageUrl ? (
                            <img
                                src={task.payload.imageUrl}
                                alt="Task Content"
                                className="w-full h-auto rounded-lg border"
                            />
                        ) : (
                            <div className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
                                <pre className="text-sm">{JSON.stringify(task.payload, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Column: Answer Form */}
                <Card className="h-fit sticky top-6">
                    <CardHeader className="border-b">
                        <CardTitle>Tu Respuesta</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Introduce tu respuesta en el siguiente campo.
                            </p>
                            <Textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="min-h-[200px] resize-none"
                                placeholder="Escribe tu respuesta aquí..."
                                required
                            />
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || !answer}
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                                {loading ? "Enviando..." : "Enviar Trabajo"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
