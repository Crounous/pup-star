export interface Study {
  id: string
  title: string
  course: string
  year: number
  authors: string[]
  abstract: string
  pdfUrl?: string
  datePublished?: string
  sections?: {
    introduction: string
    methodology: string
    results: string
  }
  storageMethod?: 'local' | 'supabase';
}

export interface StudiesData {
  [key: string]: Study
} 