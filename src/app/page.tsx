import { ResumeRewriter } from "@/components/resume-rewriter"
import { Navigation } from "@/components/navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your resume to perfectly match any job description using AI-powered optimization
          </p>
        </div>
        <ResumeRewriter />
      </main>
    </div>
  )
}
