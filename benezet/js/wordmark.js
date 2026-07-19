/* ============================================================
   BENEZET — the wordmark
   A bespoke cursive signature, traced as SVG strokes to echo the
   cream script on Leo's shopfront fascia. Single-weight pen strokes
   (stroke, no fill) so it reads as handwriting, not a font.
   Letters are generated so the three e's stay identical and the
   whole word sits on one baseline.

   Grid: baseline y=150, x-height top y=100, cap top y=48,
   t-ascender y=66.
   ============================================================ */
(function () {
  // cursive e: a small eye-loop high up, bottom-left OPEN, flowing
  // out to the baseline on the right (this is what stops it reading 'o').
  function e(x) {
    return [
      // eye (small loop in the upper half)
      "M " + (x + 12) + " 122 C " + (x + 8) + " 104 " + (x + 38) + " 102 " + (x + 40) + " 116 C " + (x + 42) + " 128 " + (x + 24) + " 132 " + (x + 14) + " 124",
      // bowl + exit, left side left open
      "M " + (x + 14) + " 124 C " + (x + 16) + " 142 " + (x + 42) + " 150 " + (x + 60) + " 132"
    ];
  }
  // cursive n: two arches from the baseline
  function n(x) {
    return [
      "M " + x + " 132 C " + (x + 4) + " 112 " + (x + 16) + " 102 " + (x + 26) + " 102 C " + (x + 36) + " 102 " + (x + 38) + " 118 " + (x + 34) + " 132 C " + (x + 38) + " 116 " + (x + 50) + " 102 " + (x + 60) + " 102 C " + (x + 72) + " 102 " + (x + 74) + " 120 " + (x + 68) + " 132"
    ];
  }
  // cursive z: top stroke, diagonal, looped foot
  function z(x) {
    return [
      "M " + x + " 108 C " + (x + 20) + " 104 " + (x + 42) + " 104 " + (x + 54) + " 108",
      "M " + (x + 52) + " 110 C " + (x + 40) + " 124 " + (x + 20) + " 138 " + (x + 6) + " 150",
      "M " + (x + 6) + " 150 C " + (x + 24) + " 152 " + (x + 44) + " 152 " + (x + 64) + " 146"
    ];
  }
  // t: ascender stem + crossbar
  function t(x) {
    return [
      "M " + (x + 26) + " 66 C " + (x + 16) + " 100 " + (x + 10) + " 132 " + (x + 20) + " 148 C " + (x + 28) + " 158 " + (x + 40) + " 154 " + (x + 50) + " 144",
      "M " + x + " 102 C " + (x + 26) + " 98 " + (x + 52) + " 98 " + (x + 72) + " 102"
    ];
  }

  var PATHS = [].concat(
    // ── Capital B: stem + two bowls ──
    [
      "M 94 52 C 86 92 86 120 92 150",
      "M 94 52 C 132 46 150 78 112 92 C 140 96 138 116 92 100",
      "M 92 100 C 134 96 156 126 118 138 C 144 142 126 158 90 150",
      // connector B → e
      "M 90 150 C 118 152 138 138 152 122"
    ],
    e(140),                              // e  (bowl exits ~200,132)
    ["M 200 132 C 200 132 200 132 200 132"], // (noop keeps indices readable)
    n(200),                              // n  (exits ~268,132)
    e(268),                              // e  (exits ~328,132)
    ["M 328 132 C 332 122 334 114 336 108"], // connector e → z
    z(336),                              // z  (foot ends ~400,146)
    ["M 400 146 C 408 145 412 135 416 122"], // connector z → e
    e(404),                              // e  (exits ~464,132)
    ["M 464 132 C 474 130 484 126 492 118"], // connector e → t
    t(470),                              // t  (stem ends ~520,144)
    // terminal swash (flat signature underline, not a letter)
    ["M 520 148 C 552 158 582 154 606 142"]
  );

  function svg(extraClass) {
    var p = PATHS.map(function (d) { return '<path d="' + d + '"/>'; }).join("");
    return (
      '<span class="wordmark ' + (extraClass || "") + '" role="img" aria-label="Benezet">' +
      '<svg viewBox="0 0 660 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<g stroke-width="6">' + p + "</g></svg></span>"
    );
  }

  window.BENEZET_WORDMARK = { svg: svg, paths: PATHS };
})();
