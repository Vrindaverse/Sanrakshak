import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Wordmark } from '@/components/landing/BrandMark'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden="true" className="hero-aurora opacity-50" />
      <div aria-hidden="true" className="absolute inset-0 grid-lines opacity-40" />

      <Link to="/" className="relative mb-8 inline-flex items-center py-2" aria-label="Sanrakshak home">
        <Wordmark markClassName="h-8 w-8" />
      </Link>

      <div className="relative w-full max-w-md">{children}</div>

      <p className="type-mono relative mt-8 text-[0.56rem] uppercase tracking-[0.2em] text-muted-foreground/75">
        Protect. Analyze. Secure.
      </p>
      <Link
        to="/"
        className="relative mt-4 inline-flex min-h-11 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to home
      </Link>
    </main>
  )
}
