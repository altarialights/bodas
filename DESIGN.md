---
name: "Invitaciones Altaria"
description: "Una editorial íntima para invitaciones y organización de bodas."
colors:
  paper: "#fffefa"
  ink: "#282622"
  accent: "#ac8748"
  accent-dark: "#80602d"
  muted: "#6c685f"
  line: "#d6c8b1"
  soft: "#f5f1e9"
  white: "#fff"
  olive: "#79816a"
  olive-dark: "#4e5940"
  olive-paper: "#fcfcf8"
  field-border: "#b8b1a5"
  placeholder: "#777065"
  error: "#9b3630"
  error-surface: "#fbefeb"
  confirmed-ink: "#36503c"
  confirmed-surface: "#edf2e8"
  declined-ink: "#82453b"
  declined-surface: "#f7ede8"
  light-hover: "#e9decb"
typography:
  display:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(66px, 17.1vw, 248px)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "clamp(36px, 6.4vw, 84px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "37px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  body-small:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.65
  field:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  action:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.2em"
  navigation:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0.08em"
  monogram:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "45px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.04em"
  statistic:
    fontFamily: "Bodoni Moda, Georgia, serif"
    fontSize: "52px"
    fontWeight: 400
    lineHeight: 1.3
rounded:
  square: "0px"
  button: "1px"
spacing:
  field-gap: "8px"
  row: "20px"
  inset: "24px"
  panel: "35px"
  gutter: "clamp(20px, 6vw, 96px)"
  section: "clamp(64px, 8vw, 128px)"
components:
  button-primary:
    backgroundColor: "{colors.accent-dark}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    rounded: "{rounded.button}"
    padding: "16px 25px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.accent-dark}"
    typography: "{typography.action}"
    rounded: "{rounded.button}"
    padding: "16px 25px"
  button-outline-hover:
    backgroundColor: "{colors.soft}"
  button-light:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.button}"
    padding: "16px 25px"
  button-light-hover:
    backgroundColor: "{colors.light-hover}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.field}"
    rounded: "{rounded.square}"
    padding: "13px 14px"
    width: "100%"
  navigation:
    textColor: "{colors.ink}"
    typography: "{typography.navigation}"
  status-pending:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.muted}"
    padding: "4px 9px"
  status-confirmed:
    backgroundColor: "{colors.confirmed-surface}"
    textColor: "{colors.confirmed-ink}"
    padding: "4px 9px"
  status-declined:
    backgroundColor: "{colors.declined-surface}"
    textColor: "{colors.declined-ink}"
    padding: "4px 9px"
  anniversary-container:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "35px"
  accordion:
    textColor: "{colors.ink}"
    padding: "20px 0"
  program-row:
    textColor: "{colors.ink}"
    padding: "30px 0"
  stepper:
    textColor: "{colors.muted}"
  stepper-current:
    textColor: "{colors.accent-dark}"
---

# Design System: Invitaciones Altaria

## Overview

**Creative North Star: "Una editorial íntima"**

La identidad implementada traduce las referencias aportadas a una editorial íntima: papel casi blanco, tinta cálida, oro mate, serif de gran contraste y fotografía cercana. La escala tipográfica y el espacio abierto dan presencia a la celebración; las reglas finas ordenan sus detalles.

Bodoni Moda mantiene la voz de la invitación, la confirmación y la gestión. DM Sans sostiene navegación, formularios y datos. La segunda boda conserva la misma estructura y sustituye el oro por oliva. Este documento registra el código terminado y sus capturas; no procede de una composición generada aprobada.

**Key Characteristics:**

- Serif monumental con cursivas breves y monogramas compactos.
- Fondos claros, acentos mates y líneas de un píxel.
- Fotografía íntima a sangre y recortes rectangulares.
- Formularios cuadrados, progreso visible y filas operativas regladas.

Fuente normativa: valores efectivos de `src/styles/global.css`, tipografía cargada en `src/layouts/Base.astro` y variantes de `src/data/fixtures.ts`. Los componentes Astro y las plantillas de RSVP/gestión determinan el uso. Se contrastó con las capturas de portada de escritorio/móvil, RSVP móvil y gestión de `.impeccable/review/`. Los tokens del frontmatter son normativos; la sidecar amplía estados, movimiento y ejemplos.

## Colors

La paleta combina blancos cálidos, tinta suave y acentos mates, con color semántico discreto para las respuestas.

### Primary

- **Oro mate** (`accent`): ampersands, reglas, números del programa y detalles no destinados a lectura prolongada.
- **Oro profundo** (`accent-dark`): botones principales, monogramas, foco, fechas y acciones.
- **Oliva / oliva profundo** (`olive`, `olive-dark`): sustitución configurada del par anterior en la segunda boda; no es un acento simultáneo adicional.

### Neutral

- **Papel** (`paper`) y **papel oliva** (`olive-paper`): fondos de las dos bodas. Las pantallas generales usan papel.
- **Tinta cálida** (`ink`): títulos, texto y barra de demostración.
- **Texto secundario** (`muted`), **regla cálida** (`line`) y **papel tonal** (`soft`): instrucciones, separadores y bloques informativos.
- **Blanco** (`white`): texto del botón principal y sobre fotografía.
- **Borde de campo** y **placeholder**: controles legibles que conservan su etiqueta visible.
- **Hover claro** (`light-hover`): respuesta del botón claro sobre fotografía.

Los pares `confirmed-*` y `declined-*` identifican estados, junto al texto de la respuesta. `error` y `error-surface` se reservan a errores asociados a campos o resúmenes; el color no reemplaza el mensaje.

**The Accent Roles Rule.** El acento claro dibuja ampersands, números de programa y reglas; el acento oscuro sostiene acciones y texto funcional. La variante oliva conserva estos papeles.

## Typography

**Display Font:** Bodoni Moda, con Georgia y serif como respaldo. Se cargan los cortes locales regular e italic de peso 400.
**Body Font:** DM Sans, con sans-serif como respaldo. Se cargan los pesos locales 400 y 500.

**Character:** contraste entre trazos finos, titulares amplios y texto funcional contenido. No existe una escala matemática uniforme: cada rol conserva el tamaño observado en el frontmatter.

### Hierarchy

- **Display:** portada real en HTML, en dos líneas; el ampersand usa cursiva y menor escala. A 1050 px o menos pasa a 16.65vw; a 760 px o menos usa 17vw y altura de línea 0.98. El límite de escritorio permanece en 248 px.
- **Headline:** encabezados de sección. En móvil, el título general de sección pasa a 10vw; otras composiciones conservan ajustes específicos de su superficie.
- **Title:** títulos de etapa del formulario; en móvil pasan a 32 px. Los subtítulos editoriales varían por su función, sin convertir cada variación en un token.
- **Body / body-small:** lectura, ayudas y datos. El límite general de párrafo es 68ch; los bloques introductorios suelen ser más cortos.
- **Label / field:** etiquetas con peso 500 y texto de entrada de 16 px. Las etiquetas no dependen del placeholder.
- **Action / navigation:** texto compacto; las acciones usan mayúsculas por CSS. El espaciado amplio se reserva a controles y metadatos breves.
- **Monogram:** iniciales compactas, con tracking negativo; en móvil, 39 px. La apertura usa una ampliación de 100 px.
- **Statistic:** números de gestión con cifras tabulares; en móvil, 36 px. El contador de invitación también usa cifras tabulares.

**The Two Voices Rule.** Bodoni Moda expresa nombres, títulos y cifras destacadas. DM Sans resuelve controles, instrucciones y datos de lectura continua.

El rótulo “NUESTRO PROGRAMA” pertenece a la referencia fijada para esa sección. No establece un rol global de antetítulo decorativo. “DRESS CODE”, estados, unidades y etiquetas de formulario sí nombran información funcional.

## Layout

El contenedor central tiene un máximo de 1320 px y descuenta dos veces el gutter. La fotografía principal sale del contenedor y ocupa todo el ancho. Las secciones alternan bloques abiertos, columnas asimétricas y separadores; la historia y el álbum admiten imágenes escalonadas.

Los espacios de sección usan el token fluido; bajo 760 px pasan a 66 px. El gutter pasa a 24 px bajo 760 px y 18 px bajo 360 px. El encabezado mide 96 px en escritorio y 76 px en móvil. Las rejillas editoriales y operativas se simplifican a una columna cuando su contenido lo requiere.

La portada conserva las dos palabras sin partir en móvil. Nombres y fecha siguen emparejados; contador y acción se apilan. El formulario cambia de dos columnas con lateral fijo a flujo vertical; oculta la fotografía secundaria del lateral. La tabla de gestión se transforma en filas apiladas con etiquetas de datos bajo 760 px, y sus cuatro métricas pasan a dos columnas bajo 360 px.

Los bloques de formulario utilizan separaciones regulares y controles de al menos 48 px de alto. Los botones principales tienen mínimo de 54 px. La mayoría de enlaces y acciones auxiliares reservan 44 px de interacción; no se declara ese mínimo como garantía de cada control existente.

## Elevation & Depth

La interfaz no usa sombras de caja. El papel tonal, las reglas y los recortes fotográficos separan las áreas. La navegación y los diálogos usan velos de tinta translúcida; el cierre fotográfico aplica un velo oscuro para sostener el texto. La única sombra tipográfica observada pertenece al pie sobre fotografía (`0 1px 6px #0009`), como apoyo de lectura.

**The Paper Plane Rule.** Los contenedores permanecen planos. Las reglas y los fondos tonales establecen jerarquía; las fotografías aportan profundidad.

## Shapes

Predominan esquinas cuadradas, bordes de un píxel y fotografías rectangulares sin radios. El botón usa un radio casi imperceptible, documentado en `rounded.button`; los campos conservan `rounded.square`. Los círculos quedan en las muestras de color y los controles nativos de selección, no en contenedores genéricos.

Los iconos comparten SVG de 24 unidades, sin relleno, trazo 1.25, extremos cuadrados y uniones redondeadas. El tamaño visible depende del control; las flechas de retorno reutilizan la flecha común girada.

## Components

### Buttons

Acciones precisas, rectangulares y con suficiente espacio alrededor del texto.

- **Primary:** acento oscuro y texto blanco; hover en tinta.
- **Outline:** fondo transparente, borde de acento y texto oscuro; hover en papel tonal.
- **Light:** papel y tinta para el cierre sobre fotografía; hover cálido.
- **Estados:** transición de fondo, color y desplazamiento de 0.2 s; al pulsar, desplazamiento de 1 px hacia abajo. Foco de 2 px en acento oscuro, separado 5 px. Estado deshabilitado con opacidad 0.6.
- **Acciones de texto:** enlace con flecha o botón subrayado, sin convertir todas las acciones en botones rellenos.

### Chips

Los estados de asistencia son etiquetas rectangulares compactas, no filtros interactivos. Pendiente usa papel tonal y texto secundario; confirmado y no asiste usan sus pares semánticos. Siempre muestran la palabra del estado.

### Cards / Containers

La información editorial vive mayoritariamente abierta sobre el papel. Los contenedores tonales existentes —aviso de demostración, información por fase y carta de aniversario— tienen esquinas cuadradas y carecen de sombra. El contenedor de aniversario usa el inset de panel y se reduce a 25 px en móvil. Los datos de gestión mantienen filas y reglas; la demo de invitaciones usa fotografía y texto abierto.

### Inputs / Fields

Campos cuadrados sobre papel, borde cálido de un píxel, texto de entrada legible y padding normativo. Textareas redimensionables en vertical, con mínimo de 110 px. El foco comparte el contorno global; `aria-invalid="true"` cambia el borde a error y se acompaña de un mensaje asociado. Radio y checkbox usan el acento oscuro; las opciones de asistencia añaden borde oscuro y papel tonal al seleccionarse.

### Navigation

Monograma a la izquierda, enlaces compactos y acciones a la derecha. El hover de los enlaces de escritorio dibuja una regla desde la izquierda en 0.25 s. Bajo 760 px se oculta esa fila y permanece el acceso al diálogo lateral. El diálogo ofrece enlaces serif amplios, reglas y botón de cierre; vuelve el foco al disparador al cerrar. Su entrada dura 0.25 s. La acción de confirmación del encabezado se oculta bajo 1050 px.

### Programme and progress

El programa usa filas con número serif, regla vertical y bloque de hora, título y lugar. Su numeración es jerarquía editorial, no un icono. El progreso de RSVP presenta tres columnas con regla superior; la etapa actual emplea acento oscuro, regla de dos píxeles y `aria-current="step"`.

### Opening and motion

La apertura de papel usa dos hojas que se desplazan a los lados durante 0.7 s, con `cubic-bezier(.16,1,.3,1)`; el contenido desvanece en 0.25 s. Conserva los accesos para omitir y saltar a detalles. La navegación, los acordeones y el hover fotográfico usan movimiento breve. `prefers-reduced-motion: reduce` elimina animaciones, transiciones y desplazamiento suave.

## Do's and Don'ts

### Do:

- **Do** mantener la serif local, el contraste de escala y las reglas finas en las nuevas pantallas.
- **Do** aplicar conjuntamente los acentos claro y oscuro de cada boda, conservando el fondo correspondiente.
- **Do** conservar etiquetas visibles, errores asociados y foco perceptible en formularios y navegación.
- **Do** usar SVG de trazo fino para los iconos y fotografías con texto alternativo.
- **Do** respetar el movimiento reducido y mantener accesible el contenido cuando la apertura termina o se omite.

### Don't:

- **Don't** introducir flores decorativas, corazones repetidos o bloques redondeados genéricos.
- **Don't** convertir el rótulo de programa fijado por la referencia en una plantilla de antetítulos para todas las secciones.
- **Don't** usar el oro claro como sustituto del acento oscuro en el texto funcional.
- **Don't** añadir sombras a las tarjetas ni degradados decorativos que cambien el carácter de papel plano.
- **Don't** sustituir los iconos SVG por flechas o símbolos tipográficos.

