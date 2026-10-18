/* ---------- Cámara y escala ---------- */
let S = 4, VW = W, VH = VIEW_H, artGen = 0, vignette = null, ui = 1;
const cam = { x: 0, y: 0, look: 0 };
function camTarget() {
  return { x: p.x + p.w / 2 - VW / 2 + cam.look, y: p.y + p.h / 2 - VH * 0.56 };
}
function clampCam() { cam.x = Math.max(0, Math.min(W - VW, cam.x)); cam.y = Math.max(0, Math.min(H - VH, cam.y)); }
function snapCam() { cam.look = p.face * Math.min(26, VW * 0.08); const t = camTarget(); cam.x = t.x; cam.y = t.y; clampCam(); }
function updateCam(dt) {
  cam.look += (p.face * Math.min(26, VW * 0.08) - cam.look) * (1 - Math.exp(-dt * 2.2));
  const t = camTarget();
  cam.x += (t.x - cam.x) * (1 - Math.exp(-dt * 6.5));
  cam.y += (t.y - cam.y) * (1 - Math.exp(-dt * (p.vy > 250 ? 9 : 4.5)));
  clampCam();
}

/* ---------- Utilidades de dibujo ---------- */
const TAU = Math.PI * 2;
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function rgba(rgb, a) { return `rgba(${rgb},${a})`; }
function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
function ellipse(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, TAU); g.fill(); }
function softGlow(g, x, y, r, rgb, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(rgb, a)); gr.addColorStop(0.4, rgba(rgb, a * 0.35)); gr.addColorStop(1, rgba(rgb, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; }
// Cresta orgánica (montañas, colinas, rocas)
function ridge(g, rnd, w, lh, base, amp, step, color) {
  g.fillStyle = color; g.beginPath(); g.moveTo(-10, lh + 10);
  let x = -10, y = base - rnd() * amp; g.lineTo(x, y);
  while (x < w + 10) {
    const nx = x + step * (0.6 + rnd() * 0.8), ny = base - rnd() * amp;
    g.quadraticCurveTo(x + (nx - x) * 0.5, Math.min(y, ny) - rnd() * amp * 0.35, nx, ny); x = nx; y = ny;
  }
  g.lineTo(w + 10, lh + 10); g.closePath(); g.fill();
}
function wash(g, y0, y1, color, fog) {   // aguada: tinta densa arriba que se disuelve en la niebla
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, color); gr.addColorStop(.55, color); gr.addColorStop(1, rgba(fog, .16));
  return gr;
}
function haze(g, w, y0, y1, rgb, a) {
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, rgba(rgb, 0)); gr.addColorStop(1, rgba(rgb, a));
  g.fillStyle = gr; g.fillRect(-10, y0, w + 20, y1 - y0);
}
function moon(g, x, y, r) {
  softGlow(g, x, y, r * 5, '244,236,214', 0.28);
  g.fillStyle = '#f1e8d0'; circle(g, x, y, r);
  g.fillStyle = 'rgba(200,188,160,.45)'; circle(g, x - r * .3, y - r * .2, r * .25); circle(g, x + r * .35, y + r * .3, r * .18); circle(g, x + r * .1, y - r * .5, r * .12);
}
// Bambú en silueta
function bamboo(g, x, y0, y1, w, color, nodeColor, rnd, leaves) {
  g.fillStyle = color; g.fillRect(x - w / 2, y0, w, y1 - y0);
  g.fillStyle = nodeColor;
  for (let y = y1 - 6 - rnd() * 10; y > y0; y -= 14 + rnd() * 10) {
    g.fillRect(x - w / 2 - .4, y, w + .8, Math.max(.5, w * .16));
    if (leaves && rnd() < .35) {
      const d = rnd() < .5 ? -1 : 1;
      g.save(); g.fillStyle = color;
      for (let k = 0; k < 3; k++) { ellipse(g, x + d * (5 + k * 3), y - 2 + k * 2, 5 + rnd() * 3, 1 + rnd() * .6, d * (0.3 + k * .25)); }
      g.restore(); g.fillStyle = nodeColor;
    }
  }
}
function pine(g, x, base, sc, color, rnd) {
  g.fillStyle = color; g.strokeStyle = color; g.lineWidth = 2.2 * sc; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, base); g.bezierCurveTo(x + 6 * sc, base - 14 * sc, x - 8 * sc, base - 24 * sc, x + 2 * sc, base - 36 * sc); g.stroke();
  const pads = [[0, -36, 16], [-10, -27, 12], [10, -22, 13], [-4, -16, 9]];
  for (const [dx, dy, r] of pads) { ellipse(g, x + dx * sc, base + dy * sc, r * sc, r * .32 * sc); ellipse(g, x + dx * sc + r * .35 * sc, base + dy * sc - r * .2 * sc, r * .6 * sc, r * .28 * sc); }
}
function house(g, x, base, w, h, color, rnd, burned) {
  g.fillStyle = color;
  g.fillRect(x, base - h, w, h);
  g.beginPath(); g.moveTo(x - w * .18, base - h); g.lineTo(x + w * .2, base - h - h * .55); g.lineTo(x + w * .8, base - h - h * .55); g.lineTo(x + w * 1.18, base - h); g.closePath(); g.fill();
  if (burned) { // vigas rotas
    g.strokeStyle = color; g.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) { const bx = x + w * (.2 + i * .3); g.beginPath(); g.moveTo(bx, base - h - h * .5); g.lineTo(bx + (rnd() - .5) * 8, base - h - h * (.9 + rnd() * .4)); g.stroke(); }
  }
}
function tenshu(g, cx, base, sc, color, windowRGB) {
  g.fillStyle = color;
  g.beginPath(); g.moveTo(cx - 34 * sc, base); g.lineTo(cx - 27 * sc, base - 22 * sc); g.lineTo(cx + 27 * sc, base - 22 * sc); g.lineTo(cx + 34 * sc, base); g.fill();
  let y = base - 22 * sc, w = 26 * sc;
  for (let i = 0; i < 4; i++) {
    const h = 9 * sc;
    g.fillRect(cx - w * .8, y - h, w * 1.6, h);
    g.beginPath(); g.moveTo(cx - w * 1.25, y - h + 1 * sc); g.quadraticCurveTo(cx - w * .9, y - h - 2 * sc, cx - w * .7, y - h - 5 * sc);
    g.lineTo(cx + w * .7, y - h - 5 * sc); g.quadraticCurveTo(cx + w * .9, y - h - 2 * sc, cx + w * 1.25, y - h + 1 * sc); g.closePath(); g.fill();
    if (windowRGB) { g.fillStyle = rgba(windowRGB, .75); for (let k = -1; k <= 1; k++) g.fillRect(cx + k * w * .45 - 1.2 * sc, y - h * .7, 2.4 * sc, 3 * sc); g.fillStyle = color; }
    y -= h + 5 * sc; w *= 0.74;
  }
  g.fillRect(cx - .6 * sc, y - 3 * sc, 1.2 * sc, 4 * sc);
}
function torii(g, cx, base, sc, color) {
  g.fillStyle = color;
  g.fillRect(cx - 18 * sc, base - 40 * sc, 3.2 * sc, 40 * sc); g.fillRect(cx + 14.8 * sc, base - 40 * sc, 3.2 * sc, 40 * sc);
  g.fillRect(cx - 22 * sc, base - 34 * sc, 44 * sc, 2.6 * sc);
  g.beginPath(); g.moveTo(cx - 28 * sc, base - 41 * sc); g.quadraticCurveTo(cx, base - 43 * sc, cx + 28 * sc, base - 41 * sc);
  g.lineTo(cx + 26 * sc, base - 45.5 * sc); g.quadraticCurveTo(cx, base - 47.5 * sc, cx - 26 * sc, base - 45.5 * sc); g.closePath(); g.fill();
}
function hangingLantern(g, x, y, sc, lit) {
  g.strokeStyle = 'rgba(10,4,4,.9)'; g.lineWidth = .4 * sc; g.beginPath(); g.moveTo(x, y - 14 * sc); g.lineTo(x, y - 4 * sc); g.stroke();
  if (lit) softGlow(g, x, y, 22 * sc, '255,150,80', .5);
  g.fillStyle = lit ? '#e8703f' : '#3a1712'; ellipse(g, x, y, 3.2 * sc, 4.2 * sc);
  g.fillStyle = 'rgba(40,10,6,.9)'; g.fillRect(x - 2.2 * sc, y - 4.6 * sc, 4.4 * sc, 1 * sc); g.fillRect(x - 2.2 * sc, y + 3.6 * sc, 4.4 * sc, 1 * sc);
  if (lit) { g.fillStyle = 'rgba(255,220,160,.6)'; ellipse(g, x - .8 * sc, y - .6 * sc, 1 * sc, 2.4 * sc); }
}
function grassClump(g, x, base, hgt, color, rnd, n = 9) {
  g.fillStyle = color;
  for (let i = 0; i < n; i++) {
    const bx = x + (rnd() - .5) * hgt * .8, h = hgt * (.45 + rnd() * .6), lean = (rnd() - .5) * hgt * .7, w = .8 + rnd() * 1.4;
    g.beginPath(); g.moveTo(bx - w, base); g.quadraticCurveTo(bx + lean * .4, base - h * .55, bx + lean, base - h); g.quadraticCurveTo(bx + lean * .3 + w * .3, base - h * .5, bx + w, base); g.fill();
  }
}
