'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/navbar'
import ScrollHero from '@/components/scroll-hero'
import Features from '@/components/features'
import Testimonials from '@/components/testimonials'
import Footer from '@/components/footer'

function StatsBand() {
  const stats = [
    { value: '5+', label: 'Irish SMEs shone on' },
    { value: '<24h', label: 'Typical response time' },
    { value: '100%', label: 'Custom-built sites' },
    { value: '1', label: 'County we call home' },
  ]
  return (
    <section id="work" className="bg-[#0A0A0A] py-16 px-6" style={{ borderTop: '1px solid rgba(250,250,249,0.05)', borderBottom: '1px solid rgba(250,250,249,0.05)' }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-2">
            <div className="text-[clamp(2rem,4vw,3.5rem)] text-white leading-none" style={{ fontFamily: 'var(--font-bebas)' }}>{s.value}</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/35" style={{ fontFamily: 'var(--font-space-mono)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function Manifesto() {
  return (
    <section className="bg-[#0A0A0A] py-36 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
          <div className="w-8 h-px mx-auto mb-12" style={{ background: '#00FF94' }} />
          <p className="text-[clamp(1.6rem,4.5vw,3rem)] leading-[1.3] text-white/80" style={{ fontFamily: 'var(--font-space-mono)' }}>
            &ldquo;Every Irish business deserves a website as good as the work it does. We exist to shine a light on one of them at a time.&rdquo;
          </p>
          <p className="mt-10 text-[10px] tracking-[0.35em] uppercase text-[#00FF94]" style={{ fontFamily: 'var(--font-space-mono)' }}>— Lonrú Design</p>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main style={{ background: '#0A0A0A', color: '#FAFAF9' }}>
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
