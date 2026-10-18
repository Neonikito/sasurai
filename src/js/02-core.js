/* ---------- Utilidades ---------- */
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const approach = (v, t, d) => v < t ? Math.min(v + d, t) : Math.max(v - d, t);
function seeded(s) { s = Math.abs(s) % 2147483646 + 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const hash = (x, y) => { let h = x * 374761393 + y * 668265263; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; };

/* ---------- Preferencias y guardado ---------- */
let prefs = { sound: true };
try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch (e) {}
const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} };
const defaultSave = () => ({ abilities: { double: false, dash: false }, got: [], broken: [], visited: [], shrine: null, time: 0, deaths: 0, done: false });
let slot = 1;
const slotKey = n => SAVE_KEY + '-' + n;
function readSave(n = slot) { try { const s = localStorage.getItem(slotKey(n)); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function writeSave() { try { localStorage.setItem(slotKey(slot), JSON.stringify(save)); } catch (e) {} }
function deleteSave(n) { try { localStorage.removeItem(slotKey(n)); } catch (e) {} }
// La partida de la versión anterior pasa a la ranura 1
function migrateOldSave() {
  try {
    const raw = localStorage.getItem(OLD_SAVE_KEY);
    if (!raw || localStorage.getItem(slotKey(1))) return;
    const s = JSON.parse(raw), mk = k => OLD_KEYS[k] || k, mid = id => { const [r, pos] = id.split(':'); return mk(r) + ':' + pos; };
    s.visited = (s.visited || []).map(mk); s.got = (s.got || []).map(mid); s.broken = (s.broken || []).map(mid);
    if (s.shrine) s.shrine.room = mk(s.shrine.room);
    localStorage.setItem(slotKey(1), JSON.stringify(s)); localStorage.removeItem(OLD_SAVE_KEY);
  } catch (e) {}
}

/* ---------- Estado ---------- */
let save = defaultSave();
let rooms = {}, cur = null;
let state = 'title';
let enemies = [], pickups = [], shrines = [], particles = [], amb = [];
let banner = null, roomLabel = null, fade = 0, shake = 0, respawnT = 0, respawnKind = null, hitstop = 0, clock = 0;
const p = { x: 0, y: 0, w: 10, h: 14, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, jumpBuf: 0, jumpHeld: false,
  airJumps: 1, canDash: true, dashT: 0, dashCD: 0, dashHit: new Set(), atkT: 0, atkCD: 0, hitSet: new Set(), inv: 0, knockT: 0,
  hp: 5, maxHp: 5, anim: 0, atShrine: false, lastSafe: { x: 0, y: 0 }, squash: 0, flip: 0, wasGround: false, dustT: 0, ghostT: 0,
  turnT: 0, atkDir: 'side', pogoDone: false, atkLight: 0 };
let ghosts = [], splats = [], corpses = [], strokes = [], rain = [], flashT = 0;
const scarf = Array.from({ length: 6 }, () => ({ x: 0, y: 0 }));
const cloth = Array.from({ length: 3 }, () => ({ x: 0, y: 0 }));
function snapScarf() { for (const s of scarf) { s.x = p.x + 5; s.y = p.y + 5; } for (const c of cloth) { c.x = p.x + 5; c.y = p.y + 9; } }

function buildRooms() {
  rooms = {};
  for (const d of WORLD_DATA) {
    const grid = d.rows.map(r => r.split(''));
    const nr = grid.length, nc = grid[0].length, ents = [];
    for (let y = 0; y < nr; y++) for (let x = 0; x < nc; x++) {
      const ch = grid[y][x];
      if ('pSDHRef'.includes(ch)) { ents.push({ t: ch, x, y }); grid[y][x] = '.'; }
    }
    rooms[d.key] = { key: d.key, name: d.name, theme: d.theme, x: d.x, y: d.y, nc, nr, w: nc * TILE, h: nr * TILE, grid, ents, art: null,
      seed: Math.round(d.x / 480 * 7919 + d.y / 272 * 104729) + 13 };
  }
  for (const b of save.broken) {
    const [rk, pos] = b.split(':'); const [x, y] = pos.split(',').map(Number);
    if (rooms[rk]) rooms[rk].grid[y][x] = '.';
  }
}
function invalidateArt() { for (const k in rooms) rooms[k].art = null; }
function setRoomDims(r) { COLS = r.nc; ROWS = r.nr; W = r.w; H = r.h; }
function roomAt(wx, wy) {
  for (const k in rooms) { const r = rooms[k]; if (wx >= r.x && wx < r.x + r.w && wy >= r.y && wy < r.y + r.h) return r; }
  return null;
}

const tileAt = (tx, ty) => (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) ? '.' : cur.grid[ty][tx];
const isSolid = (tx, ty) => { const c = tileAt(tx, ty); return c === '#' || c === 'B'; };
