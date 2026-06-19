/* Jacal Airlines — scroll & motion */
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  const bar = loader.querySelector('.loader__bar span');
  gsap.to(bar, {width:'100%', duration:1.1, ease:'power2.inOut', onComplete:() => {
    loader.classList.add('loader--done');
    setTimeout(() => loader.remove(), 700);
    introAnim();
  }});

  /* ---------- Lenis smooth scroll ---------- */
  const lenis = new Lenis({ duration:1.15, easing:t => Math.min(1, 1.001 - Math.pow(2, -10*t)), smoothWheel:true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------- Nav state ---------- */
  const nav = document.getElementById('nav');
  ScrollTrigger.create({ start:'top -80', end:99999,
    onUpdate:s => nav.classList.toggle('nav--scrolled', s.scroll() > 80) });

  /* ---------- HERO: plane recedes into the distance as you scroll ---------- */
  const plane = document.getElementById('heroPlane');
  gsap.to(plane, {
    scale:0.16,          // shrinks away
    y:'-34vh',           // climbs slightly
    opacity:0,           // fades into the haze
    ease:'none',
    scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:1 }
  });
  // hero copy drifts up and fades a touch faster than the plane
  gsap.to('.hero__content', {
    y:-120, opacity:0, ease:'none',
    scrollTrigger:{ trigger:'#hero', start:'top top', end:'60% top', scrub:1 }
  });

  /* ---------- Reveal on scroll ---------- */
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, { opacity:1, y:0, duration:1, ease:'power3.out',
      scrollTrigger:{ trigger:el, start:'top 85%' } });
  });

  /* ---------- Counting stats ---------- */
  gsap.utils.toArray('.stat__num').forEach(el => {
    const end = +el.dataset.count;
    ScrollTrigger.create({ trigger:el, start:'top 88%', once:true, onEnter:() => {
      gsap.to(el, { textContent:end, duration:1.8, ease:'power2.out', snap:{textContent:1},
        onUpdate:function(){ el.textContent = Math.round(this.targets()[0].textContent).toLocaleString(); } });
    }});
  });

  /* ---------- Parallax quote ---------- */
  gsap.to('.quote__bg', { yPercent:18, ease:'none',
    scrollTrigger:{ trigger:'.quote', start:'top bottom', end:'bottom top', scrub:true } });

  /* ---------- Fleet card stagger ---------- */
  gsap.from('.card', { y:60, opacity:0, duration:.9, stagger:.15, ease:'power3.out',
    scrollTrigger:{ trigger:'.fleet__grid', start:'top 80%' } });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Anchor links via Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t){ e.preventDefault(); lenis.scrollTo(t, { offset:0, duration:1.4 }); }
    });
  });

  function introAnim(){
    gsap.from('.hero__plane', { scale:1.25, opacity:0, duration:1.6, ease:'power3.out' });
    gsap.from('.hero__eyebrow', { y:30, opacity:0, duration:1, delay:.2, ease:'power3.out' });
    gsap.from('.hero__title',   { y:50, opacity:0, duration:1.1, delay:.35, ease:'power3.out' });
    gsap.from('.hero__sub',     { y:30, opacity:0, duration:1, delay:.55, ease:'power3.out' });
    gsap.from('.hero__content .btn', { y:20, opacity:0, duration:1, delay:.7, ease:'power3.out' });
    gsap.from('.nav', { y:-40, opacity:0, duration:1, delay:.4, ease:'power3.out' });
  }
});
