# Sasurai 浪人

Metroidvania plataformero de un ronin en el Japón feudal, jugable en el navegador. Un samurái sin señor busca la espada de su maestro, escondida en un santuario bajo la montaña.

Estilo visual inspirado en Hollow Knight / Silksong con identidad propia de tinta sumi-e: contornos a pincel, salpicaduras que manchan el escenario, enemigos que se disuelven en tinta, textura de papel washi, fondos en capas con parallax, iluminación dinámica, bloom, etalonaje por zona y escenarios vivos (pasto que se mueve y se corta, faroles que se balancean, estandartes, lluvia, goteras y luciérnagas).

## Cómo jugarlo

- En GitHub Pages: https://neonikito.github.io/sasurai/
- O abriendo `index.html` en cualquier navegador moderno (es el juego ya compilado, no necesita nada más).

## Controles

| Acción | Teclado | Táctil |
|---|---|---|
| Moverse | Flechas o A/D | ◀ ▶ |
| Saltar (mantené para saltar más alto) | Z o espacio | Saltar |
| Tajo de katana | X o J | Tajo |
| Tajo hacia arriba | ↑ o W + tajo | ▲ + Tajo |
| Tajo hacia abajo en el aire (rebota sobre enemigos y estacas) | ↓ o S + tajo | ▼ + Tajo |
| Impulso iai | C, Shift o K | Impulso |
| Mapa | M o Tab | Botón Mapa |
| Pausa | Esc o P | Botón Pausa |

La aventura empieza en la Aldea quemada, una zona de 10 salas con un secreto detrás de una pared agrietada, un pozo sin vuelta, un atajo con palanca y lugares a los que solo se llega más adelante con el doble salto. Hay 3 ranuras de partida en la pantalla de inicio. Cada linterna de piedra guarda en la ranura elegida.

## Estructura del proyecto

```
index.html            el juego compilado (lo que se publica)
src/index.html        HTML y CSS, con el lugar donde se inserta el código
src/js/               el código, dividido por tema; se une en orden numérico
  00-config.js          constantes, física y paletas de cada zona
  01-world.js           formato de las salas
  02-core.js            utilidades, guardado por ranuras y carga de salas
  03-rooms.js           entrar a una sala, aparecer en linternas
  04-physics.js … 10-loop.js     física, partículas, entrada, sonido, jugador, enemigos y bucle
  20-camera.js … 28-map.js       cámara, fondos, terreno, personajes, luz, interfaz, render y mapa
  30-screens.js … 99-init.js     pantallas, tamaño de pantalla e inicio
maps/                 las salas, en formato Tiled
  sasurai.world         dónde está cada sala en el mundo
  tiles.tsj, tiles.png  el tileset (terreno y entidades)
  *.tmj                 una sala por archivo
tools/build.mjs       compila todo en index.html
```

## Compilar

Necesitás [Node.js](https://nodejs.org) 18 o más nuevo. No hay dependencias que instalar.

```
node tools/build.mjs
```

Genera `index.html` y avisa si alguna salida de una sala no lleva a ningún lado.

## Cómo editar y crear salas con Tiled

1. Instalá [Tiled](https://www.mapeditor.org) (gratis).
2. Abrí `maps/sasurai.world` desde *Archivo → Abrir archivo o proyecto*. Vas a ver todas las salas en su lugar del mundo.
3. Cada sala tiene dos capas de tiles:
   - **terreno**: terreno, estacas y barricadas.
   - **entidades**: inicio, linternas, habilidades, la espada y enemigos.
4. Cada sala tiene tres propiedades personalizadas: `nombre` (el de la sala, se ve en el mapa), `zona` (el título grande que aparece al entrar a una zona nueva) y `tema` (`aldea`, `bambu`, `castillo`, `cueva` o `templo`).
5. Para una sala nueva: *Archivo → Nuevo mapa* con tiles de 16 × 16 y el tamaño que quieras (una pantalla son unas 22 × 13 tiles; las salas pueden ser mucho más grandes). Usá el tileset `tiles.tsj`, creá las dos capas y las tres propiedades, guardala en `maps/` y arrastrala al mundo.
6. Las salidas se conectan solas: si el borde de una sala toca a otra en el mundo y hay espacio libre en los dos lados, se puede pasar. Las colisiones son continuas entre salas, así que también funcionan las conexiones verticales.
   Un salto normal sube 3 tiles; con el doble salto, unos 6.
7. Corré `node tools/build.mjs` y abrí `index.html`.

| Tile | Qué es |
|---|---|
| terreno | Suelo y paredes |
| estacas | Estacas de bambú (lastiman) |
| barricada | Barricada de bambú (se corta con el impulso) |
| inicio | Dónde empieza la partida (uno solo en todo el mundo) |
| linterna | Linterna de piedra: guarda la partida y restaura la vida |
| grulla / iai | Habilidades: doble salto e impulso |
| espada | La espada del maestro (termina el juego) |
| ashigaru / onibi | Enemigos |
| agrietada | Pared que se rompe con dos tajos. Lo que queda detrás aparece tapado hasta romperla |
| porton | Portón cerrado: lo abre una palanca que esté cerca (también desde la sala vecina) |
| palanca | Se acciona con un tajo y abre los portones cercanos |
| fragmento | Fragmento de máscara: cuatro dan una máscara de vida más |

## Roadmap

El plan completo (progresión, mapas, secretos, habilidades, zonas, enemigos, jefes, omamori, historia, audio y lanzamiento) está en el documento de roadmap del proyecto. Fase actual: **1 · Cimientos** (hito cumplido: la Aldea quemada tiene 10 salas).
