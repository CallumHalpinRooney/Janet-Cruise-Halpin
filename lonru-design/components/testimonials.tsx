'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  { id: 1, quote: "We went from a Facebook page to an actual website that books tables for us while we sleep. Lonrú got our arcade theme exactly right — it still feels like us, just sharper.", author: 'Owner', role: 'The Little Bean Coffee Co., Greystones', image: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=200&q=80' },
  { id: 2, quote: "Forty years of paintings and I'd never sold one online. Lonrú built the shop, connected the print-on-demand, and now the Wicklow mountains are hanging on walls in Boston and Sydney.", author: 'Janet Cruise Halpin', role: 'Fine Artist, Co. Wicklow', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
  { id: 3, quote: "No jargon, no waiting weeks for updates, no surprise invoices. Just a site that looks the part and a designer who actually answers the phone.", author: 'Proprietor', role: 'Benezet Antiques, Dublin 6', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
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
    <section id="clients" className="bg-[#141414] py-32 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-[#00FF94] text-[10px] tracking-[0.4em] uppercase mb-16" style={{ fontFamily: 'var(--font-space-mono)' }}>
          Client Voices
        </motion.p>

        <div className="flex items-start gap-8">
          <span className="text-[100px] md:text-[140px] leading-none text-white/[0.06] select-none shrink-0" style={{ fontFamily: 'var(--font-bebas)' }}>
            {String(active + 1).padStart(2, '0')}
          </span>

          <div className="flex-1 pt-4">
            <AnimatePresence mode="wait">
              <motion.blockquote key={current.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
                className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-white/80 tracking-tight"
                style={{ fontFamily: 'var(--font-space-mono)' }}>
                &ldquo;{current.quote}&rdquo;
              </motion.blockquote>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div key={current.id + 'a'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mt-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-white/10">
                  <img src={current.image} alt={current.author} className="w-full h-full object-cover grayscale" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90" style={{ fontFamily: 'var(--font-space-mono)' }}>{current.author}</p>
                  <p className="text-xs text-white/40 mt-0.5" style={{ fontFamily: 'var(--font-space-mono)' }}>{current.role}</p>
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
                  <span className={`block h-px transition-all duration-500 ${i === active ? 'w-12 bg-[#00FF94]' : 'w-6 bg-white/20 group-hover:w-8 group-hover:bg-white/40'}`} />
                </button>
              ))}
            </div>
            <span className="text-[10px] text-white/30 tracking-widest uppercase" style={{ fontFamily: 'var(--font-space-mono)' }}>
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
