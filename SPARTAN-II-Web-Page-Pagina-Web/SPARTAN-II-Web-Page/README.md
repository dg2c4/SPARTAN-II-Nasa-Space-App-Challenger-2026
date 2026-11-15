# SPARTANS II · versión final
## Despliegue (Vercel)
Sitio estático, sin build. Sube la carpeta `spartans2` (Root Directory = `spartans2`, Framework = *Other*) o ejecuta `vercel --prod` dentro de ella. `vercel.json` ya incluye caché y cabeceras.

## Cambios de esta versión
- **Guía de Supervivencia** (`#guide`): presentación interactiva en `guia/` (ES/EN, sincronizada con el selector de idioma del sitio). Usa unidades relativas y se adapta a cualquier zoom o tamaño de pantalla. También funciona sola abriendo `guia/index.html`.
- **Simulador de Misión** (`#sim`): tráiler en `assets/video/trailer.mp4` y botón «Jugar ahora» hacia https://spartan-ii-the-gamme.vercel.app/ (abre en pestaña nueva).
- Se eliminó el minijuego anterior (`js/game.js`).

## Ejecutar en VS Code
1. Descomprime y abre la carpeta `spartans2` en VS Code.
2. Opción A: instala **Live Server** (se te sugiere sola) → clic derecho en `index.html` → *Open with Live Server*.
   Opción B: `Ctrl+Shift+B` (tarea «Servir SPARTANS II») y abre http://localhost:5500. También sirven `iniciar.bat` / `iniciar.sh` (requieren Python).
3. Necesitas internet: Three.js y Google Fonts se cargan por CDN. No abras `index.html` con doble clic.

## Datos reales vs simulados (estado honesto)
| Elemento | Estado |
|---|---|
| Elevación del atlas, globo y rutas | **SIMULADO** (procedural) hasta que generes el DEM: `pip install rasterio numpy` y `python tools/make_dem.py <MOLA.tif> --lon360`. Con `data/mola_720x360.json` presente pasa a **MOLA real** y la etiqueta del atlas lo indica. |
| Capas térmica, O₂ e hielo | **SIMULADAS** (modelos simples). No usan THEMIS/TES/SHARAD/MARSIS. |
| Fuentes científicas | Catálogo de enlaces; ninguna se consume aún en tiempo real. |
| Telemetría | Valores de referencia NASA, no en vivo. |
| Informe | Vista de impresión → «Guardar como PDF». Incluye ahora las 14 fuentes. |

## Navegación por pestañas (v9)
El menú tiene 10 opciones (Mission Control, Systems, Survival Protocol, Mars Atlas, Route Planner, Rover Exploration, Mars Globe, Mission Sim, Scientific Data, Mission Report). Cada una abre **solo su sección**, sin scroll entre secciones; la URL cambia (`#atlas`, `#route`…) y el botón Atrás funciona. En pantallas ≤1400 px el menú pasa a botón de hamburguesa.
Paleta: negro/gris/blanco + naranjas, rojos y amarillos neón (sin morados). Tipografías: Orbitron (HUD), Cinzel (título y tarjetas), IBM Plex Sans/Mono (texto/datos).
Archivos nuevos: `js/tabs.js`, `css/hud-cinema.css`. `route.js` incorpora el bloque isométrico 3D; `mars3d.js` añade atmósfera y tono cinematográfico.

## Cambios v7
Telemetría fija (`js/telemetry.js`, `css/telemetry.css`), etiqueta de origen de datos en el atlas, cargador opcional de DEM MOLA, pipeline `tools/make_dem.py`, configuración de VS Code.

Abre la carpeta en VS Code e instala la extensión **Live Server** (clic derecho en `index.html` → Open with Live Server). **No abras `index.html` con doble clic:** el globo 3D usa módulos ES y el navegador los bloquea en `file://`. Usa Live Server (o `python3 -m http.server`).

- `css/style.css` · colores y **fuentes** en las variables del inicio (`--font-display`, `--font-body`). Para tus propias fuentes: copia los archivos a `assets/fonts/` y activa el bloque `@font-face`.
- `js/sources.js` · catálogo único de repositorios (NASA, PDS, USGS…). Edítalo y la web se actualiza.
- `js/i18n.js` · textos ES/EN.
- `js/atlas.js` · mapa. El terreno es **procedural (simulado)**; para datos reales reemplaza el arreglo `E` con un DEM MOLA procesado (GDAL/Rasterio → JSON/PNG).
- `js/astronaut.js`, `js/game.js`, `js/intro.js`.
- `assets/img/` · coloca aquí imágenes reales de NASA (HiRISE, CTX) y úsalas en CSS (`.planet`, `.hero`).

## v2 · Sistema de diseño SPARTANS II
- Tokens y componentes HUD (`.hud`, `.btn`, `.kick`, `.mono`) al inicio de `css/style.css`.
- `js/mars3d.js`: globo Three.js (módulo ES, importmap con three@0.160.0 desde CDN → requiere internet). Para textura real, reemplaza `tex` por `new THREE.TextureLoader().load('assets/img/mars.jpg')`.
- `js/motion.js`: reveal por scroll con `class="rv"`; `prefers-reduced-motion` desactiva animaciones y la rotación.
- No incluido aún: React/TS/Vite/Tailwind, GSAP/Framer Motion, CesiumJS, SPARTAN AI, Data Lab, Mission Planner.

## v4 · Rediseño cinematográfico
- `tools/make_assets.py` regenera todas las ilustraciones SVG de `assets/img/` (capas del hero, rovers y artes de tarjetas).
- `js/scene.js`: parallax por capas, polvo, título, menú activo. `js/cards.js`: carrusel de tarjetas 3D y sección de rovers.
- Fuentes y Three.js siguen cargándose por CDN (Google Fonts, jsDelivr).

## v5 · HALO · NASA · MARTE
- `css/halo.css`: paleta marciana (#090A12, #9F382B, #C45136, #FF713B, #FFB45E, #D9A77B, #281638, #F2EDF2), HUD y layouts a pantalla completa. Se carga después de `style.css`; las animaciones previas no se tocan.
- `js/survival.js`: simulador (sustituye a `astronaut.js`, que queda como referencia; sus fórmulas se conservaron). Silueta interactiva con 5 sistemas, estados por reglas explícitas y 2 gráficas canvas.
- `js/route.js`: rutas A→B sobre el atlas (haversine R=3389.5 km, perfil sobre el DEM **procedural**), comparación astronauta/rover. Ganchos añadidos en `atlas.js`: `routePick` y `routeDraw`.
- `js/rovers2.js`: línea de tiempo, fichas, diagrama interactivo, comparador y "Did you know?".
- Los parámetros marcados (A) son supuestos editables, no especificaciones oficiales. Idioma inicial: español.
