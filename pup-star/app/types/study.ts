export interface Study {
  id: string
  title: string
  subtitle: string
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
}

export interface StudiesData {
  [key: string]: Study
} 