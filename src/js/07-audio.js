/* ---------- Sonido ---------- */
let actx = null;
function ensureAudio() {
  if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; } }
  if (actx.state === 'suspended') actx.resume();
}
const SFX = { jump: [520, 780, .08, 'square'], dbl: [660, 1180, .12, 'triangle'], dash: [1400, 220, .14, 'sawtooth'], hit: [260, 70, .12, 'square'],
  hurt: [180, 50, .3, 'sawtooth'], pogo: [300, 900, .1, 'triangle'], ui: [660, 880, .06, 'triangle'], pick: [523, 1568, .5, 'triangle'], save: [392, 784, .45, 'triangle'], slash: [1800, 500, .07, 'sawtooth'],
  break: [160, 50, .25, 'square'], kill: [420, 90, .22, 'square'], lunge: [220, 330, .2, 'square'] };
function sfx(name) {
  if (!prefs.sound || !actx) return;
  const s = SFX[name], t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
  o.type = s[3]; o.frequency.setValueAtTime(s[0], t); o.frequency.exponentialRampToValueAtTime(s[1], t + s[2]);
  g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + s[2]);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + s[2] + 0.02);
}
