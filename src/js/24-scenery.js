/* ---------- Escenario vivo y tinta ---------- */
const inView = (x, m = 30) => x > cam.x - m && x < cam.x + VW + m;
function drawPocketCover(g) {
  const T = TH[cur.theme];
  const paint = (set, a) => {
    g.globalAlpha = a; g.fillStyle = T.rock; g.beginPath();
    for (const k of set) { const [x, y] = k.split(',').map(Number); g.rect(x * TILE - .5, y * TILE - .5, TILE + 1, TILE + 1); }
    g.fill(); g.globalAlpha = 1;
  };
  if (cur.pocket) paint(cur.pocket, 1);
  if (cur.reveal > 0 && cur.oldPocket) { paint(cur.oldPocket, cur.reveal); cur.reveal = Math.max(0, cur.reveal - 1 / 50); if (!cur.reveal) cur.oldPocket = null; }
}
function drawSplats(g) {
  for (const sp of splats) {
    if (!inView(sp.x)) continue;
    g.globalAlpha = Math.min(1, sp.t / 3) * .9; g.fillStyle = sp.c;
    g.beginPath();
    const n = sp.pts.length;
    for (let i = 0; i <= n; i++) { const a = sp.rot + i / n * TAU, r = sp.pts[i % n]; g.lineTo(sp.x + Math.cos(a) * r, sp.y + Math.sin(a) * r * .8); }
    g.fill();
  }
  g.globalAlpha = 1;
}
function drawTufts(g, t) {
  const T = TH[cur.theme];
  for (const tf of cur.deco.tufts) {
    if (!inView(tf.x)) continue;
    const r = seeded(Math.floor(tf.seed * 1000));
    for (let i = 0; i < tf.n; i++) {
      const bx = tf.x + (i - tf.n / 2) * 1.1, h = tf.cut ? 1.2 + r() : tf.h * (.65 + r() * .45);
      const bend = tf.cut ? 0 : (tf.b + Math.sin(t * 2.1 + tf.seed + i * .8) * .4) * (h / 8);
      g.fillStyle = i % 2 ? T.topHi : T.top;
      g.beginPath(); g.moveTo(bx - .55, tf.y + .6); g.quadraticCurveTo(bx + bend * .3, tf.y - h * .55, bx + bend * 1.3, tf.y - h);
      g.quadraticCurveTo(bx + bend * .35 + .2, tf.y - h * .5, bx + .55, tf.y + .6); g.fill();
      if (tf.glow && !tf.cut && i === 0) { g.globalCompositeOperation = 'lighter'; softGlow(g, bx + bend * 1.3, tf.y - h, 4, '120,230,200', .5); g.fillStyle = '#c4fff0'; circle(g, bx + bend * 1.3, tf.y - h, .45); g.globalCompositeOperation = 'source-over'; }
    }
  }
}
function drawHangs(g, t) {
  for (const hg of cur.deco.hangs) {
    if (!inView(hg.x)) continue;
    const lx = hg.x + Math.sin(hg.ang) * hg.len, ly = hg.y + Math.cos(hg.ang) * hg.len;
    g.strokeStyle = 'rgba(8,5,6,.9)'; g.lineWidth = .4; g.beginPath(); g.moveTo(hg.x, hg.y); g.lineTo(lx, ly - 4); g.stroke();
    g.save(); g.translate(lx, ly); g.rotate(-hg.ang * .6);
    g.fillStyle = hg.lit ? '#e2643a' : '#2e1410'; ellipse(g, 0, 0, 3.4, 4.4);
    if (hg.lit) { g.fillStyle = 'rgba(255,214,150,.55)'; ellipse(g, -.8, -.4, 1.2, 2.8); }
    g.strokeStyle = 'rgba(60,15,8,.6)'; g.lineWidth = .25;
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(-3.4 * Math.cos(k * .3), k * 1.5); g.lineTo(3.4 * Math.cos(k * .3), k * 1.5); g.stroke(); }
    g.fillStyle = '#120808'; g.fillRect(-2.2, -4.9, 4.4, 1.1); g.fillRect(-2.2, 3.8, 4.4, 1.1);
    if (hg.lit) { g.fillStyle = 'rgba(20,6,4,.85)'; g.font = `700 3.2px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(cur.theme === 'templo' ? '祭' : '城', 0, .3); }
    g.restore();
  }
}
function drawBanners(g, t) {
  for (const b of cur.deco.banners) {
    if (!inView(b.x)) continue;
    const top = b.y - b.h;
    g.fillStyle = '#1e140e'; g.fillRect(b.x - .5, top, 1, b.h); g.fillRect(b.x - .5, top + 1, 7.5, .7);
    const N = 7, fh = b.h * .62, fw = 6.4;
    g.fillStyle = b.torn ? '#4e1912' : C.shu;
    g.beginPath(); g.moveTo(b.x + .5, top + 1.6);
    for (let j = 0; j <= N; j++) { const yy = top + 1.6 + j / N * fh, wv = Math.sin(t * 3.4 - j * .8) * (j / N) * 1.1 + Math.sin(t * 1.3) * .4 * (j / N); g.lineTo(b.x + .5 + fw + wv, yy); }
    if (b.torn) { for (let k = 0; k < 4; k++) g.lineTo(b.x + .5 + fw - k * 1.7, top + 1.6 + fh - (k % 2) * 2.4); }
    g.lineTo(b.x + .5, top + 1.6 + fh); g.closePath(); g.fill();
    if (!b.torn) { g.fillStyle = 'rgba(239,230,210,.85)'; circle(g, b.x + .5 + fw / 2 + Math.sin(t * 3.4 - 3) * .4, top + 1.6 + fh * .32, 1.6); g.fillStyle = C.shu; circle(g, b.x + .5 + fw / 2 + Math.sin(t * 3.4 - 3) * .4, top + 1.6 + fh * .32, .7); }
  }
}
function drawRain(g) {
  if (!rain.length) return;
  g.strokeStyle = 'rgba(185,198,235,.28)'; g.lineWidth = .32; g.beginPath();
  for (const q of rain) { g.moveTo(q.x, q.y); g.lineTo(q.x + 1.1, q.y - 5.5); }
  g.stroke();
}
function drawFlies(g, t) {
  const fl = cur.deco.flies; if (!fl) return;
  g.globalCompositeOperation = 'lighter';
  for (const f of fl) { const a = .4 + .6 * Math.max(0, Math.sin(t * 2.2 + f.ph * 3)); softGlow(g, f.x, f.y, 5, '220,255,140', .5 * a); g.fillStyle = `rgba(240,255,190,${a})`; circle(g, f.x, f.y, .45); }
  g.globalCompositeOperation = 'source-over';
}
function drawCorpses(g, t) {
  for (const c of corpses) {
    const k = c.t / c.max, e = c.e;
    g.save(); g.globalAlpha = k;
    if (e.kind === 'ashi') { g.translate(e.x + e.w / 2, e.y + e.h); g.scale(1 + (1 - k) * .25, 1 - (1 - k) * .45); g.translate(-(e.x + e.w / 2), -(e.y + e.h)); drawAshigaru(g, e, t, '#07060c'); }
    else { g.translate(e.x + 5, e.y + 5); g.scale(k, k); g.translate(-(e.x + 5), -(e.y + 5)); drawOnibi(g, e, t); }
    g.restore();
  }
}
function drawStrokes(g) {
  for (const st of strokes) {
    const k = st.t / st.max, grow = Math.min(1, (1 - k) * 5), L = st.len * grow, w = st.w * Math.sqrt(k);
    g.save(); g.translate(st.x, st.y); g.rotate(st.ang);
    const ink = (c, ww, off) => { g.fillStyle = c; g.beginPath(); g.moveTo(-st.len / 2, off); g.quadraticCurveTo(-st.len / 2 + L * .5, -ww + off, -st.len / 2 + L, off + ww * .2); g.quadraticCurveTo(-st.len / 2 + L * .45, ww * .5 + off, -st.len / 2, off); g.fill(); };
    if (st.kill) { ink(`rgba(5,4,10,${.9 * k})`, w * 1.5, 0); ink(`rgba(200,56,42,${k})`, w * .7, -.2); }
    else ink(`rgba(250,246,232,${.85 * k})`, w, 0);
    g.restore();
  }
}
