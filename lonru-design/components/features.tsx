'use client'

import { motion, type Variants } from 'framer-motion'

const features = [
  {
    number: '01', title: 'Built to Convert', subtitle: 'Not Just to Look Nice',
    description: 'Every site we ship is designed around the one thing that actually matters to a small business: does it turn visitors into customers. Clean information architecture, fast load times, clear calls to action — no decoration without a job to do.',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1200&q=80&auto=format&fit=crop',
    stat: '<2s', statLabel: 'avg. load time',
  },
  {
    number: '02', title: 'Genuinely Irish', subtitle: 'No Templates, No Stock Clichés',
    description: "We're based in Wicklow and we work with businesses we can actually drive to. That means real photography, real understanding of the local market, and a design language built from scratch for every single client — never a recycled theme.",
    image: 'https://images.unsplash.com/photo-1551038247-3d9af20df552?w=1200&q=80&auto=format&fit=crop',
    stat: '100%', statLabel: 'custom-built',
  },
  {
    number: '03', title: 'End-to-End Delivery', subtitle: 'Design, Build, Deploy',
    description: 'From first sketch to a live URL on your own domain, we handle the whole pipeline ourselves — design, development, GitHub, Netlify deployment, and the handover documents you need to own it outright.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop',
    stat: '1', statLabel: 'point of contact',
  },
]

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]
const reveal: Variants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease } } }
const imgReveal: Variants = { hidden: { opacity: 0, scale: 1.05 }, visible: { opacity: 1, scale: 1, transition: { duration: 1.1, ease } } }

export default function Features() {
  return (
    <section id="process" className="bg-[#0A0A0A] py-32 px-6">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={reveal} className="max-w-5xl mx-auto mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-[#00FF94] text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: 'var(--font-space-mono)' }}>How We Work</p>
          <h2 className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95]" style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.01em' }}>One business at<br />a time, done right</h2>
        </div>
        <p className="max-w-sm text-white/50 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-space-mono)' }}>We don&apos;t run a volume shop. Every client gets the same attention we&apos;d want if it were our own business on the line.</p>
      </motion.div>

      <div className="max-w-5xl mx-auto space-y-32">
        {features.map((f, i) => (
          <div key={f.number} className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={imgReveal} className="relative overflow-hidden rounded-sm aspect-[4/3] [direction:ltr]">
              <img src={f.image} alt={f.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-6 right-6 text-right">
                <div className="text-5xl text-white" style={{ fontFamily: 'var(--font-bebas)' }}>{f.stat}</div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-white/60 mt-1" style={{ fontFamily: 'var(--font-space-mono)' }}>{f.statLabel}</div>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={reveal} className="[direction:ltr] flex flex-col gap-6">
              <div className="text-[#00FF94] text-[10px] tracking-[0.4em] uppercase" style={{ fontFamily: 'var(--font-space-mono)' }}>{f.number} — {f.subtitle}</div>
              <h3 className="text-[clamp(2rem,5vw,3.8rem)] leading-[1] " style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '0.01em' }}>{f.title}</h3>
              <div className="w-8 h-px bg-[#00FF94]" />
              <p className="text-white/50 text-sm leading-relaxed max-w-sm" style={{ fontFamily: 'var(--font-space-mono)' }}>{f.description}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}
