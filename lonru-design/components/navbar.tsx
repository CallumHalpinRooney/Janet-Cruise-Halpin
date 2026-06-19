'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const links = ['Work', 'Process', 'Clients', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between w-full max-w-5xl px-6 py-3 rounded-full transition-all duration-500"
          style={{
            background: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            border: scrolled ? '1px solid rgba(250,250,249,0.08)' : '1px solid transparent',
          }}
        >
          <a href="#" style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }} className="text-2xl text-[#FAFAF9]">
            Lonrú
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`}
                className="group relative text-[11px] tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors duration-300 cursor-pointer"
                style={{ fontFamily: 'var(--font-space-mono)' }}>
                {link}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#00FF94] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <a href="#contact"
            className="hidden md:block text-[10px] tracking-[0.25em] uppercase px-5 py-2.5 rounded-full bg-[#00FF94] text-[#0A0A0A] font-bold hover:bg-[#33ffa8] transition-colors duration-200 cursor-pointer"
            style={{ fontFamily: 'var(--font-space-mono)' }}>
            Start a Project
          </a>

          <button className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <motion.span className="w-6 h-px bg-white/80 block" animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} />
            <motion.span className="w-4 h-px bg-white/80 block" animate={menuOpen ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.2 }} />
            <motion.span className="w-6 h-px bg-white/80 block" animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} transition={{ duration: 0.2 }} />
          </button>
        </motion.nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-10">
            {links.map((link, i) => (
              <motion.a key={link} href={`#${link.toLowerCase()}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 + 0.1 }}
                className="text-4xl text-white/80 hover:text-white transition-colors cursor-pointer"
                style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.02em' }}
                onClick={() => setMenuOpen(false)}>
                {link}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
