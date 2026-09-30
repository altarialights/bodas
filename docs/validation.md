# Validación de la entrega

Entorno: Windows, Node 22.20.0 y pnpm 10.22.0. Astro 7.3.5, TypeScript 5.9.3, Tailwind 4.3.3. Comprobaciones realizadas el 30 de septiembre de 2026.

## Comprobaciones

- `pnpm check`: sin errores, avisos ni hints en la última comprobación.
- `pnpm test`: 18 pruebas de lógica aprobadas. Fechas/offset/fases, respuestas, menú infantil, transporte, aislamiento, duplicados, errores, acompañantes, CSV, imágenes y cartas selladas.
- `pnpm build`: 10 rutas estáticas generadas, incluidas ambas invitaciones, sus confirmaciones/recuerdos, demo, gestión, inicio y 404.
- `pnpm test:e2e`: **18 pruebas aprobadas** en la ejecución final (9 flujos en Chromium de escritorio y 9 en WebKit emulando iPhone; 30,8 segundos). RSVP con errores, asistir/rechazar/editar, datos conservados al volver y descartados al recargar, token cruzado inválido, acompañante autorizado, fases, mesa de ejemplo, calendario descargable, música voluntaria/denegada, teclado/menú, imágenes locales/formatos/borrado, mensaje escapado, CSV descargable, búsquedas, totales, estados vacío/error, editor y vista previa aislada.
- Comprobación de ausencia de desbordamiento horizontal en 320, 390, 768 y 1440 px para las rutas principales. Fotografías verificadas como cargadas.
- Pruebas adicionales de propuesta musical, carta sellada y apertura que puede saltarse y no se repite en la sesión.

Las pruebas corrigieron un selector de imágenes demasiado ancho a 320 px, el uso de controles antes de terminar su inicialización, etiquetas de textarea con valores iniciales y navegadores que omiten el MIME de un archivo WebP. El selector ahora comprueba firmas de archivo y la carga espera a que los controles estén preparados.

## Revisión visual

Capturas reproducibles con `pnpm exec node scripts/capture.mjs` y servidor de desarrollo activo. Evidencias en `.impeccable/review/`:

- `desktop.png`, `desktop-hero.png`: primera boda, 1440 px.
- `mobile.png`, `mobile-hero.png`, `mobile-program.png`: primera boda, 390 px.
- `second-desktop.png`, `second-desktop-hero.png`: segunda boda.
- `rsvp-mobile.png`, `memories-mobile.png`: flujos móviles.
- `management-desktop.png`: panel completo.
- `capture-report.json`: dimensiones y recursos de las capturas.

La revisión independiente de Impeccable comprobó la composición, fotografías, responsive, coherencia de las superficies y honestidad de la demo. Solicitó tres ajustes concretos: retirar rótulos opcionales, normalizar el espaciado de monogramas y usar SVG para las flechas de retorno. Los tres recibieron valoración **resuelto**, con disposición `ship` limitada a esos ajustes. El programa mantiene el rótulo de la referencia del usuario.

El detector `impeccable detect --json` devolvió `[]`. El escaneo de procedencia verificó 18 archivos raster y cero recursos sin metadatos. Los prompts exactos están en `docs/assets/` y los sidecars acompañan cada WebP.

## Rendimiento medido

`docs/performance.json` contiene una medición de la compilación de producción en `http://127.0.0.1:4322`, Chromium headless local, sin limitación de red/CPU, movimiento reducido y una carga por viewport. Reproducir con `pnpm preview --port 4322` y `pnpm exec node scripts/measure.mjs`.

La medición final registró aproximadamente 9,7 KB de JavaScript transferido, 59,6 KB de fuentes, 116,5 KB de imágenes en móvil y 443,2 KB en escritorio. El audio no se pidió automáticamente. LCP local: 84–88 ms; CLS: 0,0043–0,0153. Son observaciones del equipo local, **no** rendimiento real sobre 4G, datos de campo, garantía ni puntuación Lighthouse. El JSON regenerado es la fuente de la medición más reciente.

Los recursos fotográficos usan WebP en 480/960/1536 px, dimensiones reservadas, `srcset`, prioridad alta solo en la imagen principal y lazy loading inferior. Las fuentes se alojan localmente. Audio bajo demanda con `preload="none"`. Sin React/Vue, mapa embebido ni servicios de terceros en la ruta crítica.

## Límites de la validación

No se probaron dispositivos físicos, Safari real en un iPhone ni Chrome real en Android. WebKit emulado cubre una parte de las diferencias del motor, no todo el sistema operativo. No se realizó una auditoría con lector de pantalla ni una certificación WCAG. No hay micrófono implementado: su permiso no se solicita; la carta siempre ofrece texto. Se probó una denegación de reproducción de audio.

No se comprobó backend, autenticación, pagos, subida remota o notificaciones porque no existen en esta fase. El esquema SQL se entrega como propuesta y no se ejecutó como migración.
