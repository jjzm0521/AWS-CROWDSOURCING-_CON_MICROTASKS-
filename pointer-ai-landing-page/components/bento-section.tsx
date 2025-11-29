import AiCodeReviews from "./bento/ai-code-reviews"
import RealtimeCodingPreviews from "./bento/real-time-previews"
import OneClickIntegrationsIllustration from "./bento/one-click-integrations-illustration"
import MCPConnectivityIllustration from "./bento/mcp-connectivity-illustration" // Updated import
import EasyDeployment from "./bento/easy-deployment"
import ParallelCodingAgents from "./bento/parallel-agents" // Updated import

import ImageClassification from "./bento/image-classification"
import AudioTranscription from "./bento/audio-transcription"
import QualityControlIllustration from "./bento/quality-control-illustration"
import WorkerDashboard from "./bento/worker-dashboard"
import AutomatedPayments from "./bento/automated-payments"
import DisputeResolution from "./bento/dispute-resolution"
import PlatformInterface from "./bento/platform-interface" // Added platform interface component

const BentoCard = ({ title, description, Component }) => (
  <div className="overflow-hidden rounded-2xl border border-white/20 flex flex-col justify-start items-start relative">
    {/* Background with blur effect */}
    <div
      className="absolute inset-0 rounded-2xl"
      style={{
        background: "rgba(231, 236, 235, 0.08)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    />
    {/* Additional subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

    <div className="self-stretch p-6 flex flex-col justify-start items-start gap-2 relative z-10">
      <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
        <p className="self-stretch text-foreground text-lg font-normal leading-7">
          {title} <br />
          <span className="text-muted-foreground">{description}</span>
        </p>
      </div>
    </div>
    <div className="self-stretch h-72 relative -mt-0.5 z-10">
      <Component />
    </div>
  </div>
)

export function BentoSection() {
  const cards = [
    {
      title: "AI-powered code reviews.",
      description: "Get real-time, smart suggestions for cleaner code.",
      Component: AiCodeReviews,
    },
    {
      title: "Real-time coding previews",
      description: "Chat, collaborate, and instantly preview changes together.",
      Component: RealtimeCodingPreviews,
    },
    {
      title: "One-click integrations",
      description: "Easily connect your workflow with popular dev tools.",
      Component: OneClickIntegrationsIllustration,
    },
    {
      title: "Flexible MCP connectivity",
      description: "Effortlessly manage and configure MCP server access.",
      Component: MCPConnectivityIllustration, // Updated component
    },
    {
      title: "Launch parallel coding agents", // Swapped position
      description: "Solve complex problems faster with multiple AI agents.",
      Component: ParallelCodingAgents, // Updated component
    },
    {
      title: "Deployment made easy", // Swapped position
      description: "Go from code to live deployment on Vercel instantly.",
      Component: EasyDeployment,
    },
    {
      title: "Clasificación de imágenes.",
      description: "Etiqueta, categoriza y dibuja bounding boxes en objetos.",
      Component: ImageClassification,
    },
    {
      title: "Transcripción de audio",
      description: "Convierte audio a texto con precisión humana verificada.",
      Component: AudioTranscription,
    },
    {
      title: "Control de calidad automático",
      description: "ML y honeypot tasks aseguran resultados de alta calidad.",
      Component: QualityControlIllustration,
    },
    {
      title: "Interfaz intuitiva y completa", // Added platform interface card showing the actual app
      description: "Workers y requesters gestionan todo desde un dashboard único.",
      Component: PlatformInterface,
    },
    {
      title: "Dashboard intuitivo para workers",
      description: "Rastrea ganancias, métricas y progresa de nivel fácilmente.",
      Component: WorkerDashboard,
    },
    {
      title: "Pagos automatizados",
      description: "Recibe pagos al instante cuando tus tareas son aprobadas.",
      Component: AutomatedPayments,
    },
    {
      title: "Resolución de disputas",
      description: "Sistema justo de revisión manual para proteger workers y requesters.",
      Component: DisputeResolution,
    },
  ]

  return (
    <section className="w-full px-5 flex flex-col justify-center items-center overflow-visible bg-transparent">
      <div className="w-full py-8 md:py-16 relative flex flex-col justify-start items-start gap-6">
        <div className="w-[547px] h-[938px] absolute top-[614px] left-[80px] origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[130px] z-0" />
        <div className="self-stretch py-8 md:py-14 flex flex-col justify-center items-center gap-2 z-10">
          <div className="flex flex-col justify-start items-center gap-4">
            <h2 className="w-full max-w-[655px] text-center text-foreground text-4xl md:text-6xl font-semibold leading-tight md:leading-[66px] text-balance">
              Potencia tu Workflow de Datos
            </h2>
            <p className="w-full max-w-[600px] text-center text-muted-foreground text-lg md:text-xl font-medium leading-relaxed text-pretty">
              Procesa millones de datos con nuestra plataforma de crowdsourcing impulsada por IA y validación humana.
            </p>
          </div>
        </div>
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
          {cards.map((card) => (
            <BentoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}
