/* Inline editor (replica-only addition, not part of the original site):
   "Edit" toggles edit mode — every [data-edit] text becomes editable and
   clicking a media placeholder opens a file picker to set an image.
   "Publish" saves the page state to the shared store (Supabase) so everyone
   who opens the page sees the latest published version; the page also checks
   for a newer shared version every minute while not editing.
   "Download" saves the edited page as a standalone HTML file. */
(function () {
  'use strict';

  var body = document.body;
  var toggleBtn = document.getElementById('editor-toggle');
  var publishBtn = document.getElementById('editor-publish');
  var downloadBtn = document.getElementById('editor-download');
  var statusEl = document.getElementById('editor-status');
  var fileInput = document.getElementById('editor-file');
  var currentBox = null;

  /* Shared store: same Supabase project + publishable (browser-safe) key the
     rest of this repo already uses; RLS limits anon access to replica_state. */
  var SUPABASE_URL = 'https://lkwzyaygeqxfnmzekadj.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_m1fXPq2PNZ3JMjQDx05pqg_FT2UT0xH';
  var STATE_ENDPOINT = SUPABASE_URL + '/rest/v1/replica_state';
  var HEADERS = {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
  };
  var lastApplied = null;
  var statusTimer = null;

  function setStatus(msg) {
    statusEl.textContent = msg;
    clearTimeout(statusTimer);
    if (msg) statusTimer = setTimeout(function () { statusEl.textContent = ''; }, 6000);
  }

  /* ----------------------------- edit mode ------------------------------ */

  function setEditMode(on) {
    body.classList.toggle('edit-mode', on);
    toggleBtn.textContent = on ? 'Done' : 'Edit';
    toggleBtn.classList.toggle('is-active', on);
    document.querySelectorAll('[data-edit], [data-detail-field]').forEach(function (el) {
      if (on) el.setAttribute('contenteditable', 'plaintext-only');
      else el.removeAttribute('contenteditable');
    });
  }

  toggleBtn.addEventListener('click', function () {
    setEditMode(!body.classList.contains('edit-mode'));
  });

  window.__replicaEditorMedia = { set: setBoxImage, clear: clearBoxImage };

  /* While editing, links must not navigate (or jump to top via href="#"). */
  document.addEventListener('click', function (e) {
    if (body.classList.contains('edit-mode') && e.target.closest('a')) e.preventDefault();
  });

  /* ------------------------------ images ------------------------------- */

  function setBoxImage(box, src) {
    var primary = box.querySelector('.media-box_media--primary');
    if (!primary) return;
    var img = box.querySelector('.editor-img');
    if (!img) {
      img = document.createElement('img');
      img.className = 'editor-img';
      img.alt = '';
      primary.appendChild(img);
    }
    img.src = src;
    box.classList.add('img-set');
    if (!box.querySelector('.editor-remove-img')) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'editor-remove-img';
      btn.setAttribute('aria-label', 'Remove image');
      btn.textContent = '×';
      box.querySelector('.media-box_frame').appendChild(btn);
    }
  }

  function clearBoxImage(box) {
    var img = box.querySelector('.editor-img');
    if (img) img.remove();
    var btn = box.querySelector('.editor-remove-img');
    if (btn) btn.remove();
    box.classList.remove('img-set');
  }

  /* Downscale large uploads so shared publishing stays small and fast. */
  function fileToDataURI(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      if (file.size < 300 * 1024) return cb(reader.result);
      var im = new Image();
      im.onload = function () {
        var max = 1600;
        var scale = Math.min(1, max / Math.max(im.width, im.height));
        var c = document.createElement('canvas');
        c.width = Math.round(im.width * scale);
        c.height = Math.round(im.height * scale);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.85));
      };
      im.onerror = function () { cb(reader.result); };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  document.addEventListener('click', function (e) {
    if (!body.classList.contains('edit-mode')) return;

    var remove = e.target.closest('.editor-remove-img');
    if (remove) {
      var removedBox = remove.closest('.media-box');
      clearBoxImage(removedBox);
      if (window.__replicaDetail) window.__replicaDetail.noteImage(removedBox, null);
      e.preventDefault();
      return;
    }

    var frame = e.target.closest('.media-box_frame');
    if (frame && !e.target.closest('[contenteditable]')) {
      currentBox = frame.closest('.media-box');
      fileInput.click();
      e.preventDefault();
    }
  });

  fileInput.addEventListener('change', function () {
    var file = fileInput.files && fileInput.files[0];
    if (!file || !currentBox) return;
    fileToDataURI(file, function (src) {
      setBoxImage(currentBox, src);
      if (window.__replicaDetail) window.__replicaDetail.noteImage(currentBox, src);
      fileInput.value = '';
    });
  });

  /* --------------------- shared state (gather/apply) -------------------- */

  /* detail-view boxes/fields are stored per card, not by DOM order */
  function contentBoxes() {
    return [].filter.call(document.querySelectorAll('.media-box'), function (box) {
      return !box.closest('#project-detail');
    });
  }

  function gatherState() {
    var texts = [].map.call(document.querySelectorAll('[data-edit]'), function (el) {
      return el.textContent;
    });
    var images = {};
    contentBoxes().forEach(function (box, i) {
      var img = box.querySelector('.editor-img');
      if (img) images[i] = img.src;
    });
    return {
      v: 2,
      feedCount: document.querySelectorAll('.feed_item').length,
      texts: texts,
      images: images,
      details: window.__replicaDetail ? window.__replicaDetail.get() : {},
    };
  }

  function applyState(state) {
    if (!state) return;
    // match the publisher's feed length so element order lines up
    var have = document.querySelectorAll('.feed_item').length;
    if (state.feedCount > have && window.__replicaFeed) {
      window.__replicaFeed.append(state.feedCount - have);
    }
    var els = document.querySelectorAll('[data-edit]');
    (state.texts || []).forEach(function (t, i) {
      if (els[i] && els[i].textContent !== t) els[i].textContent = t;
    });
    var boxes = contentBoxes();
    boxes.forEach(function (box, i) {
      var src = state.images && state.images[i];
      if (src) setBoxImage(box, src);
      else if (box.classList.contains('img-set')) clearBoxImage(box);
    });
    if (state.details && window.__replicaDetail) window.__replicaDetail.set(state.details);
  }

  /* --------------------------- publish / sync --------------------------- */

  function fetchLatest() {
    return fetch(STATE_ENDPOINT + '?select=state,created_at&order=created_at.desc&limit=1', {
      headers: HEADERS,
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (rows) { return rows[0] || null; });
  }

  publishBtn.addEventListener('click', function () {
    var payload = JSON.stringify({ state: gatherState() });
    if (payload.length > 4 * 1024 * 1024) {
      setStatus('Too large to publish — use smaller images');
      return;
    }
    setStatus('Publishing…');
    fetch(STATE_ENDPOINT, { method: 'POST', headers: HEADERS, body: payload })
      .then(function (r) {
        if (r.ok) {
          lastApplied = 'just-published';
          setStatus('Published — everyone sees this version now');
        } else if (r.status === 404) {
          setStatus('Shared saving not set up yet — see README');
        } else {
          setStatus('Publish failed (HTTP ' + r.status + ')');
        }
      })
      .catch(function () { setStatus('Publish failed — no connection'); });
  });

  function syncFromShared(manual) {
    fetchLatest().then(function (row) {
      if (row && row.created_at !== lastApplied && lastApplied !== 'just-published') {
        applyState(row.state);
        lastApplied = row.created_at;
        setStatus('Showing shared version from ' + new Date(row.created_at).toLocaleString());
      } else if (row) {
        lastApplied = row.created_at;
        if (manual) setStatus('Already up to date');
      } else if (manual) {
        setStatus('Nothing published yet');
      }
    }).catch(function () {
      // shared store unreachable or not set up — page works locally
      if (manual) setStatus('Shared saving not set up yet — see README');
    });
  }

  syncFromShared();
  setInterval(function () {
    if (!body.classList.contains('edit-mode')) syncFromShared();
  }, 60000);

  /* ----------------------------- download ------------------------------ */

  downloadBtn.addEventListener('click', function () {
    var clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('[contenteditable]').forEach(function (el) {
      el.removeAttribute('contenteditable');
    });
    var cloneBody = clone.querySelector('body');
    cloneBody.classList.remove('edit-mode', 'navigation-open');
    var cursor = clone.querySelector('.custom-cursor');
    if (cursor) { cursor.removeAttribute('style'); cursor.classList.remove('is-active'); }
    // the exported feed is already populated; tell app.js not to rebuild it
    var feed = clone.querySelector('#feed');
    if (feed) feed.setAttribute('data-prebuilt', 'true');
    var modal = clone.querySelector('.navigation_modal');
    if (modal) modal.setAttribute('hidden', '');
    var tb = clone.querySelector('#editor-toggle');
    if (tb) { tb.textContent = 'Edit'; tb.classList.remove('is-active'); }
    var st = clone.querySelector('#editor-status');
    if (st) st.textContent = '';
    // export always reopens on the home view, carrying the detail store along
    var detail = clone.querySelector('#project-detail');
    if (detail) {
      detail.setAttribute('hidden', '');
      if (window.__replicaDetail) detail.setAttribute('data-details', JSON.stringify(window.__replicaDetail.get()));
    }
    clone.querySelectorAll('.site-main > .module').forEach(function (m) {
      if (m.id !== 'project-detail') m.removeAttribute('hidden');
    });

    var html = '<!DOCTYPE html>\n' + clone.outerHTML;
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = 'hdm-replica-edited.html';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
})();
