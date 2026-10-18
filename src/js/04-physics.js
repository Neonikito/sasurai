/* ---------- Física ---------- */
function moveX(o, dx, canBreak) {
  if (!dx) return false;
  o.x += dx;
  const y0 = Math.floor(o.y / TILE), y1 = Math.floor((o.y + o.h - 0.01) / TILE);
  const tx = dx > 0 ? Math.floor((o.x + o.w - 0.01) / TILE) : Math.floor(o.x / TILE);
  let hit = false;
  for (let ty = y0; ty <= y1; ty++) {
    if (isSolid(tx, ty)) {
      if (canBreak && tileAt(tx, ty) === 'B') { breakWall(tx, ty); continue; }
      hit = true;
    }
  }
  if (hit) o.x = dx > 0 ? tx * TILE - o.w : (tx + 1) * TILE;
  return hit;
}
function moveY(o, dy) {
  o.onGround = false;
  if (!dy) return false;
  o.y += dy;
  const x0 = Math.floor(o.x / TILE), x1 = Math.floor((o.x + o.w - 0.01) / TILE);
  const ty = dy > 0 ? Math.floor((o.y + o.h - 0.01) / TILE) : Math.floor(o.y / TILE);
  let hit = false;
  for (let tx = x0; tx <= x1; tx++) if (isSolid(tx, ty)) hit = true;
  if (hit && dy < 0 && o === p && x0 !== x1) {
    const hitL = isSolid(x0, ty), hitR = isSolid(x1, ty);
    if (hitL && !hitR && (x0 + 1) * TILE - o.x <= 6) { o.x = (x0 + 1) * TILE; hit = false; }
    else if (hitR && !hitL && o.x + o.w - x1 * TILE <= 6) { o.x = x1 * TILE - o.w; hit = false; }
  }
  if (hit) { if (dy > 0) { o.y = ty * TILE - o.h; o.onGround = true; } else o.y = (ty + 1) * TILE; o.vy = 0; }
  return hit;
}

function breakWall(tx, ty) {
  const stack = [[tx, ty]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (tileAt(x, y) !== 'B') continue;
    cur.grid[y][x] = '.';
    save.broken.push(cur.key + ':' + x + ',' + y);
    burst(x * TILE + 8, y * TILE + 8, 10, [C.take, C.takeHi, '#b89a62'], 170);
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  if (cur.art) cur.art.terrain = null;
  shake = 0.25; hitstop = 0.06; sfx('break'); writeSave();
}
