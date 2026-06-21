'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/navbar'
import ScrollHero from '@/components/scroll-hero'
import Features from '@/components/features'
import Testimonials from '@/components/testimonials'
import Footer from '@/components/footer'

function StatsBand() {
  const stats = [
    { value: '6ft', label: 'Perfect barrel height' },
    { value: '90s', label: 'Wave interval' },
    { value: '12', label: 'Acres of privacy' },
    { value: '24h', label: 'Private access' },
  ]
  return (
    <section id="waves" className="bg-[#0C0A09] py-16 px-6" style={{ borderTop: '1px solid rgba(250,250,249,0.05)', borderBottom: '1px solid rgba(250,250,249,0.05)' }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-2">
            <div className="text-[clamp(2rem,4vw,3.5rem)] font-light text-white leading-none" style={{ fontFamily: 'var(--font-bodoni)' }}>{s.value}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/35" style={{ fontFamily: 'var(--font-jost)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function Manifesto() {
  return (
    <section className="bg-[#0C0A09] py-36 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
          <div className="w-8 h-px mx-auto mb-12" style={{ background: '#CA8A04' }} />
          <p className="text-[clamp(1.6rem,4vw,3rem)] font-light leading-[1.4] italic text-white/80" style={{ fontFamily: 'var(--font-bodoni)' }}>
            &ldquo;The ocean does not give perfect waves to just anyone. We built a place where it has no choice.&rdquo;
          </p>
          <p className="mt-10 text-[10px] tracking-[0.35em] uppercase text-[#CA8A04]" style={{ fontFamily: 'var(--font-jost)' }}>— Founders, Crystal Point</p>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main style={{ background: '#0C0A09', color: '#FAFAF9' }}>
      <Navbar />
      <ScrollHero />
      <StatsBand />
      <Manifesto />
      <Features />
      <Testimonials />
      <Footer />
    </main>
  )
}
