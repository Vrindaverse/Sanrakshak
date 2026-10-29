import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/contexts/useAuth'
import { EASE_OUT_SOFT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { Wordmark } from './BrandMark'
import { MagneticButton } from './MagneticButton'

const LINKS = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Process', href: '#process' },
  { label: 'Why it matters', href: '#why' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)

    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [menuOpen])

  const goToScan = () => {
    setMenuOpen(false)
    navigate('/scan/new')
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled
          ? 'border-b border-white/[0.07] bg-[oklch(0.095_0.01_250_/_0.72)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-5 md:h-[72px] md:px-8">
        <a href="#top" aria-label="Sanrakshak home" className="group flex items-center py-2" onClick={() => setMenuOpen(false)}>
          <Wordmark className="transition-opacity duration-300 group-hover:opacity-80" markClassName="h-7 w-7 md:h-8 md:w-8" />
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative flex min-h-11 items-center rounded-full px-3.5 text-[0.8rem] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute inset-x-3.5 bottom-1 h-px origin-left scale-x-0 bg-acid/70 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {token ? (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex min-h-11 items-center rounded-full px-3.5 text-[0.8rem] text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex min-h-11 items-center rounded-full px-3.5 text-[0.8rem] text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </button>
          )}
          <MagneticButton onClick={goToScan} className="h-11 px-4 text-xs">
            {token ? 'New scan' : 'Start scan'}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </MagneticButton>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-foreground md:hidden"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.07] bg-[oklch(0.09_0.01_250_/_0.97)] backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-5">
              {LINKS.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, delay: 0.06 + index * 0.045, ease: EASE_OUT_SOFT }}
                  className="flex min-h-12 items-center justify-between rounded-xl px-3 py-3 text-lg text-foreground/85 transition-colors hover:bg-white/[0.04] hover:text-foreground"
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.06 + LINKS.length * 0.045, ease: EASE_OUT_SOFT }}
                className="mt-3 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    navigate(token ? '/dashboard' : '/login')
                  }}
                  className="h-11 flex-1 rounded-full border border-white/12 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {token ? 'Dashboard' : 'Sign in'}
                </button>
                <MagneticButton onClick={goToScan} className="h-11 flex-1 px-4 text-xs">
                  {token ? 'New scan' : 'Start scan'}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </MagneticButton>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
