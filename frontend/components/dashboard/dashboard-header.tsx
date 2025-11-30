"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthenticator } from "@aws-amplify/ui-react"
import { LogOut, User } from "lucide-react"

export function DashboardHeader() {
    const pathname = usePathname()
    const { user: authUser, signOut } = useAuthenticator((context) => [context.user])

    // Demo user
    const user = authUser || { username: "Demo Worker" }

    const navItems = [
        { name: "Tareas", href: "/dashboard" },
        { name: "Historial", href: "/dashboard/history" },
        // { name: "Soy Requester", href: "/dashboard/requester" }, // Future implementation
    ]

    return (
        <header className="w-full py-4 px-6 border-b bg-background">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <span className="text-foreground text-xl font-semibold">TaskCrowd</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`px-4 py-2 rounded-full font-medium transition-colors ${pathname === item.href
                                    ? "bg-secondary text-secondary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User size={16} />
                        <span className="hidden sm:inline">{user?.username || "Usuario"}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={signOut}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={16} className="mr-2" />
                        Salir
                    </Button>
                </div>
            </div>
        </header>
    )
}
