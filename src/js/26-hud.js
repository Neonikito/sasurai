/* ---------- Interfaz ---------- */
function drawMask(g, x, y, full, t, i) {
  g.save(); g.translate(x, y);
  const pulse = full && p.hp === 1 ? 1 + Math.sin(t * 8) * .06 : 1; g.scale(pulse, pulse);
  g.beginPath(); g.moveTo(0, 10); g.bezierCurveTo(-8, 5, -8.5, -6, 0, -9); g.bezierCurveTo(8.5, -6, 8, 5, 0, 10); g.closePath();
  if (full) {
    g.shadowColor = 'rgba(239,230,210,.5)'; g.shadowBlur = 8;
    g.fillStyle = '#f2ead8'; g.fill(); g.shadowBlur = 0;
    g.fillStyle = '#16182b'; ellipse(g, -3, -.8, 1.8, 2.6, .35); ellipse(g, 3, -.8, 1.8, 2.6, -.35);
    g.fillStyle = C.shu; g.fillRect(-.5, -7, 1, 3);
  } else { g.fillStyle = 'rgba(10,10,22,.55)'; g.fill(); g.strokeStyle = 'rgba(239,230,210,.35)'; g.lineWidth = 1.2; g.stroke(); }
  g.restore();
}
function enso(g, x, y, r) {   // círculo zen a pincel
  const N = 46; g.lineCap = 'round';
  for (let i = 0; i < N; i++) {
    const k = i / N, a0 = -2.1 + k * 5.7, a1 = a0 + 5.7 / N + .02, rr = r + Math.sin(i * .7) * .5;
    g.strokeStyle = `rgba(239,230,210,${.95 - k * .25})`; g.lineWidth = 4.6 * Math.pow(1 - k, .7) + .7;
    g.beginPath(); g.arc(x, y, rr, a0, a1); g.stroke();
    if (k > .45) { g.strokeStyle = 'rgba(239,230,210,.35)'; g.lineWidth = .5; g.beginPath(); g.arc(x, y, rr + 2.4 * (1 - k) + 1, a0, a1); g.stroke(); }
  }
}
function drawHUD(t) {
  ui = Math.max(.7, Math.min(2.4, cv.height / 430));
  const g = ctx; g.setTransform(ui, 0, 0, ui, 0, 0);
  const sw = cv.width / ui, sh = cv.height / ui;
  // emblema
  const ex = 36, ey = 36;
  g.fillStyle = 'rgba(6,6,14,.6)'; circle(g, ex, ey, 24);
  enso(g, ex, ey, 20.5);
  g.strokeStyle = C.shu; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.arc(ex, ey, 15.5, -Math.PI / 2, -Math.PI / 2 + TAU * (p.hp / p.maxHp)); g.stroke();
  g.fillStyle = '#efe6d2'; g.font = `700 22px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('浪', ex, ey + 1);
  // máscaras de vida
  for (let i = 0; i < p.maxHp; i++) drawMask(g, 74 + i * 21, 26, i < p.hp, t, i);
  const fr = (save.frags || 0) % 4;   // fragmentos juntados hacia la próxima máscara
  if (fr) {
    const fx = 74 + p.maxHp * 21 + 2, fy = 26;
    g.strokeStyle = 'rgba(239,230,210,.4)'; g.lineWidth = 1; g.beginPath(); g.arc(fx, fy, 6, 0, TAU); g.stroke();
    g.fillStyle = 'rgba(242,234,216,.9)'; g.beginPath(); g.moveTo(fx, fy); g.arc(fx, fy, 6, -Math.PI / 2, -Math.PI / 2 + TAU * fr / 4); g.closePath(); g.fill();
  }
  // habilidades
  const ab = [[save.abilities.double, '鶴'], [save.abilities.dash, '居']];
  let ax = 70;
  for (const [has, k] of ab) {
    if (!has) continue;
    g.fillStyle = 'rgba(6,6,14,.55)'; circle(g, ax, 52, 9);
    g.strokeStyle = 'rgba(216,164,69,.8)'; g.lineWidth = 1; g.beginPath(); g.arc(ax, 52, 9, 0, TAU); g.stroke();
    g.fillStyle = k === '居' ? '#ff8a6a' : '#efe6d2'; g.font = `700 11px ${SERIF}`; g.fillText(k, ax, 52.5); ax += 22;
  }
  // minimapa: salas visitadas alrededor de la actual
  { const bw = 78, bh = 44, mx = sw - 14 - bw, my = 12, k = 1 / 26;
    g.save(); g.fillStyle = 'rgba(6,6,14,.5)'; g.fillRect(mx, my, bw, bh); g.beginPath(); g.rect(mx, my, bw, bh); g.clip();
    const ox = mx + bw / 2 - (cur.x + p.x) * k, oy = my + bh / 2 - (cur.y + p.y) * k;
    for (const key of save.visited) {
      const r = rooms[key]; if (!r) continue;
      g.fillStyle = key === cur.key ? 'rgba(239,230,210,.85)' : 'rgba(239,230,210,.28)';
      g.fillRect(ox + r.x * k + .6, oy + r.y * k + .6, r.w * k - 1.2, r.h * k - 1.2);
      if (save.shrine && save.shrine.room === key) { g.fillStyle = C.kin; circle(g, ox + (r.x + save.shrine.tx * TILE) * k, oy + (r.y + save.shrine.ty * TILE) * k, 1.6); }
    }
    g.fillStyle = C.shu; circle(g, mx + bw / 2, my + bh / 2, 1.8);
    g.restore(); }
  // título de zona
  if (roomLabel && state === 'play') {
    const k = roomLabel.t / roomLabel.max, a = Math.min(1, (1 - k) * 4, k * 3);
    const cy = sh * .22;
    g.globalAlpha = a;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.font = `700 ${Math.min(34, sw / 14)}px ${SERIF}`;
    g.fillStyle = '#efe6d2'; g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 12;
    g.fillText(roomLabel.text, sw / 2, cy); g.shadowBlur = 0;
    const tw = g.measureText(roomLabel.text).width / 2 + 18;
    g.strokeStyle = 'rgba(239,230,210,.7)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(sw / 2 - tw - 60, cy + 22); g.lineTo(sw / 2 - 8, cy + 22); g.moveTo(sw / 2 + 8, cy + 22); g.lineTo(sw / 2 + tw + 60, cy + 22); g.stroke();
    g.fillStyle = C.shu; g.save(); g.translate(sw / 2, cy + 22); g.rotate(Math.PI / 4); g.fillRect(-3, -3, 6, 6); g.restore();
    g.globalAlpha = 1;
  }
  // aviso grande (habilidad / guardado)
  if (banner) {
    const k = banner.t / banner.max, a = Math.min(1, (1 - k) * 6, k * 4);
    const cy = sh * .5, bw = Math.min(sw - 30, 420);
    g.globalAlpha = a;
    const gr = g.createLinearGradient(0, cy - 48, 0, cy + 48); gr.addColorStop(0, 'rgba(4,4,12,0)'); gr.addColorStop(.5, 'rgba(4,4,12,.78)'); gr.addColorStop(1, 'rgba(4,4,12,0)');
    g.fillStyle = gr; g.fillRect(0, cy - 48, sw, 96);
    const x0 = sw / 2 - bw / 2;
    g.fillStyle = C.shu; g.save(); g.translate(x0 + 26, cy); g.rotate(-.05); g.fillRect(-21, -21, 42, 42);
    g.strokeStyle = 'rgba(239,230,210,.8)'; g.lineWidth = 1; g.strokeRect(-17.5, -17.5, 35, 35);
    g.fillStyle = '#efe6d2'; g.font = `700 24px ${SERIF}`; g.textAlign = 'center'; g.fillText(banner.kanji, 0, 1); g.restore();
    g.textAlign = 'left'; g.fillStyle = '#efe6d2'; g.font = `700 19px ${SERIF}`; g.fillText(banner.title, x0 + 60, cy - 11);
    g.fillStyle = '#cfc8d9'; g.font = `400 12px ${SANS}`;
    wrapText(g, banner.sub, x0 + 60, cy + 9, bw - 64, 16);
    g.textAlign = 'center'; g.globalAlpha = 1;
  }
}
function wrapText(g, str, x, y, maxW, lh) {
  const words = str.split(' '); let line = '', yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = test;
  }
  if (line) g.fillText(line, x, yy);
}
