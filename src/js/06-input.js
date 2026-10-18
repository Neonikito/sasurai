/* ---------- Entrada ---------- */
const keys = { left: false, right: false, up: false, down: false, jump: false, dash: false, attack: false };
const pressed = { jump: false, dash: false, attack: false };
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', KeyZ: 'jump', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
  KeyX: 'attack', KeyJ: 'attack', KeyC: 'dash', ShiftLeft: 'dash', ShiftRight: 'dash', KeyK: 'dash' };
function press(k) { if (!keys[k] && k in pressed) pressed[k] = true; keys[k] = true; }
addEventListener('keydown', e => {
  if ((e.code === 'KeyM' || e.code === 'Tab') && !e.repeat) { if (state === 'play' || state === 'map') { toggleMap(); e.preventDefault(); } return; }
  if (e.code === 'Escape' || e.code === 'KeyP') { if (state === 'map') toggleMap(); else if (state === 'play' || state === 'pause') togglePause(); e.preventDefault(); return; }
  const k = KEYMAP[e.code]; if (!k || state !== 'play') return;
  e.preventDefault(); ensureAudio(); press(k);
});
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys[k] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (state === 'play') togglePause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') togglePause(); });
const clearPressed = () => { for (const k in pressed) pressed[k] = false; };

const pad = document.getElementById('pad');
if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) document.documentElement.classList.add('touch');
addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !document.documentElement.classList.contains('touch')) { document.documentElement.classList.add('touch'); fit(); } });
pad.querySelectorAll('[data-k]').forEach(b => {
  const k = b.dataset.k;
  b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (_) {} ensureAudio(); press(k); b.classList.add('on'); });
  const up = () => { keys[k] = false; b.classList.remove('on'); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, up));
  b.addEventListener('contextmenu', e => e.preventDefault());
});
function updatePadLocks() { pad.querySelector('[data-k="dash"]').classList.toggle('locked', !save.abilities.dash); }
