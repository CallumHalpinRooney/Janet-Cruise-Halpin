/* ============================================================
   BENEZET — the wordmark
   Set in a stylish display face (see --wordmark in site.css) rather
   than a script. Rendered as real text so it's selectable and
   accessible; CSS handles the caps + letter-spacing. Reused at three
   sizes: header (small), hero (large), footer (mid).
   ============================================================ */
(function () {
  function html(extraClass) {
    return '<span class="wordmark ' + (extraClass || "") + '">Benezet</span>';
  }
  // `svg` kept as an alias so existing call sites don't change; it now
  // returns the styled text wordmark, not an SVG.
  window.BENEZET_WORDMARK = { html: html, svg: html };
})();
