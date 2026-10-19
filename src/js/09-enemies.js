/* ---------- Enemigos ---------- */
function inkSpray(x, y, n, dir, spd, red) {
  for (let i = 0; i < n; i++) {
    const a = (dir ? (dir > 0 ? 0 : Math.PI) : -Math.PI / 2) + (Math.random() - .5) * 2.2, v = spd * (.35 + Math.random() * .75);
    particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 50, life: .9, max: .9, c: red && Math.random() < .35 ? '#a8261c' : '#07060c', s: .5 + Math.random() * .9, g: 620, ink: 1 });
  }
}
function addSplat(x, y, c, r) {
  if (splats.length > 70) splats.shift();
  const n = 7 + Math.floor(Math.random() * 4), pts = [];
  for (let i = 0; i < n; i++) pts.push(r * (.6 + Math.random() * .6));
  splats.push({ x, y, c, r, pts, rot: Math.random() * 6, t: 14 });
}
// Paredes agrietadas: dos tajos rompen todo el bloque conectado
function hitWalls(hb) {
  if (p.hitSet.has('wall')) return;
  for (let ty = Math.floor(hb.y / TILE); ty <= Math.floor((hb.y + hb.h) / TILE); ty++)
    for (let tx = Math.floor(hb.x / TILE); tx <= Math.floor((hb.x + hb.w) / TILE); tx++) {
      if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS || cur.grid[ty][tx] !== 'X') continue;
      p.hitSet.add('wall'); hitstop = 0.05; shake = Math.max(shake, 0.12); sfx('hit');
      for (let i = 0; i < 8; i++) particles.push({ x: tx * TILE + 8, y: ty * TILE + 8, vx: (Math.random() - .5) * 140, vy: -40 - Math.random() * 90, life: .6, max: .6, c: TH[cur.theme].rockHi, s: 1.1, g: 600 });
      cur.cracks = cur.cracks || {};
      const k = tx + ',' + ty; cur.cracks[k] = (cur.cracks[k] || 0) + 1;
      if (cur.cracks[k] >= 2) breakWallGroup(tx, ty);
      return;
    }
}
function breakWallGroup(sx, sy) {
  const todo = [[sx, sy]];
  while (todo.length) {
    const [x, y] = todo.pop();
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS || cur.grid[y][x] !== 'X') continue;
    cur.grid[y][x] = '.'; save.broken.push(cur.key + ':' + x + ',' + y);
    for (let i = 0; i < 5; i++) particles.push({ x: x * TILE + Math.random() * 16, y: y * TILE + Math.random() * 16, vx: (Math.random() - .5) * 120, vy: -30 - Math.random() * 80, life: .8, max: .8, c: i % 2 ? TH[cur.theme].rock : TH[cur.theme].edge, s: 1.4, g: 650 });
    todo.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  if (cur.art) cur.art.terrain = null;
  cur.deco = buildDeco(cur);
  cur.oldPocket = cur.pocket; cur.reveal = 1; computePocket(cur);
  shake = 0.3; sfx('secret'); writeSave();
}
// Palanca: abre los portones que estén cerca en el mundo (también en salas vecinas)
function pullLever(lv) {
  lv.on = true; lv.swing = 1; save.levers.push(lv.id); sfx('lever'); shake = 0.25; hitstop = 0.06;
  const lx = cur.x + lv.x + 5, ly = cur.y + lv.y + 8;
  let opened = 0;
  for (const k in rooms) {
    const r = rooms[k];
    for (let y = 0; y < r.nr; y++) for (let x = 0; x < r.nc; x++) {
      if (r.grid[y][x] !== 'G' || Math.hypot(r.x + x * TILE + 8 - lx, r.y + y * TILE + 8 - ly) > 200) continue;
      r.grid[y][x] = '.'; save.broken.push(k + ':' + x + ',' + y); opened++;
      if (r === cur) for (let i = 0; i < 4; i++) particles.push({ x: x * TILE + Math.random() * 16, y: y * TILE + 8, vx: (Math.random() - .5) * 80, vy: -40 - Math.random() * 60, life: .7, max: .7, c: '#6a4a2c', s: 1.2, g: 600 });
    }
    if (r.art) r.art.terrain = null;
  }
  if (opened) showBanner('開', 'Se abrió un portón', 'Quedó libre un atajo.', 2.6);
  writeSave();
}
function damageEnemy(e, dir, aim) {
  e.hp--; e.hurt = 0.2; hitstop = 0.06; sfx('hit');
  if (e.kind === 'ashi') { e.kbT = 0.15; e.kb = dir * 150; e.vy = aim === 'up' ? -230 : aim === 'down' ? 60 : -140; e.dir = -dir; e.st = 'walk'; e.cd = 0.8; }
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  burst(cx, cy, 5, [C.washi, e.kind === 'oni' ? C.oni : C.ashiHi], 120);
  inkSpray(cx, cy, 9, aim === 'side' || !aim ? dir : 0, 170, e.kind === 'ashi');
  strokes.push({ x: cx, y: cy, ang: aim === 'up' ? -1.4 : aim === 'down' ? 1.4 : (dir > 0 ? -.35 : Math.PI + .35), len: 26, t: .22, max: .22, w: 1.6 });
  if (e.hp <= 0) {
    e.alive = false; sfx('kill'); flashT = 0.1; shake = Math.max(shake, 0.16);
    corpses.push({ e: Object.assign({}, e), t: .6, max: .6 });
    inkSpray(cx, cy, 26, 0, 230, e.kind === 'ashi');
    strokes.push({ x: cx, y: cy, ang: (dir > 0 ? -.55 : Math.PI + .55), len: 48, t: .5, max: .5, w: 3.2, kill: 1 });
    burst(cx, cy, 10, e.kind === 'oni' ? [C.oni, C.oniHi, C.washi] : [C.shu, C.washi], 170);
  }
}
const spearBox = e => ({ x: e.dir > 0 ? e.x + e.w : e.x - 9, y: e.y + 6, w: 9, h: 3 });

function updateEnemies(dt) {
  for (const e of enemies) {
    if (!e.alive) continue;
    e.hurt -= dt; e.anim += dt;
    if (e.kind === 'oni') {
      const nx = e.x + e.dir * e.speed * dt;
      const fx = e.dir > 0 ? nx + e.w : nx;
      if (fx < 2 || fx > W - 2 || isSolid(Math.floor(fx / TILE), Math.floor((e.y + e.h / 2) / TILE))) e.dir *= -1; else e.x = nx;
      const ny = e.baseY + Math.sin(e.anim * 2.4) * 12;
      if (!isSolid(Math.floor((e.x + e.w / 2) / TILE), Math.floor((ny + (ny > e.y ? e.h : 0)) / TILE))) e.y = ny;
      if (Math.random() < 0.3) particles.push({ x: e.x + 3 + Math.random() * 4, y: e.y + e.h - 2, vx: 0, vy: -20, life: 0.45, max: 0.45, c: C.oni, s: 0.9, g: -20, a: 1 });
      continue;
    }
    e.cd -= dt;
    const dx = (p.x + p.w / 2) - (e.x + e.w / 2), dy = (p.y + p.h / 2) - (e.y + e.h / 2);
    if (e.kbT > 0) { e.kbT -= dt; e.vx = e.kb; }
    else if (e.st === 'walk') {
      e.vx = e.dir * e.speed;
      if (e.cd <= 0 && respawnT <= 0 && Math.sign(dx) === e.dir && Math.abs(dx) < 76 && Math.abs(dy) < 18) { e.st = 'wind'; e.stT = 0.42; }
    } else if (e.st === 'wind') {
      e.vx = 0; e.stT -= dt; if (e.stT <= 0) { e.st = 'lunge'; e.stT = 0.32; sfx('lunge'); }
    } else if (e.st === 'lunge') {
      e.vx = e.dir * 150; e.stT -= dt; if (e.stT <= 0) { e.st = 'walk'; e.cd = 1.1; }
    }
    e.vy = Math.min(e.vy + GRAV * dt, MAX_FALL);
    const hitWall = moveX(e, e.vx * dt, false);
    moveY(e, e.vy * dt);
    e.x = Math.max(0, Math.min(W - e.w, e.x));
    if (e.kbT <= 0 && e.onGround && e.st !== 'wind') {
      const fx = e.dir > 0 ? e.x + e.w + 1 : e.x - 1;
      if (hitWall || fx < 0 || fx > W || !isSolid(Math.floor(fx / TILE), Math.floor((e.y + e.h + 2) / TILE))) {
        if (e.st === 'lunge') { e.st = 'walk'; e.cd = 1.1; }
        e.dir *= -1;
      }
    }
  }
}

function combat() {
  if (p.atkT > 0) {
    const hb = attackBox();
    for (const e of enemies) {
      if (!e.alive || p.hitSet.has(e) || !overlap(hb, e)) continue;
      p.hitSet.add(e); damageEnemy(e, p.face, p.atkDir);
      if (p.atkDir === 'down') { if (!p.pogoDone) pogo(); }
      else if (!p.onGround && p.atkDir === 'side') p.vy = Math.min(p.vy, -120);
    }
    if (p.atkDir === 'down' && !p.pogoDone) {   // rebote sobre estacas
      for (let ty = Math.floor(hb.y / TILE); ty <= Math.floor((hb.y + hb.h) / TILE) && !p.pogoDone; ty++)
        for (let tx = Math.floor(hb.x / TILE); tx <= Math.floor((hb.x + hb.w) / TILE); tx++)
          if (tileAt(tx, ty) === '^' && overlap(hb, { x: tx * TILE + 1, y: ty * TILE + 5, w: 14, h: 11 })) {
            pogo(); hitstop = 0.04;
            for (let i = 0; i < 8; i++) particles.push({ x: p.x + 5 + (Math.random() - .5) * 8, y: ty * TILE + 6, vx: (Math.random() - .5) * 120, vy: -60 - Math.random() * 80, life: .3, max: .3, c: i % 2 ? '#fff4d0' : C.kin, s: .8, g: 400, a: 1 });
            break;
          }
    }
    hitWalls(hb);
    for (const lv of levers) if (!lv.on && !p.hitSet.has(lv) && overlap(hb, lv)) { p.hitSet.add(lv); pullLever(lv); }
    const deco = cur.deco;   // pasto que se corta, faroles que se golpean
    for (const tf of deco.tufts) if (!tf.cut && overlap(hb, { x: tf.x - 3, y: tf.y - 6, w: 6, h: 6 })) {
      tf.cut = true;
      for (let i = 0; i < 5; i++) particles.push({ x: tf.x, y: tf.y - 3, vx: (Math.random() - .5) * 90, vy: -40 - Math.random() * 70, life: .6, max: .6, c: Math.random() < .5 ? TH[cur.theme].top : TH[cur.theme].topHi, s: .8, g: 350, leaf: 1 });
    }
    for (const hg of deco.hangs) if (overlap(hb, { x: hg.x - 3, y: hg.y + hg.len - 4, w: 6, h: 8 }) && !p.hitSet.has(hg)) { p.hitSet.add(hg); hg.angV += p.face * 3.2; }
  }
  if (p.dashT > 0) {
    for (const e of enemies) if (e.alive && !p.dashHit.has(e) && overlap(p, e)) { p.dashHit.add(e); damageEnemy(e, p.face); }
  }
  if (p.inv <= 0 && p.dashT <= 0) {
    for (const e of enemies) {
      if (!e.alive) continue;
      if (overlap(p, e) || (e.kind === 'ashi' && e.kbT <= 0 && overlap(p, spearBox(e)))) { hurtPlayer(e.x + e.w / 2); break; }
    }
  }
}

function hazards() {
  const x0 = Math.floor(p.x / TILE), x1 = Math.floor((p.x + p.w - 0.01) / TILE);
  const y0 = Math.floor(p.y / TILE), y1 = Math.floor((p.y + p.h - 0.01) / TILE);
  let touching = false;
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (tileAt(tx, ty) === '^' && overlap(p, { x: tx * TILE + 2, y: ty * TILE + 8, w: 12, h: 8 })) touching = true;
  }
  if (touching && p.justPogo > 0) touching = false;   // rebote justo a tiempo: no lastima
  if (touching) {
    p.hp--; shake = 0.25; hitstop = 0.08; sfx('hurt'); burst(p.x + 5, p.y + 10, 10, [C.shu, C.washi], 140);
    if (p.hp <= 0) die(); else { respawnT = 0.45; respawnKind = 'safe'; }
    return;
  }
  if (p.onGround && p.knockT <= 0) p.lastSafe = { x: p.x, y: p.y };
}

function interactions() {
  let atAny = false;
  for (const s of shrines) {
    if (!overlap(p, s.box)) continue;
    atAny = true;
    if (!p.atShrine) {
      save.shrine = { room: cur.key, tx: s.tx, ty: s.ty };
      p.hp = p.maxHp; writeSave(); sfx('save');
      burst(s.tx * TILE + 8, s.ty * TILE + 4, 14, [C.kin, C.washi], 90, -60);
      showBanner('灯', 'Linterna encendida', 'Progreso guardado. Vida restaurada.', 2.2);
    }
  }
  p.atShrine = atAny;
  for (const k of pickups) {
    if (k.taken || !overlap(p, k)) continue;
    k.taken = true; save.got.push(k.id);
    burst(k.x + 6, k.y + 6, 22, [C.washi, C.kin, C.shu], 150, 0);
    const touch = document.documentElement.classList.contains('touch');
    if (k.t === 'D') {
      save.abilities.double = true; sfx('pick');
      showBanner('鶴', 'Salto de grulla', touch ? 'Tocá Saltar otra vez en el aire.' : 'Pulsá saltar otra vez en el aire.', 4);
    } else if (k.t === 'H') {
      save.abilities.dash = true; sfx('pick'); updatePadLocks();
      showBanner('居', 'Impulso iai', (touch ? 'Tocá Impulso para desenvainar y lanzarte.' : 'Pulsá C o Shift para desenvainar y lanzarte.') + ' Corta enemigos y barricadas de bambú.', 4.8);
    } else if (k.t === 'M') {
      save.frags = (save.frags || 0) + 1; sfx('pick');
      const n = save.frags % 4;
      if (n === 0) { p.maxHp = maxHpFor(save); p.hp = p.maxHp; showBanner('面', 'Máscara completa', 'Tu vida máxima aumentó en una máscara.', 3.6); }
      else showBanner('面', 'Fragmento de máscara', `${n} de 4. Juntá cuatro para tener una máscara más.`, 3.2);
    } else if (k.t === 'R') { sfx('pick'); win(); }
    writeSave();
  }
  pickups = pickups.filter(k => !k.taken);
}

function showBanner(kanji, title, sub, t) { banner = { kanji, title, sub, t, max: t }; }
