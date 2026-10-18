// Compila Sasurai en un solo index.html.
// Uso:  node tools/build.mjs
// - Une los archivos de src/js en orden (00-…, 01-…) dentro de una función.
// - Lee el mundo de Tiled (maps/sasurai.world) y cada sala (.tmj) y los incrusta como WORLD_DATA.
// - Avisa si hay salidas que no llevan a ninguna sala.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = p => fs.readFileSync(path.join(root, p), 'utf8');
const TILE = 16;
const THEMES = ['aldea', 'bambu', 'castillo', 'cueva', 'templo'];
const CHAR = { terreno: '#', estacas: '^', barricada: 'B', inicio: 'p', linterna: 'S', grulla: 'D', iai: 'H', espada: 'R', ashigaru: 'e', onibi: 'f' };
const errors = [], warnings = [];

// ---- Tileset: id de tile → carácter del juego ----
const tilesets = {};
function loadTileset(file) {
  if (tilesets[file]) return tilesets[file];
  const ts = JSON.parse(rd(path.join('maps', file)));
  const map = {};
  for (const t of ts.tiles || []) {
    const cls = t.type || t.class;
    if (CHAR[cls]) map[t.id] = CHAR[cls]; else warnings.push(`El tile ${t.id} de ${file} tiene una clase desconocida: "${cls}"`);
  }
  return (tilesets[file] = map);
}

// ---- Mundo ----
const world = JSON.parse(rd('maps/sasurai.world'));
const rooms = [];
for (const m of world.maps) {
  const key = path.basename(m.fileName, '.tmj');
  const map = JSON.parse(rd(path.join('maps', m.fileName)));
  const where = `sala "${key}"`;
  if (map.tilewidth !== TILE || map.tileheight !== TILE) errors.push(`${where}: los tiles deben medir ${TILE}×${TILE}`);
  if (map.infinite) errors.push(`${where}: el mapa no puede ser infinito`);
  if (m.x % TILE || m.y % TILE) errors.push(`${where}: su posición en el mundo debe ser múltiplo de ${TILE} px`);
  const prop = n => (map.properties || []).find(q => q.name === n)?.value;
  const name = prop('nombre') || key, theme = prop('tema') || 'aldea';
  if (!THEMES.includes(theme)) errors.push(`${where}: tema "${theme}" desconocido (usá ${THEMES.join(', ')})`);
  const ts = map.tilesets[0], tmap = loadTileset(ts.source);
  const w = map.width, h = map.height;
  const grid = Array.from({ length: h }, () => Array(w).fill('.'));
  for (const layer of map.layers) {
    if (layer.type !== 'tilelayer') continue;
    layer.data.forEach((raw, i) => {
      const gid = raw & 0x1fffffff;
      if (!gid) return;
      const ch = tmap[gid - ts.firstgid];
      if (ch) grid[Math.floor(i / w)][i % w] = ch;
    });
  }
  const rows = grid.map(r => r.join(''));
  if (!rows.some(r => /[pSDHRef]/.test(r)) && !rows.some(r => r.includes('.'))) warnings.push(`${where}: está vacía`);
  rooms.push({ key, name, theme, x: m.x, y: m.y, rows });
}
if (rooms.filter(r => r.rows.some(row => row.includes('p'))).length !== 1) errors.push('Tiene que haber exactamente un tile de "inicio" en todo el mundo');

// ---- Salidas sin destino: celdas abiertas en el borde que no dan a otra sala ----
// las barricadas (B) cuentan como paso: se rompen con el impulso
const open = (r, tx, ty) => { const c = r.rows[ty]?.[tx]; return c !== undefined && c !== '#'; };
function roomAt(wx, wy) { return rooms.find(r => wx >= r.x && wx < r.x + r.rows[0].length * TILE && wy >= r.y && wy < r.y + r.rows.length * TILE); }
for (const r of rooms) {
  const w = r.rows[0].length, h = r.rows.length;
  const check = (tx, ty, dx, dy) => {
    if (!open(r, tx, ty)) return;
    const wx = r.x + tx * TILE + 8 + dx * 16, wy = r.y + ty * TILE + 8 + dy * 16;
    const o = roomAt(wx, wy);
    if (!o) warnings.push(`sala "${r.key}": salida en (${tx},${ty}) que no lleva a ninguna sala`);
    else if (!open(o, Math.floor((wx - o.x) / TILE), Math.floor((wy - o.y) / TILE))) warnings.push(`sala "${r.key}": la salida en (${tx},${ty}) choca contra una pared de "${o.key}"`);
  };
  for (let x = 0; x < w; x++) { check(x, 0, 0, -1); check(x, h - 1, 0, 1); }
  for (let y = 0; y < h; y++) { check(0, y, -1, 0); check(w - 1, y, 1, 0); }
}

if (warnings.length) console.warn('Avisos:\n  ' + warnings.join('\n  '));
if (errors.length) { console.error('Errores:\n  ' + errors.join('\n  ')); process.exit(1); }

// ---- Código ----
const jsDir = path.join(root, 'src/js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort();
const code = files.map(f => `// ===== ${f} =====\n` + fs.readFileSync(path.join(jsDir, f), 'utf8')).join('\n');
const game = `(() => {\n'use strict';\nconst WORLD_DATA = ${JSON.stringify(rooms)};\n${code}\n})();`;
const tpl = rd('src/index.html');
if (!tpl.includes('/*@@GAME@@*/')) { console.error('Falta /*@@GAME@@*/ en src/index.html'); process.exit(1); }
const out = tpl.replace('/*@@GAME@@*/', () => game);
fs.writeFileSync(path.join(root, 'index.html'), out);
console.log(`index.html listo: ${rooms.length} salas, ${files.length} archivos de código, ${(out.length / 1024).toFixed(0)} KB`);
