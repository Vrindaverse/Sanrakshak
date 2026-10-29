import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

function readVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function toThreeColor(value: string, fallback: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.Color(fallback)
  ctx.fillStyle = value
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)
}

function makeGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.18, 'rgba(255,255,255,0.9)')
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.24)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeTextRing(text: string, radius: number, y: number, color: string, opacity: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 160
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.Group()

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = color
  ctx.font = '500 58px "JetBrains Mono", monospace'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '10px'
  ctx.fillText(`${text.toUpperCase()}   •   `.repeat(3), 24, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.repeat.x = 2
  texture.anisotropy = 4

  const geometry = new THREE.CylinderGeometry(radius, radius, 0.16, 128, 1, true)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.FrontSide,
    transparent: true,
    opacity,
    alphaTest: 0.03,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.y = y
  mesh.rotation.x = Math.PI * 0.015
  mesh.renderOrder = 2
  return mesh
}

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value |= 0
    value = (value + 0x6d2b79f5) | 0
    let t = Math.imul(value ^ (value >>> 15), 1 | value)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function ChromeCore({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let disposed = false
    let cleanup = () => {}
    let frame = 0

    const start = async () => {
      try {
        await document.fonts?.ready
      } catch {
        /* font loading is best-effort */
      }
      if (disposed) return

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const compact = window.matchMedia('(max-width: 767px)').matches
      const acid = readVar('--acid', 'oklch(0.9 0.18 130)')
      const ice = readVar('--ice', 'oklch(0.86 0.06 225)')
      const warning = readVar('--warning', 'oklch(0.82 0.15 80)')
      const chrome = readVar('--chrome-2', 'oklch(0.82 0.015 220)')
      const deep = readVar('--bg-deep', 'oklch(0.095 0.01 250)')
      const chromeBright = readVar('--chrome-1', 'oklch(0.99 0.004 240)')

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
      renderer.toneMappingExposure = 1.15
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'
      container.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
      camera.position.set(0, 0, 5.2)

      const envCanvas = document.createElement('canvas')
      envCanvas.width = 1024
      envCanvas.height = 512
      const envCtx = envCanvas.getContext('2d')
      if (envCtx) {
        const gradient = envCtx.createLinearGradient(0, 0, 0, 512)
        gradient.addColorStop(0, chromeBright)
        gradient.addColorStop(0.16, deep)
        gradient.addColorStop(0.31, acid)
        gradient.addColorStop(0.43, deep)
        gradient.addColorStop(0.58, ice)
        gradient.addColorStop(0.7, chrome)
        gradient.addColorStop(0.84, deep)
        gradient.addColorStop(1, chromeBright)
        envCtx.fillStyle = gradient
        envCtx.fillRect(0, 0, 1024, 512)

        const streak = envCtx.createLinearGradient(0, 0, 1024, 0)
        streak.addColorStop(0, 'rgba(255,255,255,0)')
        streak.addColorStop(0.48, 'rgba(255,255,255,0.38)')
        streak.addColorStop(0.52, 'rgba(255,255,255,0)')
        streak.addColorStop(0.76, 'rgba(255,255,255,0.2)')
        streak.addColorStop(0.8, 'rgba(255,255,255,0)')
        envCtx.fillStyle = streak
        envCtx.fillRect(0, 0, 1024, 512)
      }

      const envTexture = new THREE.CanvasTexture(envCanvas)
      envTexture.mapping = THREE.EquirectangularReflectionMapping
      envTexture.colorSpace = THREE.SRGBColorSpace
      const pmrem = new THREE.PMREMGenerator(renderer)
      const envTarget = pmrem.fromEquirectangular(envTexture)
      const envMap = envTarget.texture
      pmrem.dispose()
      envTexture.dispose()
      scene.environment = envMap

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.1)
      keyLight.position.set(3, 4, 5)
      scene.add(keyLight)

      const acidLight = new THREE.PointLight(toThreeColor(acid, '#b8ff4f'), 22, 14, 2)
      acidLight.position.set(-3.2, -1.4, 3.2)
      scene.add(acidLight)

      const iceLight = new THREE.PointLight(toThreeColor(ice, '#b9d7ff'), 16, 14, 2)
      iceLight.position.set(3, 2.4, -2.5)
      scene.add(iceLight)

      const group = new THREE.Group()
      scene.add(group)

      const coreGeometry = new THREE.TorusKnotGeometry(0.82, 0.255, 256, 48, 2, 3)
      const coreMaterial = new THREE.MeshPhysicalMaterial({
        color: toThreeColor(chrome, '#cbd4d4'),
        metalness: 1,
        roughness: 0.13,
        clearcoat: 1,
        clearcoatRoughness: 0.07,
        iridescence: 0.85,
        iridescenceIOR: 1.45,
        iridescenceThicknessRange: [120, 460],
        envMapIntensity: 1.8,
      })
      const core = new THREE.Mesh(coreGeometry, coreMaterial)
      group.add(core)

      const wireGeometry = new THREE.IcosahedronGeometry(1.72, 2)
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: toThreeColor(ice, '#b9d7ff'),
        wireframe: true,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      })
      const wire = new THREE.Mesh(wireGeometry, wireMaterial)
      group.add(wire)

      const haloMaterial = new THREE.MeshBasicMaterial({
        color: toThreeColor(acid, '#b8ff4f'),
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const haloGeometry = new THREE.TorusGeometry(1.35, 0.004, 8, 220)
      const haloA = new THREE.Mesh(haloGeometry, haloMaterial)
      haloA.rotation.set(Math.PI / 2.2, 0, 0.35)
      group.add(haloA)

      const haloB = new THREE.Mesh(haloGeometry, haloMaterial)
      haloB.scale.setScalar(1.18)
      haloB.rotation.set(Math.PI / 1.7, 0.4, -0.3)
      group.add(haloB)

      const ringA = makeTextRing('SANRAKSHAK', 1.92, 0.92, acid, 0.58)
      const ringB = makeTextRing('ATTACK SURFACE', 2.15, -0.95, ice, 0.42)
      group.add(ringA, ringB)

      const random = seededRandom(20261026)
      const particleCount = compact ? 420 : 900
      const positions = new Float32Array(particleCount * 3)
      for (let i = 0; i < particleCount; i += 1) {
        const radius = 2.05 + random() * 2.8
        const theta = random() * Math.PI * 2
        const phi = Math.acos(2 * random() - 1)
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = radius * Math.cos(phi)
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
      }
      const particleGeometry = new THREE.BufferGeometry()
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const particleMaterial = new THREE.PointsMaterial({
        color: toThreeColor(ice, '#b9d7ff'),
        size: 0.018,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const particles = new THREE.Points(particleGeometry, particleMaterial)
      scene.add(particles)

      const glowTexture = makeGlowTexture()
      const markers: { sprite: THREE.Sprite; base: number; phase: number }[] = []
      const markerColors = [acid, acid, ice, ice, warning, acid, ice, acid]
      for (let i = 0; i < markerColors.length; i += 1) {
        const material = new THREE.SpriteMaterial({
          map: glowTexture,
          color: toThreeColor(markerColors[i], '#b8ff4f'),
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        const sprite = new THREE.Sprite(material)
        const radius = 1.86 + random() * 0.7
        const theta = random() * Math.PI * 2
        const phi = Math.acos(2 * random() - 1)
        sprite.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        )
        const base = 0.16 + random() * 0.14
        sprite.scale.setScalar(base)
        group.add(sprite)
        markers.push({ sprite, base, phase: random() * Math.PI * 2 })
      }

      let pointerX = 0
      let pointerY = 0
      let scroll = 0
      let visible = true
      let running = false
      let elapsed = 0

      function onPointerMove(event: PointerEvent) {
        pointerX = (event.clientX / window.innerWidth) * 2 - 1
        pointerY = (event.clientY / window.innerHeight) * 2 - 1
      }

      function onScroll() {
        scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.4)
      }

      function resize() {
        const width = container!.clientWidth || 600
        const height = container!.clientHeight || 600
        camera.aspect = width / height
        camera.position.z = camera.aspect < 0.85 ? 6.5 : 5.2
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      }

      function renderStatic() {
        core.rotation.set(0.4, 0.6, 0.2)
        group.rotation.set(0.08, 0.3, 0)
        renderer.render(scene, camera)
      }

      const clock = new THREE.Clock(false)
      const resizeObserver = new ResizeObserver(() => {
        resize()
        if (reduceMotion) renderStatic()
      })
      resizeObserver.observe(container)

      function animate() {
        if (!running) return
        frame = requestAnimationFrame(animate)

        elapsed += Math.min(clock.getDelta(), 0.05)
        const time = elapsed

        core.rotation.x = time * 0.17
        core.rotation.y = time * 0.23 + pointerX * 0.24
        core.rotation.z = Math.sin(time * 0.3) * 0.08

        const targetY = time * 0.07 + pointerX * 0.3 + scroll * 0.55
        const targetX = pointerY * 0.14 - scroll * 0.1
        group.rotation.y += (targetY - group.rotation.y) * 0.045
        group.rotation.x += (targetX - group.rotation.x) * 0.045
        group.position.y += (-scroll * 0.28 - group.position.y) * 0.04

        wire.rotation.y = -time * 0.045
        wire.rotation.x = time * 0.03
        wire.rotation.z = time * 0.02

        ringA.rotation.y = time * 0.15
        ringB.rotation.y = -time * 0.11

        haloA.rotation.z = time * 0.18
        haloB.rotation.z = -time * 0.13

        particles.rotation.y = time * 0.014
        particles.rotation.x = Math.sin(time * 0.08) * 0.05
        particles.rotation.z = Math.cos(time * 0.06) * 0.03

        for (const marker of markers) {
          const pulse = 1 + Math.sin(time * 1.8 + marker.phase) * 0.32
          marker.sprite.scale.setScalar(marker.base * pulse)
          ;(marker.sprite.material as THREE.SpriteMaterial).opacity = 0.48 + Math.sin(time * 1.8 + marker.phase) * 0.28
        }

        camera.position.x += (pointerX * 0.26 - camera.position.x) * 0.035
        camera.position.y += (-pointerY * 0.17 - camera.position.y) * 0.035
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }

      function syncLoop() {
        const shouldRun = visible && !document.hidden && !reduceMotion
        if (shouldRun && !running) {
          running = true
          clock.start()
          frame = requestAnimationFrame(animate)
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

      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })
      document.addEventListener('visibilitychange', onVisibilityChange)
      resize()
      onScroll()

      if (reduceMotion) {
        renderStatic()
      } else {
        syncLoop()
      }

      cleanup = () => {
        running = false
        cancelAnimationFrame(frame)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('scroll', onScroll)
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
            const mat = material as THREE.Material & { [key: string]: unknown }
            for (const value of Object.values(mat)) {
              if (value instanceof THREE.Texture) value.dispose()
            }
            mat.dispose()
          }
        })
        envTarget.dispose()
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
    <div className={cn('relative h-full w-full', className)}>
      <div aria-hidden="true" className="chrome-orb absolute left-1/2 top-1/2 h-[62%] w-[62%] -translate-x-1/2 -translate-y-1/2 opacity-35 blur-[2px]" />
      <div
        ref={containerRef}
        aria-hidden="true"
        className={cn('absolute inset-0 transition-opacity duration-1000', failed ? 'opacity-0' : 'opacity-100')}
      />
      {failed ? (
        <div aria-hidden="true" className="chrome-orb absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2" />
      ) : null}
    </div>
  )
}
