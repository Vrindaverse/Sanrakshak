import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function ThreatGlobe({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let disposed = false
    let frame = 0
    let cleanup = () => {}

    const start = async () => {
      try { await document.fonts?.ready } catch { /* */ }
      if (disposed) return
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      let renderer: THREE.WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      } catch {
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'
      container.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
      camera.position.set(0, 0, 4.6)

      const group = new THREE.Group()
      scene.add(group)

      const sphereGeo = new THREE.SphereGeometry(1.35, 64, 64)
      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a1220,
        metalness: 0.6,
        roughness: 0.35,
        transparent: true,
        opacity: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      group.add(sphere)

      const wireGeo = new THREE.SphereGeometry(1.36, 32, 32)
      const wireMat = new THREE.MeshBasicMaterial({ color: 0xb8ff4f, wireframe: true, transparent: true, opacity: 0.12 })
      const wire = new THREE.Mesh(wireGeo, wireMat)
      group.add(wire)

      const ringGeo = new THREE.TorusGeometry(1.7, 0.005, 8, 220)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xb9d7ff, transparent: true, opacity: 0.5 })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      group.add(ring)

      // threat markers
      const random = (s: number) => {
        let v = s
        return () => { v = (v * 9301 + 49297) % 233280; return v / 233280 }
      }
      const r = random(7)
      const markerMat = (color: number) => new THREE.MeshBasicMaterial({ color, transparent: true })
      const colors = [0xff4d4d, 0xffb020, 0xb8ff4f, 0xb9d7ff]
      for (let i = 0; i < 48; i += 1) {
        const phi = Math.acos(2 * r() - 1)
        const theta = r() * Math.PI * 2
        const radius = 1.38
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.sin(theta)
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 12), markerMat(colors[i % colors.length]))
        m.position.set(x, y, z)
        group.add(m)
      }

      let pointerX = 0, pointerY = 0
      let dragging = false, lastX = 0, lastY = 0
      let velX = 0, velY = 0

      function onPointerDown(e: PointerEvent) {
        dragging = true
        lastX = e.clientX; lastY = e.clientY
        velX = 0; velY = 0
        container!.setPointerCapture(e.pointerId)
      }
      function onPointerMove(e: PointerEvent) {
        if (dragging) {
          const dx = e.clientX - lastX
          const dy = e.clientY - lastY
          velX = dx * 0.005
          velY = dy * 0.005
          group.rotation.y += velX
          group.rotation.x += velY
          lastX = e.clientX; lastY = e.clientY
        } else {
          pointerX = (e.clientX / window.innerWidth) * 2 - 1
          pointerY = (e.clientY / window.innerHeight) * 2 - 1
        }
      }
      function onPointerUp(e: PointerEvent) {
        dragging = false
        try { container!.releasePointerCapture(e.pointerId) } catch { /* */ }
      }

      function resize() {
        const w = container!.clientWidth || 400
        const h = container!.clientHeight || 400
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h, false)
      }
      const ro = new ResizeObserver(resize)
      ro.observe(container)
      resize()

      container.addEventListener('pointerdown', onPointerDown)
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)

      const clock = new THREE.Clock()
      function animate() {
        frame = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        if (!dragging) {
          group.rotation.y += 0.003 + velX
          group.rotation.x += velY
          velX *= 0.95
          velY *= 0.95
          group.rotation.x += (pointerY * 0.1 - group.rotation.x) * 0.02
        }
        ring.rotation.z = t * 0.4
        wire.rotation.y = t * 0.08
        renderer.render(scene, camera)
      }
      if (reduceMotion) {
        renderer.render(scene, camera)
      } else {
        animate()
      }

      cleanup = () => {
        cancelAnimationFrame(frame)
        ro.disconnect()
        container.removeEventListener('pointerdown', onPointerDown)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
        scene.traverse((o) => {
          const m = o as THREE.Mesh
          if (m.geometry) m.geometry.dispose()
          if (m.material) {
            const mat = m.material as THREE.Material
            mat.dispose()
          }
        })
        renderer.dispose()
        renderer.domElement.remove()
      }
    }

    start()
    return () => { disposed = true; cancelAnimationFrame(frame); cleanup() }
  }, [])

  return (
    <div className={className}>
      <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing" />
    </div>
  )
}