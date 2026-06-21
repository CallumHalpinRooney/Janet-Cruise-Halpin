'use client'

import { motion } from 'framer-motion'

const navLinks = ['Experience', 'Waves', 'Guests', 'Reserve', 'Privacy']

export default function Footer() {
  return (
    <footer id="reserve" className="bg-[#0C0A09] border-t border-white/5">
      <div className="px-6 py-24 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <p className="text-[#CA8A04] text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: 'var(--font-jost)' }}>Limited Availability</p>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-light leading-[1]" style={{ fontFamily: 'var(--font-bodoni)', fontStyle: 'italic' }}>Begin your<br />inquiry</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-4 max-w-md w-full">
            <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-jost)', fontWeight: 300 }}>Availability is intentionally limited to maintain exclusivity. Send your details and our team will respond within 24 hours.</p>
            <div className="flex gap-3">
              <input type="email" placeholder="your@email.com" className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-[#CA8A04]/50 transition-colors" style={{ fontFamily: 'var(--font-jost)' }} />
              <button className="px-6 py-3 rounded-full bg-[#CA8A04] text-[#0C0A09] text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-[#d4920a] transition-colors cursor-pointer" style={{ fontFamily: 'var(--font-jost)' }}>Inquire</button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <span className="text-lg text-white/30 italic" style={{ fontFamily: 'var(--font-bodoni)' }}>Crystal Point</span>
          <nav className="flex flex-wrap gap-6">
            {navLinks.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors cursor-pointer" style={{ fontFamily: 'var(--font-jost)' }}>{l}</a>
            ))}
          </nav>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-white/5">
          <p className="text-[10px] text-white/20 tracking-wider" style={{ fontFamily: 'var(--font-jost)' }}>© {new Date().getFullYear()} Crystal Point Surf Ranch. All rights reserved. Malibu, California.</p>
        </div>
      </div>
    </footer>
  )
}
