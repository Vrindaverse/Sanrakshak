import { useId } from 'react'
import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  const gradientId = `sanrakshak-chrome-${id}`
  const glowId = `sanrakshak-glow-${id}`

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn('h-8 w-8 shrink-0', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(0.99 0.004 240)" />
          <stop offset="0.34" stopColor="oklch(0.78 0.02 225)" />
          <stop offset="0.56" stopColor="oklch(0.44 0.02 240)" />
          <stop offset="0.78" stopColor="oklch(0.92 0.06 150)" />
          <stop offset="1" stopColor="oklch(0.98 0.004 240)" />
        </linearGradient>
        <radialGradient id={glowId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(10)">
          <stop stopColor="oklch(0.9 0.18 130)" stopOpacity="0.9" />
          <stop offset="1" stopColor="oklch(0.9 0.18 130)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M20 3.2 33.4 8.3v10.1c0 8.1-5.4 14-13.4 17.5C12 32.4 6.6 26.5 6.6 18.4V8.3L20 3.2Z"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="18.5" r="6.2" stroke={`url(#${gradientId})`} strokeWidth="1.2" opacity="0.85" />
      <circle cx="20" cy="18.5" r="2.1" fill="oklch(0.9 0.18 130)" />
      <circle cx="20" cy="18.5" r="5.4" fill={`url(#${glowId})`} opacity="0.28" />
      <path d="M20 7.1v3.2M20 26.7v3.2M8.6 18.5h3.2M28.2 18.5h3.2" stroke={`url(#${gradientId})`} strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

export function Wordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <BrandMark className={markClassName} />
      <span className="type-mono text-[0.82rem] font-medium uppercase tracking-[0.22em] text-foreground">
        Sanrakshak
      </span>
    </span>
  )
}
