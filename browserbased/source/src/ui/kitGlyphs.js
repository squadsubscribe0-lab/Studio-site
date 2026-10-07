/** Sigils for the kit abilities — same 100×100 stroke-only box as `glyphs.js`. */
const WRAP = (body) =>
  `<svg class="glyph-svg" viewBox="0 0 100 100" aria-hidden="true" fill="none"
     stroke="currentColor" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const KIT_SIGILS = {
  tide: WRAP(`
    <path d="M10 72C24 72 26 40 50 34C70 29 82 40 78 52C75 60 64 60 62 52"/>
    <path d="M10 84C24 80 36 86 50 82C64 78 76 86 90 82"/>
    <path d="M40 72C46 62 56 60 62 64"/>`),
  gale: WRAP(`
    <path d="M22 76C40 70 58 50 60 22C66 44 58 70 22 76Z"/>
    <path d="M48 84C64 78 78 62 80 42C84 58 78 78 48 84Z"/>
    <path d="M14 40H34M20 52H38"/>`),
  dragon: WRAP(`
    <path d="M14 78C30 78 30 58 46 58C62 58 60 38 76 34"/>
    <path d="M76 34L88 26L84 40L76 34Z"/>
    <path d="M18 64C30 64 32 46 46 44C58 42 58 28 66 22"/>
    <circle cx="80" cy="32" r="1.5"/>`),
  boulder: WRAP(`
    <path d="M30 30L56 20L78 34L80 60L60 78L32 74L20 52Z"/>
    <path d="M44 34L52 50L44 62M52 50L66 48"/>
    <path d="M8 86H92"/>`),
  arcane: WRAP(`
    <circle cx="70" cy="30" r="10"/>
    <circle cx="70" cy="30" r="3"/>
    <path d="M60 36C44 44 40 58 18 62"/>
    <path d="M62 42C52 56 44 70 26 80"/>
    <circle cx="30" cy="28" r="5"/>`),
  venom: WRAP(`
    <path d="M50 14C40 30 32 40 32 52C32 62 40 70 50 70C60 70 68 62 68 52C68 40 60 30 50 14Z"/>
    <path d="M16 84C28 78 40 88 52 82C64 76 76 86 86 80"/>
    <circle cx="44" cy="50" r="4"/>`),
  solar: WRAP(`
    <path d="M18 82L66 34"/>
    <path d="M66 34L82 18L76 40Z"/>
    <circle cx="44" cy="56" r="10"/>
    <path d="M44 38V32M62 56H68M44 74V80M26 56H20"/>`),
  vine: WRAP(`
    <path d="M12 82C24 82 22 62 36 62C50 62 46 40 60 40C74 40 72 20 86 18"/>
    <path d="M30 62L26 52M50 50L58 46M64 40L62 30M76 26L84 30"/>`),
  cyclone: WRAP(`
    <path d="M20 22H80"/>
    <path d="M28 36H72"/>
    <path d="M36 50H64"/>
    <path d="M42 64H58"/>
    <path d="M47 78H53"/>
    <path d="M80 22C84 30 76 34 72 36"/>`),
  singularity: WRAP(`
    <circle cx="50" cy="50" r="12"/>
    <path d="M14 58C30 40 70 40 86 42"/>
    <path d="M86 42C70 60 30 60 14 58"/>
    <path d="M50 22C60 24 66 30 68 38"/>`),
  sunstrike: WRAP(`
    <path d="M42 8H58L54 60H46Z"/>
    <ellipse cx="50" cy="76" rx="34" ry="10"/>
    <ellipse cx="50" cy="76" rx="18" ry="5"/>`),
  starfall: WRAP(`
    <path d="M66 18L70 28L80 30L72 36L74 46L66 40L58 46L60 36L52 30L62 28Z"/>
    <path d="M52 44L24 72M42 34L16 60M72 52L50 80"/>`),
  miasma: WRAP(`
    <path d="M22 60C14 60 12 48 22 46C22 34 36 30 42 38C46 26 66 26 68 40C80 38 86 52 76 60Z"/>
    <path d="M18 76C30 72 40 80 52 76C64 72 74 80 84 76"/>
    <circle cx="40" cy="50" r="2"/><circle cx="58" cy="48" r="2"/>`),
  geyser: WRAP(`
    <path d="M42 80C42 60 38 40 46 18M58 80C58 60 62 40 54 18"/>
    <path d="M40 22C34 16 28 22 30 28M60 22C66 16 72 22 70 28"/>
    <path d="M14 84L32 80L40 86L60 86L68 80L86 84"/>`),
  aegis: WRAP(`
    <path d="M14 76C14 44 30 22 50 22C70 22 86 44 86 76"/>
    <path d="M10 76H90"/>
    <path d="M36 40L44 46V56L36 62L28 56V46Z"/>
    <path d="M60 40L68 46V56L60 62L52 56V46Z"/>`)
};

/** Relic icons for Dungeon.io's passive items. */
export const RELIC_SIGILS = {
  might: WRAP(`<path d="M50 84C30 70 18 56 18 40C18 28 28 20 38 20C44 20 48 24 50 28C52 24 56 20 62 20C72 20 82 28 82 40C82 56 70 70 50 84Z"/><path d="M50 36C44 46 56 50 50 62"/>`),
  haste: WRAP(`<path d="M28 14H72M28 86H72"/><path d="M32 14C32 36 68 40 68 50C68 60 32 64 32 86"/><path d="M68 14C68 36 32 40 32 50C32 60 68 64 68 86"/>`),
  reach: WRAP(`<circle cx="42" cy="42" r="24"/><path d="M60 60L84 84"/><path d="M42 28V56M28 42H56"/>`),
  swift: WRAP(`<path d="M30 20V62L20 76H70L80 66L50 58V20Z"/><path d="M8 40H22M4 52H20"/>`),
  vitality: WRAP(`<path d="M40 14H60V40H86V60H60V86H40V60H14V40H40Z"/>`),
  focus: WRAP(`<path d="M26 20V52C26 66 36 76 50 76C64 76 74 66 74 52V20"/><path d="M26 20H40V50C40 56 44 60 50 60C56 60 60 56 60 50V20H74"/><path d="M26 32H40M60 32H74"/>`)
};
