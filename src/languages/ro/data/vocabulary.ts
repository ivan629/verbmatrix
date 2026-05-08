import type { VocabSection, PhraseItem, VocabItem } from "../../../types";

export const VOCAB_SECTIONS: VocabSection[] = [
  {
    icon: "✦", label: "People & Family",
    items: [
      { ro: "om", en: "person" }, { ro: "femeie", en: "woman" }, { ro: "bărbat", en: "man" },
      { ro: "copil", en: "child" }, { ro: "prieten / prietenă", en: "friend (m / f)" }, { ro: "familie", en: "family" },
      { ro: "mamă", en: "mother" }, { ro: "tată", en: "father" }, { ro: "frate", en: "brother" },
      { ro: "soră", en: "sister" }, { ro: "soț / soție", en: "husband / wife" }, { ro: "bunic / bunică", en: "grandfather / mother" },
      { ro: "băiat", en: "boy" }, { ro: "fată", en: "girl" }, { ro: "nepot / nepoată", en: "nephew / niece (also: grandson / granddaughter)" },
      { ro: "unchi / mătușă", en: "uncle / aunt" }, { ro: "văr / verișoară", en: "cousin (m / f)" },
      { ro: "vecin / vecină", en: "neighbour (m / f)" }, { ro: "coleg / colegă", en: "colleague (m / f)" },
      { ro: "șef / șefă", en: "boss (m / f)" }, { ro: "bebeluș", en: "baby" }, { ro: "adolescent", en: "teenager" },
    ],
  },
  {
    icon: "✦", label: "Home & Objects",
    items: [
      { ro: "casă", en: "house" }, { ro: "apartament", en: "apartment" }, { ro: "cameră", en: "room" },
      { ro: "masă", en: "table" }, { ro: "pat", en: "bed" }, { ro: "ușă", en: "door" },
      { ro: "fereastră", en: "window" }, { ro: "cheie", en: "key" }, { ro: "telefon", en: "phone" },
      { ro: "apă", en: "water" }, { ro: "scaun", en: "chair" }, { ro: "dulap", en: "wardrobe" },
      { ro: "baie", en: "bathroom" }, { ro: "bucătărie", en: "kitchen" }, { ro: "dormitor", en: "bedroom" },
      { ro: "sufragerie", en: "living room" }, { ro: "etaj", en: "floor / storey" }, { ro: "perete", en: "wall" },
      { ro: "acoperiș", en: "roof" }, { ro: "podea", en: "floor" }, { ro: "oglindă", en: "mirror" },
      { ro: "lampă", en: "lamp" }, { ro: "canapea", en: "sofa" }, { ro: "covor", en: "carpet" },
      { ro: "calculator", en: "computer" }, { ro: "frigider", en: "fridge" }, { ro: "cuptor", en: "oven" },
      { ro: "aragaz", en: "stove" }, { ro: "mașină de spălat", en: "washing machine" },
    ],
  },
  {
    icon: "✦", label: "Body & Health",
    items: [
      { ro: "cap", en: "head" }, { ro: "ochi", en: "eye(s)" }, { ro: "nas", en: "nose" },
      { ro: "gură", en: "mouth" }, { ro: "ureche", en: "ear" }, { ro: "mână", en: "hand" },
      { ro: "picior", en: "leg / foot" }, { ro: "inimă", en: "heart" }, { ro: "stomac", en: "stomach" },
      { ro: "spate", en: "back" }, { ro: "dinți", en: "teeth" }, { ro: "deget", en: "finger" },
      { ro: "braț", en: "arm" }, { ro: "umăr", en: "shoulder" }, { ro: "genunchi", en: "knee" },
      { ro: "gât", en: "throat / neck" }, { ro: "piept", en: "chest" }, { ro: "față", en: "face" },
      { ro: "păr", en: "hair" }, { ro: "buze", en: "lips" }, { ro: "sânge", en: "blood" },
      { ro: "os", en: "bone" }, { ro: "piele", en: "skin" }, { ro: "durere", en: "pain" },
    ],
  },
  {
    icon: "✦", label: "Food & Drink",
    items: [
      { ro: "pâine", en: "bread" }, { ro: "carne", en: "meat" }, { ro: "lapte", en: "milk" },
      { ro: "cafea", en: "coffee" }, { ro: "ceai", en: "tea" }, { ro: "bere", en: "beer" },
      { ro: "vin", en: "wine" }, { ro: "ciorbă", en: "sour soup" }, { ro: "mici", en: "grilled sausages" },
      { ro: "sarmale", en: "cabbage rolls" }, { ro: "brânză", en: "cheese" }, { ro: "ouă", en: "eggs" },
      { ro: "legume", en: "vegetables" }, { ro: "fructe", en: "fruits" }, { ro: "pui", en: "chicken" },
      { ro: "pește", en: "fish" }, { ro: "orez", en: "rice" }, { ro: "cartofi", en: "potatoes" },
      { ro: "supă", en: "soup" }, { ro: "salată", en: "salad" }, { ro: "zahăr", en: "sugar" },
      { ro: "sare", en: "salt" }, { ro: "piper", en: "pepper" }, { ro: "ulei", en: "oil" },
      { ro: "unt", en: "butter" }, { ro: "smântână", en: "sour cream" }, { ro: "muștar", en: "mustard" },
      { ro: "roșii", en: "tomatoes" }, { ro: "ceapă", en: "onion" }, { ro: "usturoi", en: "garlic" },
      { ro: "mere", en: "apples" }, { ro: "struguri", en: "grapes" }, { ro: "nucă", en: "walnut" },
      { ro: "ciocolată", en: "chocolate" }, { ro: "prăjitură", en: "cake / pastry" }, { ro: "înghețată", en: "ice cream" },
      { ro: "miere", en: "honey" }, { ro: "compot", en: "compote" }, { ro: "mămăligă", en: "polenta" },
      { ro: "cozonac", en: "sweet bread" }, { ro: "plăcintă", en: "pie / pastry" },
      { ro: "papanași", en: "yogurt and jam donuts" }, { ro: "țuică", en: "plum brandy" },
      { ro: "suc", en: "juice" }, { ro: "apă plată", en: "still water" }, { ro: "apă minerală", en: "sparkling water" },
    ],
  },
  {
    icon: "✦", label: "City & Travel",
    items: [
      { ro: "oraș", en: "city" }, { ro: "sat", en: "village" }, { ro: "stradă", en: "street" },
      { ro: "magazin", en: "store" }, { ro: "gară", en: "station" }, { ro: "aeroport", en: "airport" },
      { ro: "metrou", en: "metro" }, { ro: "bilet", en: "ticket" }, { ro: "spital", en: "hospital" },
      { ro: "farmacie", en: "pharmacy" }, { ro: "piață", en: "market / square" }, { ro: "bancă", en: "bank / bench" },
      { ro: "poștă", en: "post office" }, { ro: "parc", en: "park" }, { ro: "muzeu", en: "museum" },
      { ro: "teatru", en: "theatre" }, { ro: "cinema", en: "cinema" }, { ro: "bibliotecă", en: "library" },
      { ro: "biserică", en: "church" }, { ro: "pod", en: "bridge" },
      { ro: "clădire", en: "building" }, { ro: "colț", en: "corner" }, { ro: "semafor", en: "traffic light" },
      { ro: "trecere de pietoni", en: "crosswalk" }, { ro: "centru", en: "centre / downtown" },
    ],
  },
  {
    icon: "✦", label: "Transportation",
    items: [
      { ro: "mașină", en: "car" }, { ro: "autobuz", en: "bus" }, { ro: "tramvai", en: "tram" },
      { ro: "tren", en: "train" }, { ro: "avion", en: "airplane" }, { ro: "taxi", en: "taxi" },
      { ro: "bicicletă", en: "bicycle" }, { ro: "vapor", en: "ship" }, { ro: "benzină", en: "gasoline" },
      { ro: "parcare", en: "parking" }, { ro: "drum", en: "road" }, { ro: "autostradă", en: "highway" },
      { ro: "stație", en: "stop / station" }, { ro: "peron", en: "platform" }, { ro: "bagaj", en: "luggage" },
      { ro: "pașaport", en: "passport" }, { ro: "valiză", en: "suitcase" }, { ro: "hartă", en: "map" },
    ],
  },
  {
    icon: "✦", label: "Clothing",
    items: [
      { ro: "haine", en: "clothes" }, { ro: "cămașă", en: "shirt" }, { ro: "pantaloni", en: "trousers" },
      { ro: "fustă", en: "skirt" }, { ro: "rochie", en: "dress" }, { ro: "geacă", en: "jacket" },
      { ro: "palton", en: "coat" }, { ro: "pantofi", en: "shoes" }, { ro: "cizme", en: "boots" },
      { ro: "ghete", en: "ankle boots" }, { ro: "șosete", en: "socks" }, { ro: "cravată", en: "tie" },
      { ro: "pălărie", en: "hat" }, { ro: "eșarfă", en: "scarf" }, { ro: "mănuși", en: "gloves" },
      { ro: "bluză", en: "blouse" }, { ro: "pulover", en: "sweater" }, { ro: "tricou", en: "t-shirt" },
    ],
  },
  {
    icon: "✦", label: "Nature & Weather",
    items: [
      { ro: "munte", en: "mountain" }, { ro: "mare", en: "sea (also: big)" }, { ro: "râu", en: "river" },
      { ro: "lac", en: "lake" }, { ro: "pădure", en: "forest" }, { ro: "câmp", en: "field" },
      { ro: "cer", en: "sky" }, { ro: "soare", en: "sun" }, { ro: "lună", en: "moon" },
      { ro: "stea", en: "star" }, { ro: "nor", en: "cloud" }, { ro: "ploaie", en: "rain" },
      { ro: "zăpadă", en: "snow" }, { ro: "vânt", en: "wind" }, { ro: "furtună", en: "storm" },
      { ro: "pământ", en: "earth / ground" }, { ro: "copac / pom", en: "tree" }, { ro: "floare", en: "flower" },
      { ro: "iarbă", en: "grass" }, { ro: "piatră", en: "stone" }, { ro: "vale", en: "valley" },
      { ro: "plajă", en: "beach" }, { ro: "insulă", en: "island" }, { ro: "izvor", en: "spring / source" },
    ],
  },
  {
    icon: "✦", label: "Animals",
    items: [
      { ro: "câine", en: "dog" }, { ro: "pisică", en: "cat" }, { ro: "cal", en: "horse" },
      { ro: "vacă", en: "cow" }, { ro: "pasăre", en: "bird" }, { ro: "pește", en: "fish" },
      { ro: "urs", en: "bear" }, { ro: "lup", en: "wolf" }, { ro: "vulpe", en: "fox" },
      { ro: "oaie", en: "sheep" }, { ro: "porc", en: "pig" }, { ro: "găină", en: "hen" },
      { ro: "fluture", en: "butterfly" }, { ro: "albină", en: "bee" }, { ro: "șarpe", en: "snake" },
    ],
  },
  {
    icon: "✦", label: "Work & Education",
    items: [
      { ro: "birou", en: "office / desk" }, { ro: "muncă / lucru", en: "work" }, { ro: "ședință", en: "meeting" },
      { ro: "proiect", en: "project" }, { ro: "contract", en: "contract" }, { ro: "salariu", en: "salary" },
      { ro: "loc de muncă", en: "workplace" }, { ro: "angajat", en: "employee" }, { ro: "firmă", en: "company" },
      { ro: "școală", en: "school" }, { ro: "universitate", en: "university" }, { ro: "profesor", en: "teacher" },
      { ro: "student", en: "student" }, { ro: "curs", en: "course" }, { ro: "examen", en: "exam" },
      { ro: "carte", en: "book" }, { ro: "caiet", en: "notebook" }, { ro: "pix", en: "pen" },
      { ro: "creion", en: "pencil" }, { ro: "diplomă", en: "diploma" }, { ro: "notă", en: "grade" },
    ],
  },
  {
    icon: "✦", label: "Shopping & Money",
    items: [
      { ro: "preț", en: "price" }, { ro: "bani", en: "money" }, { ro: "leu / lei", en: "Romanian currency" },
      { ro: "reducere", en: "discount" }, { ro: "bon", en: "receipt" }, { ro: "casă", en: "cash register" },
      { ro: "numerar", en: "cash" }, { ro: "card", en: "card" }, { ro: "rest", en: "change" },
      { ro: "scump", en: "expensive" }, { ro: "ieftin", en: "cheap" }, { ro: "gratuit", en: "free" },
      { ro: "mărime", en: "size" }, { ro: "pungă", en: "bag" }, { ro: "vitrină", en: "shop window" },
    ],
  },
  {
    icon: "✦", label: "Technology",
    items: [
      { ro: "calculator", en: "computer" }, { ro: "internet", en: "internet" }, { ro: "parolă", en: "password" },
      { ro: "ecran", en: "screen" }, { ro: "aplicație", en: "app" }, { ro: "rețea", en: "network" },
      { ro: "e-mail", en: "email" }, { ro: "mesaj", en: "message" }, { ro: "fotografie", en: "photo" },
      { ro: "baterie", en: "battery" }, { ro: "încărcător", en: "charger" }, { ro: "căști", en: "headphones" },
    ],
  },
  {
    icon: "✦", label: "Emotions & States",
    items: [
      { ro: "bucurie", en: "joy" }, { ro: "tristețe", en: "sadness" }, { ro: "furie", en: "anger" },
      { ro: "surpriză", en: "surprise" }, { ro: "teamă / frică", en: "fear" }, { ro: "dragoste", en: "love" },
      { ro: "fericire", en: "happiness" }, { ro: "speranță", en: "hope" }, { ro: "noroc", en: "luck" },
      { ro: "grijă", en: "worry / care" }, { ro: "curaj", en: "courage" }, { ro: "răbdare", en: "patience" },
      { ro: "încredere", en: "trust / confidence" }, { ro: "rușine", en: "shame" }, { ro: "mândrie", en: "pride" },
      { ro: "dor", en: "longing / missing" }, { ro: "plictiseală", en: "boredom" }, { ro: "liniște", en: "peace / quiet" },
    ],
  },
  {
    icon: "✦", label: "Entertainment & Culture",
    items: [
      { ro: "muzică", en: "music" }, { ro: "film", en: "movie" }, { ro: "spectacol", en: "show" },
      { ro: "concert", en: "concert" }, { ro: "dans", en: "dance" }, { ro: "pictură", en: "painting" },
      { ro: "roman", en: "novel" }, { ro: "poveste", en: "story" }, { ro: "joc", en: "game" },
      { ro: "sport", en: "sport" }, { ro: "fotbal", en: "football" }, { ro: "vacanță", en: "vacation" },
      { ro: "sărbătoare", en: "holiday" }, { ro: "cadou", en: "gift" }, { ro: "petrecere", en: "party" },
    ],
  },
  {
    icon: "✦", label: "Time & Abstract",
    items: [
      { ro: "timp", en: "time" }, { ro: "oră", en: "hour" }, { ro: "minut", en: "minute" },
      { ro: "zi", en: "day" }, { ro: "săptămână", en: "week" }, { ro: "lună", en: "month" },
      { ro: "an", en: "year" }, { ro: "dimineață", en: "morning" }, { ro: "amiază", en: "noon" },
      { ro: "după-amiază", en: "afternoon" },
      { ro: "seară", en: "evening" }, { ro: "noapte", en: "night" }, { ro: "viață", en: "life" },
      { ro: "moarte", en: "death" }, { ro: "nume", en: "name" }, { ro: "treabă", en: "task / work to do" },
      { ro: "lucru", en: "thing" },
      { ro: "problemă", en: "problem" }, { ro: "idee", en: "idea" }, { ro: "adevăr", en: "truth" },
      { ro: "greșeală", en: "mistake" }, { ro: "motiv", en: "reason" }, { ro: "răspuns", en: "answer" },
      { ro: "întrebare", en: "question" }, { ro: "loc", en: "place" },
    ],
  },
  {
    icon: "✦", label: "Directions",
    items: [
      { ro: "nord", en: "north" }, { ro: "sud", en: "south" },
      { ro: "est", en: "east" }, { ro: "vest", en: "west" },
      { ro: "stânga", en: "left" }, { ro: "dreapta", en: "right" },
      { ro: "înainte", en: "straight ahead / straight on" }, { ro: "înapoi", en: "back" },
      { ro: "fă la stânga", en: "turn left" }, { ro: "fă la dreapta", en: "turn right" },
      { ro: "mergi înainte", en: "go straight" }, { ro: "întoarce-te", en: "go back" },
      { ro: "oprește-te", en: "stop" },
      { ro: "lângă", en: "next to" }, { ro: "în fața", en: "in front of" },
      { ro: "în spatele", en: "behind" }, { ro: "vizavi", en: "opposite" },
      { ro: "aproape", en: "near" }, { ro: "departe", en: "far" },
    ],
  },
  {
    icon: "✦", label: "Descriptive adjectives — size, shape, quality",
    items: [
      // Size
      { ro: "mare", en: "big / large" }, { ro: "mic", en: "small / little" },
      { ro: "foarte mic", en: "tiny" }, { ro: "foarte mare", en: "huge" },
      { ro: "înalt", en: "tall" }, { ro: "scund", en: "short (height)" },
      { ro: "lung", en: "long" }, { ro: "lat", en: "wide" }, { ro: "îngust", en: "narrow" },
      // Shape
      { ro: "rotund", en: "round" }, { ro: "pătrat", en: "square" },
      { ro: "dreptunghiular", en: "rectangular" }, { ro: "plat", en: "flat" },
      { ro: "curbat", en: "curved" }, { ro: "drept", en: "straight" },
      // Thickness
      { ro: "gros", en: "thick" }, { ro: "subțire", en: "thin" },
      // Texture
      { ro: "aspru", en: "rough" }, { ro: "fin", en: "smooth" },
      { ro: "moale", en: "soft" }, { ro: "tare", en: "hard" },
      { ro: "ud", en: "wet" }, { ro: "uscat", en: "dry" },
      // Weight
      { ro: "greu", en: "heavy" }, { ro: "ușor", en: "light" },
      // Temperature
      { ro: "cald", en: "hot" }, { ro: "rece", en: "cold" },
      { ro: "călduț", en: "warm" }, { ro: "răcoros", en: "cool" },
      // Body / appearance
      { ro: "gras", en: "fat" }, { ro: "slab", en: "thin / weak" },
      { ro: "suplu", en: "slim" }, { ro: "puternic", en: "strong" },
      // Quality
      { ro: "bun", en: "good" }, { ro: "rău", en: "bad" },
      { ro: "drăguț", en: "nice" }, { ro: "frumos", en: "beautiful" },
      { ro: "urât", en: "ugly" }, { ro: "curat", en: "clean" }, { ro: "murdar", en: "dirty" },
      // Age
      { ro: "nou", en: "new" }, { ro: "vechi", en: "old (things)" },
      { ro: "tânăr", en: "young" }, { ro: "bătrân", en: "old (people)" },
    ],
  },
];

export const SURVIVAL_PHRASES: PhraseItem[] = [
  { ro: "Bună ziua!", en: "Good day!" },
  { ro: "Bună seara!", en: "Good evening!" },
  { ro: "Noapte bună!", en: "Good night!" },
  { ro: "Mulțumesc!", en: "Thank you!" },
  { ro: "Mulțumesc frumos!", en: "Thank you very much!" },
  { ro: "Cu plăcere!", en: "You’re welcome!" },
  { ro: "Vă rog.", en: "Please." },
  { ro: "Scuzați-mă.", en: "Excuse me." },
  { ro: "Îmi pare rău.", en: "I’m sorry." },
  { ro: "Cât costă?", en: "How much?" },
  { ro: "Pot să plătesc cu cardul?", en: "Can I pay by card?" },
  { ro: "Nota, vă rog.", en: "The check, please." },
  { ro: "Nu vorbesc bine românește.", en: "I don’t speak Romanian well." },
  { ro: "Vorbiți engleză?", en: "Do you speak English?" },
  { ro: "Mai spuneți o dată, vă rog.", en: "Say it again, please." },
  { ro: "Nu înțeleg.", en: "I don’t understand." },
  { ro: "Ce înseamnă asta?", en: "What does this mean?" },
  { ro: "Puteți vorbi mai încet?", en: "Can you speak more slowly?" },
  { ro: "Unde este toaleta?", en: "Where is the toilet?" },
  { ro: "Ajutor!", en: "Help!" },
  { ro: "Am nevoie de ajutor.", en: "I need help." },
  { ro: "Pot să vă întreb ceva?", en: "Can I ask you something?" },
  { ro: "Nu știu.", en: "I don’t know." },
  { ro: "Sigur!", en: "Sure!" },
  { ro: "Desigur.", en: "Of course." },
  { ro: "Poate.", en: "Maybe." },
  { ro: "Nu contează.", en: "It doesn’t matter." },
  { ro: "La revedere!", en: "Goodbye!" },
  { ro: "Pa!", en: "Bye!" },
  { ro: "Pe mâine!", en: "See you tomorrow!" },
  { ro: "Ne vedem!", en: "See you!" },
  { ro: "Să aveți o zi bună!", en: "Have a nice day!" },
];

export const HEALTH_PHRASES: PhraseItem[] = [
  { ro: "Mă doare capul.", en: "My head hurts." },
  { ro: "Mă doare stomacul.", en: "My stomach hurts." },
  { ro: "Mă dor dinții.", en: "My teeth hurt. (plural — dor!)" },
  { ro: "Mă doare spatele.", en: "My back hurts." },
  { ro: "Mă doare gâtul.", en: "My throat hurts." },
  { ro: "Am febră.", en: "I have a fever." },
  { ro: "Tușesc.", en: "I’m coughing." },
  { ro: "Am nevoie de un doctor.", en: "I need a doctor." },
  { ro: "Unde este cea mai apropiată farmacie?", en: "Where is the nearest pharmacy?" },
  { ro: "Sunt alergic / alergică la…", en: "I’m allergic to…" },
];

export const ADVERBS: VocabItem[] = [
  { ro: "bine", en: "well" }, { ro: "rău", en: "badly" }, { ro: "repede", en: "fast" },
  { ro: "încet", en: "slowly" }, { ro: "mult", en: "much" }, { ro: "puțin", en: "a little" },
  { ro: "foarte", en: "very" }, { ro: "deja", en: "already" }, { ro: "încă", en: "still / yet" },
  { ro: "aproape", en: "almost / near" }, { ro: "departe", en: "far" }, { ro: "sus", en: "up" },
  { ro: "jos", en: "down" }, { ro: "aici", en: "here" }, { ro: "acolo", en: "there" },
  { ro: "imediat", en: "immediately" }, { ro: "exact", en: "exactly" }, { ro: "sigur", en: "sure" },
  { ro: "probabil", en: "probably" }, { ro: "mereu / întotdeauna", en: "always" },
  { ro: "niciodată", en: "never" }, { ro: "uneori", en: "sometimes" }, { ro: "des / adesea", en: "often" },
  { ro: "rar", en: "rarely" },
];

export const COLORS: VocabItem[] = [
  { ro: "alb / albă", en: "white" }, { ro: "negru / neagră", en: "black" },
  { ro: "roșu / roșie", en: "red" }, { ro: "albastru / albastră", en: "blue" },
  { ro: "verde", en: "green" }, { ro: "galben / galbenă", en: "yellow" },
  { ro: "portocaliu", en: "orange" }, { ro: "maro", en: "brown" },
  { ro: "gri", en: "grey" }, { ro: "roz", en: "pink" },
  { ro: "mov / violet", en: "purple" }, { ro: "auriu", en: "gold" },
];

export const CONJUNCTIONS: VocabItem[] = [
  { ro: "și", en: "and" }, { ro: "sau", en: "or" }, { ro: "dar", en: "but" },
  { ro: "pentru că", en: "because" }, { ro: "dacă", en: "if" }, { ro: "că", en: "that" },
  { ro: "deci", en: "so / therefore" }, { ro: "deși", en: "although" },
  { ro: "când", en: "when" }, { ro: "unde", en: "where" },
  { ro: "cum", en: "how / as" }, { ro: "nici… nici", en: "neither… nor" },
  { ro: "fie… fie", en: "either… or" }, { ro: "în timp ce", en: "while" },
  { ro: "de când", en: "since" }, { ro: "până când", en: "until" },
];

export const TIME_EXPRESSIONS: VocabItem[] = [
  { ro: "azi", en: "today" }, { ro: "ieri", en: "yesterday" }, { ro: "mâine", en: "tomorrow" },
  { ro: "acum", en: "now" }, { ro: "întotdeauna", en: "always" }, { ro: "niciodată", en: "never" },
  { ro: "dimineață", en: "morning" }, { ro: "după-amiază", en: "afternoon" },
  { ro: "seară", en: "evening" }, { ro: "noapte", en: "night" },
  { ro: "alaltăieri", en: "day before yesterday" }, { ro: "poimâine", en: "day after tomorrow" },
  { ro: "săptămâna trecută", en: "last week" }, { ro: "săptămâna viitoare", en: "next week" },
  { ro: "luna trecută", en: "last month" }, { ro: "anul trecut", en: "last year" },
  { ro: "în fiecare zi", en: "every day" }, { ro: "de obicei", en: "usually" },
  { ro: "curând", en: "soon" }, { ro: "târziu", en: "late" },
  { ro: "devreme", en: "early" }, { ro: "data viitoare", en: "next time" },
];

export const DAYS: VocabItem[] = [
  { ro: "luni", en: "Monday" }, { ro: "marți", en: "Tuesday" }, { ro: "miercuri", en: "Wednesday" },
  { ro: "joi", en: "Thursday" }, { ro: "vineri", en: "Friday" },
  { ro: "sâmbătă", en: "Saturday" }, { ro: "duminică", en: "Sunday" },
];

export const MONTHS: VocabItem[] = [
  { ro: "ianuarie", en: "January" }, { ro: "februarie", en: "February" },
  { ro: "martie", en: "March" }, { ro: "aprilie", en: "April" },
  { ro: "mai", en: "May" }, { ro: "iunie", en: "June" },
  { ro: "iulie", en: "July" }, { ro: "august", en: "August" },
  { ro: "septembrie", en: "September" }, { ro: "octombrie", en: "October" },
  { ro: "noiembrie", en: "November" }, { ro: "decembrie", en: "December" },
];

export const COGNATES: VocabItem[] = [
  { ro: "informație", en: "information" }, { ro: "situație", en: "situation" },
  { ro: "educație", en: "education" }, { ro: "televiziune", en: "television" },
  { ro: "natură", en: "nature" }, { ro: "cultură", en: "culture" },
  { ro: "muzică", en: "music" }, { ro: "universitate", en: "university" },
  { ro: "restaurant", en: "restaurant" }, { ro: "hotel", en: "hotel" },
  { ro: "calitate", en: "quality" }, { ro: "apartament", en: "apartment" },
  { ro: "comunicație", en: "communication" }, { ro: "revoluție", en: "revolution" },
  { ro: "organizație", en: "organization" }, { ro: "prezentare", en: "presentation" },
  { ro: "celebrare", en: "celebration" }, { ro: "emoție", en: "emotion" },
  { ro: "aventură", en: "adventure" }, { ro: "structură", en: "structure" },
  { ro: "temperatură", en: "temperature" }, { ro: "medicină", en: "medicine" },
  { ro: "energie", en: "energy" }, { ro: "democrație", en: "democracy" },
  { ro: "familie", en: "family" }, { ro: "tradiție", en: "tradition" },
  { ro: "problemă", en: "problem" }, { ro: "moment", en: "moment" },
  { ro: "document", en: "document" }, { ro: "transport", en: "transport" },
  { ro: "modern", en: "modern" }, { ro: "normal", en: "normal" },
  { ro: "special", en: "special" }, { ro: "popular", en: "popular" },
  { ro: "important", en: "important" }, { ro: "interesant", en: "interesting" },
  { ro: "diferit", en: "different" }, { ro: "posibil", en: "possible" },
  { ro: "imposibil", en: "impossible" },
];

export const NOUNS_WITH_ARTICLES: VocabItem[] = [
  { ro: "om → omul", en: "man" }, { ro: "femeie → femeia", en: "woman" },
  { ro: "casă → casa", en: "house" }, { ro: "carte → cartea", en: "book" },
  { ro: "copil → copilul", en: "child" }, { ro: "apă → apa", en: "water" },
  { ro: "mașină → mașina", en: "car" }, { ro: "oraș → orașul", en: "city" },
  { ro: "câine → câinele", en: "dog" }, { ro: "pâine → pâinea", en: "bread" },
  { ro: "stradă → strada", en: "street" }, { ro: "soare → soarele", en: "sun" },
  { ro: "lună → luna", en: "moon" }, { ro: "munte → muntele", en: "mountain" },
];
