/**
 * projects.ts — the single source of truth for the practice's body of work.
 *
 * Every project, write-up, fact and image reference here was HARVESTED from
 * the practice's own previous site (the static /ben-mullen build). Nothing is
 * invented: where the source had no photography or copy for a project (e.g.
 * "Rose Cottage"), it is intentionally omitted rather than filled with a
 * placeholder — see the note at the bottom of this file.
 *
 * Image paths point at /public/images/projects/*. The first entry of `images`
 * for each project is used as its index-grid card image.
 */

export type ProjectImage = {
  src: string;
  alt: string;
  /** Render across the full width of the gallery grid. */
  wide?: boolean;
};

export type ProjectVideo = {
  src: string;
  poster: string;
  label: string;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  /** Ordered fact pairs shown in the detail-page facts panel. */
  facts: { label: string; value: string }[];
  /** The awarding line, surfaced on cards and facts when present. */
  award?: string;
  /** A single serif statement line introducing the project. */
  lead: string;
  /** Full write-up, paragraph by paragraph — the practice's own words. */
  body: string[];
  images: ProjectImage[];
  video?: ProjectVideo;
  /** Marks the project for the home page's featured selection. */
  featured?: boolean;
};

const P = (s: string) => `/images/projects/${s}`;
const V = (s: string) => `/videos/${s}`;

export const projects: Project[] = [
  {
    slug: "kilmantin-road",
    title: "Kilmantin Road",
    category: "Residential",
    award: "AAI Award, 2025",
    facts: [
      { label: "Type", value: "Residential extension" },
      { label: "Location", value: "Wicklow, Ireland" },
      { label: "Years", value: "2021–2024" },
      { label: "Scope", value: "Design · Self-build · Project management" },
      { label: "Award", value: "AAI Award, 2025" },
    ],
    lead: "A mid-terrace town house terraced by hand into platform gardens facing the sea.",
    body: [
      "A mid-terrace, mass-concrete town house is adapted for contemporary living. The landlocked site is terraced by hand with cut and fill; soil is moved through the house to create a series of platform gardens facing the sea. Irregular and found geometries extrapolate, producing two interlocking cubic forms. The new volumes are connected back to the middle house via a square-plan courtyard, for light and for air.",
      "The house is constructed with terracotta clay blocks, set atop a fair-faced concrete retaining base. Masonry from a previous construction is reused in the making of a landscape in miniature to the rear.",
      "External joinery is surface-mounted, producing subtle tensions between interior and exterior within the depth of the walls. All structural components are exposed — for economy, ornament and politic.",
    ],
    images: [
      { src: P("kilmantin-03.jpg"), alt: "Kilmantin Road — interior", wide: true },
      { src: P("kilmantin-01.jpg"), alt: "Kilmantin Road — 2" },
      { src: P("kilmantin-02.jpg"), alt: "Kilmantin Road — 3" },
      { src: P("kilmantin-04.jpg"), alt: "Kilmantin Road — 4" },
      { src: P("kilmantin-05.jpg"), alt: "Kilmantin Road — 5" },
      { src: P("kilmantin-06.jpg"), alt: "Kilmantin Road — 6" },
    ],
    video: {
      src: V("kilmantin-model.mp4"),
      poster: P("kilmantin-04.jpg"),
      label: "Model — Kilmantin Road house",
    },
    featured: true,
  },
  {
    slug: "the-fall",
    title: "The Fall",
    category: "Exhibition",
    award: "Art of Architecture Pavilion, RHA 2025",
    facts: [
      { label: "Type", value: "Exhibition" },
      { label: "Venue", value: "Royal Hibernian Academy, Dublin" },
      { label: "Year", value: "2025" },
      { label: "Photography", value: "Peter McGovern" },
      { label: "Award", value: "Art of Architecture Pavilion, RHA 2025" },
    ],
    lead: "An ‘A’-frame calligram of off-the-shelf timber, draped in wool — a top-lit chamber at the RHA.",
    body: [
      "November 2024: ‘Subtle Foreshadowing’ is trending on TikTok — footage of people falling, with the ending intercut throughout. The Fall takes 58 of these clips, recut to release other possible readings. Many of the clips are imprinted with the words “Subtle foreshadowing”, and this is left intact, making explicit their rerouting.",
      "In the midst of decadence, decline, and collapse we fall off, fall over, fall down. The architecture is a doorway and a window for this point of view. An ‘A’ frame — both glyph and trestle, the structure is a calligram, 4.5 metres high and wide, made of off-the-shelf 2×4” softwood timbers, draped in wool, uncut and off the shelf, to produce a successively insulated, top-lit chamber.",
      "The curtain walls form an opening into the attic space. The light, itself a recording, is — like the other material components — off-the-shelf and borrowed for reuse.",
    ],
    images: [
      { src: P("the-fall-02.jpg"), alt: "The Fall — pavilion", wide: true },
      { src: P("the-fall-01.jpg"), alt: "The Fall — 2" },
      { src: P("the-fall-03.jpg"), alt: "The Fall — 3" },
      { src: P("the-fall-04.jpg"), alt: "The Fall — 4" },
      { src: P("the-fall-05.jpg"), alt: "The Fall — 5" },
    ],
    featured: true,
  },
  {
    slug: "otium",
    title: "OTIUM",
    category: "Exhibition",
    facts: [
      { label: "Type", value: "Exhibition" },
      { label: "Venue", value: "The Architecture Centre, RIAI, Dublin" },
      { label: "Photography", value: "Aisling McCoy, Ben Mullen" },
    ],
    lead: "108 drawings and sculpture — the building site reframed as a place of architectural experiment.",
    body: [
      "An exhibition of drawings and sculpture addressing themes of research-by-design in contemporary architectural practice. The exhibition presents 108 drawings made during residency at the Centre Culturel Irlandais in Paris, analysing the image language of ‘Dysart’, an ongoing project by Tom dePaor, in which landscape, garden and domesticity coalesce with punk vernaculars in the production of a new, disciplined and performative architecture.",
      "The drawings were made in direct response to photographs taken by dePaor and Peter Maybury — an archive that documents Dysart’s diachronic development in time, as both artefact and method. The work is presented alongside contract documents, site photographs and ephemera from a domestic self-build project by ben mullen architects.",
      "The exhibition seeks to expand the theoretical framework and dominant methodologies of professional practice, reframing the building site as a place of sustained architectural experimentation where material culture, circular economics and the procurement of labour are re-evaluated under the geopolitical conditions of climate action.",
    ],
    images: [
      { src: P("otium-02.jpg"), alt: "OTIUM — exhibition", wide: true },
      { src: P("otium-01.jpg"), alt: "OTIUM — 2" },
      { src: P("otium-03.jpg"), alt: "OTIUM — 3" },
      { src: P("otium-04.jpg"), alt: "OTIUM — 4" },
      { src: P("otium-05.jpg"), alt: "OTIUM — 5" },
    ],
    video: {
      src: V("block-drawing.mp4"),
      poster: P("otium-01.jpg"),
      label: "Untitled (block drawing) — rectified digital line drawing",
    },
    featured: true,
  },
  {
    slug: "the-old-boathouse",
    title: "The Old Boathouse",
    category: "Conservation",
    facts: [
      { label: "Type", value: "Conservation" },
      { label: "Location", value: "Wicklow, Ireland" },
      { label: "Status", value: "Ongoing — 2026" },
      { label: "Note", value: "A protected structure" },
    ],
    lead: "Conservation of an 1865 maritime structure, adapted for a traditional music school.",
    body: [
      "Adaptation and refurbishment of a historic maritime structure in Wicklow, Ireland. The building was constructed in 1865, funded by Robert Jones Garden to house the Robert Theophilus Garden (RNLI ON 116) in memory of his father.",
      "Following construction of a new lifeboat house in the lee of the east pier in 1886, the old boathouse was repurposed as a municipal store and public restroom. In 1981, Comhaltas Ceoltóirí Éireann took lease of the structure and has used it as an Irish cultural building since.",
      "The project calls for the conservation of the structure, renewal of all building services with significant energy-upgrade works, and the adaptation of the building to house a small traditional music school.",
    ],
    images: [
      { src: P("boathouse-01.jpg"), alt: "The Old Boathouse — 1", wide: true },
      { src: P("boathouse-02.jpg"), alt: "The Old Boathouse — 2" },
    ],
    featured: true,
  },
  {
    slug: "dysart",
    title: "Dysart Drawings",
    category: "Exhibition",
    facts: [
      { label: "Type", value: "Exhibition — drawings" },
      { label: "Location", value: "Wicklow" },
      { label: "Status", value: "Ongoing — 2023" },
    ],
    lead: "Drawings analysing the image language of ‘Dysart’.",
    body: [
      "An exhibition of drawings analysing the image language of ‘Dysart’, an ongoing project by dePaor, in which landscape, garden and domesticity coalesce with punk vernaculars in the production of new, disciplined and performative architectures.",
      "The drawings are made in response to photographs taken by dePaor and Peter Maybury — an archive that documents Dysart’s diachronic development in time, as both artefact and method.",
    ],
    images: [
      { src: P("dysart-01.jpg"), alt: "Dysart Drawings — 1" },
      { src: P("dysart-02.jpg"), alt: "Dysart Drawings — 2" },
      { src: P("dysart-03.jpg"), alt: "Dysart Drawings — 3" },
      { src: P("dysart-04.jpg"), alt: "Dysart Drawings — 4" },
      { src: P("dysart-05.jpg"), alt: "Dysart Drawings — 5" },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const featuredProjects = projects.filter((p) => p.featured);

/**
 * NOT YET PUBLISHED — flagged for the client to complete.
 *
 * "Rose Cottage" is listed on benmullen.ie but was deliberately held back on
 * the previous site because no photography was available. To reinstate it,
 * add `rose-cottage-*.jpg` to /public/images/projects and append a Project
 * entry above with its facts and write-up.
 */
