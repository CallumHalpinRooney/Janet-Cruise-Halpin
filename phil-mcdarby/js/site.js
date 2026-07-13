/* ═══════════════════════════════════════════════════════════════════════
   PHIL McDARBY — shared behaviour
   Dependency-free. Slow, confident motion; nothing snappy.
   ═══════════════════════════════════════════════════════════════════════ */

const BASE = '/phil-mcdarby/';
const ENQUIRY_ENDPOINT = '/api/print-enquiry';

/* ── nav: gain a surface once the art starts scrolling underneath ───── */
(() => {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── reveal on scroll ────────────────────────────────────────────────── */
const observeReveals = (root = document) => {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  root.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
};

/* ── artwork images fade up from the canvas once decoded ────────────── */
const watchArtworkLoads = (root = document) => {
  root.querySelectorAll('img.artwork, .work-stage img').forEach((img) => {
    const done = () => img.classList.add('loaded');
    // complete covers both decoded and already-errored images — either way
    // the load/error events have fired and would never call done()
    if (img.complete) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
  });
};

/* keep Tab inside an open dialog — the page behind is invisible */
const trapFocus = (container) => {
  container.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = [...container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )].filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
      e.preventDefault(); first.focus();
    }
  });
};

/* ── card builder — one artwork tile, used by home + gallery ────────── */
const workCard = (work, { eager = false, underCaption = false } = {}) => {
  const a = document.createElement('a');
  a.className = 'work-card reveal';
  a.href = `${BASE}work/?w=${encodeURIComponent(work.slug)}`;
  a.setAttribute('aria-label', `${work.title} — view artwork`);

  const ratio = (work.h / work.w * 100).toFixed(3);
  a.innerHTML = `
    <figure>
      <div style="position:relative;width:100%;padding-top:${ratio}%">
        <img class="artwork" src="${BASE}${work.image}" alt="${escapeHtml(work.title)} — ${COLLECTIONS[work.collection]} by Phil McDarby"
             width="${work.w}" height="${work.h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"
             style="position:absolute;inset:0">
      </div>
      <figcaption aria-hidden="true">
        <span class="work-title">${escapeHtml(work.title)}</span>
        <span class="work-coll">${COLLECTIONS[work.collection]}</span>
      </figcaption>
    </figure>
    ${underCaption ? `
      <div class="work-under">
        <span class="work-title">${escapeHtml(work.title)}</span>
        <span class="work-coll">${COLLECTIONS[work.collection]}</span>
      </div>` : ''}
  `;
  return a;
};

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

/* ── justified (gapless) layout — images edge-to-edge, no gutters ─────
   Greedy rows scaled to fill the container's full width; each cell's
   aspect ratio matches its image, so nothing is cropped and there are
   no gaps ("all joined"). Rebuilds on resize. */
function justifiedCard(work) {
  const a = document.createElement('a');
  a.className = 'jcell';
  a.href = `${BASE}work/?w=${encodeURIComponent(work.slug)}`;
  a.setAttribute('aria-label', `${work.title} — view artwork`);
  a.innerHTML = `
    <img class="artwork" src="${BASE}${work.image}"
         alt="${escapeHtml(work.title)} — ${COLLECTIONS[work.collection]} by Phil McDarby"
         width="${work.w}" height="${work.h}" loading="lazy" decoding="async">
    <figcaption aria-hidden="true">
      <span class="jt">${escapeHtml(work.title)}</span>
      <span class="jc">${COLLECTIONS[work.collection]}</span>
    </figcaption>`;
  return a;
}

function renderJustified(container, works, opts = {}) {
  const maxPerRow = opts.maxPerRow || 4;   // cap so tall/portrait works stay generously sized
  const build = () => {
    const cw = container.clientWidth;
    if (!cw) return;
    const target = cw >= 1000 ? 400 : cw >= 640 ? 320 : 260;
    container.innerHTML = '';
    let i = 0;
    while (i < works.length) {
      const row = [];
      let sumAR = 0, k = i;
      while (k < works.length) {
        sumAR += works[k].w / works[k].h;
        row.push(works[k]); k++;
        if (sumAR * target >= cw) break;      // filled by width
        if (row.length >= maxPerRow) break;    // filled by the per-row cap
      }
      const ranOut = k >= works.length;
      const filled = sumAR * target >= cw;
      // stretch to full width unless it's the leftover last row — but on
      // curated strips (fillLast) always fill so nothing looks cut off
      const full = filled || !ranOut || opts.fillLast;
      const h = full ? cw / sumAR : target;       // last row → natural target height
      const rowEl = document.createElement('div');
      rowEl.className = 'jrow' + (full ? '' : ' jrow-last');
      rowEl.style.height = h + 'px';
      row.forEach((w) => {
        const ar = w.w / w.h;
        const cell = justifiedCard(w);
        if (full) cell.style.flex = ar + ' 1 0';
        else { cell.style.width = (h * ar) + 'px'; cell.style.flex = '0 0 auto'; }
        rowEl.appendChild(cell);
      });
      container.appendChild(rowEl);
      i = k;
    }
    watchArtworkLoads(container);
  };
  build();
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 160); });
}

/* ── lightbox — the piece, huge, on a dark backdrop, nothing else ───── */
const lightbox = (() => {
  let el = null;

  const build = () => {
    el = document.createElement('div');
    el.className = 'lightbox';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Artwork, enlarged');
    el.innerHTML = `
      <img alt="">
      <p class="lightbox-caption"></p>
      <button class="lightbox-close" type="button">Close</button>
    `;
    document.body.appendChild(el);
    trapFocus(el);
    el.querySelector('.lightbox-close').addEventListener('click', close);
    el.addEventListener('click', (e) => { if (e.target === el) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.classList.contains('open')) close();
    });
    return el;
  };

  let lastFocus = null;
  const open = (src, caption) => {
    if (!el) build();
    lastFocus = document.activeElement;
    el.querySelector('img').src = src;
    el.querySelector('img').alt = caption;
    el.querySelector('.lightbox-caption').textContent = caption;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
    el.querySelector('.lightbox-close').focus();
  };
  const close = () => {
    el.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  return { open };
})();

/* ── print-enquiry modal ─────────────────────────────────────────────
   Pre-filled with the artwork so context is never lost. Lead capture
   only: no payment, no cart. POSTs to the serverless function which
   emails Phil (Resend) and logs the enquiry (Supabase). */
const enquiryModal = (() => {
  let el = null;
  let currentWork = null;
  let lastFocus = null;

  const build = () => {
    el = document.createElement('div');
    el.className = 'modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'enquiry-title');
    el.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-panel">
        <button class="modal-close" type="button">Close</button>
        <div class="modal-context">
          <img class="modal-thumb" alt="" aria-hidden="true">
          <div>
            <span class="label label--gold" id="enquiry-title">Print enquiry</span>
            <span class="modal-work-title"></span>
          </div>
        </div>
        <form novalidate>
          <div class="field-row">
            <div class="field">
              <label for="enq-name">Name</label>
              <input id="enq-name" name="name" type="text" required autocomplete="name">
            </div>
            <div class="field">
              <label for="enq-email">Email</label>
              <input id="enq-email" name="email" type="email" required autocomplete="email">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="enq-size">Print size</label>
              <select id="enq-size" name="size"></select>
            </div>
            <div class="field">
              <label for="enq-framing">Framing</label>
              <select id="enq-framing" name="framing">
                <option>Not sure yet</option>
                <option>Yes — framed</option>
                <option>No — print only</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="enq-message">Message <span style="text-transform:none;letter-spacing:.05em">(optional)</span></label>
            <textarea id="enq-message" name="message" rows="3"></textarea>
          </div>
          <div class="field field--hp" aria-hidden="true">
            <label for="enq-website">Website</label>
            <input id="enq-website" name="website" type="text" tabindex="-1" autocomplete="off">
          </div>
          <div class="form-actions">
            <button class="btn btn--solid" type="submit">Send enquiry</button>
          </div>
          <p class="form-error" role="alert"></p>
        </form>
        <div class="modal-success" role="status" tabindex="-1">
          <p class="big">Thank you.</p>
          <p>Your enquiry has been sent. Phil will be in touch shortly to arrange your print.</p>
          <button class="text-link" type="button" data-close>Back to the work</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    trapFocus(el.querySelector('.modal-panel'));

    const sizeSelect = el.querySelector('#enq-size');
    PRINT_SIZES.forEach((s) => {
      const o = document.createElement('option');
      o.textContent = s;
      sizeSelect.appendChild(o);
    });

    el.querySelector('.modal-close').addEventListener('click', close);
    el.querySelector('[data-close]').addEventListener('click', close);
    el.querySelector('.modal-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.classList.contains('open')) close();
    });
    el.querySelector('form').addEventListener('submit', submit);
    return el;
  };

  const open = (work) => {
    if (!el) build();
    currentWork = work;
    lastFocus = document.activeElement;
    el.querySelector('.modal-thumb').src = BASE + work.image;
    el.querySelector('.modal-work-title').textContent = work.title;
    el.querySelector('form').style.display = '';
    el.querySelector('.modal-success').classList.remove('show');
    el.querySelector('.form-error').classList.remove('show');
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
    el.querySelector('#enq-name').focus();
  };

  const close = () => {
    el.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const err = el.querySelector('.form-error');
    err.classList.remove('show');

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.textContent = 'Please add your name and a valid email address so Phil can reply.';
      err.classList.add('show');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const res = await fetch(ENQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'print',
          name, email,
          size: form.size.value,
          framing: form.framing.value,
          message: form.message.value.trim(),
          website: form.website.value,
          // the API resolves title + image server-side from the slug
          work_slug: currentWork.slug,
          page: location.href,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.style.display = 'none';
      const success = el.querySelector('.modal-success');
      success.classList.add('show');
      success.focus();
      form.reset();
    } catch (_) {
      err.textContent = 'Something went wrong sending your enquiry — please try again in a moment.';
      err.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send enquiry';
    }
  };

  return { open };
})();

/* ── boot ────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  observeReveals();
  watchArtworkLoads();
});
