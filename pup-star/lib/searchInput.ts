'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabaseClient'

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const cache = useRef<Record<string, any[]>>({})
  const router = useRouter()

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const query = searchQuery.trim().toLowerCase()
    
    // Check cache first
    if (cache.current[query]) {
      setSearchResults(cache.current[query])
      return
    }

    // Fetch from Supabase
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('studies')
          .select('id, title, course, year')
          .or(`title.ilike.%${query}%, abstract.ilike.%${query}%`)
          .limit(10)

        if (error) throw error
        
        cache.current[query] = data || []
        setSearchResults(data || [])
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }

    const handler = setTimeout(fetchData, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const handleResultClick = (studyId: string) => {
    router.push(`/studies/${studyId}`)
    setSearchQuery('')
  }

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    handleResultClick
  }
}