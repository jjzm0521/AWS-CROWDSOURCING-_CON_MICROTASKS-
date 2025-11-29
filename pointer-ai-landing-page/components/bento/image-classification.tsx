"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"

export default function ImageClassification() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    { id: "cat", label: "Gato", color: "bg-primary/20" },
    { id: "dog", label: "Perro", color: "bg-blue-500/20" },
    { id: "bird", label: "Pájaro", color: "bg-yellow-500/20" },
    { id: "other", label: "Otro", color: "bg-gray-500/20" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * categories.length)
      setSelectedCategory(categories[randomIndex].id)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-4">
      {/* Mock image placeholder */}
      <div className="w-40 h-40 rounded-lg bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
        <svg className="w-20 h-20 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      {/* Category selection */}
      <div className="grid grid-cols-2 gap-2 w-full">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat.id
                ? `${cat.color} text-foreground ring-2 ring-primary/50`
                : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            } flex items-center justify-center gap-1.5`}
          >
            {selectedCategory === cat.id && <Check className="w-3 h-3" />}
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  )
}
