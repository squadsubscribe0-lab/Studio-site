// Daily word list — 365 curated 5-letter words
// The word for any given date is deterministic based on the day index
export const WORDS = [
  "CRANE","SLANT","GRIPE","FLOWN","PLUMB","CRAVE","BLITZ","SKIMP","DWARF","FOXED",
  "GROAN","TULIP","WINDY","GAVEL","CRIMP","FLUTE","SWAMP","BORAX","JOUST","KNAVE",
  "LYMPH","OXIDE","QUIRK","RAJAH","SUAVE","TWERP","UNZIP","VENOM","WALTZ","XYLEM",
  "YODEL","ZONAL","ABBOT","BEZEL","CAULK","DEPOT","ENVOY","FJORD","GULCH","HATCH",
  "INBOX","JOKEY","KARMA","LARVA","MOCHA","NYMPH","OPTIC","PLAID","QUOTA","ROBIN",
  "SCONE","THYME","UMBRA","VIGIL","WOKEN","XENON","YACHT","ZEBRA","ABYSS","BATCH",
  "CLOTH","DRONE","ELBOW","FEMUR","GLOSS","HYENA","ICIER","JINGO","KAYAK","LUNAR",
  "MAXIM","NICHE","OCTET","PROXY","QUEUE","RIGID","STONE","TABBY","ULCER","VALVE",
  "WEAVE","EXALT","YACHT","ZESTY","ABIDE","BLIMP","CHEST","DAUNT","EPOCH","FROST",
  "GLAZE","HOMER","INGOT","JIFFY","KNEEL","LAPSE","MIRTH","NOTCH","ORBIT","PLUCK",
  "QUAFF","RIVET","STRAP","TRUNK","USURP","VOUCH","WINCH","EXPAT","YUCKY","ZILCH",
  "ACUTE","BLURB","CINCH","DEPTH","EXULT","FANCY","GIRTH","HAVOC","ICING","JOUST",
  "KNACK","LUSTY","MANGO","NIFTY","ONSET","PUNCH","QUIRK","REVUE","SNUFF","TITHE",
  "UNCUT","VIPER","WITCH","EXACT","YAWNS","ZONAL","AGILE","BRINE","CLOAK","DIGIT",
  "EVADE","FLANK","GRUEL","HAUNT","IMBUE","JUMPY","KNAVE","LYRIC","MAUVE","NOTCH",
  "OCCUR","PLUSH","QUILL","ROGUE","SHOAL","TONIC","ULCER","VOILA","WRATH","EXPEL",
  "YEARN","ZIPPY","ABHOR","BENCH","CHARM","DODGE","EVOKE","FLAIR","GLYPH","HITCH",
  "IRONY","JOKEY","KARMA","LEAKY","MANOR","NERVE","OFFAL","PYGMY","QUASH","REALM",
  "SNIDE","TUTOR","UNTIE","VICAR","WRATH","EXERT","YOWLS","ZESTY","ADEPT","BUXOM",
  "CHEWY","DUCHY","ENACT","FUDGE","GRUFF","HIPPO","IDEAL","JEWEL","KNELT","LLAMA",
  "MOSSY","NATAL","OCCUR","PATCH","QUERY","RAZED","SCOFF","TILTS","UNTIE","VISOR",
  "WALTZ","EXUDE","YOKEL","ZOOM","ADORN","BAWDY","CLEFT","DETER","ENVOY","FIZZY",
  "GRIMY","HEIST","IVIED","JUMBO","KNOBS","LIVID","MOULT","NUTTY","OOZES","PIQUE",
  "QUAFF","RANDY","SMELT","TIPSY","UNIFY","VIXEN","WOOZY","EXPEL","YODELS","ZONAL",
  "ALARM","BROOK","CINCH","DAFFY","ELAND","FLOSS","GORSE","HUTCH","ICHOR","JADED",
  "KINKY","LEMON","MYNAH","NACRE","OPIUM","PALSY","QUACK","REEDY","SNOWY","TRUSS",
  "UNFIT","VODKA","WINKY","EXUDE","YUPPY","ZAPPY","ALOFT","BROTH","CLASP","DINGO",
  "ELATE","FLECK","GUSTO","HORDE","IDIOM","JETTY","KNOBS","LIGHT","MORON","NITTY",
  "OUTDO","POUCH","QUOTA","REBEL","SKIMP","TEMPO","UNIFY","VIOLA","WRECK","EXIST",
  "YOUNG","ZONAL","AFFIX","BULLY","CREPT","DISCO","ETUDE","FUNGI","GUILE","HEFTY",
  "INEPT","JAUNT","KUDOS","LODGE","MUTTS","NIPPY","OVOID","PLUMB","QUAFF","RAWLY",
  "STIFF","TALLY","USING","VAPID","WOKEN","EXTOL","YELLS","ZIPPY","AGLOW","BERTH",
  "CLUMP","DIVAN","EVICT","FJORD","GULCH","HORDE","INLET","JAZZY","KLUGE","LOAMY",
  "MORPH","NIFTY","OUTGO","PIANO","QUAFF","RISKY","SLUNG","TWERP","UNMET","VOWED",
  "WIDER","EXIST","YEARS","ZONKS","ADAPT","BOGUS","CROAK","DOWRY","EPOCH","FROTH",
  "GNOME","HAVEN","IMPEL","JOKEY","KNOBS","LUMPY","MOURN","NEWSY","OFFAL","PIXEL"
];

// Valid guess words (larger set — includes answers + common 5-letter words)
export const VALID_GUESSES = new Set([
  ...WORDS,
  "ABOUT","ABOVE","ABUSE","ACORN","ACRES","ADMIT","ADOPT","ADULT","AFTER","AGAIN",
  "AGENT","AGREE","AHEAD","ALARM","ALBUM","ALERT","ALIKE","ALIVE","ALLEY","ALLOW",
  "ALOUD","ALOFT","ALONE","ALONG","ALTER","AMONG","ANGEL","ANGER","ANGLE","ANGRY",
  "ANIME","ANNEX","ANTIC","APART","APPLE","APPLY","ARGUE","ARISE","ARRAY","ARROW",
  "ASIDE","ASKED","ATLAS","ATTIC","AUDIT","AVOID","AWAKE","AWARD","AWFUL","AZURE",
  "BADLY","BAKER","BALLS","BARGE","BARON","BASIC","BASIS","BASIS","BATHE","BEARS",
  "BEAST","BEATS","BEGAN","BEGIN","BEING","BELOW","BIBLE","BIKES","BIRDS","BLACK",
  "BLADE","BLAME","BLANK","BLAST","BLAZE","BLEND","BLESS","BLIND","BLOCK","BLOOD",
  "BLOOM","BLOWN","BOAST","BOATS","BONUS","BOOKS","BOOST","BOOTH","BOUND","BOXER",
  "BRACE","BRAIN","BRAND","BRAVE","BREAD","BREAK","BREED","BRICK","BRIDE","BRIEF",
  "BRING","BROAD","BROKE","BROOK","BROWN","BUILD","BUILT","BURNS","BURST","BUYER",
  "CABIN","CAMEL","CANDY","CARRY","CAUSE","CHAIR","CHAOS","CHART","CHASE","CHEAP",
  "CHECK","CHEER","CHEFS","CHESS","CHIEF","CHILD","CHIPS","CHOSE","CLEAR","CLERK",
  "CLICK","CLIFF","CLIMB","CLING","CLOSE","CLOUD","CLOWN","CLUBS","COACH","COAST",
  "COMET","COMIC","COMMA","CORAL","COUCH","COULD","COUNT","COURT","COVER","CRACK",
  "CRASH","CRAZY","CREEK","CRIME","CROSS","CROWD","CROWN","CRUEL","CRUSH","CURVE",
  "CYCLE","DAILY","DAIRY","DANCE","DATES","DEALS","DEATH","DEBUT","DECAY","DECOR",
  "DELAY","DELTA","DENSE","DEPOT","DERBY","DIRTY","DISCO","DIODE","DIRTY","DOING",
  "DOORS","DOUBT","DOUGH","DRAFT","DRAIN","DRAMA","DRANK","DRAWN","DREAM","DRESS",
  "DRINK","DRIVE","DROPS","DROVE","DRUGS","DRUMS","DUCKS","DUMPS","DUNCE","DUSTY",
  "EARLY","EARTH","EIGHT","ELITE","EMPTY","ENEMY","ENJOY","ENTER","ENTRY","EQUIP",
  "ESSAY","EVERY","EXACT","EXTRA","FABLE","FACES","FACTS","FAITH","FALSE","FARMS",
  "FATAL","FAULT","FEAST","FEELS","FERRY","FETCH","FETCH","FIGHT","FILED","FILES",
  "FILLS","FILMS","FINAL","FIRED","FIRST","FIXED","FLAGS","FLAME","FLASH","FLEET",
  "FLESH","FLIES","FLOCK","FLOOD","FLOOR","FLOUR","FLOWS","FLUID","FOCUS","FORCE",
  "FORGE","FORMS","FORTY","FORUM","FOUND","FRAME","FRANK","FREED","FRESH","FRONT",
  "FROZE","FULLY","FUNDS","FUNNY","GAMES","GIANT","GIRLS","GIVES","GIVEN","GLASS",
  "GLOBE","GLOSS","GLOVE","GOING","GRACE","GRADE","GRAIN","GRAND","GRANT","GRASP",
  "GRASS","GRAVE","GREED","GREEN","GREET","GRIEF","GRIND","GRIPS","GROSS","GROUP",
  "GROWN","GROWS","GRUMPY","GUARD","GUAVA","GUIDE","GUILT","GUESS","GUEST","HANDS",
  "HAPPY","HARSH","HASTE","HEADS","HEART","HEAVY","HELLO","HELPS","HERBS","HOUSE",
  "HUMAN","HUMID","HUMOR","HURRY","HUSKY","HYDRO","IMAGE","INDEX","INDEX","INDIE",
  "INNER","INPUT","IRKED","ISSUE","ITEMS","IVORY","JUDGE","JUICE","JUICY","KEEPS",
  "KINGS","KNEEL","KNOWN","KNOWS","LABOR","LANCE","LARGE","LASER","LATER","LAUGH",
  "LAYER","LEARN","LEAST","LEAVE","LEVER","LIGHT","LINER","LINED","LINEN","LINKS",
  "LIONS","LOBBY","LOCAL","LOGIC","LOGOS","LOOSE","LOVER","LOWER","LUCKY","MAGIC",
  "MAKER","MARCH","MATCH","MAYOR","MEALS","MEDIA","METAL","MIGHT","MINOR","MINUS",
  "MODAL","MODEL","MONEY","MONTH","MOUSE","MOTOR","MOUNT","MOVES","MOVIE","MUSIC",
  "NAMES","NAVAL","NEVER","NEWLY","NIGHT","NOBLE","NOISE","NORTH","NOTES","NOVEL",
  "OFTEN","OFFER","OILED","OTHER","OUGHT","OUTER","OWNED","OWNER","OZONE","PAGES",
  "PAINT","PAIRS","PANEL","PANIC","PARTS","PARTY","PASTE","PAUSE","PEACE","PENNY",
  "PERCH","PILOT","PITCH","PLACE","PLAIN","PLANE","PLANT","PLATE","PLAZA","PLAYS",
  "PLAZA","PLEAD","PLUMP","POINT","POLAR","POSED","POSTS","POWER","PRESS","PRICE",
  "PRINT","PRIZE","PRONE","PROOF","PROPS","PROSE","PROUD","PROVE","PRIDE","PRIOR",
  "SCALE","SCENE","SCOPE","SCORE","SCOUT","SERVE","SEVEN","SHARP","SHEET","SHELF",
  "SHIFT","SHIRT","SHOES","SHOOT","SHORT","SHOUT","SIGHT","SINCE","SIXTH","SIXTY",
  "SIZED","SKILL","SLACK","SLEEP","SLICE","SLIDE","SLOPE","SMART","SMELL","SMILE",
  "SMOKE","SOLAR","SOLID","SOLVE","SONIC","SONGS","SORRY","SOUND","SOUTH","SPACE",
  "SPARE","SPEAK","SPEED","SPEND","SPLIT","SPOKE","SPORT","SPRAY","SPEND","SQUAD",
  "STACK","STAFF","STAGE","STAIN","STAKE","STAND","STARK","START","STAYS","STEAM",
  "STEEL","STEEP","STEER","STEMS","STORY","STOVE","STUFF","STUDY","STYLE","SUGAR",
  "SUITE","SUNNY","SUPER","SURGE","SWEAR","SWEET","SWEPT","SWIFT","SWING","SWORE",
  "TABLE","TAKEN","TASTE","TAXES","TEACH","TEARS","TEETH","TENTH","TERMS","TERSE",
  "TEXTS","THEIR","THERE","THICK","THING","THINK","THIRD","THOSE","THREE","THREW",
  "THROW","TODAY","TIRED","TITLE","TOKEN","TOUGH","TOWER","TOWEL","TOXIC","TRACK",
  "TRADE","TRAIL","TRAIN","TRAIT","TREAT","TRIAL","TRIBE","TRIED","TRULY","TRUTH",
  "TUMOR","TWICE","TWIGS","TWIST","TYPED","UNDER","UNIFY","UNION","UNTIL","UPPER",
  "URBAN","USING","USUAL","VALID","VALUE","VIDEO","VIEWS","VISIT","VISTA","VITAL",
  "VOTER","WAVES","WEALTH","WEARS","WEEKS","WEIRD","WELLS","WHALE","WHERE","WHICH",
  "WHILE","WHITE","WHOLE","WHOSE","WIDER","WINDS","WITTY","WOMAN","WOMEN","WORLD",
  "WORRY","WORSE","WORST","WOULD","WRAPS","WRITE","WRONG","WROTE","YARDS","YEARS"
]);

/**
 * Get the word of the day based on today's date.
 * The same word is shown to every player on the same date.
 */
export function getDailyWord() {
  const start = new Date("2024-01-01");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayIndex = Math.floor((today - start) / 86400000) % WORDS.length;
  return WORDS[Math.abs(dayIndex)];
}

/**
 * Evaluate a guess against the target word.
 * Returns array of { letter, state } where state is:
 *   "correct"  — right letter, right position (green)
 *   "present"  — right letter, wrong position (yellow)
 *   "absent"   — letter not in word (gray)
 */
export function evaluateGuess(guess, target) {
  const result = Array(5).fill(null).map((_, i) => ({
    letter: guess[i],
    state: "absent"
  }));

  // Track which target letters have been "used"
  const targetLetters = target.split("");
  const used = Array(5).fill(false);

  // First pass: mark correct positions
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      result[i].state = "correct";
      used[i] = true;
    }
  }

  // Second pass: mark present letters
  for (let i = 0; i < 5; i++) {
    if (result[i].state === "correct") continue;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && guess[i] === targetLetters[j]) {
        result[i].state = "present";
        used[j] = true;
        break;
      }
    }
  }

  return result;
}

/**
 * Returns the keyboard letter states based on all guesses so far.
 */
export function getKeyboardStates(guesses, target) {
  const states = {};
  const priority = { correct: 3, present: 2, absent: 1 };

  guesses.forEach(guess => {
    const result = evaluateGuess(guess, target);
    result.forEach(({ letter, state }) => {
      const current = states[letter];
      if (!current || priority[state] > priority[current]) {
        states[letter] = state;
      }
    });
  });

  return states;
}
