"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { get } from "aws-amplify/api"
import { CheckCircle, AlertCircle, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Task {
    taskId: string
    type: string
    payload: {
        instructions: string
        [key: string]: any
    }
    status: string
    reward?: number
}

export function WorkerDashboard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchTasks()
    }, [])

    const fetchTasks = async () => {
        try {
            const restOperation = get({
                apiName: "CrowdsourcingApi",
                path: "/worker/tasks",
            })
            const response = await restOperation.response
            const body = await response.body.json()
            setTasks((body as any).tasks || [])
        } catch (error) {
            console.error("Error fetching tasks:", error)
            // Fallback for demo if API fails or doesn't exist yet
            setTasks([
                {
                    taskId: "demo-1",
                    type: "image-labeling",
                    payload: { instructions: "Identifica los objetos en la imagen." },
                    status: "open",
                    reward: 0.50
                },
                {
                    taskId: "demo-2",
                    type: "text-classification",
                    payload: { instructions: "Clasifica el sentimiento del texto." },
                    status: "open",
                    reward: 0.30
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="w-full">
                        <CardHeader>
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-6 w-[200px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

    if (tasks.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No hay tareas disponibles</AlertTitle>
                <AlertDescription>
                    Vuelve a intentarlo más tarde.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-foreground">Tareas Disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                    <Card key={task.taskId} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push(`/dashboard/task/${task.taskId}`)}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center mb-2">
                                <Badge variant="secondary" className="uppercase">
                                    {task.type.replace("-", " ")}
                                </Badge>
                                <span className="font-bold text-lg text-green-600 flex items-center">
                                    <DollarSign size={16} />
                                    {task.reward || "0.10"}
                                </span>
                            </div>
                            <CardTitle className="truncate group-hover:text-primary transition-colors">
                                {task.payload.instructions || "Tarea de etiquetado"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                                {task.payload.instructions || "Ayúdanos a categorizar y verificar datos."}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full group-hover:bg-primary/90">
                                <CheckCircle size={18} className="mr-2" /> Empezar Tarea
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
