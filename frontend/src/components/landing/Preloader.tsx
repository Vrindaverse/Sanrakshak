import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { animate } from 'animejs'
import { BrandMark } from './BrandMark'

const STORAGE_KEY = 'sanrakshak:intro-seen'

function shouldPlay() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

export function Preloader() {
  const [show, setShow] = useState(shouldPlay)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!show) return

    const counter = { value: 0 }
    const animation = animate(counter, {
      value: 100,
      duration: 1450,
      ease: 'outCubic',
      onUpdate: () => {
        setProgress(Math.round(counter.value))
      },
    })

    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* ignore storage failures */
      }
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
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="absolute inset-0 grid-lines opacity-50" />
          <div className="hero-aurora opacity-60" />
          <div className="absolute inset-x-0 top-0 h-px animate-scan-line bg-acid/30" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandMark className="h-7 w-7" />
              <span className="type-mono text-[0.7rem] uppercase tracking-[0.3em] text-foreground/80">Sanrakshak</span>
            </div>
            <span className="type-mono text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground">v1.0 / secure session</span>
          </div>

          <div className="relative mx-auto w-full max-w-3xl">
            <p className="eyebrow mb-4">
              <span className="status-dot" />
              Calibrating perimeter
            </p>
            <div className="flex items-end justify-between gap-6">
              <p className="type-display text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.86] tracking-[-0.03em]">
                See the <em className="chrome-text">unseen.</em>
              </p>
              <span className="type-mono mb-2 text-2xl tabular-nums text-muted-foreground md:text-4xl">
                {String(progress).padStart(3, '0')}
              </span>
            </div>
            <div className="mt-8 h-px w-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-acid shadow-[0_0_18px_oklch(0.9_0.18_130_/_0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="relative flex items-end justify-between">
            <span className="type-mono max-w-[16rem] text-[0.62rem] leading-relaxed uppercase tracking-[0.2em] text-muted-foreground/70">
              Map the surface. Read the signal. Fix what matters.
            </span>
            <span className="type-mono hidden text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground/70 md:block">
              Protect / Analyze / Secure
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
