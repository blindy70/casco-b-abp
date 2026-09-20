window.APP_CONFIG = {
  club: {
    name: "CascoB",
    tagline: "Estrategias a balón parado",
    primary: "#1749C4",
    primaryDark: "#0E2E7E",
    accent: "#5B8CFF",
    bg: "#0A0E1A",
    surface: "#141B30",
    border: "#22304F",
    text: "#EDF1FF",
    textDim: "#9AA7C7",
    logo: "Escudo.png"
  },
  data: {
    sheetUrl: "https://script.google.com/macros/s/AKfycbzTVlQPSKacv835CwVHkBeXWJoPKT6VXwLHbeI4WDLOQgwqUOoE_8hfEnej2PCj9g_l8A/exec",
    useSample: false
  },
  sample: {
    items: [
      { name: "Córner cerrado primer palo", category: "Córner", duration: "0:42" },
      { name: "Córner abierto segundo palo", category: "Córner", duration: "0:37" },
      { name: "Banda corta jugada a altura", category: "Banda Corta", duration: "0:31" },
      { name: "Banda media con doble bloqueo", category: "Banda Media", duration: "0:48" },
      { name: "Banda larga directa a pivot", category: "Banda Larga", duration: "0:26" },
      { name: "Salida de presión hacia córner", category: "Salida de Presión", duration: "0:55" },
      { name: "Saque de centro tras gol encajar", category: "Saque de Centro", duration: "0:33" },
      { name: "Falta lateral con pared", category: "Falta", duration: "0:29" },
      { name: "Defensa córner en zona", category: "Defensa Córner", duration: "0:46" },
      { name: "Ataque 5vs4 con pivot al segundo palo", category: "Ataque 5vs4", duration: "1:05" },
      { name: "Ataque 4v3 jugada entre líneas", category: "Ataque 4v3", duration: "0:52" }
    ]
  },
  categories: [
    { label: "Banda Corta", rank: 2, initials: "BC", patterns: ["bandacorta", "bcorta"] },
    { label: "Banda Media", rank: 3, initials: "BM", patterns: ["bandamedia", "bmedia"] },
    { label: "Banda Larga", rank: 4, initials: "BL", patterns: ["bandalarga", "blarga"] },
    { label: "Salida de Presión", rank: 5, initials: "SP", patterns: ["salidapresion", "salida"] },
    { label: "Saque de Centro", rank: 6, initials: "SC", patterns: ["saquecentro", "centro"] },
    { label: "Defensa Córner", rank: 8, initials: "DC", patterns: ["defensacorner", "defcorner"] },
    { label: "Defensa 5vs4", rank: 11, initials: "D5", patterns: ["defensa5vs4", "defensa5v4", "defensa5x4", "def5vs4"] },
    { label: "Defensa 4v3", rank: 12, initials: "D4", patterns: ["defensa4v3", "defensa4x3", "def4v3"] },
    { label: "Córner", rank: 1, initials: "CR", patterns: ["corner"] },
    { label: "Ataque 5vs4", rank: 9, initials: "A5", patterns: ["5vs4", "5v4", "5x4", "ataque5"] },
    { label: "Ataque 4v3", rank: 10, initials: "A4", patterns: ["4v3", "4x3", "ataque4"] },
    { label: "Falta", rank: 7, initials: "FA", patterns: ["falta"] }
  ]
};