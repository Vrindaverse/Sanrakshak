import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

const INTERACTIVE = 'a, button, input, textarea, select, [data-cursor="hover"]'

function isInteractive(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE))
}

export function ChromeCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const reduceMotion = useReducedMotion()

  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)
  const ringX = useSpring(dotX, { stiffness: 420, damping: 34, mass: 0.45 })
  const ringY = useSpring(dotY, { stiffness: 420, damping: 34, mass: 0.45 })

  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)')
    const update = () => setEnabled(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!enabled || reduceMotion) return

    document.body.classList.add('chrome-cursor-active')

    function onPointerMove(event: PointerEvent) {
      dotX.set(event.clientX)
      dotY.set(event.clientY)
    }

    function onPointerOver(event: PointerEvent) {
      setHovered(isInteractive(event.target))
    }

    function onPointerOut(event: PointerEvent) {
      setHovered(isInteractive(event.relatedTarget))
    }

    function onPointerDown() {
      setPressed(true)
    }

    function onPointerUp() {
      setPressed(false)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerover', onPointerOver, { passive: true })
    window.addEventListener('pointerout', onPointerOut, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('pointerup', onPointerUp, { passive: true })

    return () => {
      document.body.classList.remove('chrome-cursor-active')
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerover', onPointerOver)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [enabled, reduceMotion, dotX, dotY])

  if (!enabled || reduceMotion) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[120] select-none">
      <motion.div
        className="cursor-dot"
        style={{ x: dotX, y: dotY }}
        animate={{ scale: pressed ? 0.6 : hovered ? 1.6 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />
      <motion.div
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: pressed ? 0.75 : hovered ? 1.55 : 1,
          borderColor: hovered ? 'oklch(0.9 0.18 130 / 0.9)' : 'oklch(0.95 0.01 240 / 0.55)',
          opacity: hovered ? 1 : 0.7,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      />
    </div>
  )
}
