import { useEffect, useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { animate } from 'animejs'
import { cn } from '@/lib/utils'

interface CounterProps {
  to: number
  pad?: number
  duration?: number
  className?: string
}

function format(value: number, pad: number) {
  return String(Math.round(value)).padStart(pad, '0')
}

export function Counter({ to, pad = 2, duration = 1100, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!inView || !ref.current) return
    if (reduceMotion) {
      ref.current.textContent = format(to, pad)
      return
    }

    const counter = { value: 0 }
    const animation = animate(counter, {
      value: to,
      duration,
      ease: 'outCubic',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = format(counter.value, pad)
      },
    })
    return () => {
      animation.pause()
    }
  }, [inView, to, pad, duration, reduceMotion])

  return (
    <span ref={ref} className={cn('tabular-nums', className)} aria-label={String(to)}>
      {format(0, pad)}
    </span>
  )
}
