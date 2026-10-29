import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Counter } from './Counter'

type Tone = 'cmd' | 'muted' | 'info' | 'warn' | 'danger' | 'ai' | 'good'

const LINES: { prompt: string; text: string; tone: Tone }[] = [
  { prompt: '$', text: 'sanrakshak scan --target example.com', tone: 'cmd' },
  { prompt: '·', text: 'target resolved · 93.184.216.34', tone: 'muted' },
  { prompt: '>', text: 'nmap · mapping 1,000 ports & services', tone: 'info' },
  { prompt: '>', text: 'nikto · checking server configuration', tone: 'info' },
  { prompt: '>', text: 'zap · probing web application surface', tone: 'info' },
  { prompt: '!', text: '2 exposed services · 4 missing headers', tone: 'warn' },
  { prompt: '!', text: '1 critical · 2 high severity findings', tone: 'danger' },
  { prompt: '>', text: 'gemini · translating findings to plain English', tone: 'ai' },
  { prompt: '✓', text: 'report ready · score 62 / 100', tone: 'good' },
]

const TONE: Record<Tone, string> = {
  cmd: 'text-foreground',
  muted: 'text-muted-foreground',
  info: 'text-ice',
  warn: 'text-warning',
  danger: 'text-destructive',
  ai: 'text-acid',
  good: 'text-acid',
}

export function ScanConsole() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-16%' })
  const reduceMotion = useReducedMotion()
  const [visibleCount, setVisibleCount] = useState(1)
  const [done, setDone] = useState(false)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (!inView) return

    if (reduceMotion) {
      setVisibleCount(LINES.length)
      setDone(true)
      return
    }

    let index = 1
    const interval = window.setInterval(() => {
      index += 1
      setVisibleCount(Math.min(index, LINES.length))
      if (index >= LINES.length) {
        window.clearInterval(interval)
        setDone(true)
      }
    }, 560)

    return () => window.clearInterval(interval)
  }, [inView, run, reduceMotion])

  const visibleLines = LINES.slice(0, visibleCount)

  return (
    <div ref={ref} className="scan-console chrome-border relative overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.66_0.2_25_/_0.9)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.82_0.15_80_/_0.9)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-acid/80" />
          </div>
          <span className="type-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
            sanrakshak — demo session
          </span>
        </div>
        <span className="type-mono rounded-full border border-white/10 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground/75">
          example.com
        </span>
      </div>

      <div className="relative p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-scan-line h-px w-full bg-acid/15" />
        </div>
        <div className="relative min-h-[280px] space-y-2.5 font-mono text-[0.7rem] leading-relaxed sm:text-xs">
          {visibleLines.map((line, index) => {
            const isLast = index === visibleLines.length - 1
            return (
              <div key={`${run}-${line.text}`} className="terminal-line flex items-start gap-2.5">
                <span className="w-3 shrink-0 text-right text-muted-foreground/70">{line.prompt}</span>
                <span className={cn(TONE[line.tone], 'min-w-0')}>
                  {line.text}
                  {isLast && !done ? (
                    <span
                      className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 bg-acid/80"
                      style={{ animation: 'blink 1s steps(1) infinite' }}
                    />
                  ) : null}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[0.07] pt-4">
          {[
            { label: 'Engines', to: 3 },
            { label: 'Findings', to: 7 },
            { label: 'Jargon', to: 0 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <p className="type-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground/75">{stat.label}</p>
              <p className={cn('type-mono mt-1 text-lg tabular-nums', stat.label === 'Jargon' ? 'text-acid' : 'text-foreground')}>
                <Counter key={`${run}-${stat.label}`} to={stat.to} />
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={cn('status-dot', done ? '' : 'opacity-50')} />
          <span className="type-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
            {done ? 'session complete' : 'session running'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisibleCount(1)
            setDone(false)
            setRun((value) => value + 1)
          }}
          className="type-mono inline-flex items-center gap-1.5 rounded-full border border-white/10 h-11 px-3 text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground lg:h-8 lg:px-2.5 lg:text-[0.58rem] transition-colors hover:border-white/25 hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" />
          Replay
        </button>
      </div>
    </div>
  )
}
