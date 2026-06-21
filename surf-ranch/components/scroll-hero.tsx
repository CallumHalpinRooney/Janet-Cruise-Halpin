'use client'

import { useEffect, useRef } from 'react'

const FRAME_COUNT = 316  // matches the frames extracted into public/frames

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const currentIndexRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Cover-fit draw: fills the canvas like object-fit: cover
    const drawFrame = (img: HTMLImageElement) => {
      const cw = canvas.width
      const ch = canvas.height
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const sw = img.naturalWidth * scale
      const sh = img.naturalHeight * scale
      ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh)
    }

    // Size canvas to viewport — redraw current frame after resize
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const f = framesRef.current[currentIndexRef.current]
      if (f?.complete) drawFrame(f)
    }
    resize()
    window.addEventListener('resize', resize)

    // Preload all frames. Show frame 0 the moment it arrives.
    const frames: HTMLImageElement[] = new Array(FRAME_COUNT)
    framesRef.current = frames
    let firstShown = false

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()
      img.src = `frames/frame_${String(i + 1).padStart(4, '0')}.jpg`
      img.onload = () => {
        frames[i] = img
        if (!firstShown && i === 0) {
          firstShown = true
          canvas.style.opacity = '1'
          drawFrame(img)
        }
      }
    }

    let targetIndex = 0
    let lastDrawnIndex = -1
    let raf: number

    const onScroll = () => {
      const { top } = container.getBoundingClientRect()
      const scrollable = container.offsetHeight - window.innerHeight
      const progress = Math.min(1, Math.max(0, -top / scrollable))
      targetIndex = Math.round(progress * (FRAME_COUNT - 1))

      // Update overlay directly — no React re-renders in the scroll hot path
      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(Math.max(0, 1 - progress * 3))
      }
    }

    // rAF loop: draw whenever the target frame changes and that image is ready
    const tick = () => {
      if (targetIndex !== lastDrawnIndex && frames[targetIndex]?.complete) {
        currentIndexRef.current = targetIndex
        drawFrame(frames[targetIndex])
        lastDrawnIndex = targetIndex
      }
      raf = requestAnimationFrame(tick)
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReduced) {
      window.addEventListener('scroll', onScroll, { passive: true })
      raf = requestAnimationFrame(tick)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '300vh' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100vw', overflow: 'hidden' }}>

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            opacity: 0,
            transition: 'opacity 400ms ease',
          }}
        />

        {/* Cinematic gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(12,10,9,0.25) 0%, rgba(12,10,9,0.05) 40%, rgba(12,10,9,0.6) 100%)',
        }} />

        {/* Hero text — fades out as scroll progresses */}
        <div
          ref={overlayRef}
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}
        >
          <p style={{ fontFamily: 'var(--font-jost)', color: '#CA8A04', fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '24px', animation: 'fadeInUp 1.2s 0.3s both' }}>
            Crystal Point
          </p>
          <h1 style={{ fontFamily: 'var(--font-bodoni)', fontStyle: 'italic', fontSize: 'clamp(3.5rem, 10vw, 9rem)', lineHeight: 0.9, fontWeight: 300, color: '#FAFAF9', textAlign: 'center', animation: 'fadeInUp 1.4s 0.5s both' }}>
            Surf Ranch
          </h1>
          <p style={{ fontFamily: 'var(--font-jost)', fontWeight: 300, fontSize: '13px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(250,250,249,0.65)', marginTop: '32px', animation: 'fadeInUp 1s 0.9s both' }}>
            Malibu, California
          </p>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', animation: 'fadeIn 0.8s 1.6s both', pointerEvents: 'none' }}>
          <p style={{ fontFamily: 'var(--font-jost)', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(250,250,249,0.4)' }}>
            Scroll to explore
          </p>
          <div style={{ width: '1px', height: '48px', background: 'rgba(250,250,249,0.15)', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, width: '100%', height: '40%', background: 'rgba(250,250,249,0.6)', animation: 'scrollLine 1.4s linear infinite' }} />
          </div>
        </div>

      </div>
    </div>
  )
}
