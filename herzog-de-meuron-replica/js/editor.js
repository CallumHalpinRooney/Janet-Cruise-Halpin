/* Inline editor (replica-only addition, not part of the original site):
   "Edit" toggles edit mode — every [data-edit] text becomes editable and
   clicking a media placeholder opens a file picker to set an image.
   "Download" saves the edited page as a standalone HTML file that can be
   reopened and edited again. */
(function () {
  'use strict';

  var body = document.body;
  var toggleBtn = document.getElementById('editor-toggle');
  var downloadBtn = document.getElementById('editor-download');
  var fileInput = document.getElementById('editor-file');
  var currentBox = null;

  function setEditMode(on) {
    body.classList.toggle('edit-mode', on);
    toggleBtn.textContent = on ? 'Done' : 'Edit';
    toggleBtn.classList.toggle('is-active', on);
    document.querySelectorAll('[data-edit]').forEach(function (el) {
      if (on) el.setAttribute('contenteditable', 'plaintext-only');
      else el.removeAttribute('contenteditable');
    });
  }

  toggleBtn.addEventListener('click', function () {
    setEditMode(!body.classList.contains('edit-mode'));
  });

  /* While editing, links must not navigate (or jump to top via href="#"). */
  document.addEventListener('click', function (e) {
    if (body.classList.contains('edit-mode') && e.target.closest('a')) e.preventDefault();
  });

  /* ------------------------------ images ------------------------------- */

  document.addEventListener('click', function (e) {
    if (!body.classList.contains('edit-mode')) return;

    var remove = e.target.closest('.editor-remove-img');
    if (remove) {
      var box = remove.closest('.media-box');
      box.querySelectorAll('.editor-img').forEach(function (img) { img.remove(); });
      box.classList.remove('img-set');
      remove.remove();
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
    var reader = new FileReader();
    reader.onload = function () {
      var primary = currentBox.querySelector('.media-box_media--primary');
      var img = currentBox.querySelector('.editor-img');
      if (!img) {
        img = document.createElement('img');
        img.className = 'editor-img';
        img.alt = '';
        primary.appendChild(img);
      }
      img.src = reader.result;
      currentBox.classList.add('img-set');
      if (!currentBox.querySelector('.editor-remove-img')) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'editor-remove-img';
        btn.setAttribute('aria-label', 'Remove image');
        btn.textContent = '×';
        currentBox.querySelector('.media-box_frame').appendChild(btn);
      }
      fileInput.value = '';
    };
    reader.readAsDataURL(file);
  });

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

    var html = '<!DOCTYPE html>\n' + clone.outerHTML;
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = 'hdm-replica-edited.html';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
})();
