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
          <img src="/PUPStarLogoRed.png" alt="PUP Star Logo" className="h-15 w-auto" />
        </div>
        
      </header>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-8 py-6">
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex gap-8">
          {/* Navigation Sidebar */}
          <aside className="w-72 flex-shrink-0 text-right pr-2 pt-6">
            <nav className="sticky top-6 border-r-4 border-[#ffd600] space-y-2">
              <Link 
              href="/studies" 
              className="inline-flex font-bold items-center px-4 text-lg text-[#880d0d] hover:text-[#880d0d]/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Studies
            </Link>
              <div className="font-bold px-4 text-md mb-4">Thesis Preview</div>
              <a href="#introduction" className="block px-4 rounded hover:bg-[#ffd600]/10 transition-colors">Introduction</a>
              <a href="#methodology" className="block px-4 rounded hover:bg-[#ffd600]/10 transition-colors">Methodology</a>
              <a href="#results" className="block px-4 rounded hover:bg-[#ffd600]/10 transition-colors">Results and Discussions</a>
            </nav>
          </aside>

          {/* Study Content */}
          <main className="flex-1 max-w-4xl">
            {/* Title Section */}
            <div className="mb-8">
              <div className="items-start">
                <h1 className="text-3xl font-bold leading-8  mb-1 text-justify">{study.title}</h1>
              </div>
              <div className="text-right">
              {study.pdfUrl && (
                  <a
                    href={study.pdfUrl}
                    download
                    className="text-[#880d0d]  font-bold text-lg hover:text-[#FFD600] transition-colors"
                  >
                    [Download PDF]
                  </a>
                )}
                </div>
              <div className="space-y-1 text-black">
                <div>
                  <strong className="text-[#880d0d]">Authors:</strong> {study.authors.join(', ')}
                </div>
                <div>
                  <strong className="text-[#880d0d]">Date Published:</strong> {study.datePublished}
                </div>
                <div>
                  <strong className="text-[#880d0d]">Course:</strong> {study.course}
                </div>
              </div>
            </div>

            {/* Content Sections */}
            {study.sections && (
              <div className="space-y-12">
                <section id="introduction">
                  <h2 className="text-2xl font-bold mb-4">INTRODUCTION</h2>
                  <div className="prose prose-red max-w-none text-justify text-black leading-5">
                    {renderParagraphs(study.sections.introduction)}
                  </div>
                </section>

                <section id="methodology">
                  <h2 className="text-2xl font-bold mb-4">METHODOLOGY</h2>
                  <div className="prose prose-red max-w-none text-justify text-black leading-5">
                    {renderParagraphs(study.sections.methodology)}
                  </div>
                </section>

                <section id="results">
                  <h2 className="text-2xl font-bold mb-4">RESULTS AND DISCUSSION</h2>
                  <div className="prose prose-red max-w-none text-justify text-black leading-5">
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
