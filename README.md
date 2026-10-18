# Sasurai 浪人

Metroidvania plataformero de un ronin en el Japón feudal, jugable en el navegador. Un samurái sin señor busca la espada de su maestro, escondida en un santuario bajo la montaña.

Todo el juego vive en un solo archivo: `index.html` (HTML + CSS + JavaScript, Canvas 2D, sin dependencias ni build). Estilo visual inspirado en Hollow Knight / Silksong: cámara que sigue al personaje con zoom, arte vectorial en alta resolución, fondos en capas con parallax, primer plano en silueta, niebla, rayos de luz e iluminación dinámica.

## Cómo jugarlo

- Abrí `index.html` en cualquier navegador moderno, o
- jugalo desde GitHub Pages (si está activado: Settings → Pages → rama `main`, carpeta raíz).

## Controles

| Acción | Teclado | Táctil |
|---|---|---|
| Moverse | Flechas o A/D | ◀ ▶ |
| Saltar (mantené para saltar más alto) | Z, espacio, W o ↑ | Saltar |
| Tajo de katana | X o J | Tajo |
| Impulso iai | C, Shift o K | Impulso |
| Pausa | Esc o P | Botón Pausa |

## Qué incluye el MVP

- 6 zonas conectadas: Aldea quemada, Bosque de bambú, Muralla del castillo, Torre del vigía, Cueva del pozo y Santuario del maestro.
- Dos habilidades que abren caminos: **salto de grulla** (doble salto) e **impulso iai** (dash que corta enemigos y barricadas de bambú).
- Enemigos: **ashigaru** con lanza (avisan y embisten) y **onibi** (fuegos fatuos que flotan).
- Estacas de bambú, linternas de piedra que guardan la partida, minimapa y pantalla final con tiempo y caídas.
- Fondos con parallax, luna, bambú, castillo y torii; partículas de ambiente por zona (brasas, hojas, pétalos).
- Bufanda animada del ronin, hitstop en los golpes, controles táctiles y sonidos con Web Audio.

## Cómo editar el mapa

Las salas están en el objeto `DEFS` dentro de `index.html`: cada una es una grilla de 30 × 17 caracteres con un tema visual (`aldea`, `bambu`, `castillo`, `cueva`, `templo`).

| Carácter | Significado |
|---|---|
| `#` | Terreno |
| `.` | Vacío |
| `^` | Estacas de bambú |
| `B` | Barricada de bambú (se corta con el impulso) |
| `p` | Inicio del jugador |
| `S` | Linterna de piedra (guardado) |
| `D` | Salto de grulla |
| `H` | Impulso iai |
| `R` | La espada del maestro (final) |
| `e` | Ashigaru |
| `f` | Onibi |

La clave de cada sala (`'1,0'`, `'2,1'`…) es su posición en el mapa. Las salidas tienen que coincidir con la sala vecina en las mismas filas o columnas.

## Próximas ideas

- Salto en pared y una zona que lo requiera.
- Parry con la katana.
- Un jefe ronin en el santuario.
- Mejoras de vida escondidas y música ambiente.
