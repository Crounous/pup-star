'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AdminLoginPopup from '@/components/login/AdminLoginPopup'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Handle search logic here
      alert('Searching for: ' + searchQuery)
    }
  }

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
        <h1 className="text-4xl md:text-6xl font-bold tracking-[0.3em] mb-10 text-[#ffd600] font-montserrat">
          PUP ST<span className="text-[0.8em] align-top">★</span>R
        </h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8 w-full flex justify-center">
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
              type="submit"
              size="icon"
              className="bg-[#ffd600] text-[#850d0d] hover:bg-[#fff200] rounded-full w-10 h-10 ml-2.5 transition-colors duration-200"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </form>

        {/* All Studies Button */}
        <Link href="/studies">
          <Button className="bg-[#ffd600] text-[#850d0d] hover:bg-[#fff200] rounded-3xl px-8 py-3 text-xl font-bold transition-colors duration-200">
            All Studies <Play className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
}