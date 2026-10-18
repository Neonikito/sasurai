/* ---------- Pantallas ---------- */
const ov = { title: document.getElementById('ovTitle'), pause: document.getElementById('ovPause'), win: document.getElementById('ovWin') };
function show(name) { for (const k in ov) ov[k].hidden = k !== name; document.documentElement.classList.toggle('in-menu', !!name); }
function fmtTime(s) { const m = Math.floor(s / 60), ss = Math.floor(s % 60); return m + ':' + String(ss).padStart(2, '0'); }

function refreshTitle() {
  const box = document.getElementById('slots'); box.textContent = '';
  for (let n = 1; n <= SLOTS; n++) {
    const s = readSave(n), row = document.createElement('div'), main = document.createElement('button');
    row.className = 'slot'; row.setAttribute('role', 'listitem'); main.className = 'slot-main';
    const num = document.createElement('span'); num.className = 'slot-n'; num.textContent = n;
    const txt = document.createElement('span'); txt.className = 'slot-txt';
    const b = document.createElement('b'), sm = document.createElement('small');
    if (s) {
      const zone = rooms[s.shrine && s.shrine.room] ? rooms[s.shrine.room].name : '—';
      const ab = (s.abilities.double ? ' 鶴' : '') + (s.abilities.dash ? ' 居' : '');
      b.textContent = s.done ? 'Completada' : zone;
      sm.textContent = `${fmtTime(s.time)} · ${s.deaths} ${s.deaths === 1 ? 'caída' : 'caídas'}${ab ? ' ·' + ab : ''}`;
      main.onclick = () => { if (s.done && !confirm(`¿Empezar una partida nueva en la ranura ${n}? Se reemplaza la completada.`)) return; startGame(n, !!s.done); };
    } else {
      b.textContent = 'Nueva partida'; sm.textContent = 'Ranura vacía';
      main.onclick = () => startGame(n, true);
    }
    txt.append(b, sm); main.append(num, txt); row.append(main);
    if (s) {
      const del = document.createElement('button'); del.className = 'slot-del'; del.textContent = 'Borrar';
      del.setAttribute('aria-label', `Borrar la partida de la ranura ${n}`);
      del.onclick = () => { if (confirm(`¿Borrar la partida de la ranura ${n}? No se puede deshacer.`)) { deleteSave(n); refreshTitle(); } };
      row.append(del);
    }
    box.append(row);
  }
  if (document.documentElement.classList.contains('touch')) {
    const h = document.getElementById('helpText'); h.hidden = false;
    h.textContent = 'Usá los botones de abajo. Mantené Saltar para llegar más alto. Girá el teléfono para jugar a pantalla ancha.';
  }
}
function startGame(n, fresh) {
  slot = n; ensureAudio(); setupWorld(fresh);
  if (fresh) { writeSave(); showBanner('浪', 'Sasurai', 'La espada de tu maestro descansa bajo la montaña.', 3.6); }
  state = 'play'; show(null);
}
function togglePause() {
  if (state === 'play') { state = 'pause'; show('pause'); for (const k in keys) keys[k] = false; document.getElementById('btnResume').focus(); }
  else if (state === 'pause') { state = 'play'; show(null); }
}
function win() {
  save.done = true; writeSave(); state = 'win';
  document.getElementById('winStats').innerHTML = `Tiempo: ${fmtTime(save.time)}<br>Caídas: ${save.deaths}`;
  show('win'); document.getElementById('btnAgain').focus();
}

document.getElementById('btnResume').onclick = togglePause;
document.getElementById('btnToTitle').onclick = () => { writeSave(); state = 'title'; refreshTitle(); show('title'); };
document.getElementById('btnAgain').onclick = () => startGame(slot, true);
document.getElementById('btnMap').onclick = () => { if (state === 'play' || state === 'pause' || state === 'map') toggleMap(); };
document.getElementById('btnMapPause').onclick = () => toggleMap();
document.getElementById('btnPause').onclick = () => { if (state === 'play' || state === 'pause') togglePause(); };
const btnSound = document.getElementById('btnSound');
function syncSound() { btnSound.textContent = prefs.sound ? 'Sonido: sí' : 'Sonido: no'; btnSound.setAttribute('aria-pressed', String(prefs.sound)); }
btnSound.onclick = () => { prefs.sound = !prefs.sound; savePrefs(); syncSound(); ensureAudio(); };
syncSound();
