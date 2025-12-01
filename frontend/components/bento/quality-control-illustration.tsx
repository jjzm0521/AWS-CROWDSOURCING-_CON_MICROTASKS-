"use client"

import { useState, useEffect } from "react"
import { Shield, CheckCircle } from "lucide-react"

export default function QualityControlIllustration() {
  const [checkStep, setCheckStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCheckStep((prev) => (prev + 1) % 4)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const checks = [
    { label: "Honeypot Task", status: checkStep > 0 },
    { label: "Majority Vote", status: checkStep > 1 },
    { label: "ML Validation", status: checkStep > 2 },
  ]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-6">
      {/* Shield icon */}
      <div className="relative">
        <Shield className="w-16 h-16 text-primary" strokeWidth={1.5} />
        {checkStep === 3 && (
          <div className="absolute -top-1 -right-1">
            <CheckCircle className="w-6 h-6 text-green-500 fill-green-500/20" />
          </div>
        )}
      </div>

      {/* Check items */}
      <div className="w-full flex flex-col gap-3">
        {checks.map((check, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 transition-all duration-500 ${
              check.status ? "opacity-100" : "opacity-30"
            }`}
          >
            {check.status ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-muted" />
            )}
            <span className="text-sm text-foreground/80">{check.label}</span>
          </div>
        ))}
      </div>

      {/* Quality score */}
      <div className="mt-2 text-center">
        <div className="text-2xl font-bold text-primary">{checkStep === 3 ? "98%" : "--"}</div>
        <div className="text-xs text-muted-foreground">Quality Score</div>
      </div>
    </div>
  )
}
