# Conexión de servicios · fase 2

Esta entrega no configura clientes privilegiados, cuentas, secretos ni migraciones. `db/schema.sql` es una propuesta revisable, no un archivo ejecutado al iniciar la app.

## Frontera del servidor

Crear un adaptador HTTP que implemente `WeddingRepository`. El servidor implementará el repositorio Turso; el navegador no importará fixtures privados ni el cliente de Turso. Mantener la demo pública separada de las rutas de producción. Eliminar `getStaticPaths()` para invitaciones privadas y usar renderizado bajo demanda con el adaptador de despliegue elegido.

| Método actual | Punto futuro | Comprobación indispensable en servidor |
| --- | --- | --- |
| `listWeddings`, `getManagement`, `updateWedding` | API de organización autenticada | Sesión y membresía en `company_memberships`; empresa/boda autorizadas; rol para editar/exportar |
| `getWedding` | DTO público reducido o configuración privada según sesión | No incluir familias, tokens, cartas ni datos de invitados en el HTML público |
| `resolveInvitation(token, weddingId)` | Canjear token opaco por sesión de invitación | Generar tokens aleatorios de alta entropía, guardar hash, comprobar revocación/caducidad y boda; cookie HttpOnly Secure SameSite |
| `getResponses`, `saveResponses` | API de la invitación resuelta | Obtener `company_id`, `wedding_id`, `invitation_id` del servidor; no confiar en IDs del body |
| `getProgram`, `getTransport` | API o DTO autorizado | Filtrar por empresa y boda; evitar exponer asignaciones de terceros |
| `proposeSong`, `saveMemory`, `getMemories` | API de participación | Autorizar invitación; limitar longitud y frecuencia; sanitizar salida; moderación de mensajes públicos |
| `saveMediaMetadata` | API de almacenamiento y metadatos | Autorizar antes de emitir URLs firmadas, validar bytes reales, tamaño/cupo y ámbito; registrar solo metadatos tras verificar subida |

Todas las consultas de organización incluyen `company_id` y `wedding_id`. Las consultas de invitado añaden `invitation_id`. Un `WHERE id = ?` sin ámbito no basta. Las claves compuestas del esquema impiden referencias cruzadas accidentales; no sustituyen a la autorización. Los métodos actuales son contratos de frontend, no barreras de seguridad.

## Confirmaciones

Revalidar la lista canónica de invitados y acompañantes autorizados, opciones de menú, edad para menú infantil, sentido/capacidad de autobuses, fecha límite y estado de invitación. Hacer el guardado de todos los invitados en una transacción; eliminar detalles de quien no asiste. Añadir clave de idempotencia y control optimista de revisión. Resolver conflictos de aforo en la transacción.

Minimizar datos sensibles: acceso restringido a alergias y accesibilidad, consentimiento contextual, retención y borrado definidos. No incluirlos en telemetría, logs, analítica, URLs o CSV generales. Las exportaciones futuras requieren autorización y auditoría.

## Fotografías, audio y vídeo

Turso conserva filas estructuradas y metadatos. Los binarios van en almacenamiento de objetos independiente. Firmar subidas/descargas después de autorizar; comprobar MIME/firma, tamaño y cuota en servidor. Analizar los recursos, eliminar EXIF de localización cuando corresponda, moderar antes de publicar, generar variantes y publicar únicamente recursos aprobados. Las URL `blob:` del frontend no son rutas de almacenamiento.

## Cartas y notificaciones

Una carta sellada no debe salir de la API de lectura hasta que el destinatario esté autorizado y `release_at <= now` con `status` publicable. La implementación en memoria muestra únicamente estados de ejemplo; no protege secretos.

Un trabajo de servidor liberará cartas o enviará recordatorios y confirmaciones con consentimientos, reintentos e idempotencia. No confiar en un temporizador del navegador. Añadir proveedor de notificaciones después de decidir canales y plantillas.

## Gestión y vista previa

La edición del panel hoy modifica el repositorio en memoria y envía únicamente contenido de boda al iframe por `postMessage`, verificando `origin`, `source` y `weddingId`. En producción, guardar un borrador autorizado, asignar revisión, previsualizar con token efímero y publicar de forma explícita. No enviar tokens de invitación ni respuestas sensibles al iframe público.

## Identidad y NFC/QR

La tarjeta futura enlazará a una ruta de canje de token opaco. No usar el slug, nombre de familia, ID correlativo ni un botón oculto como autenticación. Evitar el token en logs, cabeceras Referer y analítica; canjearlo y limpiar la URL. Aplicar HTTPS, límites de intentos, expiración/revocación y política de contenido en el despliegue.
