/* ---------- Composición ---------- */
function drawLayer(L, ox, oy) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(L.c, Math.round(-cam.x * L.f * S + ox), Math.round(-cam.y * L.f * S + oy));
}
const GRADE = { aldea: ['#3a4a8c', '#ff7a3c'], bambu: ['#245c70', '#d8e490'], castillo: ['#3a4aa0', '#e8b4d4'], cueva: ['#1c4c60', '#5ee0c0'], templo: ['#5a1820', '#ffb060'] };
let quality = 1, perfAvg = 1 / 60, perfT = 0, bl1 = null, bl2 = null, washiPat = null;
function buildWashi() {
  const c = mk(320, 320), g = c.getContext('2d'), r = seeded(42);
  for (let i = 0; i < 520; i++) {
    const x = r() * 320, y = r() * 320, l = 3 + r() * 14, a = r() * TAU;
    g.strokeStyle = r() < .5 ? `rgba(255,255,255,${.05 + r() * .1})` : `rgba(0,0,0,${.05 + r() * .1})`; g.lineWidth = .4 + r() * .8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 1) * l * .5, y + Math.sin(a + 1) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < .5 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.1)'; g.fillRect(r() * 320, r() * 320, 1 + r(), 1 + r()); }
  washiPat = ctx.createPattern(c, 'repeat');
}
function bloom() {
  const w1 = Math.ceil(cv.width / 4), h1 = Math.ceil(cv.height / 4), w2 = Math.ceil(cv.width / 12), h2 = Math.ceil(cv.height / 12);
  if (!bl1 || bl1.width !== w1 || bl1.height !== h1) { bl1 = mk(w1, h1); bl2 = mk(w2, h2); }
  const g1 = bl1.getContext('2d'), g2 = bl2.getContext('2d');
  g1.globalCompositeOperation = 'copy'; g1.drawImage(cv, 0, 0, w1, h1);
  g2.globalCompositeOperation = 'copy'; g2.drawImage(bl1, 0, 0, w2, h2);
  g1.globalCompositeOperation = 'multiply'; g1.drawImage(bl1, 0, 0); g1.drawImage(bl1, 0, 0);   // solo sobreviven los brillos
  g2.globalCompositeOperation = 'multiply'; g2.drawImage(bl2, 0, 0); g2.drawImage(bl2, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = .7; ctx.drawImage(bl2, 0, 0, cv.width, cv.height);
  ctx.globalAlpha = .35; ctx.drawImage(bl1, 0, 0, cv.width, cv.height);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
function heatShimmer(t) {
  const y0 = Math.floor(cv.height * .58), st = Math.max(3, Math.round(cv.height / 140)), amp = cv.height / 540 * 1.5;
  for (let y = y0; y < cv.height; y += st) {
    const off = Math.sin(t * 5 + y * .06) * amp * ((y - y0) / (cv.height - y0));
    ctx.drawImage(cv, 0, y, cv.width, st, off, y, cv.width, st);
  }
}
function drawLayer(L, ox, oy) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(L.c, Math.round(-cam.x * L.f * S + ox), Math.round(-cam.y * L.f * S + oy));
}
function render(t) {
  if (!cur) return;
  ensureArt(cur);
  const A = cur.art, T = TH[cur.theme], pw = cv.width, ph = cv.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = A.sky; ctx.fillRect(0, 0, pw, ph);
  let sx = 0, sy = 0;
  if (shake > 0 && !REDUCED) { const m = Math.min(1, shake * 4) * 2.2 * S; sx = (Math.random() - .5) * m; sy = (Math.random() - .5) * m; }
  drawLayer(A.far, sx * .3, sy * .3);
  ctx.globalAlpha = .75 + .25 * Math.sin(t * .4); ctx.fillStyle = A.fog; ctx.fillRect(0, 0, pw, ph); ctx.globalAlpha = 1;
  drawLayer(A.mid, sx * .6, sy * .6);
  drawRays(t);

  // mundo
  ctx.setTransform(S, 0, 0, S, -cam.x * S + sx, -cam.y * S + sy);
  ctx.drawImage(A.terrain, 0, 0, W, H);
  drawSplats(ctx);
  drawBanners(ctx, t);
  for (const s of shrines) drawToro(ctx, s.tx * TILE + 8, (s.ty + 1) * TILE, isLit(s), t);
  for (const k of pickups) if (!inPocket(cur, k.x + 6, k.y + 6)) drawPickup(ctx, k, t);
  for (const lv of levers) drawLever(ctx, lv, t);
  for (const e of enemies) if (e.alive) { if (e.kind === 'ashi') drawAshigaru(ctx, e, t); else drawOnibi(ctx, e, t); }
  drawCorpses(ctx, t);
  drawGhosts(ctx);
  drawScarf(ctx);
  drawPlayer(ctx, t);
  drawTufts(ctx, t);
  drawHangs(ctx, t);
  drawParticles(ctx);
  drawStrokes(ctx);
  drawRain(ctx);
  drawPocketCover(ctx);

  drawLighting(t, sx, sy);

  // brillos aditivos sobre la oscuridad
  ctx.setTransform(S, 0, 0, S, -cam.x * S + sx, -cam.y * S + sy);
  ctx.globalCompositeOperation = 'lighter';
  for (const s of shrines) if (isLit(s)) softGlow(ctx, s.tx * TILE + 8, (s.ty + 1) * TILE - 14, 34 + Math.sin(t * 9) * 1.5, '255,180,90', .55);
  for (const hg of cur.deco.hangs) if (hg.lit && inView(hg.x)) softGlow(ctx, hg.x + Math.sin(hg.ang) * hg.len, hg.y + Math.cos(hg.ang) * hg.len, 26, '255,140,70', .45);
  for (const l of cur.deco.lights) if (inView(l.x)) softGlow(ctx, l.x, l.y, l.r * .55 * (l.flick ? .9 + Math.sin(t * 11 + l.x) * .1 : 1), l.rgb, .4);
  softGlow(ctx, p.x + 5, p.y + 6, 26, '255,220,180', .07);
  ctx.globalCompositeOperation = 'source-over';
  drawFlies(ctx, t);
  drawAmb(ctx);

  drawLayer(A.fg, sx * 1.3, sy * 1.3);

  // etalonaje y postproceso
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .5; ctx.fillStyle = A.grade; ctx.fillRect(0, 0, pw, ph);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  if (quality) { bloom(); if (cur.theme === 'aldea' && !REDUCED) heatShimmer(t); }
  ctx.drawImage(vignette, 0, 0);
  if (washiPat) { ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .55; ctx.fillStyle = washiPat; ctx.fillRect(0, 0, pw, ph); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  if (flashT > 0 && !REDUCED) { ctx.fillStyle = `rgba(255,248,230,${flashT * 1.6})`; ctx.fillRect(0, 0, pw, ph); }

  if (state === 'play' || state === 'pause') drawHUD(t);
  if (state === 'map') drawMapScreen(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (fade > 0 && state !== 'title') { ctx.fillStyle = `rgba(2,2,8,${Math.min(1, fade)})`; ctx.fillRect(0, 0, pw, ph); }
}
