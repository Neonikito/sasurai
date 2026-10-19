/* ---------- Mundo ----------
  Las salas se diseñan en Tiled (carpeta maps/) y tools/build.mjs las incrusta en WORLD_DATA:
  [{ key, name, theme, x, y, rows }]  — x, y = posición de la sala en el mundo, en píxeles.
  Cada sala puede tener cualquier tamaño; las transiciones se calculan por posición en el mundo.
  Caracteres de rows:
  #  terreno       .  vacío        ^  estacas de bambú
  B  barricada de bambú (se corta con el impulso iai)
  p  inicio        S  linterna de piedra (guardado)
  D  salto de grulla   H  impulso iai   R  la espada del maestro
  e  ashigaru      f  onibi (fuego fatuo)
  X  pared agrietada (se rompe a tajos: secretos)
  G  portón (se abre con una palanca cercana)   L  palanca
  M  fragmento de máscara (4 = una máscara más)
*/
// Claves de la versión anterior (partidas guardadas v1) → nombres de sala actuales
const OLD_KEYS = {"0,0": "aldea-quemada", "1,0": "bosque-de-bambu", "2,0": "muralla-del-castillo", "3,0": "torre-del-vigia", "1,1": "cueva-del-pozo", "2,1": "santuario-del-maestro"};
