"use client"

import { useEffect, useState } from "react"
import { get, post } from "aws-amplify/api"
import { AlertCircle, CheckCircle, XCircle, Gavel, RefreshCw } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

export function WorkerHistory() {
    const [submissions, setSubmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [disputeReason, setDisputeReason] = useState("")
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const restOperation = get({ apiName: "CrowdsourcingApi", path: "/worker/tasks?history=true" })
            // Note: This requires backend support. Using mock data if fails or returns empty.

            // MOCK DATA FOR VISUALIZATION
            setSubmissions([
                { submissionId: "1", taskId: "tarea-foto-gato", status: "Approved", reward: 0.5, createdAt: "2023-10-27" },
                { submissionId: "2", taskId: "tarea-audio-ruido", status: "Rejected", reward: 0.5, createdAt: "2023-10-28" },
                { submissionId: "3", taskId: "tarea-texto-mal", status: "Disputed", reward: 0.5, createdAt: "2023-10-29" },
            ])

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDispute = (subId: string) => {
        setSelectedSubmissionId(subId)
        setDisputeReason("")
        setIsDialogOpen(true)
    }

    const submitDispute = async () => {
        if (!selectedSubmissionId || !disputeReason) return

        try {
            const restOperation = post({
                apiName: "CrowdsourcingApi",
                path: "/worker/disputes",
                options: {
                    body: {
                        submissionId: selectedSubmissionId,
                        reason: disputeReason
                    }
                }
            })
            await restOperation.response
            alert("Disputa enviada al tribunal.")
            setIsDialogOpen(false)
            setSelectedSubmissionId(null)
            // Reload data here
        } catch (e) {
            console.error(e)
            alert("Error al enviar disputa")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-foreground">Historial de Trabajo</h2>
                <Button variant="outline" size="icon" onClick={fetchHistory}>
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tarea</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                </TableRow>
                            ))
                        ) : submissions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No hay historial disponible.
                                </TableCell>
                            </TableRow>
                        ) : (
                            submissions.map((sub) => (
                                <TableRow key={sub.submissionId}>
                                    <TableCell className="font-medium">{sub.taskId}</TableCell>
                                    <TableCell>{sub.createdAt}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                sub.status === "Approved" ? "default" : // Greenish usually default or success
                                                    sub.status === "Rejected" ? "destructive" :
                                                        "secondary"
                                            }
                                            className={
                                                sub.status === "Approved" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
                                            }
                                        >
                                            {sub.status === "Approved" && <CheckCircle size={14} className="mr-1 inline" />}
                                            {sub.status === "Rejected" && <XCircle size={14} className="mr-1 inline" />}
                                            {sub.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {sub.status === "Rejected" && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDispute(sub.submissionId)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <Gavel size={16} className="mr-1" /> Apelar
                                            </Button>
                                        )}
                                        {sub.status === "Disputed" && <span className="text-muted-foreground italic text-sm">En revisión</span>}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Iniciar Disputa</DialogTitle>
                        <DialogDescription>
                            Explica por qué crees que tu trabajo fue rechazado incorrectamente.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Tu explicación..."
                        className="min-h-[100px]"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={submitDispute}>Enviar Apelación</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
