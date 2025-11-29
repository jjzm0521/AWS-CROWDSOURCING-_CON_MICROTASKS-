"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqData = [
  {
    question: "¿Qué es TaskCrowd y cómo funciona?",
    answer:
      "TaskCrowd es una plataforma de crowdsourcing donde empresas (requesters) publican microtareas como etiquetar imágenes, transcribir audio o validar datos. Los workers completan estas tareas y reciben pagos. Nuestro sistema de quality control automático asegura resultados de alta calidad mediante ML, honeypot tasks y majority voting.",
  },
  {
    question: "¿Cuánto puedo ganar como worker?",
    answer:
      "Las ganancias varían según el tipo de tarea, tu nivel de experiencia y velocidad. Workers principiantes (Novice) pueden ganar entre $5-$10/hora, mientras que workers expertos (Expert) con alta accuracy pueden ganar $15-$25/hora o más. El pago se realiza por tarea completada y aprobada.",
  },
  {
    question: "¿Cómo funciona el sistema de quality control?",
    answer:
      "Utilizamos múltiples capas de control: 1) Honeypot tasks (10% con respuesta conocida) para validar la accuracy del worker, 2) Majority voting donde 3+ workers hacen la misma tarea y ganan los que coinciden con el consenso, y 3) ML automático con SageMaker que predice si una submission es válida con +90% de confianza.",
  },
  {
    question: "¿Qué pasa si mi trabajo es rechazado?",
    answer:
      "Si una tarea es rechazada, puedes iniciar un proceso de disputa que será revisado por un humano en nuestro equipo. Los posibles resultados son: aprobación completa (recibes 100% del pago), rechazo (sin pago) o aprobación parcial (50% del pago). Si no hay resolución en 3 días, la tarea se auto-aprueba.",
  },
  {
    question: "¿Cómo puedo subir de nivel como worker?",
    answer:
      "Tu nivel (Novice, Intermediate, Expert) se basa en tres métricas: accuracy rate (% de tareas aprobadas), completion rate (% de tareas asignadas que completaste) y speed (tiempo promedio). Al subir de nivel, desbloqueas tareas más avanzadas y mejor pagadas, además de acceso prioritario a nuevas oportunidades.",
  },
  {
    question: "¿Es seguro trabajar con TaskCrowd?",
    answer:
      "Sí. Usamos seguridad enterprise-grade con AWS, todos los pagos están protegidos en wallets virtuales, y tenemos un sistema de dispute resolution justo para proteger tanto a workers como requesters. Los requesters deben depositar fondos antes de publicar tareas, garantizando que siempre hay presupuesto para pagar el trabajo completado.",
  },
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggle()
  }
  return (
    <div
      className={`w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-center gap-5 text-left transition-all duration-300 ease-out">
        <div className="flex-1 text-foreground text-base font-medium leading-6 break-words">{question}</div>
        <div className="flex justify-center items-center">
          <ChevronDown
            className={`w-6 h-6 text-muted-foreground-dark transition-all duration-500 ease-out ${isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
        style={{
          transitionProperty: "max-height, opacity, padding",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`px-5 transition-all duration-500 ease-out ${isOpen ? "pb-[18px] pt-2 translate-y-0" : "pb-0 pt-0 -translate-y-2"}`}
        >
          <div className="text-foreground/80 text-sm font-normal leading-6 break-words">{answer}</div>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }
  return (
    <section className="w-full pt-[66px] pb-20 md:pb-40 px-5 relative flex flex-col justify-center items-center">
      <div className="w-[300px] h-[500px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[100px] z-0" />
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[435px] text-center text-foreground text-4xl font-semibold leading-10 break-words">
            Preguntas Frecuentes
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] break-words">
            Todo lo que necesitas saber sobre TaskCrowd y cómo puede transformar tu flujo de trabajo de desarrollo
          </p>
        </div>
      </div>
      <div className="w-full max-w-[600px] pt-0.5 pb-10 flex flex-col justify-start items-start gap-4 relative z-10">
        {faqData.map((faq, index) => (
          <FAQItem key={index} {...faq} isOpen={openItems.has(index)} onToggle={() => toggleItem(index)} />
        ))}
      </div>
    </section>
  )
}
