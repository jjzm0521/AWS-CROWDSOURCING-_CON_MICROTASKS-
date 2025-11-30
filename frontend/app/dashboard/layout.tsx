import type React from "react"
import AuthGuard from "@/components/AuthGuard"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard>
            <div className="min-h-screen bg-background flex flex-col">
                <DashboardHeader />
                <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </AuthGuard>
    )
}
