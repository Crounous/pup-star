'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AdminLoginPopup from '@/components/login/AdminLoginPopup'
import { useSearch } from '@/lib/searchInput'

export default function HomePage() {
  const router = useRouter()
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    handleResultClick
  } = useSearch()

  const showResults = searchQuery.trim() !== '' && (searchResults.length > 0 || loading)

  return (
    <div className="min-h-screen bg-[#850d0d] text-[#ffd600] font-montserrat">
      {/* Staff Login*/}
      <div className="absolute top-8 right-8">
        <AdminLoginPopup 
          trigger={
            <button className="text-[#ffd600] text-lg hover:underline">
              Staff Login
            </button>
          }
        />
      </div>

      {/* Main Container */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <img src="../PUPStarLogoYellow.png" alt="PUP STAR" className="w-auto h-auto mb-8" />

        {/* Search Bar */}
        <div className="mb-8 w-full flex justify-center relative">
          <div className="flex items-center border-3 border-[#ffd600] rounded-full px-5 w-full max-w-2xl h-[60px] bg-transparent">
            <Search className="text-[#ffd600] w-7 h-7 mr-4" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-none outline-none bg-transparent text-[#ffd600] text-2xl placeholder:text-[#ffd600]/70 font-montserrat focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              size="icon"
              className="rounded-full"
            ><img src="../homepage/EnterSearchButton.png" alt="Search" className="w-auto h-auto" />
            </Button>
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full max-w-2xl bg-white rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-10">
              {loading ? (
                <div className="p-4 text-center text-[#850d0d]">Loading...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((study) => (
                  <button
                    key={study.id}
                    onClick={() => handleResultClick(study.id)}
                    className="w-full text-left p-4 hover:bg-[#ffd600]/10 transition-colors border-b border-[#850d0d]/10 last:border-b-0"
                  >
                    <div className="text-[#850d0d] font-bold mb-1">{study.title}</div>
                    <div className="text-[#850d0d]/70 text-sm">
                      {study.course} • {study.year}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-[#850d0d]">No studies found matching your search.</div>
              )}
            </div>
          )}
        </div>

        {/* All Studies Button */}
        <Link href="/studies">
          <Button className="bg-[#ffd600] text-[#850d0d] hover:bg-[#fff200] rounded-3xl px-8 py-5 text-xl font-bold transition-colors duration-200">
            All Studies <img src="../homepage/Arrow.png" alt="Arrow Right" className="inline-block w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}