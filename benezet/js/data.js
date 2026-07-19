/* ============================================================
   BENEZET — data layer (single source of truth for the catalogue)

   The catalogue lives in a Supabase `pieces` table so Leo can add,
   edit and photograph stock from /admin without a redeploy. This
   module reads it at runtime with the public (anon) key. If the
   table isn't reachable yet, it falls back to the text-only SEED
   below so the grid, filters and detail page can be reviewed —
   exactly the pattern the sibling Lonrú sites use for their
   dashboards. Every piece ships with NO images; Leo uploads his own
   photographs in /admin, which writes public URLs into `images`.

   Schema (see benezet/README.md for the full SQL):
     id, slug, title, maker, period, category, materials, dimensions,
     provenance, condition_note, stock_no, images (jsonb),
     status (available|reserved|sold), featured (bool), created_at
   ============================================================ */
(function () {
  var SUPABASE_URL = "https://lkwzyaygeqxfnmzekadj.supabase.co";
  var SUPABASE_KEY = "sb_publishable_m1fXPq2PNZ3JMjQDx05pqg_FT2UT0xH";

  // Category order for the filter bar (labels). Only categories that
  // actually appear in the data are shown — this array just fixes order.
  var CATEGORY_ORDER = [
    "Furniture", "Paintings", "Mirrors", "Silver",
    "Lighting", "Sculpture", "Objets"
  ];

  /* ── seed: text only, every image slot deliberately blank ──
     Written to read like catalogue entries, not shop listings. */
  var SEED = [
    {
      id: "seed-1", slug: "george-iii-mahogany-serpentine-commode",
      title: "Serpentine commode", maker: "In the manner of Gillows of Lancaster",
      period: "George III, c. 1785", category: "Furniture",
      materials: "Mahogany, oak-lined drawers, later gilt-brass handles",
      dimensions: "H 84 · W 112 · D 58 cm",
      provenance: "From a private collection, Fitzwilliam Square, Dublin 2.",
      condition_note: "Excellent colour and patina. Two handles sympathetically replaced; one drawer runner renewed.",
      stock_no: "0417", images: [], status: "available", featured: true,
      created_at: "2026-06-02T10:00:00Z"
    },
    {
      id: "seed-2", slug: "irish-georgian-giltwood-mirror",
      title: "Giltwood pier mirror", maker: "Irish, Dublin",
      period: "George II, c. 1750", category: "Mirrors",
      materials: "Carved giltwood, original mercury plate",
      dimensions: "H 156 · W 72 cm",
      provenance: "Acquired from a country house, Co. Meath.",
      condition_note: "Original plate with light foxing consistent with age. Gilding with minor restoration to the crest.",
      stock_no: "0389", images: [], status: "available", featured: true,
      created_at: "2026-05-28T10:00:00Z"
    },
    {
      id: "seed-3", slug: "dutch-still-life-oil-tulips",
      title: "Still life with tulips", maker: "Circle of Jan van Huysum",
      period: "18th century", category: "Paintings",
      materials: "Oil on panel, in a carved giltwood frame",
      dimensions: "48 · 39 cm (panel); 66 · 57 cm (framed)",
      provenance: "Irish private collection since the 1960s.",
      condition_note: "Cleaned and lightly restored. Craquelure stable throughout.",
      stock_no: "0402", images: [], status: "available", featured: true,
      created_at: "2026-06-10T10:00:00Z"
    },
    {
      id: "seed-4", slug: "pair-irish-silver-candlesticks",
      title: "Pair of table candlesticks", maker: "Attributed to John Hamilton, Dublin",
      period: "George II, 1745", category: "Silver",
      materials: "Sterling silver, loaded bases",
      dimensions: "H 24 cm",
      provenance: "Dublin assay marks; from a South Dublin estate.",
      condition_note: "Crisp marks, no repairs. Even wear to the wells.",
      stock_no: "0371", images: [], status: "sold", featured: false,
      created_at: "2026-04-19T10:00:00Z"
    },
    {
      id: "seed-5", slug: "regency-cut-glass-colza-lamp",
      title: "Cut-glass colza lamp", maker: "Irish or English",
      period: "Regency, c. 1815", category: "Lighting",
      materials: "Cut glass, gilt-bronze mounts, later electrified",
      dimensions: "H 62 cm",
      provenance: "From a Dublin townhouse.",
      condition_note: "Electrified for modern use; original reservoir retained. One prism replaced.",
      stock_no: "0410", images: [], status: "available", featured: false,
      created_at: "2026-06-01T10:00:00Z"
    },
    {
      id: "seed-6", slug: "grand-tour-bronze-marcus-aurelius",
      title: "Bronze of Marcus Aurelius", maker: "Italian, Grand Tour",
      period: "19th century, after the Antique", category: "Sculpture",
      materials: "Patinated bronze on a rouge marble socle",
      dimensions: "H 38 cm overall",
      provenance: "A Grand Tour souvenir, Irish private collection.",
      condition_note: "Fine warm patina, undisturbed. Socle with minor edge chips.",
      stock_no: "0356", images: [], status: "reserved", featured: false,
      created_at: "2026-03-30T10:00:00Z"
    },
    {
      id: "seed-7", slug: "william-iv-rosewood-library-table",
      title: "Rosewood library table", maker: "English",
      period: "William IV, c. 1835", category: "Furniture",
      materials: "Rosewood, leather-lined top",
      dimensions: "H 74 · W 137 · D 69 cm",
      provenance: "From a private library, Rathgar, Dublin 6.",
      condition_note: "Replaced tooled leather; timber with excellent figure and colour.",
      stock_no: "0395", images: [], status: "available", featured: false,
      created_at: "2026-05-12T10:00:00Z"
    },
    {
      id: "seed-8", slug: "irish-silver-georgian-tea-service",
      title: "Three-piece tea service", maker: "West & Son, Dublin",
      period: "Victorian, 1865", category: "Silver",
      materials: "Sterling silver, ivory-insulated handles",
      dimensions: "Teapot H 15 cm",
      provenance: "Retailed by West & Son, College Green.",
      condition_note: "Bright, undamaged; hinges crisp. Sold with antique certification.",
      stock_no: "0408", images: [], status: "available", featured: false,
      created_at: "2026-06-05T10:00:00Z"
    },
    {
      id: "seed-9", slug: "portrait-of-a-gentleman-oil",
      title: "Portrait of a gentleman", maker: "Irish School",
      period: "c. 1820", category: "Paintings",
      materials: "Oil on canvas, in a period gilt frame",
      dimensions: "76 · 63 cm (canvas)",
      provenance: "By family descent, Co. Wicklow.",
      condition_note: "Relined and cleaned. Frame original with minor losses.",
      stock_no: "0384", images: [], status: "available", featured: false,
      created_at: "2026-05-02T10:00:00Z"
    },
    {
      id: "seed-10", slug: "convex-giltwood-butlers-mirror",
      title: "Convex girandole mirror", maker: "English or Irish",
      period: "Regency, c. 1810", category: "Mirrors",
      materials: "Giltwood and gesso, ebonised slip, eagle cresting",
      dimensions: "Diam. 61 cm (plate); H 104 cm overall",
      provenance: "Private collection, Dún Laoghaire.",
      condition_note: "Original plate and mercury silvering. Eagle and ball decoration intact.",
      stock_no: "0399", images: [], status: "available", featured: false,
      created_at: "2026-05-20T10:00:00Z"
    },
    {
      id: "seed-11", slug: "chinese-export-famille-rose-bowl",
      title: "Famille rose punch bowl", maker: "Chinese export",
      period: "Qianlong, c. 1760", category: "Objets",
      materials: "Porcelain, enamel decoration",
      dimensions: "Diam. 36 cm",
      provenance: "From an Irish country house collection.",
      condition_note: "No restoration; a short original firing line to the footrim.",
      stock_no: "0361", images: [], status: "available", featured: false,
      created_at: "2026-04-08T10:00:00Z"
    },
    {
      id: "seed-12", slug: "pair-ormolu-mounted-cassolettes",
      title: "Pair of ormolu cassolettes", maker: "French",
      period: "Louis XVI style, 19th century", category: "Objets",
      materials: "Gilt bronze and marble, reversible candle nozzles",
      dimensions: "H 29 cm",
      provenance: "Irish private collection.",
      condition_note: "Mercury gilding well preserved; marble sound.",
      stock_no: "0392", images: [], status: "available", featured: false,
      created_at: "2026-05-08T10:00:00Z"
    }
  ];

  function normalise(row) {
    // tolerate images stored as jsonb array, JSON string, or null
    var imgs = row.images;
    if (typeof imgs === "string") { try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; } }
    if (!Array.isArray(imgs)) imgs = [];
    return {
      id: row.id, slug: row.slug, title: row.title || "Untitled",
      maker: row.maker || "", period: row.period || "",
      category: row.category || "Objets",
      materials: row.materials || "", dimensions: row.dimensions || "",
      provenance: row.provenance || "", condition_note: row.condition_note || "",
      stock_no: row.stock_no || "", images: imgs,
      status: (row.status || "available"), featured: !!row.featured,
      created_at: row.created_at || ""
    };
  }

  function sortPieces(list) {
    return list.slice().sort(function (a, b) {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return String(b.created_at).localeCompare(String(a.created_at));
    });
  }

  // Fetch the live catalogue; resolves { pieces, demo } — never rejects.
  async function loadPieces() {
    try {
      var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 8000) : null;
      var r = await fetch(
        SUPABASE_URL + "/rest/v1/pieces?select=*&order=featured.desc,created_at.desc",
        {
          headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
          signal: ctrl ? ctrl.signal : undefined
        }
      );
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error(await r.text());
      var rows = await r.json();
      if (!Array.isArray(rows) || rows.length === 0) throw new Error("empty");
      return { pieces: sortPieces(rows.map(normalise)), demo: false };
    } catch (e) {
      return { pieces: sortPieces(SEED.map(normalise)), demo: true };
    }
  }

  function categoriesFrom(pieces) {
    var present = {};
    pieces.forEach(function (p) { present[p.category] = true; });
    var ordered = CATEGORY_ORDER.filter(function (c) { return present[c]; });
    // include any stray categories not in the canonical order, alphabetised
    Object.keys(present).forEach(function (c) {
      if (ordered.indexOf(c) === -1) ordered.push(c);
    });
    return ordered;
  }

  function findBySlug(pieces, slug) {
    for (var i = 0; i < pieces.length; i++) if (pieces[i].slug === slug) return pieces[i];
    return null;
  }

  window.BENEZET_DATA = {
    SUPABASE_URL: SUPABASE_URL,
    SUPABASE_KEY: SUPABASE_KEY,
    CATEGORY_ORDER: CATEGORY_ORDER,
    SEED: SEED,
    loadPieces: loadPieces,
    categoriesFrom: categoriesFrom,
    findBySlug: findBySlug,
    normalise: normalise,
    sortPieces: sortPieces
  };
})();
