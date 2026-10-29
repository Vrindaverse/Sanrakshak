import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

export function ThreatGlobe({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    let frame = 0
    let cleanup = () => {}

    const start = async () => {
      try {
        await document.fonts?.ready
      } catch {
        /* font loading is best-effort */
      }
      if (disposed) return

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const compact = window.matchMedia('(max-width: 767px)').matches

      let renderer: THREE.WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        })
      } catch {
        setFailed(true)
        return
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.5 : 2))
      renderer.setClearColor(0x000000, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'
      renderer.domElement.setAttribute('aria-hidden', 'true')
      container.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      camera.position.set(0, 0, 4.6)

      const group = new THREE.Group()
      scene.add(group)

      const keyLight = new THREE.PointLight(0xb8ff4f, 12, 16, 2)
      keyLight.position.set(3, 2.6, 3.4)
      scene.add(keyLight)

      const fillLight = new THREE.PointLight(0xb9d7ff, 8, 16, 2)
      fillLight.position.set(-3.2, -1.4, 2.4)
      scene.add(fillLight)

      const sphereGeometry = new THREE.SphereGeometry(1.35, compact ? 48 : 64, compact ? 48 : 64)
      const sphereMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0a1220,
        metalness: 0.55,
        roughness: 0.32,
        transparent: true,
        opacity: 0.42,
        clearcoat: 1,
        clearcoatRoughness: 0.14,
      })
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      group.add(sphere)

      const wireGeometry = new THREE.SphereGeometry(1.37, compact ? 24 : 32, compact ? 24 : 32)
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0xb8ff4f,
        wireframe: true,
        transparent: true,
        opacity: 0.11,
        depthWrite: false,
      })
      const wire = new THREE.Mesh(wireGeometry, wireMaterial)
      group.add(wire)

      const ringGeometry = new THREE.TorusGeometry(1.7, 0.005, 8, compact ? 140 : 220)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xb9d7ff,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.PI / 2
      group.add(ring)

      const markerGeometry = new THREE.SphereGeometry(0.026, 10, 10)
      const markerMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.95,
        toneMapped: false,
      })
      const markerCount = compact ? 36 : 48
      const markers = new THREE.InstancedMesh(markerGeometry, markerMaterial, markerCount)
      const palette = [0xff4d4d, 0xffb020, 0xb8ff4f, 0xb9d7ff].map((color) => new THREE.Color(color))
      const random = seededRandom(7)
      const dummy = new THREE.Object3D()

      for (let i = 0; i < markerCount; i += 1) {
        const phi = Math.acos(2 * random() - 1)
        const theta = random() * Math.PI * 2
        const radius = 1.39
        dummy.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        )
        dummy.scale.setScalar(0.75 + random() * 0.7)
        dummy.updateMatrix()
        markers.setMatrixAt(i, dummy.matrix)
        markers.setColorAt(i, palette[i % palette.length])
      }
      markers.instanceMatrix.needsUpdate = true
      if (markers.instanceColor) markers.instanceColor.needsUpdate = true
      group.add(markers)

      const state = {
        rotX: 0.12,
        rotY: 0,
        targetX: 0.12,
        targetY: 0,
        spinX: 0,
        spinY: 0,
        dragging: false,
        lastX: 0,
        lastY: 0,
        hoverX: 0,
        hoverY: 0,
      }

      let running = false
      let elapsed = 0
      let animateFrame: (() => void) | null = null

      function applyRotation() {
        state.targetX = clamp(state.targetX, -1.15, 1.15)
        state.rotX = clamp(state.rotX, -1.15, 1.15)
        group.rotation.set(state.rotX, state.rotY, 0)
      }

      function renderFrame() {
        applyRotation()
        if (!reduceMotion) {
          ring.rotation.z = elapsed * 0.35
          wire.rotation.y = elapsed * 0.06
        }
        camera.position.x = reduceMotion ? 0 : state.hoverX * 0.22
        camera.position.y = reduceMotion ? 0 : -state.hoverY * 0.14
        camera.lookAt(0, 0, 0)
        renderer.render(scene, camera)
      }

      function onPointerDown(event: PointerEvent) {
        state.dragging = true
        state.lastX = event.clientX
        state.lastY = event.clientY
        state.spinX = 0
        state.spinY = 0
        container!.setPointerCapture(event.pointerId)
      }

      function onPointerMove(event: PointerEvent) {
        const rect = container!.getBoundingClientRect()
        state.hoverX = ((event.clientX - rect.left) / rect.width) * 2 - 1
        state.hoverY = ((event.clientY - rect.top) / rect.height) * 2 - 1

        if (!state.dragging) return

        const dx = event.clientX - state.lastX
        const dy = event.clientY - state.lastY
        state.lastX = event.clientX
        state.lastY = event.clientY

        if (reduceMotion) {
          state.rotY += dx * 0.007
          state.rotX += dy * 0.007
          state.targetY = state.rotY
          state.targetX = state.rotX
          renderFrame()
          return
        }

        state.targetY += dx * 0.007
        state.targetX += dy * 0.007
        state.spinY = dx * 0.007
        state.spinX = dy * 0.007
      }

      function onPointerUp(event: PointerEvent) {
        state.dragging = false
        try {
          container!.releasePointerCapture(event.pointerId)
        } catch {
          /* pointer may already be released */
        }
      }

      function onPointerLeave() {
        if (!state.dragging) {
          state.hoverX = 0
          state.hoverY = 0
        }
      }

      function onKeyDown(event: KeyboardEvent) {
        const step = 0.18
        let dY = 0
        let dX = 0
        if (event.key === 'ArrowLeft') dY = -step
        else if (event.key === 'ArrowRight') dY = step
        else if (event.key === 'ArrowUp') dX = -step * 0.8
        else if (event.key === 'ArrowDown') dX = step * 0.8
        else return

        event.preventDefault()

        if (reduceMotion) {
          state.rotY += dY
          state.rotX += dX
          state.targetY = state.rotY
          state.targetX = state.rotX
          renderFrame()
        } else {
          state.targetY += dY
          state.targetX += dX
          if (!running) syncLoop()
        }
      }

      function resize() {
        const width = container!.clientWidth || 400
        const height = container!.clientHeight || 400
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
        if (reduceMotion) renderFrame()
      }

      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(container)
      resize()

      animateFrame = () => {
        if (!running) return
        frame = requestAnimationFrame(animateFrame!)

        const delta = Math.min(clock.getDelta(), 0.05)
        elapsed += delta

        if (!state.dragging) {
          state.targetY += state.spinY + 0.16 * delta
          state.targetX += state.spinX
          state.spinX *= 0.94
          state.spinY *= 0.94
        }

        state.rotY += (state.targetY - state.rotY) * 0.12
        state.rotX += (state.targetX - state.rotX) * 0.12
        renderFrame()
      }

      let visible = true
      const clock = new THREE.Clock(false)

      function syncLoop() {
        const shouldRun = visible && !document.hidden && !reduceMotion
        if (shouldRun && !running) {
          running = true
          clock.start()
          frame = requestAnimationFrame(animateFrame!)
        } else if (!shouldRun && running) {
          running = false
          clock.stop()
          cancelAnimationFrame(frame)
        }
      }

      function onVisibilityChange() {
        syncLoop()
      }

      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting
          syncLoop()
        },
        { threshold: 0 }
      )
      intersectionObserver.observe(container)

      container.addEventListener('pointerdown', onPointerDown)
      container.addEventListener('pointermove', onPointerMove)
      container.addEventListener('pointerup', onPointerUp)
      container.addEventListener('pointercancel', onPointerUp)
      container.addEventListener('pointerleave', onPointerLeave)
      container.addEventListener('keydown', onKeyDown)
      document.addEventListener('visibilitychange', onVisibilityChange)

      if (reduceMotion) {
        renderFrame()
      } else {
        syncLoop()
      }

      cleanup = () => {
        running = false
        cancelAnimationFrame(frame)
        container.removeEventListener('pointerdown', onPointerDown)
        container.removeEventListener('pointermove', onPointerMove)
        container.removeEventListener('pointerup', onPointerUp)
        container.removeEventListener('pointercancel', onPointerUp)
        container.removeEventListener('pointerleave', onPointerLeave)
        container.removeEventListener('keydown', onKeyDown)
        document.removeEventListener('visibilitychange', onVisibilityChange)
        resizeObserver.disconnect()
        intersectionObserver.disconnect()
        scene.traverse((object) => {
          const mesh = object as THREE.Mesh
          if (mesh.geometry) mesh.geometry.dispose()
          const material = mesh.material
          if (Array.isArray(material)) {
            material.forEach((item) => item.dispose())
          } else if (material) {
            material.dispose()
          }
        })
        renderer.dispose()
        renderer.domElement.remove()
      }
    }

    start()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      cleanup()
    }
  }, [])

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        role="img"
        aria-label="Rotatable 3D globe of simulated threat locations. Drag or use the arrow keys to rotate."
        tabIndex={0}
        className="h-full w-full cursor-grab touch-pan-y rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-acid/45 active:cursor-grabbing"
      />
      {failed ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="chrome-orb h-2/3 w-2/3 opacity-60" />
        </div>
      ) : null}
    </div>
  )
}
