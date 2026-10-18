/* ---------- Mapa ---------- */
// Pantalla completa de mapa (M o Tab): muestra la forma real de cada sala visitada.
function toggleMap() {
  if (state === 'play' || state === 'pause') { state = 'map'; show(null); for (const k in keys) keys[k] = false; sfx('ui'); }
  else if (state === 'map') { state = 'play'; }
}
function drawMapScreen(t) {
  const g = ctx, pw = cv.width, ph = cv.height;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = 'rgba(5,5,12,.94)'; g.fillRect(0, 0, pw, ph);
  const u = Math.max(.7, Math.min(2.4, ph / 430)); g.setTransform(u, 0, 0, u, 0, 0);
  const sw = pw / u, sh = ph / u;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#efe6d2'; g.font = `700 22px ${SERIF}`; g.fillText('Mapa', sw / 2, 30);
  g.strokeStyle = 'rgba(239,230,210,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(sw / 2 - 70, 48); g.lineTo(sw / 2 + 70, 48); g.stroke();
  const vis = save.visited.map(k => rooms[k]).filter(Boolean);
  if (!vis.length) return;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of vis) { x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); }
  const areaW = sw - 60, areaH = sh - 120, k = Math.min(areaW / (x1 - x0), areaH / (y1 - y0), .4);
  const ox = sw / 2 - (x0 + x1) / 2 * k, oy = 62 + areaH / 2 - (y0 + y1) / 2 * k;
  const c = k * TILE;
  for (const r of vis) {
    const rx = ox + r.x * k, ry = oy + r.y * k, here = r === cur;
    // interior: celdas libres en papel, terreno en tinta
    g.fillStyle = 'rgba(239,230,210,.05)'; g.fillRect(rx, ry, r.w * k, r.h * k);
    g.fillStyle = here ? 'rgba(239,230,210,.42)' : 'rgba(239,230,210,.24)';
    g.beginPath();   // un solo relleno: sin costuras entre celdas
    for (let y = 0; y < r.nr; y++) for (let x = 0; x < r.nc; x++) {
      const ch = r.grid[y][x];
      if (ch !== '#' && ch !== 'B') g.rect(rx + x * c - .2, ry + y * c - .2, c + .4, c + .4);
    }
    g.fill();
    g.strokeStyle = here ? C.shu : 'rgba(239,230,210,.45)'; g.lineWidth = here ? 1.6 : 1;
    g.strokeRect(rx, ry, r.w * k, r.h * k);
    if (r.w * k > 60) { g.fillStyle = here ? '#efe6d2' : 'rgba(239,230,210,.6)'; g.font = `500 ${Math.min(11, r.w * k / 9)}px ${SANS}`; g.fillText(r.name, rx + r.w * k / 2, ry + r.h * k + 8); }
    if (save.shrine && save.shrine.room === r.key) {
      const sx = rx + (save.shrine.tx + .5) * c, sy = ry + (save.shrine.ty + .5) * c;
      g.fillStyle = C.kin; g.save(); g.translate(sx, sy); g.rotate(Math.PI / 4); g.fillRect(-2.6, -2.6, 5.2, 5.2); g.restore();
    }
  }
  // posición del ronin
  const px = ox + (cur.x + p.x + p.w / 2) * k, py = oy + (cur.y + p.y + p.h / 2) * k, pulse = 3 + Math.sin(t * 5) * 1;
  g.fillStyle = 'rgba(200,56,42,.35)'; circle(g, px, py, pulse + 3);
  g.fillStyle = C.shu; circle(g, px, py, 2.6);
  // leyenda
  g.font = `400 11px ${SANS}`; g.fillStyle = 'rgba(239,230,210,.7)';
  const touch = document.documentElement.classList.contains('touch');
  const l1 = `${vis.length} de ${Object.keys(rooms).length} salas visitadas`, l2 = `◆ linterna  ·  ● vos  ·  ${touch ? 'tocá Mapa para cerrar' : 'M o Tab para cerrar'}`;
  if (g.measureText(l1 + '  ·  ' + l2).width < sw - 24) g.fillText(l1 + '  ·  ' + l2, sw / 2, sh - 18);
  else { g.fillText(l1, sw / 2, sh - 32); g.fillText(l2, sw / 2, sh - 16); }
}
