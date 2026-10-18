/* ---------- Jugador ---------- */
function updatePlayer(dt) {
  const ab = save.abilities;
  p.inv = Math.max(0, p.inv - dt); p.justPogo = Math.max(0, (p.justPogo || 0) - dt); p.atkCD -= dt; p.atkT -= dt; p.dashCD -= dt; p.coyote -= dt; p.jumpBuf -= dt;
  if (pressed.jump) p.jumpBuf = 0.12;
  const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);

  if (p.dashT > 0) {
    p.dashT -= dt; p.vx = p.face * DASH_V; p.vy = 0;
    particles.push({ x: p.x + 5 - p.face * 6, y: p.y + 2 + Math.random() * 11, vx: -p.face * 30, vy: 0, life: 0.25, max: 0.25, c: Math.random() < 0.6 ? C.washi : C.shu, s: 1.2, g: 0, a: 1 });
    if ((p.ghostT -= dt) <= 0) { p.ghostT = 0.03; ghosts.push({ x: p.x, y: p.y, face: p.face, life: 0.28 }); }
    if (p.dashT <= 0) p.vx = p.face * RUN;
  } else {
    if (p.knockT > 0) p.knockT -= dt;
    else { p.vx = approach(p.vx, dir * RUN, (p.onGround ? 1600 : 1000) * dt); if (dir && dir !== p.face) { p.face = dir; p.turnT = 0.1; } }

    if (p.jumpBuf > 0) {
      if (p.onGround || p.coyote > 0) {
        p.vy = -JUMP_V; p.jumpBuf = 0; p.coyote = 0; p.jumpHeld = true; sfx('jump'); p.squash = -0.9;
        dust(p.x + 5, p.y + p.h, 5);
      } else if (ab.double && p.airJumps > 0) {
        p.airJumps--; p.vy = -JUMP_V * 0.95; p.jumpBuf = 0; p.jumpHeld = true; sfx('dbl'); p.squash = -1; p.flip = 1;
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; particles.push({ x: p.x + 5, y: p.y + p.h, vx: Math.cos(a) * 80, vy: Math.sin(a) * 22, life: 0.36, max: 0.36, c: i % 3 ? C.washi : C.sakura, s: 1.2, g: 0, a: 1 }); }
      }
    }
    if (!keys.jump && p.jumpHeld && p.vy < 0) { p.vy *= 0.45; p.jumpHeld = false; }
    if (p.vy >= 0) p.jumpHeld = false;
    p.vy = Math.min(p.vy + GRAV * dt, MAX_FALL);

    if (pressed.dash && ab.dash && p.canDash && p.dashCD <= 0) {
      if (dir) p.face = dir;
      p.dashT = DASH_T; p.canDash = false; p.dashCD = 0.4; p.vy = 0; p.atkT = 0; p.dashHit = new Set(); sfx('dash');
    }
    if (pressed.attack && p.atkCD <= 0 && p.dashT <= 0) {
      p.atkT = 0.16; p.atkCD = 0.3; p.hitSet = new Set(); sfx('slash'); p.pogoDone = false; p.atkLight = 0.14;
      p.atkDir = keys.up ? 'up' : (keys.down && !p.onGround ? 'down' : 'side');
    }
  }

  if (moveX(p, p.vx * dt, p.dashT > 0) && p.dashT > 0) p.dashT = 0;
  const preVy = p.vy;
  moveY(p, p.vy * dt);
  if (p.onGround) { p.coyote = 0.1; p.airJumps = 1; p.canDash = true; }
  if (p.onGround && !p.wasGround && preVy > 160) { p.squash = Math.min(1, preVy / 380); dust(p.x + 5, p.y + p.h, 7); }
  p.wasGround = p.onGround;
  if (p.onGround && Math.abs(p.vx) > 90 && (p.dustT -= dt) <= 0) { p.dustT = 0.16; dust(p.x + 5 - p.face * 3, p.y + p.h, 1); }
  p.squash *= Math.pow(0.0008, dt); p.flip = Math.max(0, p.flip - dt * 3.2); p.turnT = Math.max(0, p.turnT - dt); p.atkLight = Math.max(0, p.atkLight - dt);
  p.anim += Math.abs(p.vx) * dt;
}

function updateCloth() {
  let ax = p.x + 5 - p.face * 3, ay = p.y + 9;
  for (let i = 0; i < cloth.length; i++) {
    const c = cloth[i];
    const tx = ax - p.face * (0.5 + Math.abs(p.vx) / RUN * 0.8) - p.vx * 0.002, ty = ay + 1.3 - p.vy * 0.003 + Math.sin(clock * 11 + i * 1.2) * 0.3 * (Math.abs(p.vx) / RUN);
    c.x += (tx - c.x) * 0.5; c.y += (ty - c.y) * 0.5; ax = c.x; ay = c.y;
  }
}
function updateScarf() {
  updateCloth();
  let ax = p.x + 5 - p.face * 2, ay = p.y + 5;
  for (let i = 0; i < scarf.length; i++) {
    const s = scarf[i];
    const tx = ax - p.face * 2.4 - p.vx * 0.006, ty = ay + 0.5 + Math.sin(clock * 9 + i * 0.9) * 0.9 - p.vy * 0.003;
    s.x += (tx - s.x) * 0.55; s.y += (ty - s.y) * 0.55;
    ax = s.x; ay = s.y;
  }
}

const attackBox = () => p.atkDir === 'up' ? { x: p.x - 7, y: p.y - 21, w: p.w + 14, h: 23 }
  : p.atkDir === 'down' ? { x: p.x - 6, y: p.y + p.h - 3, w: p.w + 12, h: 21 }
  : { x: p.face > 0 ? p.x + p.w - 2 : p.x - 20, y: p.y - 4, w: 22, h: p.h + 7 };
function pogo() {
  p.pogoDone = true; p.justPogo = 0.1; p.vy = -JUMP_V * 0.82; p.jumpHeld = false; p.airJumps = 1; p.canDash = true; p.squash = -0.7; sfx('pogo');
}

function hurtPlayer(fromX) {
  inkSpray(p.x + 5, p.y + 7, 10, 0, 150, true);
  p.hp--; p.inv = 1.0; p.knockT = 0.18; p.dashT = 0; hitstop = 0.08;
  const d = Math.sign(p.x + p.w / 2 - fromX) || -p.face;
  p.vx = d * 170; p.vy = -220; shake = 0.2; sfx('hurt');
  burst(p.x + 5, p.y + 7, 8, [C.shu, C.washi], 120);
  if (p.hp <= 0) die();
}
function die() {
  save.deaths++; respawnT = 0.9; respawnKind = 'shrine'; shake = 0.35;
  burst(p.x + 5, p.y + 7, 26, [C.washi, C.shu, C.sakura], 180);
}

function checkTransition() {
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  if (cx <= W && cx >= 0 && cy <= H && cy >= 0) return;
  // la sala de destino es la que contiene el centro del ronin en coordenadas del mundo
  const next = roomAt(cur.x + cx, cur.y + cy);
  if (!next || next === cur) { p.x = Math.max(0, Math.min(W - p.w, p.x)); p.y = Math.max(0, Math.min(H - p.h, p.y)); return; }
  p.x += cur.x - next.x; p.y += cur.y - next.y;
  enterRoom(next.key); snapScarf(); snapCam(); fade = Math.max(fade, 0.55);
}
