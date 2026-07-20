/* Behaviors per DESIGN_NOTES.md: menu overlay, chip expander, search field,
   word-reveal, lazy fade-in, infinite feed, custom cursor. No dependencies. */
(function () {
  'use strict';

  /* ---------------- feed data (all placeholder content) ---------------- */

  var KICKERS = ['News', 'Project', 'Monograph', 'News', 'Project'];
  var RATIOS = [1.3333, 1, 0.75, 0.6668];
  var feedCount = 0;

  function feedCard(i) {
    var li = document.createElement('li');
    li.className = 'feed_item';

    // one circular topic tile mid-feed, like the original
    if (i === 18) {
      li.innerHTML =
        '<a class="feed_card_link no-underline" href="#">' +
        '<div class="topic-circle"><span data-edit>Topic Title</span></div>' +
        '<div class="card_text"><p class="card_kicker" data-edit>Topic</p></div>' +
        '</a>';
      return li;
    }

    var ratio = RATIOS[i % RATIOS.length];
    var kicker = KICKERS[i % KICKERS.length];
    var n = String(i + 1).padStart(2, '0');
    var dims = ratio >= 1 ? '1000×' + Math.round(1000 / ratio)
                          : Math.round(1000 * ratio) + '×1000';
    // portraits get a ~square normalized frame, like the original feed grid
    var frame = ratio < 1 ? ' media-box--contain" style="--frame-ratio: 1; ' : '" style="';
    li.innerHTML =
      '<a class="feed_card_link no-underline" href="#">' +
      '<figure class="media-box' + frame + '--aspect-ratio: ' + ratio + '">' +
      '<div class="media-box_frame">' +
      '<div class="media-box_media media-box_media--primary">' +
      '<span class="ph-label">IMAGE PLACEHOLDER — feed-card-' + n + ' ' + dims + ' (' + ratio + ')</span></div>' +
      '<div class="media-box_media media-box_media--secondary">' +
      '<span class="ph-label">IMAGE PLACEHOLDER — feed-card-' + n + '-hover</span></div>' +
      '</div></figure>' +
      '<div class="card_text">' +
      '<p class="card_kicker" data-edit>' + kicker + '</p>' +
      '<div class="card_title" data-edit>' + (kicker === 'Project' ? '000 ' : '') +
      'Placeholder Title ' + n + (i % 3 === 0 ? ' With a Second Line of Text' : '') + '</div>' +
      '</div></a>';
    return li;
  }

  var feed = document.getElementById('feed');

  function appendBatch(size) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < size; i++) frag.appendChild(feedCard(feedCount++));
    feed.appendChild(frag);
    observeMedia();
  }

  /* ------------------- lazy fade-in (250ms ease-out) -------------------- */

  var mediaObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-loaded');
        mediaObserver.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px 200px 0px' });

  function observeMedia() {
    document.querySelectorAll('.media-box:not(.is-loaded)').forEach(function (el) {
      mediaObserver.observe(el);
    });
  }

  /* ------------------------ infinite feed scroll ------------------------ */

  var MAX_BATCHES = 3;
  var batches = 0;
  // a page exported by the inline editor ships with its feed already in the DOM
  if (feed.hasAttribute('data-prebuilt') || feed.children.length) {
    batches = MAX_BATCHES;
    observeMedia();
  } else {
    appendBatch(40);
    batches++;
  }

  var sentinel = document.querySelector('.feed_sentinel');
  var feedObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && batches < MAX_BATCHES) {
      appendBatch(20);
      batches++;
      if (batches >= MAX_BATCHES) feedObserver.disconnect();
    }
  }, { rootMargin: '600px' });
  feedObserver.observe(sentinel);

  /* -------------------------- word reveal ------------------------------- */
  /* Split into .word spans, fade in with random-order stagger:
     total stagger amount = wordCount * 0.04s (as in the original bundle). */

  function revealWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    var spans = words.map(function (w, i) {
      var s = document.createElement('span');
      s.className = 'word';
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      return s;
    });
    var order = spans.map(function (_, i) { return i; })
      .sort(function () { return Math.random() - 0.5; });
    var amount = spans.length * 0.04 * 1000;
    order.forEach(function (idx, pos) {
      var s = spans[idx];
      setTimeout(function () {
        s.classList.add('is-visible');
        s.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: 400, easing: 'ease-out' }
        );
      }, (pos / Math.max(order.length - 1, 1)) * amount);
    });
  }

  document.querySelectorAll('.js-words').forEach(revealWords);

  /* --------------------------- menu overlay ----------------------------- */

  var toggle = document.querySelector('.navigation_toggle');
  var modal = document.querySelector('.navigation_modal');

  function openMenu() {
    modal.hidden = false;
    modal.classList.add('is-opening');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { modal.classList.remove('is-opening'); });
    });
    document.body.classList.add('navigation-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    modal.classList.add('is-closing');
    setTimeout(function () {
      modal.classList.remove('is-closing');
      modal.hidden = true;
    }, 300);
    document.body.classList.remove('navigation-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    document.body.classList.contains('navigation-open') ? closeMenu() : openMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('navigation-open')) closeMenu();
  });
  modal.querySelector('.navigation_modal_backdrop').addEventListener('click', closeMenu);

  /* --------------------------- chip expander ---------------------------- */

  var pageLinks = document.querySelector('.page-links');
  var expander = document.querySelector('.page-links_item--toggle button');
  expander.addEventListener('click', function () {
    pageLinks.classList.add('is-expanded');
  });

  /* ----------------------------- search --------------------------------- */

  var search = document.querySelector('.global-search');
  var field = search.querySelector('.global-search_field');
  var clearBtn = search.querySelector('.global-search_clear');

  field.addEventListener('focus', function () { search.classList.add('is-focused'); });
  field.addEventListener('blur', function () {
    if (!field.value) search.classList.remove('is-focused');
  });
  field.addEventListener('input', function () {
    search.classList.toggle('has-value', !!field.value);
    clearBtn.hidden = !field.value;
  });
  clearBtn.addEventListener('click', function () {
    field.value = '';
    field.dispatchEvent(new Event('input'));
    field.focus();
  });

  /* --------------------------- custom cursor ---------------------------- */

  var cursor = document.querySelector('.custom-cursor');
  var cursorX = 0, cursorY = 0, raf = null;

  function moveCursor(e) {
    cursorX = e.clientX;
    cursorY = e.clientY;
    if (!raf) {
      raf = requestAnimationFrame(function () {
        cursor.style.transform = 'translate(' + cursorX + 'px,' + cursorY + 'px)';
        raf = null;
      });
    }
  }

  document.addEventListener('pointermove', moveCursor, { passive: true });
  document.addEventListener('pointerover', function (e) {
    cursor.classList.toggle('is-active', !!e.target.closest('[data-cursor]'));
  });
})();
