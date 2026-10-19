/* ---------- Luz ---------- */
let light = mk(10, 10), lg = light.getContext('2d');
function buildVignette() {
  vignette = mk(cv.width, cv.height);
  const g = vignette.getContext('2d'), w = cv.width, h = cv.height;
  const gr = g.createRadialGradient(w / 2, h * .5, Math.min(w, h) * .3, w / 2, h * .5, Math.max(w, h) * .75);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.62)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  light = mk(VW + 4, VH + 4); lg = light.getContext('2d');
}
function lightHole(x, y, r, a = 1) {
  const gr = lg.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(.55, `rgba(0,0,0,${a * .55})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
  lg.fillStyle = gr; lg.fillRect(x - r, y - r, r * 2, r * 2);
}
function drawLighting(t, sx, sy) {
  const T = TH[cur.theme]; if (T.dark <= 0) return;
  const ox = cam.x - 2, oy = cam.y - 2;
  lg.globalCompositeOperation = 'source-over'; lg.clearRect(0, 0, light.width, light.height);
  lg.fillStyle = `rgba(4,4,14,${T.dark})`; lg.fillRect(0, 0, light.width, light.height);
  lg.globalCompositeOperation = 'destination-out';
  lightHole(p.x + 5 - ox, p.y + 7 - oy, 78);
  for (const s of shrines) lightHole(s.tx * TILE + 8 - ox, (s.ty + 1) * TILE - 14 - oy, isLit(s) ? 85 : 30, isLit(s) ? 1 : .5);
  for (const k of pickups) if (!inPocket(cur, k.x + 6, k.y + 6)) lightHole(k.x + 6 - ox, k.y + 6 - oy, 55);
  for (const e of enemies) if (e.alive && e.kind === 'oni') lightHole(e.x + 5 - ox, e.y + 5 - oy, 48);
  for (const hg of cur.deco.hangs) if (hg.lit) lightHole(hg.x + Math.sin(hg.ang) * hg.len - ox, hg.y + hg.len - oy, 58);
  for (const l of cur.deco.lights) lightHole(l.x - ox, l.y - oy, l.r);
  if (p.atkLight > 0) lightHole(p.x + 5 + (p.atkDir === 'side' ? p.face * 12 : 0) - ox, p.y + 6 + (p.atkDir === 'up' ? -10 : p.atkDir === 'down' ? 12 : 0) - oy, 60 * p.atkLight / .14);
  lg.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(light, -2 * S + sx - (cam.x - Math.floor(cam.x)) * 0, -2 * S + sy, light.width * S, light.height * S);
}
function drawRays(t) {
  const T = TH[cur.theme]; if (!T.rays || REDUCED) return;
  ctx.save(); ctx.setTransform(S, 0, 0, S, -cam.x * .5 * S, -cam.y * .5 * S); ctx.globalCompositeOperation = 'lighter';
  const r = seeded(cur.seed + 5);
  for (let i = 0; i < 4; i++) {
    const bx = r() * (W * .5 + VW) - 30, wd = 10 + r() * 18, a = .045 + .03 * Math.sin(t * .35 + i * 1.7);
    const gr = ctx.createLinearGradient(0, -10, 0, VH + 80);
    gr.addColorStop(0, rgba(T.rays, a)); gr.addColorStop(1, rgba(T.rays, 0));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(bx, -10); ctx.lineTo(bx + wd, -10); ctx.lineTo(bx + wd + 60, VH + 120); ctx.lineTo(bx + 45, VH + 120); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
