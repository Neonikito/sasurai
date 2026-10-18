/* ---------- Sala y entidades ---------- */
function enterRoom(key) {
  if (cur && cur.key !== key) cur.art = null;   // liberar memoria del arte de la sala anterior
  cur = rooms[key];
  setRoomDims(cur); computeScale();
  enemies = []; pickups = []; shrines = []; amb = []; splats = []; corpses = []; strokes = []; rain = [];
  if (!cur.deco) cur.deco = buildDeco(cur);
  for (const tf of cur.deco.tufts) { tf.cut = false; tf.b = 0; }
  for (const hg of cur.deco.hangs) { hg.ang = (Math.random() - .5) * .2; hg.angV = 0; }
  for (const e of cur.ents) {
    const id = key + ':' + e.x + ',' + e.y;
    if (e.t === 'e') enemies.push({ kind: 'ashi', x: e.x * TILE + 2, y: e.y * TILE + 2, w: 12, h: 14, vx: 0, vy: 0, dir: Math.random() < 0.5 ? -1 : 1, speed: 28, hp: 2, hurt: 0, kbT: 0, kb: 0, alive: true, onGround: false, anim: Math.random() * 3, st: 'walk', stT: 0, cd: 0 });
    else if (e.t === 'f') enemies.push({ kind: 'oni', x: e.x * TILE + 3, y: e.y * TILE + 3, baseY: e.y * TILE + 3, w: 10, h: 10, dir: Math.random() < 0.5 ? -1 : 1, speed: 34, hp: 1, hurt: 0, alive: true, anim: Math.random() * 6 });
    else if (e.t === 'S') shrines.push({ tx: e.x, ty: e.y, box: { x: e.x * TILE + 1, y: e.y * TILE - 2, w: 14, h: 18 } });
    else if ('DHR'.includes(e.t) && !save.got.includes(id)) pickups.push({ t: e.t, id, x: e.x * TILE + 2, y: e.y * TILE + 1, w: 12, h: 12, bob: Math.random() * 6 });
  }
  if (!save.visited.includes(key)) { save.visited.push(key); roomLabel = { text: cur.name, theme: cur.theme, t: 3.4, max: 3.4 }; }
  amb = []; ambSeeded = false;
  p.lastSafe = { x: p.x, y: p.y };
}

function spawnAtShrine() {
  const sh = save.shrine;
  if (!rooms[sh.room]) { save.shrine = null; return setupStart(); }
  enterRoom(sh.room);
  p.x = sh.tx * TILE + 3; p.y = (sh.ty + 1) * TILE - p.h;
  p.vx = p.vy = 0; p.hp = p.maxHp; p.inv = 0; p.dashT = 0; p.knockT = 0; p.atShrine = true;
  p.lastSafe = { x: p.x, y: p.y }; snapScarf(); snapCam();
}

function setupWorld(fresh) {
  save = fresh ? defaultSave() : (readSave() || defaultSave());
  buildRooms();
  if (!save.shrine) setupStart(); else spawnAtShrine();
  particles = []; banner = null; fade = 1;
  updatePadLocks();
}
function setupStart() {
  const a = Object.values(rooms).find(r => r.ents.some(e => e.t === 'p'));
  const sp = a.ents.find(e => e.t === 'p'), sh = a.ents.find(e => e.t === 'S') || sp;
  save.shrine = { room: a.key, tx: sh.x, ty: sh.y };
  enterRoom(a.key);
  p.x = sp.x * TILE + 3; p.y = (sp.y + 1) * TILE - p.h; p.face = 1;
  p.vx = p.vy = 0; p.hp = p.maxHp; p.lastSafe = { x: p.x, y: p.y }; snapScarf(); snapCam();
}
