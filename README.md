# Altaria · invitaciones que se quedan

Frontend de invitaciones de boda conectado conceptualmente a una tarjeta NFC o QR. Astro 7.3.5, TypeScript estricto, Tailwind CSS 4 por `@tailwindcss/vite`, componentes Astro y módulos TypeScript sin framework de hidratación. Dos bodas ficticias comparten la misma implementación.

## Ejecutar

Requisitos: Node.js ≥22.12 y pnpm 10.22. El lockfile se incluye.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abrir `http://127.0.0.1:4321`. Otros comandos:

```sh
pnpm check
pnpm test
pnpm build
pnpm preview
pnpm test:e2e
```

Las pruebas E2E necesitan Chromium y WebKit de Playwright. Si no están instalados: `pnpm exec playwright install chromium webkit`. Las capturas se reproducen con el servidor activo: `pnpm exec node scripts/capture.mjs`.

Se eligió TypeScript 5.9.3 porque el verificador actual `@astrojs/check` no declara compatibilidad con TypeScript 7. No hay integración antigua `@astrojs/tailwind`: se sigue la [integración oficial de Tailwind 4](https://tailwindcss.com/docs/installation/framework-guides/astro) y la [configuración de estilos de Astro](https://docs.astro.build/en/guides/styling/).

## Rutas

| Ruta | Contenido |
| --- | --- |
| `/` | Primera invitación completa |
| `/demo` | Selector de ambas bodas y accesos a los flujos |
| `/boda/elena-y-marcos` | Boda editorial dorada, junio de 2027, Toledo ficticio |
| `/boda/ines-y-gabriel` | Boda mediterránea oliva, septiembre de 2027, Menorca ficticia |
| `/boda/[slug]/confirmar` | Asistencia, detalles individuales, revisión, edición y éxito simulado |
| `/boda/[slug]/recuerdos` | Álbum, previsualizaciones locales y libro de recuerdos |
| `/gestion` | Panel demo sin autenticación: invitados, filtros, detalles, CSV y editor |

Estas rutas prerenderizan **solo los ejemplos públicos**. El slug no es una credencial. Un token de demo puede probarse con `?invitacion=demo_f4Rz8Wx9Km2P` en la primera confirmación; pertenece solo a esa boda. La segunda usa `demo_h7Kp9Qx2Nz8B`. Los tokens son intencionadamente públicos y no proporcionan privacidad real.

## Qué funciona

- Portada con fuentes locales, fotografía responsive, fecha y cuenta atrás calculadas desde un instante ISO con offset; presentación horaria mediante la zona IANA configurada.
- Apertura de papel de aproximadamente 1,6 s, saltar, detalles directos, una vez por boda y sesión; no se muestra con movimiento reducido.
- Navegación con diálogo nativo y restauración de foco, historia, tres momentos, programa con distintos lugares, guía, acordeones, regalos y contacto configurables.
- Confirmación por persona, acompañante habilitado solo en una de las demos, menú individual/infantil, alergias, llegada, ida/vuelta, accesibilidad y comentario. Rechazar elimina los campos que no aplican. Volver y editar conservan estado en la misma página.
- Validación asociada a campos, carga, reintento y fallo simulado desde el último paso.
- Propuestas de canciones y cartas selladas en memoria; libro de recuerdos local. Se ofrece texto. No se implementa grabación de voz ni se pide permiso de micrófono.
- Fases automática/antes/hoy/después. El selector de demo fuerza la vista; hoy muestra el siguiente evento, mesa de la invitación de ejemplo, avisos, rutas y fotografías. La información prioritaria se mueve al principio. El reloj de «hoy» forzado se sitúa 20 minutos después de la ceremonia.
- Álbum con fotos reales del proyecto. Selección de hasta 8 JPG/PNG/WebP y 10 MB por foto, comprobación de firma de archivo, vista local y borrado. Se liberan las URL de objetos al quitar fotos o abandonar la página.
- Música instrumental original procedimental, reproducción voluntaria, pausa, errores y preferencia recordada. `preload="none"`, sin autoplay. La música se pausa ante otro medio y al ocultar la pestaña. La preferencia nunca autoriza reproducción automática.
- Descargas reales de calendario `.ics` y CSV UTF-8 con BOM. El CSV respeta la búsqueda y el filtro activos y neutraliza entradas de fórmula.
- Panel con totales derivados, tabla responsive, búsqueda, filtro, respuestas individuales, estados vacío/error/carga y selector de boda. Editor de nombres/textos/secciones con vista previa en iframe de mismo origen y comprobación de origen/emisor. Cambiar de boda conserva las ediciones en memoria sin mezclarlas.

## Qué se simula y límites intencionados

No hay servidor de aplicación, autenticación, Turso conectado, pagos, correos, notificaciones, hoteles reservables, mapas reales ni subida de archivos. Los lugares y las parejas son ficticios. Los enlaces que requieren una dirección real permanecen ocultos y se explica su estado, en lugar de apuntar a destinos inventados.

El adaptador usa memoria **por documento/pestaña**, no almacenamiento persistente. Una confirmación se puede modificar mientras se permanezca en su página; se pierde al salir o recargar. Las confirmaciones y cartas no se sincronizan entre rutas ni con el panel. El panel usa sus propios datos ficticios y su propio estado. Es una limitación explícita de la fase frontend, no una confirmación real. La vista previa refleja los textos editados en el mismo documento de gestión.

Solo se usa `localStorage` para la preferencia de música (`on/off`), y `sessionStorage` para el indicador de apertura. Nunca para alergias, comentarios, nombres introducidos, cartas ni fotos.

Los aniversarios se modelan con fecha de liberación y estado. El cliente no publica una carta sellada. La liberación, entrega y privacidad reales corresponden al servidor futuro. No se simulan vídeos ausentes ni descargas de un álbum inexistente.

## Estructura

```text
src/
  domain/types.ts        Contratos y entidades multiempresa/multiboda
  domain/logic.ts        Fechas, validación, CSV, ICS y formatos de imagen
  data/fixtures.ts       Única fuente de contenido ficticio
  data/repository.ts     WeddingRepository implementado en memoria
  components/           Estructura editorial compartida en Astro
  layouts/Base.astro    Metadatos, fuentes locales, estilos y accesibilidad base
  pages/                Rutas prerenderizadas de demostración
  scripts/              Interacción de invitación, RSVP, recuerdos y gestión
  styles/global.css     Tokens, composición y responsive; Tailwind 4
public/
  images/               Fotografías sintéticas, 3 tamaños WebP por imagen
  audio/                Instrumental original WAV
  licenses/             Licencias OFL de las fuentes
  ASSETS.md             Procedencia de los recursos
db/schema.sql           Propuesta relacional, nunca ejecutada
tests/                  Pruebas de lógica y flujos de navegador
docs/                   Conexiones futuras y evidencias de validación
```

## Personalizar otra boda

Añade un `WeddingBundle` a la fuente del adaptador y registra sus invitaciones/invitados de demostración. Los componentes no necesitan cambiar. Cada entidad lleva un ID estable y ámbito de boda/empresa. Cambia `names`, `visual.monogram`, `headline`, textos, `startsAt`, `endsAt`, `timezone`, `locale`, `rsvpDeadline`, recursos, lugares, programa, menús, transporte y `sections`.

Mantén el offset de `startsAt` coherente con la zona IANA de la fecha, especialmente al cambiar entre verano e invierno. La UI de esta entrega está escrita en español; `locale` configura formato de fechas e idioma del documento. Una traducción completa de los textos funcionales necesita un catálogo i18n en la siguiente ampliación.

Para imágenes externas añade recursos locales y documenta su licencia. `Photo.astro` espera bases de ruta con variantes `-480.webp`, `-960.webp`, `-1536.webp`. Los assets finales ya están incluidos: no necesitas generar nada para ejecutar el proyecto. `scripts/prepare-assets.mjs` reproduce la optimización desde los originales y la música desde su partitura matemática.

## Segunda fase

Los contratos están en `src/domain/types.ts`, el punto de sustitución es `src/data/repository.ts`, la propuesta de datos está en `db/schema.sql` y el mapa de conexión exacto se documenta en [docs/backend.md](docs/backend.md).

## Validación

Consulta [docs/validation.md](docs/validation.md) para comandos, resultados, capturas y límites. Las pruebas de navegador usan emulación de Chromium y WebKit. No se han probado teléfonos físicos ni se promete una puntuación Lighthouse.
