'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Study } from '../types/study'

const ITEMS_PER_PAGE = 4

export default function AllStudiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name')
  const [selectedCourses, setSelectedCourses] = useState({
    CS: true,
      IT: true
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const res = await fetch('/api/research', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!res.ok) {
          throw new Error(`Failed to fetch studies: ${res.status} ${res.statusText}`)
        }
        
        const data = await res.json()
        setStudies(data)
        console.log('Successfully fetched studies:', data.length)
        
      } catch (err: any) {
        console.error("Error fetching studies:", err)
        setError(err.message || 'Failed to load research data. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStudies()
  }, [])

  const currentYear = new Date().getFullYear()
  // Generate a list of years from current year down to 1900
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i)

  // Filter and sort studies based on current filters
  const filteredStudies = studies.filter(study => {
    const matchesCourse = (
      (selectedCourses.CS && study.course === 'Computer Science') ||
      (selectedCourses.IT && study.course === 'Information Technology')
    )
    
    const matchesYear = (
      (!yearFrom || study.year >= parseInt(yearFrom)) &&
      (!yearTo || study.year <= parseInt(yearTo))
    )

    const matchesSearch = searchQuery
      ? study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.abstract.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    return matchesCourse && matchesYear && matchesSearch
  })

  // Sort studies
  const sortedStudies = [...filteredStudies].sort((a, b) => {
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title)
    } else {
      return b.year - a.year
    }
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedStudies.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedStudies = sortedStudies.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on search
  }

  const handleCourseToggle = (course: 'CS' | 'IT') => {
    setSelectedCourses(prev => ({
      ...prev,
      [course]: !prev[course]
    }))
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)

      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if at the start
      if (currentPage <= 2) {
        end = 4
      }

      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 3
      }

      // Add ellipsis if needed
      if (start > 2) {
        pageNumbers.push('...')
      }

      // Add visible page numbers
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pageNumbers.push('...')
      }

      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  // Function to truncate abstract with word boundary
  const truncateAbstract = (abstract: string, maxLength: number = 300) => {
    if (abstract.length <= maxLength) return abstract
    
    // Find the last space before the maxLength to avoid cutting words
    const truncated = abstract.substring(0, maxLength)
    const lastSpaceIndex = truncated.lastIndexOf(' ')
    
    return lastSpaceIndex > 0 
      ? truncated.substring(0, lastSpaceIndex) + '...'
      : truncated + '...'
  }

  // Function to render justified text with paragraph breaks
  const renderJustifiedText = (text: string) => {
    // Split text into paragraphs while preserving intentional line breaks
    return text
      .split('\n\n')  
      .map(paragraph => paragraph.split('\n').join(' '))  
      .filter(p => p.trim() !== '')  
      .map((paragraph, index) => (
        <p key={index} className="mb-4 text-justify">{paragraph}</p>
      ));
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white font-montserrat text-[#880d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#880d0d] mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading studies...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white font-montserrat text-[#880d0d] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-4">Error loading studies</p>
          <p className="text-base text-[#880d0d]/70 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#880d0d] text-white px-6 py-2 rounded hover:bg-[#880d0d]/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white font-montserrat text-[#880d0d]">
      {/* Header */}
      <header className="border-b border-[#880d0d]/20 pb-4 pt-6">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between gap-8">
          <Link href="/">
              <img src="/PUPStarLogoRed.png" alt="PUP Star Logo" className="h-15 w-auto" />
          </Link>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="flex items-center border-2 border-[#880d0d] rounded-full px-6 h-[56px] bg-white w-full">
              <Search className="text-[#880d0d] w-6 h-6 mr-3" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none outline-none bg-transparent text-[#880d0d] text-xl placeholder:text-[#880d0d]/60 font-montserrat focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <button
                type="submit"
                className="ml-2.5 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200 text-[#880d0d] hover:bg-[#ffd600]/20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto flex flex-row gap-8 pt-6">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0 pr-8 border-r border-[#880d0d]">
          <div className="space-y-8">
            {/* Year of Publication */}
            <div>
              <div className="text-lg font-bold mb-2">Year of Publication</div>
              <div className="mb-2">
                <label className="block font-bold text-sm mb-1" htmlFor="year-from">From:</label>
                <div className="relative">
                  <select
                    id="year-from"
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    className="w-full border border-[#880d0d] rounded bg-white text-[#880d0d] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#ffd600] appearance-none"
                  >
                    <option value="">Any</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#880d0d] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-sm mb-1" htmlFor="year-to">To:</label>
                <div className="relative">
                  <select
                    id="year-to"
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    className="w-full border border-[#880d0d] rounded bg-white text-[#880d0d] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#ffd600] appearance-none"
                  >
                    <option value="">Any</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#880d0d] pointer-events-none" />
                </div>
              </div>
            </div>
            {/* Sort By */}
            <div>
              <div className="text-lg font-bold mb-2">Sort By</div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    checked={sortBy === 'name'}
                    onChange={() => setSortBy('name')}
                    className="accent-[#880d0d] w-4 h-4"
                  />
                  <span className="font-semibold text-[#880d0d]">Sort By Name</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    checked={sortBy === 'date'}
                    onChange={() => setSortBy('date')}
                    className="accent-[#880d0d] w-4 h-4"
                  />
                  <span className="font-semibold text-[#880d0d]">Sort By Date</span>
                </label>
              </div>
            </div>
            {/* Course */}
            <div>
              <div className="text-lg font-bold mb-2">Course</div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCourses.CS}
                    onChange={() => handleCourseToggle('CS')}
                    className="accent-[#880d0d] w-4 h-4"
                  />
                  <span className="font-semibold text-[#880d0d]">CS</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCourses.IT}
                    onChange={() => handleCourseToggle('IT')}
                    className="accent-[#880d0d] w-4 h-4"
                  />
                  <span className="font-semibold text-[#880d0d]">IT</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Studies List */}
        <main className="flex-1 pl-6">
  {filteredStudies.length === 0 ? (
    <div className="text-center py-12">
      <p className="text-xl font-semibold text-[#880d0d] mb-2">No studies found</p>
      <p className="text-[#880d0d]/70">Try adjusting your search criteria or filters.</p>
    </div>
  ) : (
    <div className="space-y-8">
      {paginatedStudies.map((study) => (
        // The key is now on the outer container div
        <div key={study.id} className="transition-all duration-200 hover:shadow-lg hover:bg-[#ffd600]/5 rounded-lg p-2 relative group">
          <div className="flex justify-between items-start">
            <div>
              {/* This Link now only wraps the title */}
              <Link href={`/studies/${study.id}`}>
                <div className="text-xl font-extrabold text-[#880d0d] mb-0.5 group-hover:text-[#880d0d]/80 cursor-pointer" style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}>
                  {study.title}
                  <span className="text-base font-semibold text-[#FFD600] ml-2 align-middle">| {study.course}, {study.year}</span>
                </div>
              </Link>
              <div className="text-sm text-[#880d0d] font-semibold mb-1" style={{ fontFamily: 'Montserrat, Arial, sans-serif' }}>
                {/* Defensive check for authors */}
                {(study.authors || []).join(", ")}
              </div>
            </div>
            {/* The PDF link is now a sibling, not a child */}
            {study.pdfUrl && (
              <a
                href={study.pdfUrl}
                download
                className="text-[#880d0d] font-bold text-base min-w-[60px] text-right select-none hover:text-[#FFD600] transition-colors"
                // No longer need stopPropagation if the links aren't nested
              >
                [PDF]
              </a>
            )}
          </div>
          <div className="relative pl-8 mt-1" style={{ textIndent: '-2rem', marginLeft: '2rem' }}>
            <div className="text-[#880d0d] text-base leading-relaxed">
              {/* You can make the abstract clickable as well */}
              <Link href={`/studies/${study.id}`}>
                <div className="cursor-pointer">
                  {renderJustifiedText(truncateAbstract(study.abstract || ''))}
                </div>
              </Link>
            </div>
            {(study.abstract || '').length > 300 && (
              <div className="absolute bottom-0 right-0 w-16 h-6 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />
            )}
          </div>
        </div>
      ))}
    </div>
  )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-10 space-x-2 text-[#880d0d] text-lg select-none">
              <button 
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#ffd600]/20 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              
              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={`ellipsis-${index}`} className="mx-1">...</span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum as number)}
                    className={`w-8 h-8 rounded border border-[#880d0d] font-bold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#ffd600] text-[#880d0d]'
                        : 'bg-white text-[#880d0d] hover:bg-[#ffd600]/20'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              ))}

              <button 
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#ffd600]/20 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}