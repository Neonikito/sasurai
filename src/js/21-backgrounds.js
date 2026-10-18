/* ---------- Capas de fondo (parallax) ---------- */
function makeLayer(f, draw) {
  const lw = VW + (W - VW) * f, lh = VH + (H - VH) * f;
  const c = mk(lw * S, lh * S), g = c.getContext('2d');
  g.scale(S, S); draw(g, lw, lh);
  return { c, f };
}
function drawFar(room, T, g, w, h) {
  const r = seeded(room.seed + 1);
  switch (room.theme) {
    case 'aldea':
      moon(g, w * .74, h * .2, 9);
      ridge(g, r, w, h, h * .58, 26, 50, wash(g, h * .58 - 26 * 1.6, h * .58 + 40, T.far, T.fog));
      haze(g, w, h * .35, h * .7, T.fog, .18);
      for (let i = 0; i < 4; i++) { // columnas de humo
        const x = r() * w;
        for (let k = 0; k < 10; k++) { g.fillStyle = `rgba(110,90,105,${.07 - k * .005})`; ellipse(g, x + Math.sin(k * .7) * 6 + k * 3, h * .7 - k * 9, 7 + k * 1.6, 5 + k); }
      }
      ridge(g, r, w, h, h * .74, 14, 34, wash(g, h * .74 - 14 * 1.6, h * .74 + 40, T.far2, T.fog));
      haze(g, w, h * .7, h, T.fog, .22);
      break;
    case 'bambu':
      haze(g, w, h * .1, h * .8, T.fog, .1);
      for (let i = 0; i < 46; i++) { const x = r() * w; bamboo(g, x, -10, h + 10, .8 + r() * 1.6, `rgba(150,210,190,${.05 + r() * .09})`, `rgba(190,240,220,${.06})`, r, false); }
      haze(g, w, h * .4, h, T.fog, .14);
      for (let i = 0; i < 26; i++) { const x = r() * w; bamboo(g, x, -10, h + 10, 1.6 + r() * 2, T.far, T.far2, r, true); }
      haze(g, w, h * .55, h, T.fog, .12);
      break;
    case 'castillo':
      moon(g, w * .22, h * .18, 12);
      ridge(g, r, w, h, h * .62, 30, 60, wash(g, h * .62 - 30 * 1.6, h * .62 + 40, T.far2, T.fog));
      haze(g, w, h * .4, h * .75, T.fog, .12);
      tenshu(g, w * .64, h * .74, 1.1, T.far, '255,190,110');
      ridge(g, r, w, h, h * .8, 8, 30, wash(g, h * .8 - 8 * 1.6, h * .8 + 40, T.far, T.fog));
      haze(g, w, h * .7, h, T.fog, .15);
      break;
    case 'cueva':
      for (let i = 0; i < 12; i++) { // estalactitas lejanas
        const x = r() * w, len = 20 + r() * 60, wd = 6 + r() * 14;
        g.fillStyle = T.far; g.beginPath(); g.moveTo(x - wd, -5); g.quadraticCurveTo(x - wd * .3, len * .5, x, len); g.quadraticCurveTo(x + wd * .3, len * .5, x + wd, -5); g.fill();
      }
      ridge(g, r, w, h, h * .7, 30, 40, wash(g, h * .7 - 30 * 1.6, h * .7 + 40, T.far, T.fog));
      for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h; softGlow(g, x, y, 3 + r() * 5, '111,200,170', .18 + r() * .2); }
      haze(g, w, h * .5, h, T.fog, .1);
      break;
    case 'templo':
      g.fillStyle = T.far; for (let i = 0; i < 5; i++) g.fillRect(-10, 6 + i * 4, w + 20, 1.6); // vigas del techo
      for (let i = 0; i < 7; i++) { const x = (i + .5) * w / 7; g.fillRect(x - 3, 0, 6, h); g.fillStyle = 'rgba(216,164,69,.12)'; g.fillRect(x - 3, h * .3, 6, 1.2); g.fillRect(x - 3, h * .62, 6, 1.2); g.fillStyle = T.far; }
      torii(g, w * .5, h * .9, 1.6, '#3a1310');
      for (let i = 0; i < 6; i++) hangingLantern(g, (i + .5) * w / 6, h * .32 + r() * 10, .9, true);
      haze(g, w, h * .45, h, T.fog, .14);
      break;
  }
}
function drawMid(room, T, g, w, h) {
  const r = seeded(room.seed + 2), col = T.mid;
  switch (room.theme) {
    case 'aldea': {
      let x = -20;
      while (x < w) { const hw = 26 + r() * 22, hh = 14 + r() * 10; house(g, x, h * .86, hw, hh, col, r, true);
        if (r() < .6) softGlow(g, x + hw * .5, h * .86 - hh * .35, 10, '255,110,60', .35);
        x += hw + 14 + r() * 30; }
      g.fillStyle = col; g.fillRect(-10, h * .86, w + 20, h * .2);
      // árbol muerto
      g.strokeStyle = col; g.lineCap = 'round';
      const tx = w * (.3 + r() * .4); g.lineWidth = 3; g.beginPath(); g.moveTo(tx, h * .87); g.quadraticCurveTo(tx - 4, h * .6, tx + 3, h * .45); g.stroke();
      g.lineWidth = 1.2; for (let i = 0; i < 6; i++) { const y = h * (.5 + r() * .25), d = r() < .5 ? -1 : 1; g.beginPath(); g.moveTo(tx, y); g.quadraticCurveTo(tx + d * 10, y - 6, tx + d * (16 + r() * 8), y - 10 - r() * 8); g.stroke(); }
      break; }
    case 'bambu':
      for (let i = 0; i < 18; i++) bamboo(g, r() * w, -10, h + 10, 3 + r() * 3.5, col, '#173033', r, true);
      break;
    case 'castillo': {
      const base = h * .82;
      g.fillStyle = col; g.fillRect(-10, base, w + 20, h);
      g.fillStyle = '#272a46'; g.fillRect(-10, base - 8, w + 20, 8);           // muro encalado (en sombra)
      g.fillStyle = col; g.fillRect(-10, base - 11, w + 20, 3);
      for (let x = -10; x < w + 10; x += 3) circle(g, x, base - 11, 1.5); // tejas
      for (let i = 0; i < 3; i++) { const x = r() * w; g.fillStyle = col; g.fillRect(x - 10, base - 28, 20, 18);
        g.beginPath(); g.moveTo(x - 16, base - 27); g.quadraticCurveTo(x - 10, base - 30, x - 8, base - 34); g.lineTo(x + 8, base - 34); g.quadraticCurveTo(x + 10, base - 30, x + 16, base - 27); g.fill();
        softGlow(g, x, base - 20, 8, '255,190,110', .3); }
      for (let i = 0; i < 4; i++) pine(g, r() * w, base - 4, .7 + r() * .4, col, r);
      break; }
    case 'cueva':
      for (let i = 0; i < 7; i++) { const x = r() * w, wd = 10 + r() * 16;
        g.fillStyle = col; g.beginPath(); g.moveTo(x - wd, h + 5); g.quadraticCurveTo(x - wd * .4, h * .5, x - wd * .2, -5); g.lineTo(x + wd * .2, -5); g.quadraticCurveTo(x + wd * .5, h * .5, x + wd, h + 5); g.fill(); }
      for (let i = 0; i < 18; i++) { const x = r() * w, y = h * (.3 + r() * .65); softGlow(g, x, y, 4, '120,220,190', .3); g.fillStyle = '#9fe8d0'; circle(g, x, y, .5); }
      break;
    case 'templo':
      for (let i = 0; i < 4; i++) { const x = (i + .3 + r() * .4) * w / 4;
        g.fillStyle = col; g.fillRect(x - 5, -5, 10, h + 10);
        g.fillStyle = 'rgba(216,164,69,.22)'; g.fillRect(x - 5, h * .25, 10, 1.4); g.fillRect(x - 5, h * .7, 10, 1.4); }
      // shimenawa
      g.strokeStyle = '#2a1a0e'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-10, h * .16); g.quadraticCurveTo(w * .5, h * .28, w + 10, h * .16); g.stroke();
      for (let i = 1; i < 10; i++) { const x = i * w / 10, y = h * .16 + Math.sin(i / 10 * Math.PI) * h * .1;
        g.fillStyle = 'rgba(239,230,210,.22)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y + 3); g.lineTo(x, y + 5); g.lineTo(x + 2, y + 8); g.lineTo(x + .8, y + 9); g.lineTo(x - 1, y + 5.5); g.lineTo(x + .6, y + 3.2); g.closePath(); g.fill(); }
      break;
  }
}
function drawFg(room, T, g, w, h) {
  const r = seeded(room.seed + 3), col = T.fg;
  g.globalAlpha = .94;
  const n = Math.ceil(w / 60);
  for (let i = 0; i < n; i++) {
    const x = (i + r()) * w / n;
    if (room.theme === 'cueva') {
      const len = 10 + r() * 22, wd = 5 + r() * 8;
      g.fillStyle = col; g.beginPath(); g.moveTo(x - wd, -2); g.quadraticCurveTo(x - wd * .2, len * .6, x, len); g.quadraticCurveTo(x + wd * .2, len * .6, x + wd, -2); g.fill();
      g.beginPath(); g.ellipse(x + 20, h + 4, 14 + r() * 10, 8 + r() * 6, 0, 0, TAU); g.fill();
    } else if (room.theme === 'templo') {
      g.strokeStyle = col; g.lineWidth = .5; g.beginPath(); g.moveTo(x, -2); g.lineTo(x, 8 + r() * 10); g.stroke();
      g.fillStyle = col; g.fillRect(x - 2.5, 8 + r() * 6, 5, 9);
      grassClump(g, x + 25, h + 2, 14 + r() * 8, col, r, 6);
    } else {
      grassClump(g, x, h + 2, 16 + r() * 14, col, r, 12);
      if (room.theme === 'bambu' && r() < .5) { // hojas colgando
        for (let k = 0; k < 5; k++) ellipse(g, x + k * 4, 3 + k * 2.5 + r() * 3, 7, 1.5, .5 + r() * .5);
      } else if (r() < .4) {
        g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.moveTo(x, -2); g.quadraticCurveTo(x + 5, 10, x + 2, 16 + r() * 12); g.stroke();
        for (let k = 0; k < 4; k++) ellipse(g, x + 2 + (r() - .5) * 6, 4 + k * 4, 2.2, .9, r() * 3);
      }
    }
  }
  if (room.theme === 'bambu') for (let i = 0; i < 2; i++) bamboo(g, (i + .3 + r() * .4) * w / 2, -10, h + 10, 5 + r() * 2, 'rgba(2,8,8,.9)', 'rgba(10,25,25,.9)', r, false);
  g.globalAlpha = 1;
}
