'use client'

import { motion } from 'framer-motion'

const navLinks = ['Work', 'Process', 'Clients', 'Privacy']

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#0A0A0A] border-t border-white/5">
      <div className="px-6 py-24 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-10">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <p className="text-[#00FF94] text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: 'var(--font-space-mono)' }}>Taking on new projects</p>
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95]" style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.01em' }}>Let&apos;s build your<br />website</h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-4 max-w-md w-full">
            <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-space-mono)' }}>Tell us a bit about your business and we&apos;ll get back to you within one working day — no sales call required to find that out.</p>
            <div className="flex gap-3">
              <input type="email" placeholder="your@business.ie" className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-[#00FF94]/50 transition-colors" style={{ fontFamily: 'var(--font-space-mono)' }} />
              <button className="px-6 py-3 rounded-full bg-[#00FF94] text-[#0A0A0A] text-[11px] tracking-[0.2em] uppercase font-bold hover:bg-[#33ffa8] transition-colors cursor-pointer" style={{ fontFamily: 'var(--font-space-mono)' }}>Enquire</button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <span className="text-xl text-white/30" style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}>Lonrú Design</span>
          <nav className="flex flex-wrap gap-6">
            {navLinks.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors cursor-pointer" style={{ fontFamily: 'var(--font-space-mono)' }}>{l}</a>
            ))}
          </nav>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-white/5">
          <p className="text-[10px] text-white/20 tracking-wider" style={{ fontFamily: 'var(--font-space-mono)' }}>© {new Date().getFullYear()} Lonrú Design. All rights reserved. Co. Wicklow, Ireland.</p>
        </div>
      </div>
    </footer>
  )
}
