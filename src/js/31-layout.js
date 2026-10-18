/* ---------- Tamaño ---------- */
const stage = document.getElementById('stage'), bar = document.querySelector('.bar'), hint = document.getElementById('keysHint');
function fit() {
  const rs = getComputedStyle(document.documentElement);
  const padFixed = getComputedStyle(pad).position === 'fixed';
  const used = bar.offsetHeight + (padFixed ? 0 : pad.offsetHeight) + (hint.offsetParent ? hint.offsetHeight : 0) + 36;
  const safe = parseFloat(rs.paddingTop) + parseFloat(rs.paddingBottom);
  let h = Math.max(200, Math.min(900, window.innerHeight - used - safe));
  let w = Math.min(1600, stage.parentElement.clientWidth);
  if (w / h > 2.1) w = Math.round(h * 2.1);
  if (w / h < 0.78) h = Math.round(w / 0.78);
  stage.style.width = w + 'px'; stage.style.height = h + 'px';
  resizeCanvas(w, h);
}
function resizeCanvas(w, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let pw = Math.round(w * dpr), ph = Math.round(h * dpr);
  const k = Math.min(1, 1100 / ph, 2000 / pw); pw = Math.round(pw * k); ph = Math.round(ph * k);
  if (pw === cv.width && ph === cv.height && vignette) return;
  cv.width = pw; cv.height = ph;
  vignette = null; computeScale(); if (!washiPat) buildWashi();
  if (cur) { snapCam(); amb = []; ambSeeded = false; }
}
// Zoom: alto visible fijo (VIEW_H), pero nunca más grande que la sala actual
function computeScale() {
  const pw = cv.width, ph = cv.height;
  let s = ph / VIEW_H; if (pw / s < MIN_VW) s = pw / MIN_VW; s = Math.max(s, pw / W, ph / H);
  if (Math.abs(s - S) > 1e-6 || !vignette) { S = s; VW = pw / S; VH = ph / S; artGen++; buildVignette(); }
}
addEventListener('resize', fit);
addEventListener('orientationchange', () => setTimeout(fit, 150));
