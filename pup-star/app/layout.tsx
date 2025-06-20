import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const montserrat = Inter ({ 
  subsets: ['latin'],
  variable: '--font-montserrat'
})

export const metadata: Metadata = {
  title: 'PUP STAR',
  description: 'PUP Research Portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}

