import { bundles, invitations, guests, responses, memories } from './fixtures';
import { cleanResponse, validateResponses } from '../domain/logic';
import type { WeddingRepository, Wedding, IndividualResponse, SongProposal, MediaResource, Memory } from '../domain/types';
const clone = <T>(value: T): T => structuredClone(value);
export function createMemoryRepository(latency = 0): WeddingRepository & { failNext(): void } {
  const weddings = clone(bundles);
  let answers = clone(responses).map(cleanResponse);
  const songs: SongProposal[] = [];
  const messages: Memory[] = clone(memories);
  const media: MediaResource[] = [];
  let fail = false;
  const tick = async () => { if (latency) await new Promise(resolve => setTimeout(resolve, latency)); if (fail) { fail = false; throw new Error('No hemos podido completar la operación simulada. Tus datos siguen aquí; vuelve a intentarlo.'); } };
  const weddingFor = (weddingId: string) => { const b = weddings.find(b => b.wedding.id === weddingId); if (!b) throw new Error('No se ha encontrado esta boda.'); return b; };
  const assertScope = (entity: { companyId: string; weddingId: string; invitationId?: string }) => {
    const b = weddingFor(entity.weddingId);
    if (b.wedding.companyId !== entity.companyId || (entity.invitationId && !invitations.some(i => i.id === entity.invitationId && i.weddingId === entity.weddingId && i.companyId === entity.companyId))) throw new Error('Datos fuera del contexto de esta boda.');
  };
  return {
    failNext() { fail = true; },
    async listWeddings() { await tick(); return clone(weddings.map(b => b.wedding)); },
    async getWedding(slug) { await tick(); return clone(weddings.find(b => b.wedding.slug === slug)); },
    async resolveInvitation(token, weddingId) { await tick(); const invitation = invitations.find(i => i.opaqueToken === token && i.weddingId === weddingId); return invitation ? clone({ invitation, guests: guests.filter(g => invitation.guestIds.includes(g.id) && g.weddingId === weddingId) }) : undefined; },
    async getResponses(weddingId, invitationId) { await tick(); return clone(answers.filter(r => r.weddingId === weddingId && r.invitationId === invitationId)); },
    async saveResponses(context, rows) {
      await tick();
      const canonical = invitations.find(i => i.id === context.invitation.id && i.opaqueToken === context.invitation.opaqueToken && i.weddingId === context.invitation.weddingId);
      if (!canonical) throw new Error('Invitación no válida.');
      const trusted = { invitation: canonical, guests: guests.filter(g => canonical.guestIds.includes(g.id)) };
      const errors = validateResponses(trusted, rows, weddingFor(canonical.weddingId));
      if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
      answers = answers.filter(r => !(r.weddingId === canonical.weddingId && r.invitationId === canonical.id));
      answers.push(...clone(rows.map(cleanResponse)));
      return { id: `demo-receipt-${canonical.id}`, savedAt: new Date().toISOString(), simulated: true };
    },
    async getProgram(id) { await tick(); return clone(weddingFor(id).program); },
    async getTransport(id) { await tick(); return clone(weddingFor(id).transport); },
    async proposeSong(song) { await tick(); assertScope(song); songs.push(clone(song)); },
    async saveMemory(memory) { await tick(); assertScope(memory); messages.push(clone(memory)); },
    async getMemories(id, invitationId) { await tick(); return clone(messages.filter(m => m.weddingId === id && (m.status === 'published' || m.invitationId === invitationId))); },
    async saveMediaMetadata(resource) { await tick(); assertScope(resource); media.push(clone(resource)); },
    async getManagement(id) { await tick(); weddingFor(id); return clone({ invitations: invitations.filter(i => i.weddingId === id), guests: guests.filter(g => g.weddingId === id), responses: answers.filter(r => r.weddingId === id) }); },
    async updateWedding(wedding: Wedding) { await tick(); assertScope({ weddingId: wedding.id, companyId: wedding.companyId }); const b = weddingFor(wedding.id); b.wedding = clone(wedding); },
  };
}
export const repository = createMemoryRepository(typeof window === 'undefined' ? 0 : 240);
export type DemoRepository = ReturnType<typeof createMemoryRepository>;
export type { IndividualResponse };
