/* Project detail view: any card links to #project/<id>, which opens a detail
   page (kicker, title, hero, text, gallery, facts) in the same design system.
   Per-card content lives in a store keyed by card id; the editor persists it
   (Download embeds it, Publish syncs it). Loads after editor.js — it uses the
   editor's media helpers at runtime. */
(function () {
  'use strict';

  var view = document.getElementById('project-detail');
  var currentId = null;
  var store = {};

  // a Download export carries the store in a data attribute
  try { store = JSON.parse(view.getAttribute('data-details') || '{}') || {}; } catch (e) { store = {}; }
  view.removeAttribute('data-details');

  var DEFAULTS = {
    kicker: 'Project',
    title: 'Project Title Placeholder',
    subtitle: 'City Placeholder, Country Placeholder',
    intro: 'Intro paragraph placeholder — a short standfirst describing the project in one or two sentences.',
    body1: 'Body text placeholder. Replace this with a paragraph about the project: the brief, the site, the design approach and the materials. This copy is here to hold the layout at the correct measure and rhythm.',
    body2: 'Second body paragraph placeholder. More detail about the process, the collaborators and the outcome can live here. Click any of this text in Edit mode to replace it.',
    f1l: 'Client', f1v: 'Client name placeholder',
    f2l: 'Status', f2v: 'Status placeholder',
    f3l: 'Year', f3v: '0000–0000',
    f4l: 'Location', f4v: 'Location placeholder',
    f5l: 'Program', f5v: 'Program placeholder',
  };

  function rec(id) {
    if (!store[id]) store[id] = { fields: {}, images: {} };
    if (!store[id].fields) store[id].fields = {};
    if (!store[id].images) store[id].images = {};
    return store[id];
  }

  function populate(id) {
    var card = document.querySelector('[data-card-id="' + id + '"]');
    var d = rec(id);
    view.querySelectorAll('[data-detail-field]').forEach(function (el) {
      var f = el.getAttribute('data-detail-field');
      var v = d.fields[f];
      if (v == null && card) {
        if (f === 'title') { var t = card.querySelector('.card_title'); v = t && t.textContent; }
        if (f === 'kicker') { var k = card.querySelector('.card_kicker'); v = k && k.textContent; }
      }
      el.textContent = (v == null) ? (DEFAULTS[f] || '') : v;
    });
    var media = window.__replicaEditorMedia;
    view.querySelectorAll('[data-detail-slot]').forEach(function (box) {
      var slot = box.getAttribute('data-detail-slot');
      var src = d.images[slot];
      if (!src && slot === 'hero' && card) {
        var cardImg = card.querySelector('.editor-img');
        if (cardImg) src = cardImg.src;
      }
      if (!media) return;
      if (src) media.set(box, src);
      else media.clear(box);
    });
    var title = view.querySelector('[data-detail-field="title"]');
    if (window.__replicaWords && title) window.__replicaWords(title);
  }

  function open(id) {
    currentId = id;
    populate(id);
    document.querySelectorAll('.site-main > .module').forEach(function (m) {
      if (m !== view) m.hidden = true;
    });
    view.hidden = false;
    window.scrollTo(0, 0);
  }

  function close() {
    if (view.hidden) return;
    currentId = null;
    view.hidden = true;
    document.querySelectorAll('.site-main > .module').forEach(function (m) {
      if (m !== view) m.hidden = false;
    });
  }

  // persist text edits per card as they happen
  view.addEventListener('input', function (e) {
    var f = e.target.closest('[data-detail-field]');
    if (f && currentId) rec(currentId).fields[f.getAttribute('data-detail-field')] = f.textContent;
  });

  function route() {
    var m = location.hash.match(/^#project\/([\w-]+)$/);
    if (m) open(m[1]);
    else close();
  }
  window.addEventListener('hashchange', route);
  route();

  window.__replicaDetail = {
    get: function () { return store; },
    set: function (s) {
      store = s || {};
      if (currentId) populate(currentId);
    },
    noteImage: function (box, src) {
      var slot = box.getAttribute('data-detail-slot');
      if (!slot || !currentId) return;
      if (src) rec(currentId).images[slot] = src;
      else delete rec(currentId).images[slot];
    },
    isDetailBox: function (box) { return !!box.closest('#project-detail'); },
  };
})();
