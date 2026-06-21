'use client'

import { motion, type Variants } from 'framer-motion'

const features = [
  {
    number: '01', title: 'Perfect Waves', subtitle: 'Engineered by Nature',
    description: 'Our proprietary hydrofoil system generates 6-foot barrels every 90 seconds, calibrated for every skill level — from weekend surfers to professional athletes chasing the perfect ride.',
    image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80&auto=format&fit=crop',
    stat: '6ft', statLabel: 'barrel height',
  },
  {
    number: '02', title: 'Private Estate', subtitle: 'Exclusively Yours',
    description: 'Twelve acres of coastal luxury — eight private suites, infinity pool, chef-driven dining, and a beach club — all reserved exclusively for your party. No strangers. No compromise.',
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80&auto=format&fit=crop',
    stat: '12', statLabel: 'private acres',
  },
  {
    number: '03', title: 'World-Class Coaching', subtitle: 'Master Your Craft',
    description: "Work one-on-one with former world tour competitors. Slow-motion video analysis, custom board shaping sessions, and curated progression plans built around your movement.",
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80&auto=format&fit=crop',
    stat: '1:1', statLabel: 'coaching ratio',
  },
]

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]
const reveal: Variants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease } } }
const imgReveal: Variants = { hidden: { opacity: 0, scale: 1.05 }, visible: { opacity: 1, scale: 1, transition: { duration: 1.1, ease } } }

export default function Features() {
  return (
    <section id="experience" className="bg-[#0C0A09] py-32 px-6">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={reveal} className="max-w-5xl mx-auto mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-[#CA8A04] text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: 'var(--font-jost)' }}>The Experience</p>
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] leading-[1] font-light" style={{ fontFamily: 'var(--font-bodoni)', fontStyle: 'italic' }}>Nothing like it<br />on Earth</h2>
        </div>
        <p className="max-w-sm text-white/50 text-sm leading-relaxed" style={{ fontFamily: 'var(--font-jost)', fontWeight: 300 }}>Three pillars of an experience so complete, you&apos;ll wonder how you surfed without it.</p>
      </motion.div>

      <div className="max-w-5xl mx-auto space-y-32">
        {features.map((f, i) => (
          <div key={f.number} className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center ${i % 2 === 1 ? 'md:[direction:rtl]' : ''}`}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={imgReveal} className="relative overflow-hidden rounded-sm aspect-[4/3] [direction:ltr]">
              <img src={f.image} alt={f.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-6 right-6 text-right">
                <div className="text-5xl font-light text-white" style={{ fontFamily: 'var(--font-bodoni)' }}>{f.stat}</div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-white/60 mt-1" style={{ fontFamily: 'var(--font-jost)' }}>{f.statLabel}</div>
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={reveal} className="[direction:ltr] flex flex-col gap-6">
              <div className="text-[#CA8A04] text-[10px] tracking-[0.4em] uppercase" style={{ fontFamily: 'var(--font-jost)' }}>{f.number} — {f.subtitle}</div>
              <h3 className="text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] font-light" style={{ fontFamily: 'var(--font-bodoni)', fontStyle: 'italic' }}>{f.title}</h3>
              <div className="w-8 h-px bg-[#CA8A04]" />
              <p className="text-white/50 text-sm leading-relaxed max-w-sm" style={{ fontFamily: 'var(--font-jost)', fontWeight: 300 }}>{f.description}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  )
}
