import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TiltCardProps {
  children: ReactNode
  className?: string
  intensity?: number
  glare?: boolean
}

export function TiltCard({ children, className, intensity = 7, glare = true }: TiltCardProps) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(40)

  const rotateX = useSpring(useTransform(y, [-1, 1], [intensity, -intensity]), {
    stiffness: 180,
    damping: 22,
    mass: 0.5,
  })
  const rotateY = useSpring(useTransform(x, [-1, 1], [-intensity, intensity]), {
    stiffness: 180,
    damping: 22,
    mass: 0.5,
  })
  const background = useMotionTemplate`radial-gradient(340px circle at ${glareX}% ${glareY}%, oklch(0.92 0.08 150 / 0.1), transparent 68%)`

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    x.set(px * 2 - 1)
    y.set(py * 2 - 1)
    glareX.set(px * 100)
    glareY.set(py * 100)
  }

  function onPointerLeave() {
    x.set(0)
    y.set(0)
    glareX.set(50)
    glareY.set(40)
  }

  return (
    <motion.div
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className={cn(
        'chrome-border group relative h-full overflow-hidden rounded-2xl bg-card/55 will-change-transform',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,oklch(1_0_0_/_0.045),transparent_45%)]" />
      {glare ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background }}
        />
      ) : null}
      <div className="relative h-full">{children}</div>
    </motion.div>
  )
}
