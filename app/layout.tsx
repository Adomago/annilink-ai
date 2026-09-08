import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AniLink AI',
  description: 'AI-powered farm-to-market MVP built with Next.js and Supabase.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
