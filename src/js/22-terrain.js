/* ---------- Terreno ---------- */
function buildTerrain(room) {
  const T = TH[room.theme], c = mk(W * S, H * S), g = c.getContext('2d');
  g.scale(S, S);
  const rnd = seeded(room.seed + 99);
  const at = (x, y) => (x < 0 || x >= COLS || y < 0 || y >= ROWS) ? '#' : room.grid[y][x];
  const sol = (x, y) => '#X'.includes(at(x, y));
  const open = (x, y) => !'#BX'.includes(at(x, y));
  const cells = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if ('#X'.includes(room.grid[y][x])) cells.push([x, y]);

  // 1. masa base
  g.fillStyle = T.rock;
  for (const [x, y] of cells) g.fillRect(x * TILE - .4, y * TILE - .4, TILE + .8, TILE + .8);

  // 2. textura interior según estilo
  for (const [x, y] of cells) {
    const X = x * TILE, Y = y * TILE;
    if (T.style === 'block') {          // ishigaki: piedras irregulares
      g.strokeStyle = T.edge; g.globalAlpha = .45; g.lineWidth = .45;
      const off = (y % 2) * 5;
      for (let r = 0; r < 2; r++) for (let k = -1; k < 2; k++) {
        const bx = X + k * 10 + off + rnd() * 1.5, by = Y + r * 8 + rnd(), bw = 9 + rnd() * 1.5, bh = 7.2;
        g.beginPath(); g.moveTo(bx + 1.5, by); g.lineTo(bx + bw - 1, by + rnd() * .8); g.lineTo(bx + bw, by + bh - 1); g.lineTo(bx + bw - 1.5, by + bh); g.lineTo(bx + 1, by + bh - rnd() * .8); g.lineTo(bx, by + 1.2); g.closePath();
        g.save(); g.beginPath(); g.rect(X, Y, TILE, TILE); g.clip();
        g.fillStyle = rnd() < .5 ? T.rockHi : T.rock; g.globalAlpha = .35; g.fill(); g.globalAlpha = .5; g.stroke(); g.restore();
      }
      g.globalAlpha = 1;
    } else if (T.style === 'wood') {    // tablas de madera
      g.fillStyle = 'rgba(0,0,0,.28)';
      for (let k = 0; k < 4; k++) g.fillRect(X, Y + k * 4 + 3.6, TILE, .4);
      g.fillStyle = 'rgba(255,190,140,.05)'; g.fillRect(X + rnd() * 10, Y + rnd() * 12, 4 + rnd() * 6, .5);
    } else {                            // roca/tierra: manchas y grietas
      g.fillStyle = T.rockHi; g.globalAlpha = .28;
      if (rnd() < .55) ellipse(g, X + rnd() * 16, Y + rnd() * 16, 2 + rnd() * 3, 1 + rnd() * 1.5, rnd() * 3);
      g.globalAlpha = .22; g.strokeStyle = '#000'; g.lineWidth = .35;
      if (rnd() < .3) { const cx = X + rnd() * 16, cy = Y + rnd() * 16; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (rnd() - .5) * 6, cy + 2 + rnd() * 3); g.lineTo(cx + (rnd() - .5) * 6, cy + 5 + rnd() * 3); g.stroke(); }
      g.globalAlpha = 1;
    }
  }

  // 3. esquinas exteriores redondeadas
  g.globalCompositeOperation = 'destination-out';
  const rr = T.style === 'block' ? 1.2 : 3.5;
  for (const [x, y] of cells) {
    const X = x * TILE, Y = y * TILE;
    for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const nx = sx > 0 ? x - 1 : x + 1, ny = sy > 0 ? y - 1 : y + 1;
      if (open(nx, y) && open(x, ny)) {
        const cx = sx > 0 ? X : X + TILE, cy = sy > 0 ? Y : Y + TILE;
        g.beginPath(); g.moveTo(cx - sx * .5, cy - sy * .5); g.lineTo(cx + sx * rr, cy - sy * .5); g.quadraticCurveTo(cx, cy, cx - sx * .5, cy + sy * rr); g.closePath(); g.fill();
      }
    }
  }
  g.globalCompositeOperation = 'source-over';

  // 4. sombra interior: oscurece lejos de las superficies
  for (const [x, y] of cells) {
    if (sol(x, y - 1) && sol(x, y + 1) && sol(x - 1, y) && sol(x + 1, y)) { g.fillStyle = 'rgba(0,0,0,.32)'; g.fillRect(x * TILE - .3, y * TILE - .3, TILE + .6, TILE + .6); }
  }

  // 4b. contorno a pincel (sumi-e)
  for (const [x, y] of cells) {
    const X = x * TILE, Y = y * TILE;
    if (open(x, y - 1)) brushEdge(g, X, Y, X + TILE, Y, 0, 1);
    if (open(x, y + 1)) brushEdge(g, X, Y + TILE, X + TILE, Y + TILE, 0, -1);
    if (open(x - 1, y)) brushEdge(g, X, Y, X, Y + TILE, 1, 0);
    if (open(x + 1, y)) brushEdge(g, X + TILE, Y, X + TILE, Y + TILE, -1, 0);
  }
  // 5. bordes
  for (const [x, y] of cells) {
    const X = x * TILE, Y = y * TILE;
    const oL = open(x - 1, y), oR = open(x + 1, y);
    if (open(x, y - 1)) topEdge(g, T, X, Y, rnd, oL, oR);
    if (open(x, y + 1)) bottomEdge(g, T, X, Y, rnd);
    if (oL) sideEdge(g, T, X, Y, -1, rnd);
    if (oR) sideEdge(g, T, X + TILE, Y, 1, rnd);
  }

  // 6. barricadas y estacas
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const ch = room.grid[y][x];
    if (ch === 'B') barricade(g, x * TILE, y * TILE, at(x, y - 1) !== 'B', at(x, y + 1) !== 'B', rnd);
    else if (ch === 'X') cracks(g, x * TILE, y * TILE, rnd);
    else if (ch === 'G') gate(g, x * TILE, y * TILE, at(x - 1, y) === 'G' || at(x + 1, y) === 'G');
    else if (ch === '^') stakes(g, x * TILE, y * TILE, rnd);
  }
  // 7. decorados fijos de cada zona
  if (!room.deco) room.deco = buildDeco(room);
  for (const q of room.deco.statics) drawStatic(g, q);
  return c;
}
function brushW(c) { return .75 + .45 * Math.sin(c * .31) + .25 * Math.sin(c * 1.37 + 1) + .15 * Math.sin(c * 3.1); }
function brushEdge(g, x0, y0, x1, y1, nx, ny) {
  const N = 6;
  g.fillStyle = 'rgba(3,2,8,.85)'; g.beginPath();
  for (let i = 0; i <= N; i++) { const k = i / N; g.lineTo(x0 + (x1 - x0) * k - nx * .2, y0 + (y1 - y0) * k - ny * .2); }
  for (let i = N; i >= 0; i--) { const k = i / N, x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k, w = Math.max(.15, brushW(x + y * 1.7)); g.lineTo(x + nx * w, y + ny * w); }
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(3,2,8,.4)'; g.lineWidth = .22; g.beginPath();
  for (let i = 0; i <= N; i++) { const k = i / N, x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k, o = 1.6 + Math.sin((x + y) * .7) * .5; if (Math.sin((x + y) * .45) > -.2) g.lineTo(x + nx * o, y + ny * o); else g.moveTo(x + nx * o, y + ny * o); }
  g.stroke();
}
function drawStatic(g, q) {
  const r = seeded(q.seed + 5), x = q.x, y = q.y;
  g.save(); g.lineCap = 'round';
  switch (q.kind) {
    case 'spears':
      for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (r() - .5) * .9, len = 9 + r() * 9, bx = x + (i - 1) * 3;
        const tx = bx + Math.cos(a) * len, ty = y + Math.sin(a) * len;
        g.strokeStyle = '#2e2116'; g.lineWidth = .7; g.beginPath(); g.moveTo(bx, y + 1); g.lineTo(tx, ty); g.stroke();
        if (r() < .6) { g.fillStyle = '#b9c0cc'; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + Math.cos(a) * 3 - .7, ty + Math.sin(a) * 3); g.lineTo(tx + .7, ty); g.fill(); }
        else { g.fillStyle = '#6b1d15'; g.fillRect(tx - .2, ty, 3, 4.5); } }
      break;
    case 'armor':
      g.fillStyle = '#3a1d16'; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x - 4.5, y - 3.5); g.lineTo(x + 4, y - 3.5); g.lineTo(x + 6, y); g.fill();
      g.fillStyle = '#6a3426'; for (let k = 0; k < 2; k++) g.fillRect(x - 5 + k * .5, y - 3 + k * 1.5, 9.5 - k, .6);
      g.fillStyle = '#1c1d2b'; g.beginPath(); g.arc(x + 1, y - 3.5, 3, Math.PI, 0); g.fill();
      g.strokeStyle = C.kin; g.lineWidth = .5; g.beginPath(); g.arc(x + 1, y - 7.5, 2.4, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      break;
    case 'barrel':
      g.fillStyle = '#2a1a12'; g.fillRect(x - 3.5, y - 8, 7, 8); g.fillStyle = '#1a0f0a'; ellipse(g, x, y - 8, 3.5, 1);
      g.fillStyle = '#4a3020'; g.fillRect(x - 3.6, y - 6.5, 7.2, .6); g.fillRect(x - 3.6, y - 2.5, 7.2, .6);
      g.fillStyle = 'rgba(255,110,60,.5)'; g.fillRect(x - 1, y - 8.6, 2, .5);
      break;
    case 'jizo':
      g.fillStyle = '#5d5c6e'; g.fillRect(x - 3, y - 1.5, 6, 1.5);
      g.beginPath(); g.moveTo(x - 2.6, y - 1.5); g.quadraticCurveTo(x - 3, y - 7, x, y - 7.5); g.quadraticCurveTo(x + 3, y - 7, x + 2.6, y - 1.5); g.fill();
      g.fillStyle = '#6d6c80'; circle(g, x, y - 9, 2.2);
      g.fillStyle = '#b8352a'; g.beginPath(); g.moveTo(x - 2.6, y - 7); g.lineTo(x + 2.6, y - 7); g.lineTo(x, y - 4); g.fill();
      g.fillStyle = 'rgba(20,20,30,.6)'; g.fillRect(x - 1.2, y - 9.2, .9, .3); g.fillRect(x + .3, y - 9.2, .9, .3);
      break;
    case 'stump':
      for (let i = 0; i < 3; i++) { const bx = x + (i - 1) * 2.6, h = 3 + r() * 5;
        g.fillStyle = '#3f6a32'; g.beginPath(); g.moveTo(bx - 1, y); g.lineTo(bx - 1, y - h); g.lineTo(bx + 1, y - h - 1.2); g.lineTo(bx + 1, y); g.fill();
        g.fillStyle = '#c9d8a0'; g.beginPath(); g.moveTo(bx - 1, y - h); g.lineTo(bx + 1, y - h - 1.2); g.lineTo(bx + .6, y - h - .4); g.fill(); }
      break;
    case 'sign':
      g.fillStyle = '#2a1d14'; g.fillRect(x - .6, y - 12, 1.2, 12);
      g.fillStyle = '#6a5038'; g.fillRect(x - 5, y - 13, 10, 7);
      g.fillStyle = '#2a1d14'; g.fillRect(x - 5.6, y - 13.8, 11.2, 1);
      g.fillStyle = '#120c08'; g.font = `700 4.2px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('関所', x, y - 9.4);
      break;
    case 'crystal':
      for (let i = 0; i < 3; i++) { const bx = x + (i - 1) * 2.2, h = 4 + r() * 5, a = (i - 1) * .3;
        g.save(); g.translate(bx, y); g.rotate(a);
        g.fillStyle = '#3f9e8a'; g.beginPath(); g.moveTo(-1.2, 0); g.lineTo(-.9, -h); g.lineTo(0, -h - 1.6); g.lineTo(.9, -h); g.lineTo(1.2, 0); g.fill();
        g.fillStyle = '#c4fff0'; g.beginPath(); g.moveTo(-.3, -.5); g.lineTo(-.2, -h); g.lineTo(0, -h - 1.4); g.lineTo(.2, -h + .5); g.fill(); g.restore(); }
      break;
    case 'mush':
      for (let i = 0; i < 3; i++) { const bx = x + (i - 1) * 2.4, h = 1.5 + r() * 2.5;
        g.fillStyle = '#d6e4ef'; g.fillRect(bx - .3, y - h, .6, h); g.fillStyle = '#6fb8ff'; g.beginPath(); g.arc(bx, y - h, 1.4, Math.PI, 0); g.fill(); }
      break;
    case 'candles':
      for (let i = 0; i < 3; i++) { const bx = x + (i - 1) * 2.2, h = 2.5 + r() * 2.5;
        g.fillStyle = '#efe6d2'; g.fillRect(bx - .6, y - h, 1.2, h); g.fillStyle = '#ffcf70'; ellipse(g, bx, y - h - 1, .5, 1.1); }
      break;
    case 'offering':
      g.fillStyle = '#4a2a1a'; g.fillRect(x - 5, y - 5, 10, 5); g.fillStyle = '#1a0e08';
      for (let k = 0; k < 5; k++) g.fillRect(x - 4.4 + k * 2, y - 5, .6, 1.8);
      g.fillStyle = '#c8a050'; g.fillRect(x - 5.5, y - 5.6, 11, .7);
      break;
  }
  g.restore();
}
function topEdge(g, T, X, Y, rnd, oL, oR) {
  const x0 = X + (oL ? 2 : 0), x1 = X + TILE - (oR ? 2 : 0);
  if (T.style === 'block') {                       // tejado de tejas kawara
    g.fillStyle = '#d9cfb6'; g.fillRect(X, Y + 1.2, TILE, 1.8);
    g.fillStyle = T.roof; g.fillRect(X - (oL ? 1.5 : 0), Y - 1.6, TILE + (oL ? 1.5 : 0) + (oR ? 1.5 : 0), 2.8);
    for (let k = 0; k < TILE; k += 2.67) { g.fillStyle = T.roof; circle(g, X + k + 1.3, Y - 1.6, 1.35); g.fillStyle = 'rgba(140,150,210,.35)'; g.fillRect(X + k + .6, Y - 2.7, 1.2, .35); }
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(X, Y + 3, TILE, .8);
    return;
  }
  if (T.style === 'wood') {                         // borde laqueado
    g.fillStyle = T.top; g.fillRect(X, Y, TILE, 2.2);
    g.fillStyle = T.topHi; g.fillRect(X, Y, TILE, .5);
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(X, Y + 2.2, TILE, .7);
    if (rnd() < .25) { g.fillStyle = '#d8a445'; g.fillRect(X + 7, Y + .6, 2, 1); }
    return;
  }
  const gr = g.createLinearGradient(0, Y, 0, Y + 7);
  gr.addColorStop(0, T.top); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(x0 - .3, Y, x1 - x0 + .6, 7);
  g.fillStyle = T.topHi; g.globalAlpha = .9; g.fillRect(x0, Y, x1 - x0, .6); g.globalAlpha = 1;
  const n = T.style === 'cave' ? 3 : 6;
  for (let i = 0; i < n; i++) {                     // briznas de pasto / musgo
    const bx = x0 + rnd() * (x1 - x0), h = (T.style === 'cave' ? 1 : 1.6) + rnd() * (T.style === 'cave' ? 2.2 : 4.2), lean = (rnd() - .5) * 2.4, w = .45 + rnd() * .4;
    g.fillStyle = rnd() < .45 ? T.topHi : T.top;
    g.beginPath(); g.moveTo(bx - w, Y + .5); g.quadraticCurveTo(bx + lean * .4, Y - h * .6, bx + lean, Y - h); g.quadraticCurveTo(bx + lean * .3, Y - h * .45, bx + w, Y + .5); g.fill();
  }
  if (T.style === 'cave' && rnd() < .3) { g.fillStyle = '#8fe0c8'; circle(g, x0 + rnd() * (x1 - x0), Y - .8, .55); }
  if (rnd() < .12) { g.fillStyle = 'rgba(0,0,0,.3)'; ellipse(g, x0 + rnd() * 12, Y + .8, 2, .6); }
}
function bottomEdge(g, T, X, Y, rnd) {
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(X, Y + TILE - 1, TILE, 1);
  if (T.style === 'block' || T.style === 'wood') { g.fillStyle = T.edge; g.globalAlpha = .6; g.fillRect(X, Y + TILE - .5, TILE, .5); g.globalAlpha = 1; return; }
  const n = 1 + Math.floor(rnd() * 2);
  for (let i = 0; i < n; i++) {
    const rx = X + 2 + rnd() * 12;
    if (T.style === 'cave') { const len = 2 + rnd() * 5, w = 1 + rnd() * 1.6;
      g.fillStyle = T.rock; g.beginPath(); g.moveTo(rx - w, Y + TILE - .5); g.quadraticCurveTo(rx - w * .2, Y + TILE + len * .6, rx, Y + TILE + len); g.quadraticCurveTo(rx + w * .2, Y + TILE + len * .6, rx + w, Y + TILE - .5); g.fill(); }
    else { const len = 3 + rnd() * 7; g.strokeStyle = T.edge; g.globalAlpha = .7; g.lineWidth = .45;
      g.beginPath(); g.moveTo(rx, Y + TILE); g.bezierCurveTo(rx + 1.5, Y + TILE + len * .3, rx - 1.5, Y + TILE + len * .7, rx + (rnd() - .5) * 2, Y + TILE + len); g.stroke(); g.globalAlpha = 1; }
  }
}
function sideEdge(g, T, X, Y, d, rnd) {
  g.fillStyle = T.edge; g.globalAlpha = .55; g.fillRect(d < 0 ? X : X - .6, Y, .6, TILE); g.globalAlpha = 1;
  if (T.style === 'block' || T.style === 'wood') return;
  g.fillStyle = T.rock;
  for (let i = 0; i < 2; i++) { if (rnd() < .5) { const r = .7 + rnd() * 1.1; circle(g, X + d * r * .25, Y + 2 + rnd() * 12, r); } }
}
// Pared agrietada: casi igual a la roca, con grietas finas como pista
function cracks(g, X, Y, rnd) {
  g.save(); g.beginPath(); g.rect(X, Y, TILE, TILE); g.clip();
  g.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    let x = X + 3 + rnd() * 10, y = Y;
    g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = .55; g.beginPath(); g.moveTo(x, y);
    for (let i = 0; i < 5; i++) { x += (rnd() - .5) * 6; y += 3 + rnd() * 1.5; g.lineTo(x, y); }
    g.stroke();
    g.strokeStyle = 'rgba(255,240,220,.1)'; g.lineWidth = .3; g.stroke();
  }
  g.restore();
}
// Portón de madera con herrajes (horizontal si está en un piso)
function gate(g, X, Y, horiz) {
  g.fillStyle = '#2a1a10'; g.fillRect(X, Y, TILE, TILE);
  g.fillStyle = '#5a3c22';
  for (let k = 0; k < 4; k++) { if (horiz) g.fillRect(X, Y + 1 + k * 3.8, TILE, 3); else g.fillRect(X + 1 + k * 3.8, Y, 3, TILE); }
  g.fillStyle = '#1a1a22'; if (horiz) { g.fillRect(X + 3, Y, 1.6, TILE); g.fillRect(X + 11.4, Y, 1.6, TILE); } else { g.fillRect(X, Y + 3, TILE, 1.6); g.fillRect(X, Y + 11.4, TILE, 1.6); }
  g.fillStyle = '#8a8070'; for (const [a, b] of [[3.8, 3.8], [12.2, 3.8], [3.8, 12.2], [12.2, 12.2]]) circle(g, X + a, Y + b, .55);
  g.strokeStyle = 'rgba(3,2,8,.8)'; g.lineWidth = .5; g.strokeRect(X + .25, Y + .25, TILE - .5, TILE - .5);
}
function barricade(g, X, Y, isTop, isBottom, rnd) {
  g.fillStyle = '#0d0907'; g.fillRect(X + 1, Y, 14, TILE);
  for (let k = 0; k < 3; k++) {
    const px = X + 1.2 + k * 4.6, w = 4.2, top = isTop ? Y + 1 + k % 2 * 1.4 : Y;
    const gr = g.createLinearGradient(px, 0, px + w, 0);
    gr.addColorStop(0, '#3e5a2c'); gr.addColorStop(.35, '#8cb062'); gr.addColorStop(1, '#2c4220');
    g.fillStyle = gr;
    g.beginPath();
    if (isTop) { g.moveTo(px, top + 3); g.lineTo(px + w * .5, top - 1); g.lineTo(px + w, top + 3); } else { g.moveTo(px, top); g.lineTo(px + w, top); }
    g.lineTo(px + w, Y + TILE); g.lineTo(px, Y + TILE); g.closePath(); g.fill();
    g.fillStyle = 'rgba(20,30,10,.7)'; g.fillRect(px, Y + 7 + k, w, .6);
  }
  g.fillStyle = '#b89a62';
  for (const ry of [Y + 4, Y + 12]) { g.fillRect(X + .6, ry, 14.8, 1.3); g.fillStyle = 'rgba(80,60,30,.8)'; for (let k = 0; k < 6; k++) g.fillRect(X + 1 + k * 2.5, ry, .4, 1.3); g.fillStyle = '#b89a62'; }
}
function stakes(g, X, Y, rnd) {
  for (let k = 0; k < 4; k++) {
    const bx = X + 2 + k * 3.8, tipY = Y + 4 + rnd() * 4, lean = (rnd() - .5) * 3, w = 1.6;
    const gr = g.createLinearGradient(0, tipY, 0, Y + TILE);
    gr.addColorStop(0, '#e8e2c4'); gr.addColorStop(.18, '#9cbd6a'); gr.addColorStop(1, '#2c4220');
    g.fillStyle = gr; g.beginPath(); g.moveTo(bx - w, Y + TILE); g.lineTo(bx + lean, tipY); g.lineTo(bx + w, Y + TILE); g.closePath(); g.fill();
  }
  g.fillStyle = '#1a120c'; g.fillRect(X, Y + TILE - 2, TILE, 2);
}

function ensureArt(room) {
  if (!room.art || room.art.gen !== artGen) room.art = { gen: artGen };
  const A = room.art, T = TH[room.theme];
  if (!A.far) {
    A.far = makeLayer(0.25, (g, w, h) => drawFar(room, T, g, w, h));
    A.mid = makeLayer(0.55, (g, w, h) => drawMid(room, T, g, w, h));
    A.fg = makeLayer(1.3, (g, w, h) => drawFg(room, T, g, w, h));
    const sky = ctx.createLinearGradient(0, 0, 0, cv.height);
    sky.addColorStop(0, T.sky[0]); sky.addColorStop(.55, T.sky[1]); sky.addColorStop(1, T.sky[2]);
    A.sky = sky;
    const fog = ctx.createLinearGradient(0, cv.height * .35, 0, cv.height);
    fog.addColorStop(0, rgba(T.fog, 0)); fog.addColorStop(1, rgba(T.fog, .16));
    A.fog = fog;
    const gd = ctx.createLinearGradient(0, 0, 0, cv.height), G = GRADE[room.theme];
    gd.addColorStop(0, G[0]); gd.addColorStop(.5, 'rgb(128,128,128)'); gd.addColorStop(1, G[1]);
    A.grade = gd;
  }
  if (!A.terrain) A.terrain = buildTerrain(room);
}
