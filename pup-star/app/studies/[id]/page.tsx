'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { studies } from '../../data/studies'
import { Study } from '../../types/study'

export default function StudyDetailPage() {
  const params = useParams()
  const study = studies[params.id as string]

  if (!study) {
    return <div>Study not found</div>
  }

  const renderParagraphs = (text: string) => {
    return text.split('\n').map((paragraph: string, index: number) => (
      <p key={index} className="mb-4 whitespace-pre-line">{paragraph}</p>
    ))
  }

  return (
    <div className="min-h-screen bg-white text-[#880d0d]">
      {/* Header */}
      <header className="border-b border-[#880d0d]/20 pb-4 pt-6">
        <div className="max-w-7xl mx-auto px-8">
          <img src="/PUPStarLogoRed.png" alt="PUP Star Logo" className="h-12 mb-2" />
        </div>
      </header>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        <Link 
          href="/studies" 
          className="inline-flex items-center text-[#880d0d] hover:text-[#880d0d]/80 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Studies
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex gap-8">
          {/* Navigation Sidebar */}
          <aside className="w-72 flex-shrink-0">
            <nav className="sticky top-6 space-y-2">
              <div className="font-bold text-lg mb-4">Thesis Preview</div>
              <a href="#introduction" className="block py-1 px-4 rounded hover:bg-[#ffd600]/10 transition-colors">Introduction</a>
              <a href="#methodology" className="block py-1 px-4 rounded hover:bg-[#ffd600]/10 transition-colors">Methodology</a>
              <a href="#results" className="block py-1 px-4 rounded hover:bg-[#ffd600]/10 transition-colors">Results and Discussions</a>
            </nav>
          </aside>

          {/* Study Content */}
          <main className="flex-1 max-w-4xl">
            {/* Title Section */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold mb-4">{study.title}</h1>
                {study.pdfUrl && (
                  <a
                    href={study.pdfUrl}
                    download
                    className="text-[#880d0d] font-bold text-lg hover:text-[#FFD600] transition-colors"
                  >
                    [Download PDF]
                  </a>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <strong>Authors:</strong> {study.authors.join(', ')}
                </div>
                <div>
                  <strong>Date Published:</strong> {study.datePublished}
                </div>
                <div>
                  <strong>Course:</strong> {study.course}
                </div>
              </div>
            </div>

            {/* Content Sections */}
            {study.sections && (
              <div className="space-y-12">
                <section id="introduction">
                  <h2 className="text-2xl font-bold mb-4">INTRODUCTION</h2>
                  <div className="prose prose-red max-w-none">
                    {renderParagraphs(study.sections.introduction)}
                  </div>
                </section>

                <section id="methodology">
                  <h2 className="text-2xl font-bold mb-4">METHODOLOGY</h2>
                  <div className="prose prose-red max-w-none">
                    {renderParagraphs(study.sections.methodology)}
                  </div>
                </section>

                <section id="results">
                  <h2 className="text-2xl font-bold mb-4">RESULTS AND DISCUSSION</h2>
                  <div className="prose prose-red max-w-none">
                    {renderParagraphs(study.sections.results)}
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
