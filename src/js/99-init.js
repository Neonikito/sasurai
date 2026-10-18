/* ---------- Inicio ---------- */
migrateOldSave();
fit();
setupWorld(false);
refreshTitle(); show('title');
if (document.fonts) {
  Promise.all([document.fonts.ready, document.fonts.load(`700 20px ${SERIF}`, '鶴居刀浪Sasurai'), document.fonts.load(`400 12px ${SANS}`, 'Pulsá')]).then(() => { invalidateArt(); }).catch(() => {});
}
requestAnimationFrame(frame);
