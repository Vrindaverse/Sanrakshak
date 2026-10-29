import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { animate } from 'animejs'
import { EASE_IN_OUT } from '@/lib/motion'
import { BrandMark } from './BrandMark'

const STORAGE_KEY = 'sanrakshak:intro-seen'

export function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

interface PreloaderProps {
  onExitStart?: () => void
}

export function Preloader({ onExitStart }: PreloaderProps) {
  const [show, setShow] = useState(shouldPlayIntro)
  const progressRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const onExitStartRef = useRef(onExitStart)

  useEffect(() => {
    onExitStartRef.current = onExitStart
  }, [onExitStart])

  useEffect(() => {
    if (!show) return

    const counter = { value: 0 }
    const animation = animate(counter, {
      value: 100,
      duration: 1450,
      ease: 'outCubic',
      onUpdate: () => {
        const value = Math.round(counter.value)
        if (progressRef.current) progressRef.current.textContent = String(value).padStart(3, '0')
        if (barRef.current) barRef.current.style.width = `${value}%`
      },
    })

    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* ignore storage failures */
      }
      onExitStartRef.current?.()
      setShow(false)
    }, 1900)

    return () => {
      animation.pause()
      window.clearTimeout(timer)
    }
  }, [show])

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="sanrakshak-preloader"
          role="status"
          aria-label="Loading Sanrakshak"
          className="fixed inset-0 z-[200] flex flex-col justify-between overflow-hidden bg-[oklch(0.075_0.008_250)] px-6 py-8 md:px-10 md:py-10"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: EASE_IN_OUT }}
        >
          <div className="absolute inset-0 grid-lines opacity-50" />
          <div className="hero-aurora opacity-60" />
          <div className="absolute inset-x-0 top-0 h-px animate-scan-line bg-acid/30" />

          <motion.div
            className="relative flex items-center justify-between"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div className="flex items-center gap-3">
              <BrandMark className="h-7 w-7" />
              <span className="type-mono text-[0.7rem] uppercase tracking-[0.3em] text-foreground/80">Sanrakshak</span>
            </div>
            <span className="type-mono text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground">v1.0 / secure session</span>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-3xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow mb-4">
              <span className="status-dot" />
              Calibrating perimeter
            </p>
            <div className="flex items-end justify-between gap-6">
              <p className="type-display text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.86] tracking-[-0.03em]">
                See the <em className="chrome-text">unseen.</em>
              </p>
              <span
                ref={progressRef}
                aria-hidden="true"
                className="type-mono mb-2 text-2xl tabular-nums text-muted-foreground md:text-4xl"
              >
                000
              </span>
            </div>
            <div className="mt-8 h-px w-full overflow-hidden bg-white/10">
              <div
                ref={barRef}
                className="h-full w-0 bg-acid shadow-[0_0_18px_oklch(0.9_0.18_130_/_0.8)]"
              />
            </div>
          </motion.div>

          <motion.div
            className="relative flex items-end justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="type-mono max-w-[16rem] text-[0.62rem] leading-relaxed uppercase tracking-[0.2em] text-muted-foreground/70">
              Map the surface. Read the signal. Fix what matters.
            </span>
            <span className="type-mono hidden text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground/70 md:block">
              Protect / Analyze / Secure
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
