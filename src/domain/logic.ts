import type { IndividualResponse, InvitationContext, Phase, Wedding, WeddingBundle } from './types';
export function phaseAt(wedding: Wedding, now = Date.now()): Phase {
  if (wedding.phase !== 'auto') return wedding.phase;
  return now < Date.parse(wedding.startsAt) ? 'before' : now <= Date.parse(wedding.endsAt) ? 'during' : 'after';
}
export function countdown(startsAt: string, now = Date.now()) {
  const seconds = Math.max(0, Math.floor((Date.parse(startsAt) - now) / 1000));
  return { days: Math.floor(seconds / 86400), hours: Math.floor(seconds % 86400 / 3600), minutes: Math.floor(seconds % 3600 / 60) };
}
export const formatDate = (w: Wedding, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) => new Intl.DateTimeFormat(w.locale, { ...options, timeZone: w.timezone }).format(new Date(w.startsAt));
export const formatTime = (date: string, w: Wedding) => new Intl.DateTimeFormat(w.locale, { hour: '2-digit', minute: '2-digit', timeZone: w.timezone }).format(new Date(date));
export function validateResponses(context: InvitationContext, rows: IndividualResponse[], bundle: WeddingBundle): Record<string, string> {
  const errors: Record<string, string> = {};
  const { invitation, guests } = context;
  const seen = new Set<string>();
  for (const row of rows) {
    const guest = guests.find(g => g.id === row.guestId);
    if (!guest || seen.has(row.guestId) || row.weddingId !== invitation.weddingId || row.companyId !== invitation.companyId || row.invitationId !== invitation.id || (guest.optional && !invitation.allowCompanion)) { errors.scope = 'La respuesta no pertenece a esta invitación.'; continue; }
    seen.add(row.guestId);
    if (!['yes', 'no'].includes(row.attendance)) errors[`${row.guestId}-attendance`] = 'Indica si esta persona asistirá.';
    if (row.attendance !== 'yes') continue;
    const menu = bundle.wedding.menuOptions.find(m => m.id === row.menuId && (!m.childOnly || guest.child));
    if (!menu) errors[`${row.guestId}-menuId`] = 'Elige un menú para esta persona.';
    for (const [key, direction] of [['outboundId', 'outbound'], ['returnId', 'return']] as const) {
      if (row[key] && !bundle.transport.some(t => t.id === row[key] && t.direction === direction)) errors[`${row.guestId}-${key}`] = 'Selecciona una opción de transporte válida.';
    }
    if (row.arrival && !/^([01]\d|2[0-3]):[0-5]\d$/.test(row.arrival)) errors[`${row.guestId}-arrival`] = 'Introduce una hora válida.';
    for (const key of ['allergies', 'accessibility', 'comment'] as const) if ((row[key]?.length ?? 0) > 600) errors[`${row.guestId}-${key}`] = 'Usa un máximo de 600 caracteres.';
  }
  for (const guest of guests) if (!seen.has(guest.id)) errors[`${guest.id}-attendance`] = 'Falta la respuesta de esta persona.';
  return errors;
}
export function cleanResponse(row: IndividualResponse): IndividualResponse {
  if (row.attendance === 'yes') return row;
  const { id, companyId, weddingId, invitationId, guestId, attendance } = row;
  return { id, companyId, weddingId, invitationId, guestId, attendance };
}
export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export const toCSV = (rows: unknown[][]) => '\uFEFF' + rows.map(row => row.map(csvCell).join(';')).join('\r\n');
const icsEscape = (text: string) => text.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(',', '\\,').replaceAll(';', '\\;');
const utc = (date: string) => new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
export function calendarFile(bundle: WeddingBundle) {
  const w = bundle.wedding;
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Altaria//Invitaciones demo//ES', 'BEGIN:VEVENT', `UID:${w.id}@demo.altaria.invalid`, `DTSTAMP:${utc(new Date().toISOString())}`, `DTSTART:${utc(w.startsAt)}`, `DTEND:${utc(w.endsAt)}`, `SUMMARY:${icsEscape(w.names.join(' y ') + ' · boda de demostración')}`, `LOCATION:${icsEscape(bundle.venues[1]?.name ?? '')}`, 'DESCRIPTION:Evento ficticio de demostración.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
export function validatePhoto(file: Pick<File, 'type' | 'size'>): string | undefined {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Elige una imagen JPG, PNG o WebP.';
  if (file.size > 10 * 1024 * 1024) return 'Cada foto debe ocupar como máximo 10 MB.';
  if (!file.size) return 'La imagen está vacía.';
}
export async function imageMime(file: Blob): Promise<string | undefined> {
  // Some mobile browsers omit File.type. Check file signatures, never trust the extension.
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if ([137,80,78,71,13,10,26,10].every((value, i) => bytes[i] === value)) return 'image/png';
  if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
}
