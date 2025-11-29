"use client"

import { useState, useEffect } from "react"
import { Mic, Square } from "lucide-react"

export default function AudioTranscription() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState("")
  const sampleText = "The quick brown fox jumps over the lazy dog..."

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      let index = 0
      interval = setInterval(() => {
        if (index < sampleText.length) {
          setTranscription(sampleText.slice(0, index + 1))
          index++
        } else {
          setIsRecording(false)
        }
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-4">
      {/* Waveform visualization */}
      <div className="w-full h-16 flex items-end justify-center gap-1">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${isRecording ? "bg-primary" : "bg-muted"}`}
            style={{
              height: isRecording ? `${Math.random() * 60 + 20}%` : "20%",
            }}
          />
        ))}
      </div>

      {/* Transcription box */}
      <div className="w-full h-20 bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground overflow-hidden">
        {transcription || "Presiona para empezar a transcribir..."}
      </div>

      {/* Record button */}
      <button
        onClick={() => {
          setIsRecording(!isRecording)
          if (!isRecording) setTranscription("")
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
          isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/80"
        }`}
      >
        {isRecording ? (
          <Square className="w-6 h-6 text-white fill-white" />
        ) : (
          <Mic className="w-6 h-6 text-primary-foreground" />
        )}
      </button>
    </div>
  )
}
