'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Study } from '../../types/study'

export default function StudyDetailPage() {
  const params = useParams()
  const [study, setStudy] = useState<Study | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudy = async () => {
      const studyId = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!studyId) {
        setError('No study ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/research/${studyId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache'
        })
        
        if (!response.ok) {
          let errorMessage = 'Failed to fetch study';
          
          try {
            const errorData = await response.json()
            errorMessage = errorData?.error || errorMessage;
          } catch {
            errorMessage = await response.text() || errorMessage;
          }
          
          if (response.status === 404) {
            throw new Error('Study not found')
          } else {
            throw new Error(`${errorMessage}`)
          }
        }
        
        const studyData = await response.json()
        
        if (!studyData || typeof studyData !== 'object') {
          throw new Error('Invalid study data received')
        }
        
        // Transform backend data to match frontend expectations
        const transformedStudy: Study = {
          ...studyData,
          datePublished: studyData.date_published,
          pdfUrl: studyData.pdf_url,
          sections: {
            introduction: studyData.introduction,
            methodology: studyData.methodology,
            results: studyData.results_and_discussion
          }
        }
        
        setStudy(transformedStudy)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchStudy()
  }, [params.id])

  const renderParagraphs = (text: string) => {
    if (!text || text.trim() === '') {
      return <p className="mb-4 text-gray-500 italic">No content available</p>;
    }
    
    // Split text into paragraphs while preserving intentional line breaks
    return text
      .split('\n\n')  
      .map(paragraph => paragraph.split('\n').join(' '))  
      .filter(p => p.trim() !== '')  
      .map((paragraph, index) => (
        <p key={index} className="mb-4 text-justify">{paragraph}</p>
      ));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#880d0d] flex items-center justify-center">
        <div className="text-xl">Loading study...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-[#880d0d]">
        <header className="border-b border-[#880d0d]/20 pb-4 pt-6">
          <div className="max-w-7xl mx-auto px-8">
            <img src="/PUPStarLogoRed.png" alt="PUP Star Logo" className="h-15 w-auto" />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-8 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Study</h1>
          <p className="text-lg mb-6 text-red-600">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#880d0d] text-white rounded hover:bg-[#880d0d]/80 transition-colors"
            >
              Try Again
            </button>
            <Link 
              href="/studies" 
              className="inline-flex font-bold items-center px-4 py-2 text-lg text-[#880d0d] hover:text-[#880d0d]/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Studies
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!study) {
    return (
      <div className="min-h-screen bg-white text-[#880d0d]">
        <header className="border-b border-[#880d0d]/20 pb-4 pt-6">
          <div className="max-w-7xl mx-auto px-8">
            <img src="/PUPStarLogoRed.png" alt="PUP Star Logo" className="h-15 w-auto" />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-8 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Study not found</h1>
          <Link 
            href="/studies" 
            className="inline-flex font-bold items-center px-4 text-lg text-[#880d0d] hover:text-[#880d0d]/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Studies
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-[#880d0d]">
      <header className="border-b border-[#880d0d]/20 pb-4 pt-6">
        <div className="max-w-7xl mx-auto px-8">
          <img src="/PUPStarLogoRed.png" alt="PUP Star Logo" className="h-15 w-auto" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8">
        <div className="flex gap-8">
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
              {study.sections && (
                <>
                  {study.sections.introduction && (
                    <a href="#introduction" className="block px-4 rounded hover:bg-[#ffd600]/10 transition-colors">Introduction</a>
                  )}
                  {study.sections.methodology && (
                    <a href="#methodology" className="block px-4 rounded hover:bg-[#ffd600]/10 transition-colors">Methodology</a>
                  )}
                  {study.sections.results && (
                    <a href="#results" className="block px-4 rounded hover:bg-[#ffd600]/10 transition-colors">Results and Discussions</a>
                  )}
                </>
              )}
            </nav>
          </aside>

          <main className="flex-1 max-w-4xl">
            <div className="mb-8">
              <div className="items-start">
                <h1 className="text-3xl font-bold leading-8 mt-5 mb-1">{study.title || 'Untitled Study'}</h1>
              </div>
              <div className="text-right">
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
              <div className="space-y-1 text-black mt-4">
                <div className="text-justify">
                  <strong className="text-[#880d0d]">Authors:</strong> {
                    study.authors && Array.isArray(study.authors) 
                      ? study.authors.join(', ') 
                      : 'No authors listed'
                  }
                </div>
                <div className="text-justify">
                  <strong className="text-[#880d0d]">Date Published:</strong> {study.datePublished || 'Not specified'}
                </div>
                <div className="text-justify">
                  <strong className="text-[#880d0d]">Course:</strong> {study.course || 'Not specified'}
                </div>
              </div>
            </div>

            {study.sections ? (
              <div className="space-y-12">
                {study.sections.introduction && (
                  <section id="introduction" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-justify">INTRODUCTION</h2>
                    <div className="text-justify text-black leading-6">
                      {renderParagraphs(study.sections.introduction)}
                    </div>
                  </section>
                )}

                {study.sections.methodology && (
                  <section id="methodology" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-justify">METHODOLOGY</h2>
                    <div className="text-justify text-black leading-6">
                      {renderParagraphs(study.sections.methodology)}
                    </div>
                  </section>
                )}

                {study.sections.results && (
                  <section id="results" className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-justify">RESULTS AND DISCUSSION</h2>
                    <div className="text-justify text-black leading-6">
                      {renderParagraphs(study.sections.results)}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No content sections available for this study.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}