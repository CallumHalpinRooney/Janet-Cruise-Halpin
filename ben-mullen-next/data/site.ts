/**
 * site.ts — practice-level content harvested from the previous site.
 * Bio, statement, awards and contact are the practice's own words.
 */

export const site = {
  name: "ben mullen architects",
  location: "Wicklow, Ireland",
  positioning:
    "A practice working with architecture and landscape design to address environmental concerns as the primary aesthetic problems of our time.",
  disciplines: ["Architecture", "Landscape", "Conservation", "Ireland"],
  instagram: {
    handle: "@benmullenarchitects",
    url: "https://instagram.com/benmullenarchitects",
  },
  contact: {
    email: "office@benmullen.ie",
    phone: "+353 85 126 9885",
    phoneHref: "tel:+353851269885",
    address: ["Wicklow House, Market Square", "Wicklow, A67 W589", "Ireland"],
  },
  credentials: "MRIAI · Accredited in conservation, grade 3",
};

export const home = {
  heroImage: "/images/projects/hero-01.jpg",
  heroAlt: "Kilmantin Road — interior, ben mullen architects",
  statementLead:
    "Working within the traditional boundaries of architecture — from first principles, and from the ground.",
  statementBody: [
    "ben mullen architects works across new buildings, conservation and exhibition, from initial design through to self-build and construction management. Each project is developed with sensitivity to site, new material cultures and the histories of construction — treating environmental concern not as a constraint, but as the starting point of the design.",
    "Selected buildings, exhibitions and conservation work follow below. For new commissions and collaborations, please get in touch.",
  ],
};

export const about = {
  portrait: "/images/projects/about-01.jpg",
  portraitAlt: "ben mullen architects — studio",
  lead: "An architectural practice based in Wicklow, Ireland, working within the traditional boundaries of architecture to address environmental concerns as the primary spatial, ethical and aesthetic problems of our time.",
  body: [
    "Projects are developed from first principles, with sensitivity to site, new material cultures and the histories of construction. The practice is accredited in conservation at grade 3.",
    "Ben Mullen — B.Arch, BA Fine Art, MRIAI — is a graduate of SAUL, the School of Architecture at the University of Limerick, and the National College of Art & Design. In 2025 he received the RIAI Emerging Architect Award, and in 2023 the inaugural Eileen Gray E-1027 Research Fellowship at the CCI in Paris.",
    "Since 2016 he has been a Design Fellow at the School of Architecture, Planning & Environmental Policy in UCD, and a design critic to schools of architecture across Ireland and the UK.",
  ],
};

export type Award = {
  title: string;
  subject: string;
  year: string;
  note: string;
};

export const awards: Award[] = [
  {
    title: "RIAI Emerging Architect Award",
    subject: "Ben Mullen",
    year: "2025",
    note: "Awarded to Ben Mullen by the Royal Institute of the Architects of Ireland. The RIAI is the professional and regulatory body for architects in Ireland, founded in 1839. Its Emerging Architect Award recognises an architect who has made a significant contribution to architecture in the early years of independent practice.",
  },
  {
    title: "AAI Award",
    subject: "Kilmantin Road",
    year: "2025",
    note: "Kilmantin Road received an AAI Award in 2025. Run by the Architectural Association of Ireland — founded in 1896 and Ireland's longest-established forum for architecture — the AAI Awards are an annual, independently juried celebration of design excellence across built and unbuilt work by architects practising in Ireland.",
  },
  {
    title: "Art of Architecture Pavilion, RHA",
    subject: "The Fall",
    year: "2025",
    note: "The Fall was commissioned as the Art of Architecture Pavilion for 2025. The Royal Hibernian Academy (RHA), founded in 1823, is one of Ireland's oldest art institutions. Each year its Annual Exhibition includes the Art of Architecture Pavilion — a commissioned, full-scale architectural installation shown among the exhibited work in Dublin.",
  },
  {
    title: "Eileen Gray E-1027 Research Fellowship",
    subject: "Ben Mullen — inaugural",
    year: "2023",
    note: "Ben Mullen held the inaugural fellowship in 2023. Hosted at the Centre Culturel Irlandais (CCI) in Paris, the fellowship supports architectural research connected to Eileen Gray's modernist villa E-1027 on the Côte d'Azur — a landmark of twentieth-century architecture and design.",
  },
];

export type StudioShot = { src: string; label: string };

export const studio: StudioShot[] = [
  { src: "/images/studio/studio-01.jpg", label: "Toplight" },
  { src: "/images/studio/studio-02.jpg", label: "Valentia slate" },
  { src: "/images/studio/studio-03.jpg", label: "Terracotta & timber" },
  { src: "/images/studio/studio-04.jpg", label: "Timber return" },
  { src: "/images/studio/studio-05.jpg", label: "Lintel patio" },
  { src: "/images/studio/studio-06.jpg", label: "Material study" },
  { src: "/images/studio/studio-07.jpg", label: "On site" },
  { src: "/images/studio/studio-08.jpg", label: "Fieldwork" },
];
