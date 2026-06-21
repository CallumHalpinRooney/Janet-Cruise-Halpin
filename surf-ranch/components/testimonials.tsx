'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  { id: 1, quote: "Two hours of uninterrupted, perfect waves. I've surfed everywhere from Jaws to Pipeline — nothing prepares you for what Crystal Point delivers. It's a different category of experience entirely.", author: 'Kelly Slater', role: '11× World Surf League Champion', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
  { id: 2, quote: "We hired Crystal Point for our executive retreat. The combination of elite surfing, genuine isolation, and the calibre of cuisine — my team still talks about it eighteen months later.", author: 'Jessica Park', role: 'CEO, Meridian Capital', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
  { id: 3, quote: 'The coaches here rebuilt my approach to the tube from the ground up. Three days, 200+ waves, and I came home surfing better than I had in a decade.', author: 'Marcus Holt', role: 'Pro Surfer, World Tour', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const go = (i: number) => {
    if (transitioning || i === active) return
    setTransitioning(true)
    setTimeout(() => { setActive(i); setTimeout(() => setTransitioning(false), 50) }, 300)
  }

  const current = testimonials[active]

  return (
    <section id="guests" className="bg-[#1C1917] py-32 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-[#CA8A04] text-[10px] tracking-[0.4em] uppercase mb-16" style={{ fontFamily: 'var(--font-jost)' }}>
          Guest Voices
        </motion.p>

        <div className="flex items-start gap-8">
          <span className="text-[100px] md:text-[140px] font-light leading-none text-white/[0.06] select-none shrink-0" style={{ fontFamily: 'var(--font-bodoni)' }}>
            {String(active + 1).padStart(2, '0')}
          </span>

          <div className="flex-1 pt-4">
            <AnimatePresence mode="wait">
              <motion.blockquote key={current.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
                className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-white/80 tracking-tight"
                style={{ fontFamily: 'var(--font-bodoni)', fontStyle: 'italic' }}>
                &ldquo;{current.quote}&rdquo;
              </motion.blockquote>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div key={current.id + 'a'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mt-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-white/10">
                  <img src={current.image} alt={current.author} className="w-full h-full object-cover grayscale" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90" style={{ fontFamily: 'var(--font-jost)' }}>{current.author}</p>
                  <p className="text-xs text-white/40 mt-0.5" style={{ fontFamily: 'var(--font-jost)', fontWeight: 300 }}>{current.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => go(i)} className="group py-3 cursor-pointer" aria-label={`Testimonial ${i + 1}`}>
                  <span className={`block h-px transition-all duration-500 ${i === active ? 'w-12 bg-[#CA8A04]' : 'w-6 bg-white/20 group-hover:w-8 group-hover:bg-white/40'}`} />
                </button>
              ))}
            </div>
            <span className="text-[10px] text-white/30 tracking-widest uppercase" style={{ fontFamily: 'var(--font-jost)' }}>
              {String(active + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => go(active === 0 ? testimonials.length - 1 : active - 1)} className="p-2.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => go(active === testimonials.length - 1 ? 0 : active + 1)} className="p-2.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-all cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </section>
  )
}
