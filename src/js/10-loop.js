/* ---------- Bucle ---------- */
function step(dt) {
  clock += dt;
  if (hitstop > 0) { hitstop -= dt; return; }
  save.time += dt;
  if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
  if (roomLabel) { roomLabel.t -= dt; if (roomLabel.t <= 0) roomLabel = null; }
  fade = Math.max(0, fade - dt * 3); shake = Math.max(0, shake - dt);
  updateParticles(dt); updateAmb(dt); updateWorld(dt);
  if (respawnT > 0) {
    respawnT -= dt;
    if (respawnT <= 0) {
      if (respawnKind === 'shrine') spawnAtShrine();
      else { p.x = p.lastSafe.x; p.y = p.lastSafe.y; p.vx = p.vy = 0; p.inv = 0.8; p.dashT = 0; p.knockT = 0; snapScarf(); snapCam(); }
      fade = 1;
    }
    clearPressed(); return;
  }
  updatePlayer(dt);
  checkTransition();
  updateScarf();
  updateCam(dt);
  updateEnemies(dt);
  combat();
  if (respawnT <= 0) hazards();
  if (respawnT <= 0 && state === 'play') interactions();
  clearPressed();
}

let last = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  perfAvg += (dt - perfAvg) * .05; perfT += dt;
  if (quality && perfT > 5 && perfAvg > 0.03) quality = 0;   // equipos lentos: sin bloom ni distorsión
  if (state === 'play') { acc += dt; while (acc >= STEP && state === 'play') { step(STEP); acc -= STEP; } }
  else { acc = 0; clock += dt; if (cur) { updateAmb(dt); updateWorld(dt); updateScarf(); updateCam(dt); } }
  render(now / 1000);
  requestAnimationFrame(frame);
}
