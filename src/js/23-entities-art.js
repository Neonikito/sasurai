/* ---------- Entidades ---------- */
function isLit(s) { return save.shrine && save.shrine.room === cur.key && save.shrine.tx === s.tx && save.shrine.ty === s.ty; }
function drawToro(g, x, y, lit, t) {
  g.save(); g.translate(x, y);
  const st = '#6a697e', sd = '#45445a', sl = '#9a99ae';
  g.fillStyle = sd; g.fillRect(-5.5, -2, 11, 2); g.fillStyle = st; g.fillRect(-4.2, -3.2, 8.4, 1.4);
  g.fillStyle = st; g.fillRect(-1.7, -10, 3.4, 7); g.fillStyle = sl; g.fillRect(-1.7, -10, .7, 7);
  g.fillStyle = sd; g.fillRect(-4.4, -11.6, 8.8, 1.7);
  g.fillStyle = st; g.fillRect(-3.4, -16.6, 6.8, 5.1);
  const fl = lit ? .8 + Math.sin(t * 13) * .1 + Math.sin(t * 7.3) * .1 : 0;
  g.fillStyle = lit ? `rgba(255,${200 + fl * 30 | 0},120,1)` : '#15141f'; g.fillRect(-1.9, -15.5, 3.8, 3);
  g.fillStyle = sl; g.beginPath(); g.moveTo(-6.4, -16.4); g.quadraticCurveTo(-4.2, -17.2, -3.2, -19.6); g.lineTo(3.2, -19.6); g.quadraticCurveTo(4.2, -17.2, 6.4, -16.4); g.closePath(); g.fill();
  g.fillStyle = st; g.fillRect(-1.1, -21.2, 2.2, 1.7); circle(g, 0, -21.8, 1.1);
  g.restore();
}
const PK = { M: { k: '面', c: C.washi, rgb: '239,230,210' }, D: { k: '鶴', c: C.washi, rgb: '239,230,210' }, H: { k: '居', c: C.shu, rgb: '230,90,60' }, R: { k: '刀', c: C.kin, rgb: '230,180,80' } };
function drawPickup(g, k, t) {
  const P = PK[k.t], x = k.x + 6, y = k.y + 6 + Math.sin(t * 2.2 + k.bob) * 2;
  g.save(); g.globalCompositeOperation = 'lighter';
  const pil = g.createLinearGradient(0, y - 70, 0, y + 8); pil.addColorStop(0, rgba(P.rgb, 0)); pil.addColorStop(1, rgba(P.rgb, .22));
  g.fillStyle = pil; g.fillRect(x - 5, y - 70, 10, 78);
  softGlow(g, x, y, 22, P.rgb, .5);
  g.strokeStyle = rgba(P.rgb, .5 - ((t * .8) % 1) * .5); g.lineWidth = .6; g.beginPath(); g.arc(x, y, 6 + ((t * .8) % 1) * 12, 0, TAU); g.stroke();
  g.restore();
  if (k.t === 'M') {   // fragmento de máscara: un cuarto de máscara blanca con borde roto
    g.save(); g.translate(x, y); g.rotate(Math.sin(t * 1.6 + k.bob) * .15);
    g.fillStyle = '#f2ead8'; g.beginPath(); g.moveTo(0, 8); g.bezierCurveTo(-6.5, 4, -7, -5, 0, -7.5);
    g.lineTo(1.2, -4); g.lineTo(-.6, -1); g.lineTo(1.6, 2); g.lineTo(0, 8); g.fill();
    g.fillStyle = '#16182b'; ellipse(g, -2.6, -.6, 1.5, 2.2, .35);
    g.strokeStyle = 'rgba(3,2,8,.8)'; g.lineWidth = .4; g.stroke();
    g.restore(); return;
  }
  g.fillStyle = '#3a2418'; g.fillRect(x - 6.5, y - 8, 13, 2); g.fillRect(x - 6.5, y + 6, 13, 2);
  g.fillStyle = '#efe4c8'; g.fillRect(x - 5, y - 6.2, 10, 12.4);
  g.fillStyle = C.kin; circle(g, x - 6.7, y - 7, .9); circle(g, x + 6.7, y - 7, .9); circle(g, x - 6.7, y + 7, .9); circle(g, x + 6.7, y + 7, .9);
  g.fillStyle = k.t === 'D' ? C.ink : P.c; g.font = `700 8px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(P.k, x, y + .4);
}
function drawLever(g, lv, t) {
  const x = lv.x + 5, y = lv.y + 16;
  lv.swing = Math.max(0, lv.swing - 1 / 40);
  g.fillStyle = '#3a2a1c'; g.fillRect(x - 4, y - 3, 8, 3);
  g.fillStyle = '#2a1d14'; g.fillRect(x - 2.5, y - 6, 5, 3.5);
  const a = (lv.on ? .7 : -.7) + Math.sin(lv.swing * 14) * lv.swing * .3;
  g.save(); g.translate(x, y - 5); g.rotate(a);
  g.strokeStyle = '#6a4a2c'; g.lineWidth = 1.3; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -10); g.stroke();
  g.fillStyle = lv.on ? '#8a8070' : C.shu; circle(g, 0, -10.5, 1.6);
  g.restore();
  if (!lv.on) { g.save(); g.globalCompositeOperation = 'lighter'; softGlow(g, x, y - 14, 10, '230,90,60', .25 + Math.sin(t * 3) * .1); g.restore(); }
}
function drawAshigaru(g, e, t, mono) {
  const flash = !!mono || (e.hurt > 0 && Math.floor(t * 30) % 2 === 0), FL = mono || '#fff';
  const x = e.x + e.w / 2, y = e.y + e.h, d = e.dir;
  const wind = e.st === 'wind', lunge = e.st === 'lunge';
  g.save(); g.translate(x, y); g.scale(d, 1);
  if (wind) g.translate(-1.2, 0);
  if (lunge) { g.transform(1, 0, -0.18, 1, 0, 0); }
  g.fillStyle = 'rgba(0,0,0,.35)'; ellipse(g, 0, 0, 7, 1.2);
  const ph = e.anim * 8, walk = e.st === 'walk' && e.kbT <= 0;
  const body = flash ? FL : C.ashi, dark = flash ? FL : '#2a1610', plate = flash ? FL : C.ashiHi;
  for (const s of [-1, 1]) { // piernas
    g.save(); g.translate(s * 1.6, -5.5); g.rotate(walk ? Math.sin(ph + (s > 0 ? 0 : Math.PI)) * .5 : (wind ? s * .3 : 0));
    g.fillStyle = dark; g.fillRect(-1.3, 0, 2.6, 5.5); g.fillStyle = flash ? FL : '#111'; g.fillRect(-1.4, 4.8, 3.2, .9); g.restore();
  }
  // lanza (detrás del cuerpo en la mano trasera)
  const pull = wind ? -4 - Math.sin(t * 40) * .3 : 0, reach = lunge ? 4 : 0;
  g.strokeStyle = flash ? FL : '#7a5a36'; g.lineWidth = .9; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-9 + pull, -7.6); g.lineTo(13 + pull + reach, -8.4); g.stroke();
  g.fillStyle = flash ? FL : C.steel; g.beginPath(); g.moveTo(13 + pull + reach, -9.5); g.lineTo(17.5 + pull + reach, -8.4); g.lineTo(13 + pull + reach, -7.3); g.closePath(); g.fill();
  if (wind && !flash) { g.save(); g.globalCompositeOperation = 'lighter'; softGlow(g, 16 + pull, -8.4, 7, '255,90,60', .9); g.restore(); }
  // torso con placas
  g.fillStyle = body; g.beginPath(); g.moveTo(-4, -5); g.lineTo(-3.6, -11.5); g.lineTo(3.6, -11.5); g.lineTo(4.2, -5); g.closePath(); g.fill();
  g.fillStyle = plate; for (let k = 0; k < 3; k++) g.fillRect(-3.8, -10.6 + k * 2, 7.8, .7);
  g.fillStyle = flash ? FL : C.shu; for (let k = 0; k < 4; k++) g.fillRect(-3 + k * 2, -10.6, .3, 6);
  g.fillStyle = body; g.fillRect(-4.6, -11.8, 2.6, 2.6); g.fillRect(2.2, -11.8, 2.6, 2.6); // hombreras
  g.fillStyle = flash ? FL : '#1a0f0c'; g.fillRect(2.2, -9, 1.6, 2.8); // brazo
  // cara y jingasa
  g.fillStyle = flash ? FL : '#120a08'; ellipse(g, .6, -13, 2.2, 1.7);
  if (!flash) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = '#ff5a3c'; circle(g, 1.6, -13, .45); circle(g, -.2, -13, .4); softGlow(g, .8, -13, 3.5, '255,80,50', .5); g.restore(); }
  g.fillStyle = flash ? FL : '#1c1d2b'; g.beginPath(); g.moveTo(-6.6, -14); g.quadraticCurveTo(0, -18.3, 6.6, -14); g.quadraticCurveTo(0, -13.1, -6.6, -14); g.fill();
  g.strokeStyle = flash ? FL : '#a12a1e'; g.lineWidth = .4; g.beginPath(); g.moveTo(-6.4, -14); g.quadraticCurveTo(0, -13.1, 6.4, -14); g.stroke();
  g.fillStyle = C.kin; circle(g, 0, -16.6, .55);
  g.restore();
}
function drawOnibi(g, e, t) {
  const x = e.x + e.w / 2, y = e.y + e.h / 2, fl = Math.sin(t * 14 + e.anim) * .6;
  g.save(); g.globalCompositeOperation = 'lighter';
  softGlow(g, x, y, 26, '110,220,190', .45);
  const flash = e.hurt > 0;
  g.fillStyle = flash ? '#ffffff' : 'rgba(127,214,194,.85)';
  g.beginPath(); g.moveTo(x, y - 9 - fl); g.bezierCurveTo(x + 4.5, y - 4, x + 6, y + 2, x, y + 5); g.bezierCurveTo(x - 6, y + 2, x - 4.5, y - 4, x, y - 9 - fl); g.fill();
  g.fillStyle = 'rgba(228,255,247,.95)'; ellipse(g, x, y + 1, 2.8, 3.4);
  g.restore();
  g.fillStyle = '#0d2a26'; ellipse(g, x - 1.3, y + .8, .5, .9); ellipse(g, x + 1.3, y + .8, .5, .9);
}

/* El ronin: dibujado en unidades del mundo, origen en los pies, mirando a la derecha */
function drawRonin(g, o) {
  const gh = o.ghost;
  const col = gh ? { k: gh, h: gh, b: gh, d: gh, hat: gh, hatLo: gh, obi: gh, face: gh } :
    { k: C.kimono, h: C.kimonoHi, b: C.hakama, d: '#121530', hat: C.kasa, hatLo: C.kasaLo, obi: C.shu, face: '#0a0b17' };
  const ph = o.phase || 0, run = o.run, air = o.air, fall = o.fall, tt = o.t || 0;
  for (const s of [-1, 1]) {                       // piernas (hakama amplio)
    let a = 0;
    if (run) a = Math.sin(ph + (s > 0 ? 0 : Math.PI)) * .8;
    else if (o.drawn && o.aim === 'down') a = s > 0 ? -1 : -.45;
    else if (air) a = fall ? (s > 0 ? .28 : -.22) + Math.sin(tt * 18 + s) * .07 : (s > 0 ? -.6 : .35);
    g.save(); g.translate(s * .9, -6); g.rotate(a);
    g.fillStyle = s > 0 ? col.b : col.d;
    g.beginPath(); g.moveTo(-1.8, 0); g.lineTo(1.8, 0); g.lineTo(2.2, 5.4); g.lineTo(-1.6, 5.4); g.closePath(); g.fill();
    if (!gh) { g.fillStyle = '#0a0a12'; g.fillRect(-1.3, 5.3, 3.1, .8); }
    g.restore();
  }
  if (!o.drawn && !gh) {                            // vaina
    g.strokeStyle = '#090a14'; g.lineWidth = 1.1; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-7, -4.6); g.lineTo(2.5, -7.6); g.stroke();
    g.strokeStyle = '#d9cfb6'; g.lineWidth = .9; g.beginPath(); g.moveTo(3.1, -7.8); g.lineTo(5.6, -8.6); g.stroke();
    g.fillStyle = C.kin; ellipse(g, 2.8, -7.7, .5, 1, -.3);
  }
  g.fillStyle = gh ? col.k : '#2c3768';               // faldón trasero que flamea
  { const sp = o.run ? 1 : air ? .7 : .15, fl = Math.sin(tt * 15) * .5 * sp;
    g.beginPath(); g.moveTo(-2.6, -9); g.quadraticCurveTo(-4.6 - sp * 1.2, -7, -5 - sp * 2.4, -4.6 + fl); g.lineTo(-3.4, -4.4); g.closePath(); g.fill(); }
  g.fillStyle = col.k;                              // kimono
  g.beginPath(); g.moveTo(-3.3, -5.2); g.quadraticCurveTo(-3.9, -9.5, -2.7, -12.3); g.lineTo(2.4, -12.3); g.quadraticCurveTo(3.7, -9.5, 3.6, -5.2);
  g.lineTo(4.4, -4.4); g.lineTo(-4.4, -4.4); g.closePath(); g.fill();
  if (fall || (air && !gh)) {                       // el ruedo flamea en el aire
    for (const hx of [-4, -.6]) { const fl = Math.sin(tt * 26 + hx) * .9; g.beginPath(); g.moveTo(hx, -4.6); g.lineTo(hx + 3.6, -4.6); g.lineTo(hx + 1.6 + fl, -2.6 - (fall ? 0 : .8)); g.closePath(); g.fill(); }
  }
  if (!gh) {
    g.fillStyle = col.h; g.beginPath(); g.moveTo(-2.7, -12.3); g.quadraticCurveTo(-3.9, -9.5, -3.3, -5.2); g.lineTo(-2.3, -5.2); g.quadraticCurveTo(-2.8, -9.5, -1.8, -12.3); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(239,230,210,.75)'; g.lineWidth = .45; g.beginPath(); g.moveTo(.2, -12.3); g.lineTo(1.6, -8.6); g.lineTo(2.6, -12.3); g.stroke();
    g.strokeStyle = 'rgba(170,190,255,.4)'; g.lineWidth = .4; g.beginPath(); g.moveTo(-2.7, -12.2); g.quadraticCurveTo(-3.9, -9.5, -3.3, -5.2); g.stroke();
  }
  g.fillStyle = col.obi; g.fillRect(-3.5, -7.2, 7.2, 1.3);
  if (o.drawn && !gh) {                             // brazo con la katana
    const k = o.k || 0;
    const ang = o.dash ? .12 : o.aim === 'up' ? -.4 - k * 2.1 : o.aim === 'down' ? .5 + k * 1.7 : -1.15 + k * 2.3;
    g.save(); g.translate(1.5, -10.5); g.rotate(ang);
    g.fillStyle = col.k; g.fillRect(0, -1, 4.2, 2.2);
    g.strokeStyle = '#d9cfb6'; g.lineWidth = 1; g.beginPath(); g.moveTo(3.6, 0); g.lineTo(6, 0); g.stroke();
    const bl = g.createLinearGradient(6, 0, 18, 0); bl.addColorStop(0, '#9aa6b8'); bl.addColorStop(1, '#ffffff');
    g.strokeStyle = bl; g.lineWidth = .8; g.beginPath(); g.moveTo(6.2, 0); g.quadraticCurveTo(12, -.6, 18, -1.6); g.stroke();
    g.fillStyle = C.kin; ellipse(g, 6, 0, .45, 1.2);
    g.restore();
  } else if (!gh) {
    g.fillStyle = col.d; g.save(); g.translate(1.6, -11.6); g.rotate(run ? Math.sin(ph) * .45 : air ? -.5 : .1);
    g.beginPath(); g.moveTo(-1.2, 0); g.lineTo(1.6, 0); g.lineTo(1.4, 4.4); g.lineTo(-1.4, 4.4); g.closePath(); g.fill(); g.restore();
  }
  g.fillStyle = col.face; ellipse(g, .7, -13.3, 2.4, 1.8);   // rostro en sombra
  if (!gh) { g.fillStyle = '#f4ecd9'; ellipse(g, 1.5, -13.2, .42, o.blink ? .1 : .55); ellipse(g, 2.8, -13.3, .36, o.blink ? .1 : .5); }
  g.save(); g.translate(.3, -13.6); g.rotate(o.hatTilt || 0);  // kasa
  if (!gh) { const hg = g.createLinearGradient(0, -5, 0, 1); hg.addColorStop(0, '#f0d39a'); hg.addColorStop(1, col.hat); g.fillStyle = hg; } else g.fillStyle = col.hat;
  g.beginPath(); g.moveTo(-7.8, .2); g.quadraticCurveTo(0, -6.4, 7.8, .2); g.quadraticCurveTo(0, 1.4, -7.8, .2); g.fill();
  if (!gh) {
    g.strokeStyle = col.hatLo; g.lineWidth = .55; g.beginPath(); g.moveTo(-7.6, .2); g.quadraticCurveTo(0, 1.4, 7.6, .2); g.stroke();
    g.strokeStyle = 'rgba(120,88,40,.55)'; g.lineWidth = .28;
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(0, -3.1); g.lineTo(k * 2.3, .5 - Math.abs(k) * .06); g.stroke(); }
    g.fillStyle = 'rgba(255,245,215,.6)'; g.beginPath(); g.moveTo(-4.5, -1.6); g.quadraticCurveTo(-1.5, -3.6, .6, -3.1); g.quadraticCurveTo(-1.8, -2.4, -4.5, -1.6); g.fill();
    g.strokeStyle = 'rgba(8,6,12,.85)'; g.lineWidth = .35; g.beginPath(); g.moveTo(-7.8, .2); g.quadraticCurveTo(0, -6.4, 7.8, .2); g.stroke(); // trazo de tinta
  }
  g.restore();
}
function drawScarf(g) {
  if (respawnT > 0 && respawnKind === 'shrine') return;
  const pts = [{ x: p.x + 5 - p.face * 1.2, y: p.y + 2.2 }, ...scarf];
  for (let tail = 0; tail < 2; tail++) {
    g.strokeStyle = tail ? '#8e2219' : C.shu; g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 0; i < pts.length - 1; i++) {
      g.lineWidth = (1.9 - i * .24) * (tail ? .8 : 1);
      g.beginPath(); g.moveTo(pts[i].x, pts[i].y + tail * .9 * (i / pts.length)); g.lineTo(pts[i + 1].x, pts[i + 1].y + tail * 1.6 * ((i + 1) / pts.length)); g.stroke();
    }
  }
}
function drawCloth(g) {
  if (respawnT > 0 && respawnKind === 'shrine') return;
  const pts = [{ x: p.x + 5 - p.face * 2.8, y: p.y + 8.8 }, ...cloth], L = [], Rr = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let nx = -(b.y - a.y), ny = b.x - a.x; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const w = 1.3 * (1 - i / pts.length) + .35;
    L.push([pts[i].x + nx * w, pts[i].y + ny * w]); Rr.push([pts[i].x - nx * w, pts[i].y - ny * w]);
  }
  g.fillStyle = C.kimono; g.beginPath(); g.moveTo(L[0][0], L[0][1]);
  for (const q of L) g.lineTo(q[0], q[1]); for (let i = Rr.length - 1; i >= 0; i--) g.lineTo(Rr[i][0], Rr[i][1]);
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(5,4,10,.7)'; g.lineWidth = .3; g.stroke();
}
function playerPose(t) {
  const run = p.onGround && Math.abs(p.vx) > 15, idle = p.onGround && !run && p.atkT <= 0;
  const sq = p.squash, k = p.atkT > 0 ? 1 - p.atkT / 0.16 : 0, br = idle ? Math.sin(t * 2.4) * .02 : 0;
  return { phase: p.anim * 0.24, run, air: !p.onGround, fall: !p.onGround && p.vy > 150, t, k,
    drawn: p.atkT > 0 || p.dashT > 0, dash: p.dashT > 0, aim: p.atkT > 0 ? p.atkDir : 'side', blink: idle && (t % 3.7) < .12,
    hatTilt: run ? Math.sin(p.anim * .24 * 2) * .05 : (p.vy < -50 ? -.1 : p.vy > 80 ? .08 : 0),
    sx: (1 + .17 * sq) * (1 - (p.turnT / 0.1) * .85) * (1 - br * .5), sy: (1 - .17 * sq) * (1 + br),
    lean: p.dashT > 0 ? .25 : run ? .1 * Math.abs(p.vx) / RUN : 0, bob: run ? -Math.abs(Math.sin(p.anim * .24)) * .8 : 0 };
}
function drawCastShadows(g) {
  if (!p.onGround) return;
  const fx = p.x + 5, fy = p.y + p.h, L = [];
  for (const s of shrines) if (isLit(s)) L.push([s.tx * TILE + 8, (s.ty + 1) * TILE - 14]);
  for (const hg of cur.deco.hangs) if (hg.lit) L.push([hg.x + Math.sin(hg.ang) * hg.len, hg.y + hg.len]);
  for (const l of cur.deco.lights) L.push([l.x, l.y]);
  for (const [lx, ly] of L) {
    const dx = fx - lx, dist = Math.hypot(dx, fy - ly); if (dist > 120 || ly > fy) continue;
    const len = Math.min(30, 1500 / (dist + 25)), d = Math.sign(dx) || 1;
    g.fillStyle = `rgba(0,0,0,${.4 * (1 - dist / 120)})`; ellipse(g, fx + d * len / 2, fy, len / 2 + 2.5, 1.2);
  }
}
function drawPlayer(g, t) {
  if (respawnT > 0 && respawnKind === 'shrine') return;
  const o = playerPose(t);
  drawCastShadows(g);
  if (p.inv > 0 && Math.floor(t * 18) % 2 === 0) g.globalAlpha = .45;
  g.fillStyle = 'rgba(0,0,0,.35)'; if (p.onGround) ellipse(g, p.x + 5, p.y + p.h, 6, 1.1);
  g.save(); g.translate(p.x + p.w / 2, p.y + p.h); g.scale(p.face * o.sx, o.sy); g.rotate(o.lean); g.translate(0, o.bob);
  if (p.flip > 0) { g.translate(0, -7); g.rotate(Math.sin((1 - p.flip) * Math.PI) * .22); g.translate(0, 7); }
  drawRonin(g, o);
  g.restore(); g.globalAlpha = 1;
  if (p.atkT > 0) drawSlash(g, o.k);
}
function drawSlash(g, k) {
  const d = p.atkDir, cx = p.x + p.w / 2 + (d === 'side' ? p.face * 3 : 0), cy = p.y + (d === 'up' ? 3 : d === 'down' ? 13 : 6);
  g.save(); g.translate(cx, cy); g.scale(p.face, 1);
  if (d === 'up') g.rotate(-Math.PI / 2); else if (d === 'down') g.rotate(Math.PI / 2);
  const a0 = -1.35 + k * .4, a1 = -1.35 + Math.min(1, k * 1.8) * 2.5;
  g.globalCompositeOperation = 'lighter'; softGlow(g, 10, 0, 24, '239,230,210', .3 * (1 - k)); g.globalCompositeOperation = 'source-over';
  // trazo principal a pincel
  g.fillStyle = `rgba(250,246,232,${.95 - k * .75})`;
  g.beginPath(); g.arc(0, 0, 19, a0, a1); g.arc(3.5, .5, 13.5, a1, a0, true); g.closePath(); g.fill();
  // cerdas secas del pincel
  const rr = seeded(11);
  g.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const r = 12.6 + i * 1.05, s0 = a0 - .1 + rr() * .35, s1 = a1 + .25 - rr() * .7;
    if (s1 <= s0) continue;
    g.strokeStyle = i % 3 === 0 ? `rgba(8,6,12,${.55 - k * .5})` : `rgba(255,252,240,${.6 - k * .55})`;
    g.lineWidth = .25 + rr() * .3; g.beginPath(); g.arc(0, 0, r, s0, s1); g.stroke();
  }
  if (a1 > a0 + .25) { g.strokeStyle = `rgba(200,56,42,${.75 - k * .6})`; g.lineWidth = .7; g.beginPath(); g.arc(0, 0, 19.7, a0 + .2, a1); g.stroke(); }
  g.restore();
}
function drawGhosts(g) {
  for (const gh of ghosts) {
    g.save(); g.globalAlpha = gh.life / 0.28 * .55; g.translate(gh.x + 5, gh.y + 14); g.scale(gh.face, 1);
    drawRonin(g, { ghost: '#8fb0ff', drawn: true, swing: 0 }); g.restore();
  }
  if (p.dashT > 0) { // estela
    g.save(); g.globalCompositeOperation = 'lighter';
    const gr = g.createLinearGradient(p.x + 5 - p.face * 40, 0, p.x + 5, 0);
    gr.addColorStop(0, 'rgba(239,230,210,0)'); gr.addColorStop(1, 'rgba(239,230,210,.55)');
    g.fillStyle = gr; g.fillRect(Math.min(p.x + 5, p.x + 5 - p.face * 40), p.y + 6.5, 40, 1.2); g.restore();
  }
}
function drawParticles(g) {
  for (const q of particles) {
    const a = Math.max(0, Math.min(1, q.life / (q.max || .6)));
    g.globalAlpha = a;
    if (q.a) { g.globalCompositeOperation = 'lighter'; }
    g.fillStyle = q.c;
    if (q.ink || q.drop) { g.globalAlpha = Math.min(1, a * 2); const sp = Math.hypot(q.vx, q.vy); ellipse(g, q.x, q.y, q.s * (.7 + Math.min(1.6, sp / 160)), q.s * .55, Math.atan2(q.vy, q.vx)); }
    else if (q.leaf) ellipse(g, q.x, q.y, q.s * 1.4, q.s * .5, q.life * 9);
    else circle(g, q.x, q.y, q.s * (q.d ? 1 + (1 - a) * 1.5 : .6));
    g.globalCompositeOperation = 'source-over';
  }
  g.globalAlpha = 1;
}
function drawAmb(g) {
  const kind = TH[cur.theme].amb.kind;
  for (const q of amb) {
    g.fillStyle = q.c;
    if (kind === 'ember' || kind === 'spore') {
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = .55 + Math.sin(q.ph * 2) * .3;
      circle(g, q.x, q.y, q.s * .55 * q.z); softGlow(g, q.x, q.y, 3 * q.z, hexRgb(q.c), .25);
      g.globalCompositeOperation = 'source-over';
    } else {
      g.globalAlpha = .85; ellipse(g, q.x, q.y, 1.5 * q.s * q.z, .6 * q.s * q.z * Math.abs(Math.cos(q.rot)) + .15, q.rot * .5);
    }
  }
  g.globalAlpha = 1;
}
