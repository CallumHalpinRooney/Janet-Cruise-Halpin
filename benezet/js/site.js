/* ============================================================
   BENEZET — shared behaviour
   Wordmark injection · nav · scroll reveals · piece cards ·
   the enquiry drawer (prefill + validate + send) · lightbox.
   Restrained by design; everything defers to prefers-reduced-motion.
   ============================================================ */
(function () {
  var D = document;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function attr(s) { return esc(s).replace(/"/g, "&quot;"); }

  /* ── wordmarks ── */
  function injectWordmarks() {
    if (!window.BENEZET_WORDMARK) return;
    D.querySelectorAll("[data-wordmark]").forEach(function (el) {
      el.innerHTML = window.BENEZET_WORDMARK.svg(el.getAttribute("data-wordmark-class") || "");
    });
  }

  /* ── mobile nav ── */
  function initNav() {
    var toggle = D.querySelector(".nav-toggle");
    var nav = D.querySelector(".nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ── scroll reveals ── */
  function initReveals() {
    var els = D.querySelectorAll("[data-reveal]");
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
          setTimeout(function () { el.classList.add("in"); }, delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ── piece card (shared by home + collection) ── */
  function statusTag(p) {
    if (p.status === "sold") return '<span class="piece__tag piece__tag--sold">Sold</span>';
    if (p.status === "reserved") return '<span class="piece__tag piece__tag--reserved">Reserved</span>';
    return "";
  }
  function pieceCard(p, idx) {
    var href = "/benezet/piece/?slug=" + encodeURIComponent(p.slug);
    var hasImg = p.images && p.images.length;
    var media = hasImg
      ? '<img src="' + attr(p.images[0]) + '" alt="' + attr(p.title + (p.maker ? ", " + p.maker : "")) + '" loading="lazy" decoding="async">'
      : '<span class="piece__empty" aria-label="Photograph to follow"><span>Photograph<br>to follow</span></span>';
    var maker = [p.maker, p.period].filter(Boolean).join(" · ");
    var delay = (idx % 4) * 80;
    return (
      '<a class="piece" href="' + href + '" data-reveal data-reveal-delay="' + delay + '">' +
      '<span class="piece__frame">' + statusTag(p) + media + "</span>" +
      '<span class="piece__body">' +
      '<span class="piece__stock">No. ' + esc(p.stock_no) + "</span>" +
      '<span class="piece__title">' + esc(p.title) + "</span>" +
      (maker ? '<span class="piece__maker">' + esc(maker) + "</span>" : "") +
      '<span class="piece__foot">' +
      '<span class="piece__poa">' + (p.status === "sold" ? "Sold" : "POA · Enquire") + "</span>" +
      (p.status === "sold" ? "" : '<span class="piece__cc">Click &amp; collect</span>') +
      "</span></span></a>"
    );
  }

  /* ============================================================
     Enquiry drawer — reachable from nav, hero, and every piece.
     Prefilled with item title + stock number when opened from a piece.
     ============================================================ */
  var enqEl, lastFocus;

  function buildEnquiry() {
    if (D.querySelector(".enq")) { enqEl = D.querySelector(".enq"); return; }
    var html =
      '<div class="enq" aria-hidden="true">' +
      '<div class="enq__scrim" data-enq-close></div>' +
      '<div class="enq__panel" role="dialog" aria-modal="true" aria-label="Make an enquiry">' +
      '<button class="enq__close" type="button" data-enq-close>Close ✕</button>' +
      '<div class="enq__form-wrap">' +
      '<p class="eyebrow">Price on application</p>' +
      "<h2>Make an enquiry</h2>" +
      '<div class="enq__ctx" id="enqCtx"><span class="k">Regarding</span>' +
      '<div class="t" id="enqCtxTitle"></div><div class="mono" id="enqCtxStock" style="font-size:.62rem;color:var(--gilt);letter-spacing:.2em"></div></div>' +
      '<form id="enqForm" novalidate>' +
      '<div class="field" data-f="name"><label for="enqName">Your name</label>' +
      '<input id="enqName" name="name" autocomplete="name" required><div class="msg" aria-live="polite"></div></div>' +
      '<div class="field" data-f="email"><label for="enqEmail">Email</label>' +
      '<input id="enqEmail" name="email" type="email" autocomplete="email" required><div class="msg" aria-live="polite"></div></div>' +
      '<div class="field" data-f="phone"><label for="enqPhone">Phone (optional)</label>' +
      '<input id="enqPhone" name="phone" type="tel" autocomplete="tel"><div class="msg" aria-live="polite"></div></div>' +
      '<div class="field" data-f="message"><label for="enqMsg">Your enquiry</label>' +
      '<textarea id="enqMsg" name="message" required></textarea><div class="msg" aria-live="polite"></div></div>' +
      '<label class="check" id="enqCollectWrap"><input type="checkbox" id="enqCollect" name="wants_collection">' +
      "<span>I&rsquo;d like to reserve this for click &amp; collect.</span></label>" +
      '<input type="text" class="hp" id="enqCompany" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<input type="hidden" id="enqPieceTitle" name="piece_title">' +
      '<input type="hidden" id="enqStock" name="stock_no">' +
      '<input type="hidden" id="enqPieceId" name="piece_id">' +
      '<button class="btn btn--dark" type="submit" id="enqSubmit" style="margin-top:.6rem">Send enquiry</button>' +
      '<p class="enq__note">Benezet replies to every enquiry personally. No account, no checkout.</p>' +
      "</form></div>" +
      '<div class="enq__state" id="enqSuccess"><p class="eyebrow" style="color:var(--gilt)">Enquiry sent</p>' +
      "<h3>Thank you — Benezet will be in touch shortly.</h3>" +
      "<p>Your message is with us. If your enquiry is about a particular piece, we&rsquo;ll confirm availability and arrange a viewing or click &amp; collect.</p>" +
      '<button class="btn btn--line" type="button" data-enq-close style="margin-top:1rem">Close</button></div>' +
      '<div class="enq__state" id="enqError"><p class="eyebrow" style="color:var(--claret)">Not sent</p>' +
      "<h3>That didn&rsquo;t go through.</h3>" +
      "<p>Please try once more, or call the gallery directly on <a href=\"tel:+35312830000\">+353 1 283 0000</a> and we&rsquo;ll take your enquiry over the phone.</p>" +
      '<button class="btn btn--line" type="button" id="enqRetry" style="margin-top:1rem">Try again</button></div>' +
      "</div></div>";
    var wrap = D.createElement("div");
    wrap.innerHTML = html;
    enqEl = wrap.firstChild;
    D.body.appendChild(enqEl);

    enqEl.querySelectorAll("[data-enq-close]").forEach(function (b) {
      b.addEventListener("click", closeEnquiry);
    });
    enqEl.querySelector("#enqForm").addEventListener("submit", submitEnquiry);
    enqEl.querySelector("#enqRetry").addEventListener("click", function () {
      showState(null);
    });
    D.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && enqEl.classList.contains("open")) closeEnquiry();
    });
  }

  function showState(which) {
    var form = enqEl.querySelector(".enq__form-wrap");
    var ok = enqEl.querySelector("#enqSuccess");
    var err = enqEl.querySelector("#enqError");
    form.style.display = which === "success" || which === "error" ? "none" : "block";
    ok.classList.toggle("show", which === "success");
    err.classList.toggle("show", which === "error");
  }

  function openEnquiry(ctx) {
    buildEnquiry();
    ctx = ctx || {};
    var ctxBox = enqEl.querySelector("#enqCtx");
    var collectWrap = enqEl.querySelector("#enqCollectWrap");
    if (ctx.title) {
      enqEl.querySelector("#enqCtxTitle").textContent = ctx.title;
      enqEl.querySelector("#enqCtxStock").textContent = ctx.stock ? "No. " + ctx.stock : "";
      enqEl.querySelector("#enqPieceTitle").value = ctx.title;
      enqEl.querySelector("#enqStock").value = ctx.stock || "";
      enqEl.querySelector("#enqPieceId").value = ctx.id || "";
      ctxBox.classList.add("show");
      collectWrap.style.display = "flex";
      if (ctx.collect) enqEl.querySelector("#enqCollect").checked = true;
      var msg = enqEl.querySelector("#enqMsg");
      if (!msg.value) msg.value = "I'd like to enquire about " + ctx.title +
        (ctx.stock ? " (No. " + ctx.stock + ")" : "") + ". ";
    } else {
      ctxBox.classList.remove("show");
      collectWrap.style.display = "none";
      enqEl.querySelector("#enqPieceTitle").value = "";
      enqEl.querySelector("#enqStock").value = "";
      enqEl.querySelector("#enqPieceId").value = "";
    }
    showState(null);
    lastFocus = D.activeElement;
    enqEl.classList.add("open");
    enqEl.setAttribute("aria-hidden", "false");
    D.body.classList.add("modal-open");
    setTimeout(function () { enqEl.querySelector("#enqName").focus(); }, 60);
  }

  function closeEnquiry() {
    if (!enqEl) return;
    enqEl.classList.remove("open");
    enqEl.setAttribute("aria-hidden", "true");
    D.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ── validation (mirrors the server-side Zod schema) ── */
  function validate(data) {
    var errs = {};
    if (!data.name || data.name.trim().length < 2) errs.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "")) errs.email = "A valid email, so we can reply.";
    if (data.phone && data.phone.replace(/[^0-9]/g, "").length < 6 && data.phone.trim().length)
      errs.phone = "That phone number looks too short.";
    if (!data.message || data.message.trim().length < 10) errs.message = "A line or two about your enquiry.";
    return errs;
  }
  function paintErrors(errs) {
    ["name", "email", "phone", "message"].forEach(function (f) {
      var field = enqEl.querySelector('.field[data-f="' + f + '"]');
      if (!field) return;
      var msg = field.querySelector(".msg");
      if (errs[f]) { field.classList.add("err"); msg.textContent = errs[f]; }
      else { field.classList.remove("err"); msg.textContent = ""; }
    });
  }

  async function submitEnquiry(e) {
    e.preventDefault();
    var form = e.target;
    var data = {
      name: form.name.value, email: form.email.value, phone: form.phone.value,
      message: form.message.value,
      wants_collection: form.wants_collection ? form.wants_collection.checked : false,
      piece_title: form.piece_title.value, stock_no: form.stock_no.value,
      piece_id: form.piece_id.value, company: form.company.value // honeypot
    };
    var errs = validate(data);
    paintErrors(errs);
    if (Object.keys(errs).length) {
      var first = enqEl.querySelector(".field.err input, .field.err textarea");
      if (first) first.focus();
      return;
    }
    var btn = enqEl.querySelector("#enqSubmit");
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      var r = await fetch("/api/benezet-enquiry", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!r.ok) throw new Error("bad status " + r.status);
      showState("success");
      form.reset();
    } catch (err) {
      showState("error");
    } finally {
      btn.disabled = false; btn.textContent = "Send enquiry";
    }
  }

  function initEnquiryTriggers() {
    D.addEventListener("click", function (e) {
      var t = e.target.closest("[data-enquire]");
      if (!t) return;
      e.preventDefault();
      openEnquiry({
        title: t.getAttribute("data-piece-title") || "",
        stock: t.getAttribute("data-stock") || "",
        id: t.getAttribute("data-piece-id") || "",
        collect: t.getAttribute("data-collect") === "1"
      });
    });
  }

  /* ── lightbox (detail images) ── */
  function initLightbox() {
    var box;
    function ensure() {
      if (box) return box;
      box = D.createElement("div");
      box.className = "lightbox";
      box.innerHTML = '<button type="button" aria-label="Close">Close ✕</button><img alt="">';
      D.body.appendChild(box);
      box.addEventListener("click", function (e) {
        if (e.target === box || e.target.tagName === "BUTTON") close();
      });
      D.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
      return box;
    }
    function open(src, alt) {
      ensure();
      var img = box.querySelector("img");
      img.src = src; img.alt = alt || "";
      box.classList.add("open");
      D.body.classList.add("modal-open");
    }
    function close() {
      if (box) { box.classList.remove("open"); D.body.classList.remove("modal-open"); }
    }
    window.BENEZET_LIGHTBOX = { open: open, close: close };
  }

  /* ── boot ── */
  function boot() {
    injectWordmarks();
    initNav();
    initReveals();
    initEnquiryTriggers();
    initLightbox();
    // expose for pages that build content dynamically
    window.BENEZET = {
      pieceCard: pieceCard, openEnquiry: openEnquiry, esc: esc, attr: attr,
      injectWordmarks: injectWordmarks, initReveals: initReveals
    };
    // year stamps
    D.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
