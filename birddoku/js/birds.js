/* ---------------------------------------------------------------
   Bird art list.

   Four birds, six faces each, sliced from the character sheet into
   assets/birds/. Swap in your own art with the same file names and
   the game picks it up with no code changes.

   Which face shows when:
     happy      resting on the board, and the whole flock on a win
     winking    resting (alternating patches, so a board isn't uniform)
     surprised  the bird you just dropped in a wrong square
     angry      the birds it clashed with
     sad        out of hearts
     sleepy     loading
---------------------------------------------------------------- */

const BIRD_DIR = 'assets/birds/';
const BIRD_EXT = '.png';

const BIRDS = [
  { id: 'bird01', name: 'Bluebird' },
  { id: 'bird02', name: 'Cardinal' },
  { id: 'bird03', name: 'Chick' },
  { id: 'bird04', name: 'Owl' }
];

const EXPRESSIONS = ['happy', 'sad', 'angry', 'surprised', 'winking', 'sleepy'];

function birdSrc(id, expr) {
  return BIRD_DIR + id + '_' + (expr || 'happy') + BIRD_EXT;
}

/* resting face, alternated so one board isn't all the same expression */
function restFace(region) {
  return region % 2 ? 'winking' : 'happy';
}

const BIRD_FALLBACK =
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 66">' +
    '<ellipse cx="33" cy="34" rx="21" ry="20" fill="#8AB6CE"/>' +
    '<circle cx="26" cy="30" r="3" fill="#2B3330"/>' +
    '<circle cx="40" cy="30" r="3" fill="#2B3330"/>' +
    '<path d="M33 34 l5 4 -5 4 -5 -4 z" fill="#EFA73C"/></svg>');

function preloadBirds() {
  BIRDS.forEach(b => EXPRESSIONS.forEach(e => { new Image().src = birdSrc(b.id, e); }));
}
