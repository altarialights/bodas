import { describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../src/data/repository';
import { calendarFile, cleanResponse, countdown, phaseAt, toCSV, validatePhoto, validateResponses, imageMime } from '../src/domain/logic';
import type { IndividualResponse } from '../src/domain/types';

async function example(second = false) {
  const repo = createMemoryRepository();
  const weddings = await repo.listWeddings();
  const bundle = (await repo.getWedding(weddings[second ? 1 : 0]!.slug))!;
  const context = (await repo.resolveInvitation(bundle.wedding.demoInvitationToken, bundle.wedding.id))!;
  const rows: IndividualResponse[] = context.guests.map(g => ({ id: `${g.id}-test`, weddingId: g.weddingId, companyId: g.companyId, invitationId: g.invitationId, guestId: g.id, attendance: 'yes', menuId: 'classic' }));
  return { repo, bundle, context, rows };
}
describe('Fechas reales y fases', () => {
  it('normaliza el offset y nunca muestra negativos', () => { expect(countdown('2027-06-26T17:00:00+02:00', Date.parse('2027-06-26T14:00:00Z'))).toEqual({ days: 0, hours: 1, minutes: 0 }); expect(countdown('2020-01-01T00:00:00Z')).toEqual({ days: 0, hours: 0, minutes: 0 }); });
  it('cambia en los límites configurados', async () => { const { bundle: { wedding: w } } = await example(); expect(phaseAt(w, Date.parse(w.startsAt) - 1)).toBe('before'); expect(phaseAt(w, Date.parse(w.startsAt))).toBe('during'); expect(phaseAt(w, Date.parse(w.endsAt) + 1)).toBe('after'); expect(phaseAt({ ...w, phase: 'after' }, 0)).toBe('after'); });
  it('exporta UTC correcto en el calendario', async () => { const { bundle } = await example(); const ics = calendarFile(bundle); expect(ics).toContain('DTSTART:20270626T150000Z'); expect(ics).toContain('DTEND:20270627T020000Z'); expect(ics).toContain('demostración'); });
});
describe('Contrato de respuestas e aislamiento', () => {
  it('resuelve solo un token opaco que corresponda a esa boda', async () => { const { repo, bundle } = await example(); expect(await repo.resolveInvitation(bundle.wedding.slug, bundle.wedding.id)).toBeUndefined(); expect(await repo.resolveInvitation(bundle.wedding.demoInvitationToken, 'wed-ines-gabriel')).toBeUndefined(); });
  it('guarda, consulta y modifica respuestas individuales', async () => { const { repo, bundle, context, rows } = await example(); await repo.saveResponses(context, rows); const read = await repo.getResponses(bundle.wedding.id, context.invitation.id); expect(read).toHaveLength(2); rows[0]!.attendance = 'no'; rows[0]!.allergies = 'Sensitive demo'; await repo.saveResponses(context, rows); const changed = await repo.getResponses(bundle.wedding.id, context.invitation.id); expect(changed[0]!.attendance).toBe('no'); expect(changed[0]!.allergies).toBeUndefined(); expect(changed[0]!.menuId).toBeUndefined(); });
  it('no exige detalles a quien no asiste', async () => { const { context, bundle, rows } = await example(); rows.forEach(r => { r.attendance = 'no'; r.menuId = undefined; }); expect(validateResponses(context, rows, bundle)).toEqual({}); });
  it('exige menú solo a asistentes y rechaza menú infantil para adulto', async () => { const { context, bundle, rows } = await example(); rows[0]!.menuId = 'child'; expect(validateResponses(context, rows, bundle)).toHaveProperty(`${rows[0]!.guestId}-menuId`); });
  it('rechaza transporte de otra boda o sentido', async () => { const { context, bundle, rows } = await example(); rows[0]!.outboundId = 'ig-bus-go'; rows[1]!.returnId = 'em-bus-go'; const errors = validateResponses(context, rows, bundle); expect(errors).toHaveProperty(`${rows[0]!.guestId}-outboundId`); expect(errors).toHaveProperty(`${rows[1]!.guestId}-returnId`); });
  it('impide invitados duplicados, añadidos o de otra empresa', async () => { const { repo, context, rows } = await example(); await expect(repo.saveResponses(context, [...rows, rows[0]!])).rejects.toThrow(); rows[0]!.companyId = 'other-company'; await expect(repo.saveResponses(context, rows)).rejects.toThrow(); });
  it('no mezcla respuestas entre bodas y devuelve copias', async () => { const { repo, bundle, context, rows } = await example(); await repo.saveResponses(context, rows); expect(await repo.getResponses('wed-ines-gabriel', context.invitation.id)).toEqual([]); const read = await repo.getResponses(bundle.wedding.id, context.invitation.id); read[0]!.attendance = 'no'; expect((await repo.getResponses(bundle.wedding.id, context.invitation.id))[0]!.attendance).toBe('yes'); });
  it('ofrece acompañante solo en la segunda invitación', async () => { const first = await example(); const second = await example(true); expect(first.context.invitation.allowCompanion).toBe(false); expect(second.context.invitation.allowCompanion).toBe(true); expect(second.context.guests.filter(g => g.optional)).toHaveLength(1); });
  it('un fallo simulado no borra una respuesta previa', async () => { const { repo, bundle, context, rows } = await example(); await repo.saveResponses(context, rows); repo.failNext(); await expect(repo.saveResponses(context, rows)).rejects.toThrow(); expect(await repo.getResponses(bundle.wedding.id, context.invitation.id)).toHaveLength(2); });
  it('limpia todos los campos sensibles al rechazar', () => { const result = cleanResponse({ id:'r',companyId:'c',weddingId:'w',invitationId:'i',guestId:'g',attendance:'no',allergies:'x',accessibility:'x',comment:'x',menuId:'x' }); expect(Object.keys(result)).toHaveLength(6); });
});
describe('Exportaciones y recursos', () => {
  it('reconoce WebP por su firma cuando el navegador omite el MIME', async () => { const file = new Blob([new Uint8Array([82,73,70,70,0,0,0,0,87,69,66,80])]); expect(await imageMime(file)).toBe('image/webp'); expect(await imageMime(new Blob(['<svg/>']))).toBeUndefined(); });
  it('CSV protege fórmulas, preserva acentos, comillas y saltos', () => { const csv = toCSV([['Inés', '=SUM(A1)', 'A "B"', 'uno\ndos']]); expect(csv.charCodeAt(0)).toBe(0xfeff); expect(csv).toContain('"\'=SUM(A1)"'); expect(csv).toContain('"A ""B"""'); expect(csv).toContain('"uno\ndos"'); });
  it('rechaza formatos no admitidos y más de 10 MB', () => { expect(validatePhoto({ type:'image/svg+xml',size:10 })).toBeTruthy(); expect(validatePhoto({ type:'image/png',size:11*1024*1024 })).toBeTruthy(); expect(validatePhoto({ type:'image/webp',size:100 })).toBeUndefined(); });
  it('las ediciones quedan en el adaptador de sesión, sin mutar los fixtures', async () => { const { repo, bundle } = await example(); bundle.wedding.names[0]='Prueba'; await repo.updateWedding(bundle.wedding); expect((await repo.getWedding(bundle.wedding.slug))!.wedding.names[0]).toBe('Prueba'); expect((await createMemoryRepository().getWedding(bundle.wedding.slug))!.wedding.names[0]).toBe('Elena'); });
  it('una carta sellada no aparece sin el contexto de su invitación', async () => { const { repo, bundle, context } = await example(); await repo.saveMemory({ id:'letter-test',companyId:bundle.wedding.companyId,weddingId:bundle.wedding.id,invitationId:context.invitation.id,author:'Test',text:'private',kind:'anniversary',status:'sealed',releaseAt:'2028-06-26' }); expect((await repo.getMemories(bundle.wedding.id)).some(m=>m.id==='letter-test')).toBe(false); expect((await repo.getMemories(bundle.wedding.id,context.invitation.id)).some(m=>m.id==='letter-test')).toBe(true); });
});
