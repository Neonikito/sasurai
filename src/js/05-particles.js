/* ---------- Partículas ---------- */
function burst(x, y, n, colors, spd = 120, grav = 500) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = spd * (0.3 + Math.random() * 0.7);
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.4 + Math.random() * 0.4, max: 0.8, c: colors[i % colors.length], s: 0.7 + Math.random() * 0.9, g: grav, a: 1 });
  }
}
function dust(x, y, n) {
  for (let i = 0; i < n; i++) particles.push({ x: x + (Math.random() - .5) * 6, y: y - 1, vx: (Math.random() - .5) * 60, vy: -10 - Math.random() * 20, life: 0.4 + Math.random() * .25, max: 0.65, c: 'rgba(190,180,170,.55)', s: 1.4 + Math.random(), g: -20, d: 1 });
}
function updateParticles(dt) {
  for (const gh of ghosts) gh.life -= dt; ghosts = ghosts.filter(gh => gh.life > 0);
  for (const q of particles) {
    if (!(q.ink || q.drop) || q.life <= 0 || !isSolid(Math.floor(q.x / TILE), Math.floor(q.y / TILE))) continue;
    if (q.ink) addSplat(q.x, q.y, q.c, q.s * 1.6 + .4);
    else for (let i = 0; i < 4; i++) particles.push({ x: q.x, y: Math.floor(q.y / TILE) * TILE, vx: (Math.random() - .5) * 50, vy: -30 - Math.random() * 40, life: .3, max: .3, c: '#a8f0dc', s: .4, g: 420, a: 1 });
    q.life = 0;
  }
  for (const sp of splats) sp.t -= dt; splats = splats.filter(sp => sp.t > 0);
  for (const c of corpses) {
    c.t -= dt;
    if (Math.random() < .5) particles.push({ x: c.e.x + Math.random() * c.e.w, y: c.e.y + Math.random() * c.e.h, vx: (Math.random() - .5) * 20, vy: -15 - Math.random() * 25, life: .5, max: .5, c: '#07060c', s: .5 + Math.random() * .6, g: -30 });
  }
  corpses = corpses.filter(c => c.t > 0);
  for (const st of strokes) st.t -= dt; strokes = strokes.filter(st => st.t > 0);
  flashT = Math.max(0, flashT - dt);
  for (const q of particles) { q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; }
  particles = particles.filter(q => q.life > 0);
}
let ambSeeded = false;
function spawnAmb(anywhere) {
  const A = TH[cur.theme].amb, m = 20;
  const x = cam.x - m + Math.random() * (VW + m * 2);
  const y = anywhere || A.from === 'any' ? cam.y + Math.random() * VH : (A.from === 'top' ? cam.y - 8 : cam.y + VH + 8);
  amb.push({ x, y, vx: A.vx * (0.6 + Math.random() * 0.8), vy: A.vy * (0.6 + Math.random() * 0.8), ph: Math.random() * 6, rot: Math.random() * 6,
    c: A.c[Math.floor(Math.random() * A.c.length)], s: 0.6 + Math.random() * 0.9, z: Math.random() < 0.3 ? 1.6 : 1 });
}
function updateAmb(dt) {
  const A = TH[cur.theme].amb;
  if (!ambSeeded) { ambSeeded = true; for (let i = 0; i < 22; i++) spawnAmb(true); }
  if (Math.random() < A.rate * dt * 26 && amb.length < 46) spawnAmb(false);
  for (const q of amb) { q.ph += dt * 2; q.rot += dt * 2.2; q.x += (q.vx + Math.sin(q.ph) * 8) * dt; q.y += q.vy * dt; }
  const m = 40;
  amb = amb.filter(q => q.y > cam.y - m && q.y < cam.y + VH + m && q.x > cam.x - m && q.x < cam.x + VW + m);
}

/* ---------- Decorados vivos ---------- */
function buildDeco(room) {
  const r = seeded(room.seed + 777), T = TH[room.theme], g = room.grid;
  const at = (x, y) => (x < 0 || x >= COLS || y < 0 || y >= ROWS) ? '#' : g[y][x];
  const isOpen = (x, y) => { const c = at(x, y); return !'#BXG'.includes(c); };
  const d = { tufts: [], hangs: [], banners: [], statics: [], drips: [], lights: [], flies: null };
  for (let y = 1; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if (g[y][x] !== '#') continue;
    const topOpen = isOpen(x, y - 1);
    if (topOpen && (T.style === 'earth' || T.style === 'cave')) {
      const n = T.style === 'cave' ? 1 : 2;
      for (let k = 0; k < n; k++) if (r() < .85) d.tufts.push({ x: x * 16 + 2 + r() * 12, y: y * 16, h: (T.style === 'cave' ? 4 : 6) + r() * 5, n: 3 + Math.floor(r() * 3), seed: r() * 100, cut: false, b: 0, glow: T.style === 'cave' && r() < .5 });
    }
    if (isOpen(x, y + 1) && isOpen(x, y + 2) && y < ROWS - 3) {
      if (['castillo', 'templo', 'aldea'].includes(room.theme) && r() < .12 && !d.hangs.some(h => Math.abs(h.x - (x * 16 + 8)) < 44))
        d.hangs.push({ x: x * 16 + 8, y: (y + 1) * 16, len: 8 + r() * 9, ang: 0, angV: 0, lit: room.theme !== 'aldea' || r() < .5 });
      if (room.theme === 'cueva' && r() < .2) d.drips.push({ x: x * 16 + 3 + r() * 10, y: (y + 1) * 16, t: r() * 3 });
    }
    if (topOpen && isOpen(x, y - 2) && isOpen(x, y - 3)) {
      let near = false; for (const e of room.ents) if (Math.abs(e.x - x) <= 1 && Math.abs(e.y - (y - 1)) <= 1) near = true;
      if (near) continue;
      if (r() < .08 && (room.theme === 'castillo' || room.theme === 'aldea') && !d.banners.some(b => Math.abs(b.x - x * 16) < 64))
        d.banners.push({ x: x * 16 + 3 + r() * 10, y: y * 16, h: 22 + r() * 6, torn: room.theme === 'aldea' });
      else if (r() < .1 && !d.statics.some(q => Math.abs(q.x - x * 16) < 40)) {
        const kinds = { aldea: ['spears', 'armor', 'barrel'], bambu: ['jizo', 'stump', 'jizo'], castillo: ['sign', 'spears', 'barrel'], cueva: ['crystal', 'mush', 'crystal'], templo: ['candles', 'offering', 'candles'] }[room.theme];
        const kind = kinds[Math.floor(r() * kinds.length)], sx = x * 16 + 3 + r() * 10, sy = y * 16;
        d.statics.push({ kind, x: sx, y: sy, seed: Math.floor(r() * 1000) });
        if (kind === 'crystal') d.lights.push({ x: sx, y: sy - 4, r: 42, rgb: '110,220,190' });
        if (kind === 'candles') d.lights.push({ x: sx, y: sy - 6, r: 46, rgb: '255,170,90', flick: 1 });
        if (kind === 'mush') d.lights.push({ x: sx, y: sy - 3, r: 26, rgb: '120,200,255' });
      }
    }
  }
  return d;
}
function updateWorld(dt) {
  const d = cur.deco;
  const wind = Math.sin(clock * .7) * .5 + Math.sin(clock * 1.9) * .25;
  for (const tf of d.tufts) {
    if (tf.x < cam.x - 20 || tf.x > cam.x + VW + 20) continue;
    let target = wind * .8;
    const dx = tf.x - (p.x + 5), dy = tf.y - (p.y + p.h);
    if (Math.abs(dx) < 9 && dy > -3 && dy < 8) target += Math.sign(dx || p.face) * (9 - Math.abs(dx)) * .6;
    for (const e of enemies) if (e.alive && e.kind === 'ashi' && Math.abs(tf.x - e.x - 6) < 8 && Math.abs(tf.y - e.y - e.h) < 6) target += Math.sign(tf.x - e.x - 6 || 1) * 3;
    tf.b += (target - tf.b) * Math.min(1, dt * 10);
  }
  for (const hg of d.hangs) {
    hg.angV += (-hg.ang * 10 - hg.angV * .9 + wind * .25) * dt;
    const lx = hg.x + Math.sin(hg.ang) * hg.len, ly = hg.y + hg.len;
    if (Math.abs(lx - (p.x + 5)) < 7 && Math.abs(ly - (p.y + 7)) < 11) hg.angV += p.vx * .012 * dt;
    hg.ang = Math.max(-1.2, Math.min(1.2, hg.ang + hg.angV * dt));
  }
  if (cur.theme === 'cueva') for (const dr of d.drips) {
    dr.t -= dt;
    if (dr.t <= 0) { dr.t = 1.5 + Math.random() * 3; particles.push({ x: dr.x, y: dr.y + 1, vx: 0, vy: 0, life: 3, max: 3, c: '#a8f0dc', s: .6, g: 520, drop: 1 }); }
  }
  if (cur.theme === 'bambu') {
    if (!d.flies) d.flies = Array.from({ length: 14 }, () => ({ x: Math.random() * W, y: 40 + Math.random() * (H - 70), ph: Math.random() * 6 }));
    for (const fl of d.flies) { fl.ph += dt; fl.x += Math.cos(fl.ph * .7 + fl.y) * 9 * dt; fl.y += Math.sin(fl.ph * .9) * 6 * dt; }
  }
  if (cur.theme === 'aldea' && !REDUCED) {
    while (rain.length < 80) rain.push({ x: cam.x - 10 + Math.random() * (VW + 60), y: cam.y + Math.random() * VH, v: 300 + Math.random() * 140 });
    for (const q of rain) {
      q.x -= q.v * .2 * dt; q.y += q.v * dt;
      const hit = isSolid(Math.floor(q.x / TILE), Math.floor(q.y / TILE));
      if (hit || q.y > cam.y + VH + 10) {
        if (hit && Math.random() < .5) particles.push({ x: q.x, y: Math.floor(q.y / TILE) * TILE, vx: (Math.random() - .5) * 30, vy: -25 - Math.random() * 30, life: .22, max: .22, c: 'rgba(190,200,235,.7)', s: .45, g: 400 });
        q.x = cam.x - 10 + Math.random() * (VW + 60); q.y = cam.y - 8 - Math.random() * 30;
      }
    }
  }
}
