import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'solid' | 'ghost' | 'quiet'

const base =
  'group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full text-sm font-medium tracking-[-0.01em] transition-colors duration-300 will-change-transform'

const variants: Record<Variant, string> = {
  solid:
    'bg-primary text-primary-foreground shadow-[0_0_46px_-10px_oklch(0.9_0.18_130_/_0.55)] hover:bg-[oklch(0.94_0.16_132)]',
  ghost:
    'border border-white/14 bg-white/[0.025] text-foreground hover:border-white/25 hover:bg-white/[0.06]',
  quiet:
    'text-muted-foreground hover:text-foreground',
}

function useMagnetic(strength = 0.22) {
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (reduceMotion || event.pointerType === 'touch') return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left - rect.width / 2) * strength)
    y.set((event.clientY - rect.top - rect.height / 2) * strength)
  }

  function onPointerLeave() {
    x.set(0)
    y.set(0)
  }

  return { x: springX, y: springY, onPointerMove, onPointerLeave }
}

interface MagneticLinkProps {
  href: string
  children: ReactNode
  variant?: Variant
  className?: string
  onClick?: () => void
  ariaLabel?: string
}

export function MagneticLink({
  href,
  children,
  variant = 'solid',
  className,
  onClick,
  ariaLabel,
}: MagneticLinkProps) {
  const magnetic = useMagnetic()

  return (
    <motion.a
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ x: magnetic.x, y: magnetic.y }}
      onPointerMove={magnetic.onPointerMove}
      onPointerLeave={magnetic.onPointerLeave}
      className={cn(base, variants[variant], 'h-12 px-6', className)}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_25%,oklch(1_0_0_/_0.22)_50%,transparent_75%)] transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative flex items-center gap-2.5">{children}</span>
    </motion.a>
  )
}

interface MagneticButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: Variant
  className?: string
  disabled?: boolean
  ariaLabel?: string
}

export function MagneticButton({
  children,
  onClick,
  type = 'button',
  variant = 'solid',
  className,
  disabled,
  ariaLabel,
}: MagneticButtonProps) {
  const magnetic = useMagnetic()

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{ x: magnetic.x, y: magnetic.y }}
      onPointerMove={magnetic.onPointerMove}
      onPointerLeave={magnetic.onPointerLeave}
      className={cn(base, variants[variant], 'h-12 px-6', className)}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_25%,oklch(1_0_0_/_0.22)_50%,transparent_75%)] transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative flex items-center gap-2.5">{children}</span>
    </motion.button>
  )
}
