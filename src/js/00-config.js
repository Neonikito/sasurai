/* ---------- Constantes ---------- */
const TILE = 16;
let COLS = 30, ROWS = 17, W = COLS * TILE, H = ROWS * TILE;   // tamaño de la sala actual: cambia al entrar a cada sala
const STEP = 1 / 60;
const RUN = 118, GRAV = 1400, JUMP_V = 385, MAX_FALL = 390, DASH_V = 480, DASH_T = 0.22;
const SAVE_KEY = 'sasurai-save-v2', OLD_SAVE_KEY = 'sasurai-save-v1', PREF_KEY = 'sasurai-prefs', SLOTS = 3;
const SERIF = '"Shippori Mincho", "Yu Mincho", "Hiragino Mincho ProN", Georgia, serif';
const SANS = '"Zen Kaku Gothic New", "Hiragino Kaku Gothic ProN", system-ui, sans-serif';
const VIEW_H = 200;            // alto visible del mundo (≈ 12,5 tiles): encuadre amplio estilo Hollow Knight
const MIN_VW = 210;            // ancho mínimo visible (pantallas verticales)
const C = {
  ink: '#16182b', washi: '#efe6d2', shu: '#c8382a', kin: '#d8a445', take: '#6f9a4c', takeHi: '#a9c27a',
  kasa: '#d6b47a', kasaLo: '#8a6a3c', kimono: '#3d4c86', kimonoHi: '#6878b4', hakama: '#232850', steel: '#e8eef5',
  oni: '#7fd6c2', oniHi: '#e4fff7', ashi: '#6a3426', ashiHi: '#a65a3e', sakura: '#efb0c0'
};
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Temas visuales por sala (paleta tipo acuarela nocturna) */
const TH = {
  aldea:    { sky: ['#07081a', '#1a1630', '#3a1f33'], fog: '214,96,64', far: '#1c1832', far2: '#141127', mid: '#0e0c1d', fg: '#030209',
              rock: '#151324', rockHi: '#25213b', edge: '#3b3456', top: '#46603a', topHi: '#8fb067', style: 'earth', dark: .34, rays: '255,170,120',
              amb: { kind: 'ember', c: ['#f4a259', '#e0603e', '#ffd08a'], vx: 6, vy: -22, rate: .6, from: 'bottom' } },
  bambu:    { sky: ['#040c12', '#0c2226', '#183a33'], fog: '150,214,186', far: '#12302f', far2: '#0d2324', mid: '#081719', fg: '#020808',
              rock: '#10181b', rockHi: '#1f2d31', edge: '#33494d', top: '#3d6a38', topHi: '#93c06f', style: 'earth', dark: .36, rays: '200,240,210',
              amb: { kind: 'leaf', c: ['#7fa85a', '#4f7a3e', '#a9c27a'], vx: -10, vy: 16, rate: .45, from: 'top' } },
  castillo: { sky: ['#060818', '#151b3c', '#33396a'], fog: '196,190,232', far: '#1a1f42', far2: '#141834', mid: '#0c0e24', fg: '#03040c',
              rock: '#1a1b30', rockHi: '#2c2e4c', edge: '#4a4d7c', top: '#d9cfb6', topHi: '#f3ead3', roof: '#20233c', style: 'block', dark: .3, rays: '220,225,255',
              amb: { kind: 'petal', c: [C.sakura, '#f7cdd6'], vx: -16, vy: 15, rate: .5, from: 'top' } },
  cueva:    { sky: ['#030308', '#0a0916', '#121024'], fog: '110,190,170', far: '#100f1f', far2: '#0c0b18', mid: '#080712', fg: '#010105',
              rock: '#100e1b', rockHi: '#1e1b31', edge: '#322e4b', top: '#2c574f', topHi: '#6fb3a0', style: 'cave', dark: .62, rays: null,
              amb: { kind: 'spore', c: ['#79c8b0', '#4f9a86'], vx: 3, vy: -5, rate: .3, from: 'any' } },
  templo:   { sky: ['#0a0406', '#1c0b10', '#2e1217'], fog: '230,150,90', far: '#200d12', far2: '#18090d', mid: '#110608', fg: '#040102',
              rock: '#190e0d', rockHi: '#33201a', edge: '#55332a', top: '#7a3a2a', topHi: '#c46a4a', style: 'wood', dark: .5, rays: '255,190,130',
              amb: { kind: 'petal', c: [C.sakura, C.kin], vx: -8, vy: 12, rate: .32, from: 'top' } }
};
