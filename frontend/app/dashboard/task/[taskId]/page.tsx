import { TaskWorkspace } from "@/components/dashboard/task-workspace"

// Required for static export
export async function generateStaticParams() {
    return [{ taskId: "demo-task" }]
}

export default async function TaskPage({
    params,
}: {
    params: Promise<{ taskId: string }>
}) {
    const { taskId } = await params
    return <TaskWorkspace taskId={taskId} />
}
